"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Canvas,
  extend,
  useFrame,
  useThree,
  type ThreeElement,
} from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  PerspectiveCamera,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";

extend({ MeshLineGeometry, MeshLineMaterial });

// meshline ships plain three classes; R3F v9 needs them declared as JSX
// intrinsics before `<meshLineGeometry>` / `<meshLineMaterial>` typecheck.
declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

const CARD_GLB = "/lanyard/card.glb";
const BAND_TEXTURE = "/lanyard/lanyard.png";

/** World-space height of the band's fixed anchor — the point the strap hangs
 *  from, which the camera pins to the top edge of the canvas. */
const ANCHOR_Y = 4;

/** meshline offsets its vertices in clip space, so a vertical strap's on-screen
 *  width comes out proportional to the canvas's aspect ratio. `lanyardWidth` is
 *  authored against a canvas of this shape and corrected for whatever the
 *  canvas actually is — otherwise the strap fattens as the viewport widens. */
const REFERENCE_ASPECT = 604 / 640;

/** Half the card's world size, from its collider. */
const CARD_HALF_WIDTH = 0.8;
const CARD_HALF_HEIGHT = 1.125;

/** Rigid drop from the last rope link to the card's centre — the spherical
 *  joint pins the card's own [0, 1.5, 0] to that link. */
const CLIP_DROP = 1.5;

/** 1x1 transparent pixel, so `useTexture` can be called unconditionally when a
 *  face image isn't supplied. */
const BLANK_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// The model's front face is UV-mapped to the LEFT half of the texture atlas and
// the back face to the RIGHT half. Each image is composited into its own half so
// the two faces render independently and aspect-preserving.
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

/** three's `Texture.image` is untyped; canvas drawing needs the dimensions. */
type DrawableImage = CanvasImageSource & { width: number; height: number };

type LanyardProps = {
  gravity?: [number, number, number];
  fov?: number;
  /** CSS px per world unit — what the card actually measures on screen. Held
   *  steady whatever size the canvas is, and eased down only when the canvas is
   *  too short to show the whole drop. */
  scale?: number;
  /** Where the band hangs from, in CSS px from the canvas's left edge. Null
   *  hangs it from the middle. */
  anchorX?: number | null;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  /** Flood-fills each face before the art is drawn, so none of the model's own
   *  baked card texture shows through around a letterboxed logo. */
  faceColor?: string | null;
  /** Fraction of the face left as margin around the art. */
  facePadding?: number;
  /** Front-face overrides, for artwork that should bleed to the card's edges
   *  while the back keeps a padded logo. */
  frontFit?: "cover" | "contain";
  frontPadding?: number;
  lanyardImage?: string | null;
  lanyardWidth?: number;
  /** Length of each of the three rope links, in world units. Sets how far below
   *  the anchor the card comes to rest, so it is what positions the card once
   *  the anchor is pinned to the top of the canvas. */
  segmentLength?: number;
  /** Whether the scene is on screen. False parks both the render loop and the
   *  physics step, so a scrolled-past canvas costs nothing per frame. */
  running?: boolean;
  className?: string;
};

