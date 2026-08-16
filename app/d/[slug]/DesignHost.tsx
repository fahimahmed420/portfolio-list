"use client";

import type { Profile } from "@/data/types";
import type { DesignComponent } from "@/designs/types";

import Devopoly from "@/designs/devopoly";
import Terminal from "@/designs/terminal";
import Arcade from "@/designs/arcade";
import Editorial from "@/designs/editorial";
import Rpg from "@/designs/rpg";
import Cards from "@/designs/cards";
import SkillTree from "@/designs/skilltree";
import FieldGuide from "@/designs/fieldguide";
import Claw from "@/designs/claw";
import CartridgeDesign from "@/designs/cartridge";
import DesktopOS from "@/designs/desktop";
import CaseFiles from "@/designs/casefile";
import StarMap from "@/designs/mission";
import Broadsheet from "@/designs/newspaper";
import Exhibition from "@/designs/museum";
import AlbumDesign from "@/designs/album";
import OpenWorld from "@/designs/openworld";
import InventoryDesign from "@/designs/inventory";
import ComicDesign from "@/designs/comic";
import DeparturesDesign from "@/designs/departures";
import CasinoDesign from "@/designs/casino";

/**
 * Slug → design component. Adding a design means adding one line here and one
 * entry in `designs/registry.ts`.
 *
 * Imported statically rather than lazily: all four designs share this single
 * dynamic route, so they land in one route chunk either way, and static
 * imports avoid a Suspense reveal that leaves the page on a loading state.
 */
const DESIGNS: Record<string, DesignComponent> = {
  devopoly: Devopoly,
  rpg: Rpg,
  cards: Cards,
  skilltree: SkillTree,
  fieldguide: FieldGuide,
  claw: Claw,
  cartridge: CartridgeDesign,
  desktop: DesktopOS,
  casefile: CaseFiles,
  mission: StarMap,
  terminal: Terminal,
  arcade: Arcade,
  editorial: Editorial,
  newspaper: Broadsheet,
  museum: Exhibition,
  album: AlbumDesign,
  openworld: OpenWorld,
  inventory: InventoryDesign,
  comic: ComicDesign,
  departures: DeparturesDesign,
  casino: CasinoDesign,
};

export default function DesignHost({
  slug,
  profile,
}: {
  slug: string;
  profile: Profile;
}) {
  const Design = DESIGNS[slug];
  if (!Design) return null;
  return <Design profile={profile} />;
}
