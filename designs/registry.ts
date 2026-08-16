import type { DesignMeta } from "./types";

import devopoly from "./devopoly/meta";
import terminal from "./terminal/meta";
import arcade from "./arcade/meta";
import editorial from "./editorial/meta";
import rpg from "./rpg/meta";
import cards from "./cards/meta";
import skilltree from "./skilltree/meta";
import fieldguide from "./fieldguide/meta";
import claw from "./claw/meta";
import cartridge from "./cartridge/meta";
import desktop from "./desktop/meta";
import casefile from "./casefile/meta";
import mission from "./mission/meta";
import newspaper from "./newspaper/meta";
import museum from "./museum/meta";
import album from "./album/meta";
import openworld from "./openworld/meta";
import inventory from "./inventory/meta";
import comic from "./comic/meta";
import departures from "./departures/meta";
import casino from "./casino/meta";

/**
 * The single source of truth for which designs exist.
 *
 * Metadata only — no component imports — so the gallery, `generateStaticParams`
 * and `generateMetadata` can read this without pulling four full designs into
 * the client bundle. The components themselves are lazily loaded per route in
 * `app/d/[slug]/DesignHost.tsx`.
 *
 * To add a design: create `designs/<slug>/{meta.ts,index.tsx}`, add its meta
 * here, and add one lazy import in DesignHost. Nothing else changes.
 */
export const designs: DesignMeta[] = [
  devopoly,
  rpg,
  cards,
  skilltree,
  fieldguide,
  claw,
  cartridge,
  inventory,
  openworld,
  casino,
  desktop,
  casefile,
  mission,
  departures,
  terminal,
  arcade,
  comic,
  editorial,
  newspaper,
  museum,
  album,
];

export const designSlugs = designs.map((d) => d.slug);

export function getDesignMeta(slug: string): DesignMeta | undefined {
  return designs.find((d) => d.slug === slug);
}

/** Wraps around, so the design route always has somewhere to go next. */
export function getNeighbours(slug: string) {
  const i = designs.findIndex((d) => d.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  return {
    prev: designs[(i - 1 + designs.length) % designs.length],
    next: designs[(i + 1) % designs.length],
  };
}