export default function Lanyard({
  gravity = [0, -40, 0],
  fov = 20,
  scale = 90,
  anchorX = null,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = "contain",
  faceColor = null,
  facePadding = 0.12,
  frontFit,
  frontPadding,
  lanyardImage = null,
  lanyardWidth = 1,
  segmentLength = 1,
  running = true,
  className,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(false);

  // What has to be on screen: the anchor down to the bottom of the resting
  // card, and the card's width, both with a little air. Only used when the
  // canvas is too small to show that at full scale.
  const drop = segmentLength * 3 + CLIP_DROP + CARD_HALF_HEIGHT + 0.5;
  const spread = CARD_HALF_WIDTH * 2 + 0.8;

  // Read after mount rather than during render: the canvas is client-only, but
  // deriving this lazily still leaves a window where SSR and hydration disagree.
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={className}>
      <Canvas
        camera={{ fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        // Scrolled off screen the loop stops entirely rather than rendering
        // frames nobody sees — the physics is paused in step with it below.
        frameloop={running ? "always" : "never"}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <Framing
          fov={fov}
          scale={scale}
          anchorX={anchorX}
          drop={drop}
          spread={spread}
        />
        <ambientLight intensity={Math.PI} />
        {/* Rapier's wasm init and the GLB/texture loaders all suspend. Without
            a boundary inside the canvas the subtree never commits, so the
            scene renders empty — this is what keeps the card on screen. */}
        <Suspense fallback={null}>
          {/* A fixed 1/60 step everywhere. The rope links are shorter than the
              card is tall, so they are stiff relative to the load they carry:
              at 1/30 the solver leaves enough residual error per step that the
              band visibly stretches and the card hangs well below the clip. */}
          <Physics gravity={gravity} timeStep={1 / 60} paused={!running}>
            <Band
              isMobile={isMobile}
              frontImage={frontImage}
              backImage={backImage}
              imageFit={imageFit}
              faceColor={faceColor}
              facePadding={facePadding}
              frontFit={frontFit}
              frontPadding={frontPadding}
              lanyardImage={lanyardImage}
              lanyardWidth={lanyardWidth}
              segmentLength={segmentLength}
            />
          </Physics>
          <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
            />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * Camera framing.
 *
 * The canvas is sized by the section around it rather than by a fixed box, and
 * a perspective camera's field of view is vertical — so a bigger canvas would
 * otherwise magnify the card with it. This drives the camera from CSS pixels
 * instead: the card measures `scale` px per world unit whatever the canvas
 * does, the band's anchor sits on the top edge so the strap starts flush with
 * it, and `anchorX` slides the camera sideways to hang the band over a given
 * column. Only when the canvas is too short for the whole drop does the scene
 * shrink to fit, which is a fit rather than a crop.
 */
function Framing({
  fov,
  scale,
  anchorX,
  drop,
  spread,
}: {
  fov: number;
  scale: number;
  anchorX: number | null;
  drop: number;
  spread: number;
}) {
  const size = useThree((state) => state.size);

  const halfFov = Math.tan((fov * Math.PI) / 360);
  const pixelsPerUnit = Math.min(
    scale,
    size.height / drop,
    size.width / spread,
  );
  const visible = size.height / pixelsPerUnit;
  const x = anchorX === null ? 0 : (size.width / 2 - anchorX) / pixelsPerUnit;

  return (
    <PerspectiveCamera
      makeDefault
      fov={fov}
      position={[x, ANCHOR_Y - visible / 2, visible / (2 * halfFov)]}
    />
  );
}

type BandProps = {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  faceColor?: string | null;
  facePadding?: number;
  frontFit?: "cover" | "contain";
  frontPadding?: number;
  lanyardImage?: string | null;
  lanyardWidth?: number;
  segmentLength?: number;
};

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = "contain",
  faceColor = null,
  facePadding = 0.12,
  frontFit,
  frontPadding,
  lanyardImage = null,
  lanyardWidth = 1,
  segmentLength = 1,
}: BandProps) {
  const band = useRef<THREE.Mesh>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);

  const size = useThree((state) => state.size);
  const bandWidth =
    lanyardWidth * REFERENCE_ASPECT * (size.height / size.width);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const segmentProps = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(CARD_GLB) as unknown as {
    nodes: Record<string, THREE.Mesh>;
    materials: Record<string, THREE.MeshStandardMaterial>;
  };

  const texture = useTexture(lanyardImage || BAND_TEXTURE);

  // Cloned rather than mutated in place: useTexture hands back a cached
  // instance shared with any other consumer of the same URL.
  const bandTexture = useMemo(() => {
    const t = texture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [texture]);
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the face art into the card's texture atlas (front = left half,
  // back = right half), drawn aspect-preserving so nothing stretches.
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!baseMap) return null;
    if (!frontImage && !backImage && !faceColor) return baseMap;

    const baseImg = baseMap.image as DrawableImage;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return baseMap;

    // Keep the baked atlas for the card edges and any face left untouched.
    ctx.drawImage(baseImg, 0, 0, W, H);

    const paintFace = (
      img: DrawableImage,
      rect: { x: number; y: number; w: number; h: number },
      hasArt: boolean,
      fit: "cover" | "contain" = imageFit,
      pad: number = facePadding,
    ) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;

      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();

      if (faceColor) {
        ctx.fillStyle = faceColor;
        ctx.fillRect(rx, ry, rw, rh);
      }

      if (hasArt) {
        const iw = rw * (1 - pad * 2);
        const ih = rh * (1 - pad * 2);
        const pick = fit === "contain" ? Math.min : Math.max;
        const scale = pick(iw / img.width, ih / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, rx + (rw - dw) / 2, ry + (rh - dh) / 2, dw, dh);
      }

      ctx.restore();
    };

    if (frontImage && frontTex.image) {
      paintFace(
        frontTex.image as DrawableImage,
        FRONT_UV_RECT,
        true,
        frontFit ?? imageFit,
        frontPadding ?? facePadding,
      );
    } else if (faceColor) {
      paintFace(frontTex.image as DrawableImage, FRONT_UV_RECT, false);
    }

    if (backImage && backTex.image) {
      paintFace(backTex.image as DrawableImage, BACK_UV_RECT, true);
    } else if (faceColor) {
      paintFace(backTex.image as DrawableImage, BACK_UV_RECT, false);
    }

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [
    frontImage,
    backImage,
    imageFit,
    faceColor,
    facePadding,
    frontFit,
    frontPadding,
    frontTex,
    backTex,
    materials.base.map,
  ]);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = "chordal";
    return c;
  });
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  // The joint hooks want non-nullable refs; `useRef<T>(null)` widens to
  // `T | null` under the React 19 types, so narrow them back here.
  type BodyRef = React.RefObject<RapierRigidBody>;
  const link: [number, number, number] = [0, 0, 0];
  useRopeJoint(fixed as BodyRef, j1 as BodyRef, [link, link, segmentLength]);
  useRopeJoint(j1 as BodyRef, j2 as BodyRef, [link, link, segmentLength]);
  useRopeJoint(j2 as BodyRef, j3 as BodyRef, [link, link, segmentLength]);
  useSphericalJoint(j3 as BodyRef, card as BodyRef, [
    [0, 0, 0],
    [0, CLIP_DROP, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current) {
      // Smooth the two mid-rope joints so the band doesn't visibly jitter.
      [j1, j2].forEach((ref) => {
        const body = ref.current as RapierRigidBody & { lerped?: THREE.Vector3 };
        if (!body.lerped) {
          body.lerped = new THREE.Vector3().copy(body.translation());
        }
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, body.lerped.distanceTo(body.translation())),
        );
        body.lerped.lerp(
          body.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        );
      });

      const j1b = j1.current as RapierRigidBody & { lerped: THREE.Vector3 };
      const j2b = j2.current as RapierRigidBody & { lerped: THREE.Vector3 };

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2b.lerped);
      curve.points[2].copy(j1b.lerped);
      curve.points[3].copy(fixed.current.translation());

      const geometry = band.current?.geometry as unknown as {
        setPoints: (points: THREE.Vector3[]) => void;
      };
      geometry?.setPoints(curve.getPoints(isMobile ? 16 : 32));

      ang.copy(card.current.angvel() as THREE.Vector3);
      rot.copy(card.current.rotation() as unknown as THREE.Vector3);
      card.current.setAngvel(
        { x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z },
        true,
      );
    }
  });

  return (
    <>
      {/* Spawn positions scale with the links so a longer strap still settles
          from the same shape rather than snapping taut on the first frame. */}
      <group position={[0, ANCHOR_Y, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5 * segmentLength, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1 * segmentLength, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5 * segmentLength, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2 * segmentLength, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, CARD_HALF_HEIGHT, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              (e.target as Element).releasePointerCapture?.(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              if (card.current) {
                drag(
                  new THREE.Vector3()
                    .copy(e.point)
                    .sub(vec.copy(card.current.translation())),
                );
              }
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap ?? undefined}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          // `resolution` is a required constructor parameter, so it goes
          // through args rather than being set as a prop after the fact.
          args={[
            { resolution: new THREE.Vector2(1000, isMobile ? 2000 : 1000) },
          ]}
          color="white"
          depthTest={false}
          useMap={1}
          map={bandTexture}
          // Tiling is per band length, so it tracks the rope: a longer strap
          // repeats the weave more times instead of stretching it.
          repeat={new THREE.Vector2(-4 * segmentLength, 1)}
          lineWidth={bandWidth}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(CARD_GLB);
