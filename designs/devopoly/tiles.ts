import type { Profile, Project, SkillGroup } from "@/data/types";

/**
 * Board geometry: 8 columns × 6 rows, perimeter only.
 * 2×8 + 2×4 = 24 tiles — 4 corners and 20 properties — matching the
 * reference render. The 6×4 hole in the middle is the centre panel.
 */
export const COLS = 8;
export const ROWS = 6;
export const TILE_COUNT = 24;

export type TileKind = "corner" | "project" | "skill" | "value";
export type CornerId = "start" | "levelup" | "retire" | "rest";

export type ValueCard = {
  id: string;
  label: string;
  sub: string;
  icon: string;
  band: string;
  price: string;
  body: string;
};

export type BoardTile = {
  index: number;
  kind: TileKind;
  label: string;
  sub: string;
  price?: string;
  /** Header band colour. Corners have none. */
  band?: string;
  icon: string;
  corner?: CornerId;
  project?: Project;
  skill?: SkillGroup;
  value?: ValueCard;
  grid: { col: number; row: number };
  /** Which board edge the tile sits on — drives text rotation and layout. */
  edge: "top" | "right" | "bottom" | "left";
};

const SKILL_BAND = "#7b4fa8";

/**
 * Design-owned copy about the craft itself, not about any person — which is
 * why it lives here rather than in the profile. Doubles as the fallback pool
 * when a profile has fewer than six projects or five skill groups.
 */
export const VALUES: ValueCard[] = [
  {
    id: "learn",
    label: "LEARN",
    sub: "Invest in yourself",
    icon: "book",
    band: "#3f8f4e",
    price: "$100",
    body: "The stack you know today expires. Reading the docs, the source, and other people's pull requests is the compounding interest of this job.",
  },
  {
    id: "build",
    label: "BUILD",
    sub: "Ideas into things",
    icon: "hammer",
    band: "#3f8f4e",
    price: "$120",
    body: "Nothing teaches like a half-finished project that refuses to work. Build the thing, then find out what you actually didn't understand.",
  },
  {
    id: "debug",
    label: "DEBUG",
    sub: "Find. Fix. Improve.",
    icon: "glass",
    band: "#e0a02e",
    price: "$110",
    body: "Read the error. Actually read it. Most bugs are a wrong assumption wearing a stack trace as a disguise.",
  },
  {
    id: "ship",
    label: "SHIP",
    sub: "Make impact",
    icon: "rocket",
    band: "#c2382e",
    price: "$150",
    body: "Software that nobody uses is a hobby. Shipping is where the design meets the users who will use it wrong, and teach you something.",
  },
  {
    id: "mentor",
    label: "MENTOR",
    sub: "Help others level up",
    icon: "cap",
    band: "#2e8b8b",
    price: "$110",
    body: "You learn a thing twice: once when you use it, once when you explain it to someone who is stuck.",
  },
  {
    id: "refactor",
    label: "REFACTOR",
    sub: "Make it better always",
    icon: "recycle",
    band: "#3aa0c2",
    price: "$100",
    body: "Leave the file better than you found it. Not rewritten — better. There is a difference, and the difference is the deadline.",
  },
  {
    id: "test",
    label: "TEST",
    sub: "Test for quality",
    icon: "check",
    band: "#3aa0c2",
    price: "$90",
    body: "Tests are not about proving the code works. They are about finding out, at 4pm on a Friday, that it still does.",
  },
  {
    id: "design",
    label: "DESIGN",
    sub: "Great experiences",
    icon: "brush",
    band: "#b8478f",
    price: "$100",
    body: "The interface is the product, as far as anyone outside the repo is concerned. Spacing and copy are engineering decisions.",
  },
  {
    id: "opensource",
    label: "OPEN SOURCE",
    sub: "Give back",
    icon: "code",
    band: "#8a5a2b",
    price: "$70",
    body: "Everything here stands on maintainers who were never paid for it. File the issue. Fix the typo in the README. It counts.",
  },
  {
    id: "community",
    label: "COMMUNITY",
    sub: "Share. Learn. Grow.",
    icon: "users",
    band: "#7b4fa8",
    price: "$80",
    body: "The answer to your obscure problem is usually a person, not a search result. Be findable, and be the person sometimes.",
  },
  {
    id: "tools",
    label: "TOOLS",
    sub: "Upgrade your toolkit",
    icon: "wrench",
    band: "#3a6ea5",
    price: "$90",
    body: "Sharpen the saw, but notice when sharpening the saw has become the project. Both failure modes are real.",
  },
  {
    id: "side",
    label: "SIDE PROJECT",
    sub: "Passion fuels progress",
    icon: "bulb",
    band: "#e8a02e",
    price: "$90",
    body: "The place to try the thing that would never survive a code review at work. Half of them go nowhere. The other half become work.",
  },
  {
    id: "deploy",
    label: "DEPLOY",
    sub: "Go live. Make it real.",
    icon: "cloud",
    band: "#3f8f4e",
    price: "$140",
    body: "It works on your machine. Congratulations — now make it work on a machine you will never log into.",
  },
  {
    id: "maintain",
    label: "MAINTAIN",
    sub: "Keep it running",
    icon: "gear",
    band: "#e8a02e",
    price: "$100",
    body: "The unglamorous majority of the job. Dependency bumps, expiring certificates, and the log line that has been lying to you for months.",
  },
  {
    id: "scale",
    label: "SCALE",
    sub: "Optimize. Grow.",
    icon: "chart",
    band: "#7b4fa8",
    price: "$120",
    body: "Measure first. The bottleneck is almost never where it feels like it is, and it is very often a missing index.",
  },
  {
    id: "document",
    label: "DOCUMENT",
    sub: "Write it down",
    icon: "doc",
    band: "#8a5a2b",
    price: "$80",
    body: "Write for the person who inherits this in eighteen months. Statistically, that person is you, and you will remember nothing.",
  },
  {
    id: "share",
    label: "SHARE",
    sub: "Share your journey",
    icon: "megaphone",
    band: "#3a6ea5",
    price: "$90",
    body: "Post the thing you just figured out. Someone two months behind you is searching for exactly that sentence.",
  },
];

