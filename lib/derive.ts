import type { Profile, Project, SkillGroup } from "@/data/types";

/**
 * Turns a Profile into game-shaped numbers.
 *
 * Several designs need the same thing — attributes, levels, rarity, power —
 * and they must agree with each other and stay stable between renders. So the
 * arithmetic lives here once, and it is entirely derived: nothing below reads
 * a field the Profile doesn't already have, which is what keeps a swapped-in
 * profile working without touching design code.
 */

/** Deterministic hash, so "random-looking" values never change between renders. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Stable pseudo-random in [0,1) from a seed string. */
export function seeded(s: string): number {
  return (hash(s) % 10000) / 10000;
}

/**
 * Rounds a computed coordinate to 2dp.
 *
 * Trigonometry produces the last binary digit differently under Node and the
 * browser — 780.8470824630973 server-side against 780.8470824630972 on the
 * client — and React treats that as a hydration mismatch and throws the tree
 * away. Any value derived from Math.cos/sin/hypot that lands in the DOM must
 * go through here. Two decimals is well under a subpixel at any zoom.
 */
export function coord(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ------------------------------------------------------------------ */
/* Colour                                                              */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const f = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/**
 * Hue of a hex colour, in degrees.
 *
 * Used for palette-swapping a single sprite per project: rotate the artwork's
 * base hue to the project's accent and one asset yields a distinct creature
 * for each. Palette swaps are how the games this references made variants, so
 * it reads as intentional rather than as a shortcut.
 */
export function hue(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

/** WCAG contrast ratio between two hex colours. */
export function contrast(a: string, b: string): number {
  const la = relLuminance(hexToRgb(a));
  const lb = relLuminance(hexToRgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function mix(hex: string, toward: [number, number, number], amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const m = (c: number, t: number) => Math.round(c + (t - c) * amount);
  return `#${[m(r, toward[0]), m(g, toward[1]), m(b, toward[2])]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Nudges a colour until it is legible as *text* on the given background.
 *
 * The project accents are chosen as property-band fills — mid-tone, sized for
 * white text sitting on them. Several designs then use the same value as text
 * on near-black, where a mid-tone red lands around 3.7:1 and fails. Rather than
 * maintaining a second palette per design, this lifts (or darkens) the accent
 * just far enough to clear the target, preserving the hue.
 *
 * Fills, borders and glows should keep using the raw accent — only text needs it.
 */
export function readable(accent: string, bg: string, target = 4.5): string {
  if (contrast(accent, bg) >= target) return accent;
  const bgIsDark = relLuminance(hexToRgb(bg)) < 0.18;
  const toward: [number, number, number] = bgIsDark ? [255, 255, 255] : [0, 0, 0];
  let out = accent;
  for (let step = 0.08; step <= 1; step += 0.08) {
    out = mix(accent, toward, step);
    if (contrast(out, bg) >= target) return out;
  }
  return bgIsDark ? "#ffffff" : "#000000";
}

export type Attribute = {
  /** Three-letter code: STR, INT, DEX… */
  code: string;
  /** The skill group it came from. */
  name: string;
  summary: string;
  /** Classic 3–20 style score. */
  score: number;
  /** D&D-style modifier derived from the score. */
  modifier: number;
  /** Original 1–5 average, for designs that prefer bars to scores. */
  average: number;
  group: SkillGroup;
};

/**
 * Category → attribute code. Falls back to the first three letters, so an
 * unfamiliar skill group still produces something that reads as a stat.
 */
const CODES: Record<string, string> = {
  frontend: "STR",
  backend: "CON",
  "data & infra": "WIS",
  data: "WIS",
  infrastructure: "WIS",
  devops: "WIS",
  "ai & ml": "INT",
  ai: "INT",
  craft: "CHA",
  design: "DEX",
  "ui/ux": "DEX",
  "problem solving": "INT",
  mobile: "AGI",
  security: "DEF",
};

function codeFor(category: string, taken: Set<string>): string {
  const key = category.toLowerCase().trim();
  let code = CODES[key] ?? category.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase();
  // Two groups must never collide, or the sheet shows the same stat twice.
  let n = 1;
  const base = code;
  while (taken.has(code)) {
    code = base.slice(0, 2) + String(n++);
  }
  taken.add(code);
  return code;
}

export function deriveAttributes(profile: Profile): Attribute[] {
  const taken = new Set<string>();
  return profile.skills.map((group) => {
    const average =
      group.items.reduce((a, s) => a + s.level, 0) / Math.max(group.items.length, 1);
    // 1–5 average maps onto a 9–20 score: recognisably RPG, never dump-stat low.
    const score = Math.round(6 + average * 2.8);
    return {
      code: codeFor(group.category, taken),
      name: group.category,
      summary: group.summary,
      score,
      modifier: Math.floor((score - 10) / 2),
      average: Math.round(average * 10) / 10,
      group,
    };
  });
}

/** Character level: experience entries and breadth of shipped work. */
export function deriveLevel(profile: Profile): number {
  const years = Number(
    profile.stats.find((s) => /year/i.test(s.label))?.value.replace(/\D/g, "") || 0,
  );
  return Math.max(
    1,
    years * 3 + profile.experience.length * 2 + profile.projects.length,
  );
}

export function deriveXp(profile: Profile) {
  const level = deriveLevel(profile);
  const total = level * 1000 + profile.projects.length * 250;
  const into = total % 1000;
  return { level, total, into, next: 1000, pct: into / 10 };
}

export type Rarity = "common" | "rare" | "epic" | "legendary";

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; glow: string }
> = {
  common: { label: "Common", color: "#8d99a6", glow: "#8d99a644" },
  rare: { label: "Rare", color: "#3a8ee6", glow: "#3a8ee655" },
  epic: { label: "Epic", color: "#a855f7", glow: "#a855f755" },
  legendary: { label: "Legendary", color: "#f0a91e", glow: "#f0a91e66" },
};

/**
 * Rarity from how much a project actually contains — stack breadth, evidence
 * of outcomes, and whether it shipped somewhere you can visit.
 */
export function deriveRarity(project: Project): Rarity {
  const score =
    project.tech.length +
    project.highlights.length * 1.5 +
    (project.live ? 2 : 0) +
    (project.repo ? 1 : 0);
  if (score >= 15) return "legendary";
  if (score >= 12) return "epic";
  if (score >= 9) return "rare";
  return "common";
}

/** 1–5 difficulty, used as stars, skulls or a stage rating. */
export function deriveDifficulty(project: Project): number {
  return Math.max(1, Math.min(5, Math.round(project.tech.length * 0.75)));
}

/** Card-style combat numbers. Stable, and always in a readable range. */
export function deriveStats(project: Project) {
  const s = seeded(project.slug);
  const base = project.tech.length * 8 + project.highlights.length * 6;
  return {
    power: Math.min(99, 45 + Math.round(base * 0.9 + s * 12)),
    craft: Math.min(99, 50 + Math.round(project.highlights.length * 8 + s * 20)),
    scale: Math.min(99, 40 + Math.round(project.tech.length * 6 + s * 25)),
    polish: Math.min(99, 55 + Math.round((project.live ? 18 : 6) + s * 18)),
  };
}

/**
 * A "type" for card and creature designs, inferred from the stack rather than
 * stored — so it keeps working when the projects change.
 */
const TYPE_RULES: { type: string; color: string; match: RegExp }[] = [
  { type: "Interface", color: "#3a8ee6", match: /react|next|vue|svelte|tailwind|css|ui/i },
  { type: "Data", color: "#2e9e6b", match: /postgres|sql|prisma|mongo|clickhouse|redis|vector/i },
  { type: "Arcane", color: "#a855f7", match: /llm|ai|ml|gpt|rag|embedding|python|fastapi/i },
  { type: "Infra", color: "#e08a2e", match: /docker|kubernetes|terraform|aws|ci|actions|go\b/i },
  { type: "Realtime", color: "#e0483a", match: /websocket|crdt|socket|stream|realtime/i },
];

export function deriveType(project: Project): { type: string; color: string } {
  const hay = project.tech.join(" ");
  for (const rule of TYPE_RULES) {
    if (rule.match.test(hay)) return { type: rule.type, color: rule.color };
  }
  return { type: "Systems", color: "#8d99a6" };
}

/** Every distinct tech across the profile, with the projects that used it. */
export function techIndex(profile: Profile) {
  const map = new Map<string, Project[]>();
  for (const p of profile.projects) {
    for (const t of p.tech) {
      const list = map.get(t) ?? [];
      list.push(p);
      map.set(t, list);
    }
  }
  return [...map.entries()]
    .map(([tech, projects]) => ({ tech, projects }))
    .sort((a, b) => b.projects.length - a.projects.length);
}
