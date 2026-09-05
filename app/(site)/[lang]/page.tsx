import { Hero } from "@/components/sections/hero";
import { MissionVision } from "@/components/sections/mission-vision";
import { Expertise } from "@/components/sections/expertise";
import { Why } from "@/components/sections/why";
import { Reach } from "@/components/sections/reach";
import { Teams } from "@/components/sections/teams";
import { Careers } from "@/components/sections/careers";
import { BlogSection } from "@/components/sections/blog-section";
import { Faq } from "@/components/sections/faq";
import { Partner } from "@/components/sections/partner";

export default function Home() {
  return (
    <>
      <Hero />
      <MissionVision />
      <Expertise />
      <Why />
      <Reach />
      <Teams />
      <Careers />
      <BlogSection />
      <Faq />
      <Partner />
    </>
  );
}
