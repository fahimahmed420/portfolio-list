import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { profile } from "@/data/profile";
import { designSlugs, getDesignMeta, getNeighbours } from "@/designs/registry";
import DesignFrame from "@/components/DesignFrame";
import DesignHost from "./DesignHost";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return designSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const meta = getDesignMeta(slug);
  if (!meta) return { title: "Not found" };
  return {
    title: meta.name,
    description: meta.description,
  };
}

export default async function DesignPage({ params }: Params) {
  const { slug } = await params;
  const meta = getDesignMeta(slug);
  if (!meta) notFound();

  const { prev, next } = getNeighbours(slug);

  return (
    <>
      <DesignHost slug={slug} profile={profile} />
      <DesignFrame meta={meta} prev={prev} next={next} />
    </>
  );
}
