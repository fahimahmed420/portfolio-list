import type { ComponentType } from "react";
import type { Profile } from "@/data/types";

/**
 * Metadata about a design itself — not about the person it renders.
 * Lives in its own module (no "use client") so the gallery can read it
 * without pulling any design's runtime into the bundle.
 */
export type DesignMeta = {
  slug: string;
  /** Display name, e.g. "Devopoly". */
  name: string;
  /** One line, shown on the gallery card. */
  pitch: string;
  /** A sentence or two, shown on the design's own route and in <meta>. */
  description: string;
  /** Short descriptors: "playful", "keyboard-first", "print". */
  tags: string[];
  /** 4 hex colors that characterise the design. Drives the gallery swatches. */
  palette: [string, string, string, string];
  /** Which poster illustration the gallery card renders — see components/Poster.tsx. */
  poster: string;
  /** Rough sense of how heavy the interaction is. */
  interaction: "browse" | "keyboard" | "game";
};

/** A design component receives a profile and renders a complete portfolio. */
export type DesignComponent = ComponentType<{ profile: Profile }>;
