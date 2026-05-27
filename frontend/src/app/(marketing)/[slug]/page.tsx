import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INDUSTRIES, getIndustry } from "@/lib/industries";
import { COMPETITORS, getCompetitor } from "@/lib/competitors";
import { IndustryView } from "@/components/marketing/IndustryView";
import { CompetitorView } from "@/components/marketing/CompetitorView";

type Params = Promise<{ slug: string }>;

// Root-level programmatic pages (industry + competitor). Only known slugs are
// valid — anything else 404s. Static marketing routes take precedence.
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...INDUSTRIES.map((industry) => ({ slug: industry.slug })),
    ...COMPETITORS.map((competitor) => ({ slug: competitor.slug })),
  ];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;

  const industry = getIndustry(slug);
  if (industry) {
    return buildMeta(slug, industry.metaTitle, industry.metaDescription);
  }

  const competitor = getCompetitor(slug);
  if (competitor) {
    return buildMeta(slug, competitor.metaTitle, competitor.metaDescription);
  }

  return {};
}

function buildMeta(slug: string, title: string, description: string): Metadata {
  const fullTitle = `${title} — DailyBrew`;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: fullTitle, description, url: `/${slug}`, images: ["/android-chrome-512.png"] },
    twitter: { title: fullTitle, description, images: ["/android-chrome-512.png"] },
  };
}

export default async function ProgrammaticPage({ params }: { params: Params }) {
  const { slug } = await params;

  const industry = getIndustry(slug);
  if (industry) {
    return <IndustryView industry={industry} />;
  }

  const competitor = getCompetitor(slug);
  if (competitor) {
    return <CompetitorView competitor={competitor} />;
  }

  notFound();
}
