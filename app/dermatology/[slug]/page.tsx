import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { ProductCard } from "@/components/dermatology/product-card";
import { ProductVideo } from "@/components/dermatology/product-video";
import { ProductRequest } from "@/components/dermatology/product-request";
import { ProductPlaceholder } from "@/components/dermatology/product-placeholder";
import { products, productBySlug } from "@/content/dermatology";
import { brandLogos } from "@/content/site";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};

  // Falls back to the taxonomy rather than inventing a description — it states
  // only what is known for certain: what the thing is and who makes it.
  const description =
    product.summary ||
    `${product.name} — ${product.category} from ${product.brand}, supplied and supported by TribuCare for clinics across Egypt and MENA.`;

  return {
    title: product.name,
    description,
    openGraph: {
      type: "website",
      title: `${product.name} — ${product.brand}`,
      description,
      ...(product.image ? { images: [{ url: product.image }] } : {}),
    },
    alternates: { canonical: `/dermatology/${product.slug}` },
  };
}

/** Section heading, so every block on the page is set the same way. */
function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section" className="mt-12">
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </Reveal>
  );
}

/** The bulleted list used by features, applications and benefits alike. */
function Points({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-ink-soft"
        >
          <span
            aria-hidden="true"
            className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-600"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);

  if (!product) notFound();

  const logo = brandLogos[product.brand];
  const related = products
    .filter((p) => p.slug !== product.slug && p.line === product.line)
    .slice(0, 3);

  // True while TribuCare has not yet supplied anything beyond the taxonomy. The
  // page says so plainly instead of padding itself out — see the sourcing rule
  // at the top of content/dermatology.ts.
  const hasDetail =
    Boolean(product.overview) ||
    product.features.length > 0 ||
    product.specs.length > 0 ||
    product.applications.length > 0 ||
    product.benefits.length > 0;

  return (
    <article className="min-h-screen bg-gradient-to-b from-brand-50/50 via-white to-brand-50/30 pt-28 pb-24">
      <Shell>
        <Reveal>
          <Link
            href="/dermatology"
            className="group inline-flex items-center gap-2 rounded-xl border border-brand-200/80 bg-white px-4 py-2 text-xs font-semibold text-brand-800 shadow-sm transition-all hover:bg-brand-50 hover:shadow"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Back to Dermatology Solutions
          </Link>
        </Reveal>

        {/* ---- Header --------------------------------------------------- */}
        <header className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <Reveal delay={60}>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-brand-800">
                <span className="rounded-xl border border-brand-200 bg-brand-100/80 px-3.5 py-1 tracking-wider text-brand-900 uppercase">
                  {product.category}
                </span>
                <span className="flex items-center gap-1 font-normal text-ink-faint">
                  <Building2 className="size-3.5" aria-hidden="true" />
                  {product.brand}
                </span>
                <span className="text-ink-faint" aria-hidden="true">
                  •
                </span>
                <span className="flex items-center gap-1 font-normal text-ink-faint">
                  <Layers className="size-3.5" aria-hidden="true" />
                  {product.line === "devices" ? "Device" : "Injectable"}
                </span>
              </div>
            </Reveal>

            <LineReveal
              as="h1"
              delay={120}
              className="mt-6 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.025em] text-ink"
              lines={[product.name]}
            />

            {product.summary && (
              <Reveal delay={200}>
                <p className="mt-6 text-xl leading-relaxed text-ink-soft">
                  {product.summary}
                </p>
              </Reveal>
            )}

            {logo && (
              <Reveal delay={240}>
                <div className="mt-8 flex items-center gap-4 border-t border-brand-100 pt-6">
                  <Image
                    src={logo.src}
                    alt={product.brand}
                    width={logo.width}
                    height={logo.height}
                    className="h-6 w-auto max-w-[8rem] object-contain"
                  />
                  <span className="text-xs text-ink-faint">
                    Represented in Egypt by TribuCare
                  </span>
                </div>
              </Reveal>
            )}

            <Reveal delay={280}>
              <a
                href="#request"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-brand-800 hover:shadow-lg"
              >
                Request a demo, quote or support visit
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          </div>

          {/* Holds the slot whether or not a shot exists, so the header keeps
              its proportions and the page does not reflow when one lands. */}
          <Reveal className="lg:col-span-6" delay={140} from="scale">
            <div className="card-surface relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
              {product.image ? (
                <>
                  <div
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-100/90 to-brand-50/30"
                  />
                  <Image
                    src={product.image}
                    alt={product.imageAlt || product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain object-center p-8"
                  />
                </>
              ) : (
                <ProductPlaceholder brand={product.brand} />
              )}
            </div>
          </Reveal>
        </header>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {product.video && (
              <Reveal from="scale">
                <ProductVideo
                  src={product.video}
                  poster={product.videoPoster}
                  title={`${product.name} — product video`}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              </Reveal>
            )}

            {product.overview && (
              <Block title="Overview">
                <p className="text-base leading-relaxed text-ink-soft">
                  {product.overview}
                </p>
              </Block>
            )}

            {product.features.length > 0 && (
              <Block title="Key features">
                <Points items={product.features} />
              </Block>
            )}

            {product.specs.length > 0 && (
              <Block title="Specifications">
                <dl className="card-surface divide-y divide-brand-50 overflow-hidden">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3.5"
                    >
                      <dt className="text-[0.8125rem] font-medium text-ink-faint">
                        {spec.label}
                      </dt>
                      <dd className="text-[0.9375rem] font-medium text-ink">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Block>
            )}

            {product.applications.length > 0 && (
              <Block title="Clinical applications">
                <Points items={product.applications} />
              </Block>
            )}

            {product.benefits.length > 0 && (
              <Block title="Benefits">
                <Points items={product.benefits} />
              </Block>
            )}

            {product.gallery.length > 0 && (
              <Block title="Gallery">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {product.gallery.map((src) => (
                    <li
                      key={src}
                      className="card-surface relative aspect-[4/3] overflow-hidden bg-brand-50"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 28vw"
                        className="object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {!hasDetail && (
              /* Says what it does not know. The alternative — filling this with
                 plausible specifications for a regulated medical device — is
                 the one outcome that would actually be dangerous. */
              <Reveal className="mt-12">
                <div className="rounded-3xl border border-dashed border-brand-200 bg-white p-8 text-center">
                  <p className="font-display text-lg font-semibold text-ink">
                    Full specifications available on request
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                    Detailed technical documentation and clinical information for
                    the {product.name} are provided directly by our clinical
                    team. Use the form below and we will send them over.
                  </p>
                </div>
              </Reveal>
            )}
          </div>

          {/* ---- Certificates ------------------------------------------- */}
          <aside className="lg:col-span-5">
            {product.certificates.length > 0 && (
              <Reveal from="right">
                <div className="card-surface p-6 lg:sticky lg:top-28">
                  <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-wider text-brand-900 uppercase">
                    <BadgeCheck
                      className="size-4 text-signal-500"
                      aria-hidden="true"
                    />
                    Certification
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {product.certificates.map((certificate) => (
                      <li
                        key={certificate.label}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-brand-600"
                          aria-hidden="true"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-ink">
                            {certificate.label}
                          </span>
                          {certificate.reference && (
                            <span className="block text-xs text-ink-faint">
                              {certificate.reference}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </aside>
        </div>

        {/* ---- Requests -------------------------------------------------- */}
        <section id="request" className="mt-24 scroll-mt-28">
          <Reveal from="scale">
            <div className="card-surface relative overflow-hidden p-8 shadow-xl sm:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <Eyebrow className="justify-center">Get in touch</Eyebrow>
                <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
                  Request {product.name}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-soft">
                  Choose what you need and our clinical team will follow up
                  directly.
                </p>
              </div>

              <div className="mt-10">
                <ProductRequest productName={product.name} />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---- Related --------------------------------------------------- */}
        {related.length > 0 && (
          <div className="mt-24 border-t border-brand-100 pt-16">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <Eyebrow>More from this line</Eyebrow>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                    {product.line === "devices"
                      ? "Other devices we supply"
                      : "Other injectables we supply"}
                  </h2>
                </div>
                <Link
                  href="/dermatology"
                  className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 sm:inline-flex"
                >
                  View all
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </Reveal>

            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.slug}
                  delay={i * 70}
                  from="scale"
                  className="h-full"
                >
                  <ProductCard product={item} />
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </Shell>
    </article>
  );
}