/** Drawn from the CHANCE deck in the centre. Pure flavour. */
export const CHANCE_CARDS = [
  "Production is down. Advance to DEBUG.",
  "A stranger opens a PR that fixes your bug. Collect $50.",
  "You said 'it's a two-line change'. Go back 3 spaces.",
  "Your talk proposal is accepted. Advance to SHARE.",
  "Dependency published a breaking change as a patch. Pay $75.",
  "You wrote the test first, and it caught it. Collect $100.",
  "Someone found your side project on the internet. Advance to SIDE PROJECT.",
  "Force-pushed to main. Do not pass LEVEL UP.",
];

/** Drawn from the COMMUNITY CHEST deck. Also pure flavour. */
export const CHEST_CARDS = [
  "A junior dev thanks you for the code review. Collect $100.",
  "Your README saved someone an afternoon. Collect $60.",
  "You answered the question nobody else would. Advance to MENTOR.",
  "Deleted 400 lines and nothing broke. Collect $150.",
  "The docs you wrote are now the onboarding guide. Collect $120.",
  "You closed 12 stale issues in one sitting. Collect $80.",
  "Maintainer burnout. Take a break — advance to REST.",
  "Your bug report included a reproduction. The world is better. Collect $90.",
];

/** Corner copy — the four fixed anchors of the board. */
export const CORNERS: Record<
  CornerId,
  { label: string; sub: string; icon: string }
> = {
  start: { label: "START", sub: "Every journey begins here", icon: "person" },
  levelup: { label: "LEVEL UP!", sub: "The road so far", icon: "trophy" },
  retire: { label: "RETIRE", sub: "Let's talk", icon: "palm" },
  rest: { label: "REST", sub: "Take a break, recharge", icon: "sleep" },
};

/** Where each index sits on the 8×6 grid, walking clockwise from START. */
export function positionFor(index: number): {
  col: number;
  row: number;
  edge: BoardTile["edge"];
} {
  if (index <= 7) return { col: index + 1, row: 1, edge: "top" };
  if (index <= 11) return { col: COLS, row: index - 8 + 2, edge: "right" };
  if (index <= 19) return { col: COLS - (index - 12), row: ROWS, edge: "bottom" };
  return { col: 1, row: ROWS - 1 - (index - 20), edge: "left" };
}

type Slot =
  | { kind: "corner"; corner: CornerId }
  | { kind: "project"; nth: number }
  | { kind: "skill"; nth: number }
  | { kind: "value"; id: string };

/**
 * The fixed shape of the board. Projects and skills are interleaved with
 * practice tiles so that walking any edge mixes work, ability and philosophy
 * rather than grouping them into blocks.
 */
