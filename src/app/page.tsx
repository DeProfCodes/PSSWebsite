import type { Metadata } from "next";

import { FinalCta } from "@/components/sections/FinalCta";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Testimonials } from "@/components/sections/Testimonials";
import { ClientLogos } from "@/components/sections/home/ClientLogos";
import { CredibilityBand } from "@/components/sections/home/CredibilityBand";
import { FlagshipEcosystem } from "@/components/sections/home/FlagshipEcosystem";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { SelectedWork } from "@/components/sections/home/SelectedWork";
import { WhatWeBuild } from "@/components/sections/home/WhatWeBuild";
import { WhyPss } from "@/components/sections/home/WhyPss";
import { routes } from "@/config/routes";
import { pageSeo } from "@/data/seo";
import { buildPageMetadata } from "@/lib/seo";

const baseMetadata = buildPageMetadata({ description: pageSeo.home.description, path: routes.home });

export const metadata: Metadata = {
  ...baseMetadata,
  title: { absolute: pageSeo.home.title },
};

/**
 * Home — built to answer, within seconds: what PSS builds, proof of real
 * multi-platform systems, how we work, and how to get in touch.
 * Rhythm: dark hero → dark flagship → light work → dark capabilities →
 * pale process → dark differentiators → light client logos → dark CTA.
 * Sections without real content (e.g. testimonials) render nothing.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <CredibilityBand />
      <FlagshipEcosystem />
      <SelectedWork />
      <WhatWeBuild />
      <HowWeWork />
      <WhyPss />
      <ClientLogos />
      <Testimonials />
      <FinalCta />
    </>
  );
}