const SLOTS: Slot[] = [
  { kind: "corner", corner: "start" },
  { kind: "value", id: "learn" },
  { kind: "value", id: "build" },
  { kind: "project", nth: 0 },
  { kind: "project", nth: 1 },
  { kind: "value", id: "debug" },
  { kind: "skill", nth: 0 },
  { kind: "corner", corner: "levelup" },
  { kind: "project", nth: 2 },
  { kind: "skill", nth: 1 },
  { kind: "value", id: "ship" },
  { kind: "value", id: "mentor" },
  { kind: "corner", corner: "retire" },
  { kind: "project", nth: 3 },
  { kind: "skill", nth: 2 },
  { kind: "value", id: "refactor" },
  { kind: "value", id: "test" },
  { kind: "project", nth: 4 },
  { kind: "value", id: "design" },
  { kind: "corner", corner: "rest" },
  { kind: "project", nth: 5 },
  { kind: "value", id: "opensource" },
  { kind: "skill", nth: 3 },
  { kind: "skill", nth: 4 },
];

/** Prices for project tiles, in slot order — the premium side of the board. */
const PROJECT_PRICES = ["$260", "$300", "$280", "$320", "$240", "$220"];

/**
 * A distinct icon per project slot. Six identical laptops made the board read
 * as wallpaper; skills deliberately keep one shared star, because there they
 * are all genuinely the same kind of thing.
 *
 * These must not collide with the nine practice-tile icons that are always on
 * the board (book, hammer, glass, rocket, cap, recycle, check, brush, code) —
 * a repeated glyph two tiles apart reads as a mistake.
 */
const PROJECT_ICONS = ["laptop", "cloud", "chart", "gear", "bulb", "wrench"];
const SKILL_PRICES = ["$180", "$170", "$160", "$175", "$165"];

/**
 * Builds the board for a given profile.
 *
 * Profiles vary, so slots degrade rather than break: a project or skill slot
 * with no content behind it falls back to the next unused practice tile. Any
 * projects beyond the six board slots stay reachable through the centre
 * PROJECTS deck, which always lists everything.
 */
export function buildBoard(profile: Profile): BoardTile[] {
  const usedValueIds = new Set(
    SLOTS.flatMap((s) => (s.kind === "value" ? [s.id] : [])),
  );
  const spare = VALUES.filter((v) => !usedValueIds.has(v.id));
  let spareCursor = 0;
  const nextSpare = (): ValueCard =>
    spare[spareCursor++ % Math.max(spare.length, 1)] ?? VALUES[0];

  return SLOTS.map((slot, index) => {
    const { col, row, edge } = positionFor(index);
    const base = { index, grid: { col, row }, edge };

    if (slot.kind === "corner") {
      const c = CORNERS[slot.corner];
      return {
        ...base,
        kind: "corner" as const,
        corner: slot.corner,
        label: c.label,
        sub: c.sub,
        icon: c.icon,
      };
    }

    if (slot.kind === "project") {
      const project = profile.projects[slot.nth];
      if (project) {
        return {
          ...base,
          kind: "project" as const,
          label: project.name.toUpperCase(),
          sub: project.blurb,
          price: PROJECT_PRICES[slot.nth] ?? "$240",
          band: project.accent,
          icon: PROJECT_ICONS[slot.nth % PROJECT_ICONS.length],
          project,
        };
      }
      const v = nextSpare();
      return {
        ...base,
        kind: "value" as const,
        label: v.label,
        sub: v.sub,
        price: v.price,
        band: v.band,
        icon: v.icon,
        value: v,
      };
    }

    if (slot.kind === "skill") {
      const skill = profile.skills[slot.nth];
      if (skill) {
        return {
          ...base,
          kind: "skill" as const,
          label: skill.category.toUpperCase(),
          sub: skill.summary,
          price: SKILL_PRICES[slot.nth] ?? "$160",
          band: SKILL_BAND,
          icon: "star",
          skill,
        };
      }
      const v = nextSpare();
      return {
        ...base,
        kind: "value" as const,
        label: v.label,
        sub: v.sub,
        price: v.price,
        band: v.band,
        icon: v.icon,
        value: v,
      };
    }

    const v = VALUES.find((x) => x.id === slot.id) ?? VALUES[0];
    return {
      ...base,
      kind: "value" as const,
      label: v.label,
      sub: v.sub,
      price: v.price,
      band: v.band,
      icon: v.icon,
      value: v,
    };
  });
}
