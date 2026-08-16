/**
 * The contract between content and design.
 *
 * Every design in `designs/` is a pure function of a `Profile`. No design may
 * import `data/profile.ts` directly or hardcode a name, project or link —
 * that rule is what makes a design reusable. Swap the profile, keep the design.
 */

export type LinkKind = "github" | "linkedin" | "email" | "site" | "x";

export type Link = {
  kind: LinkKind;
  /** Human label, e.g. "GitHub". */
  label: string;
  /** Display form, e.g. "@jordanvale" or "hey@example.com". */
  handle: string;
  href: string;
};

/** 1–5, rendered as stars / bars / power-ups depending on the design. */
export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export type Skill = {
  name: string;
  level: SkillLevel;
};

export type SkillGroup = {
  /** e.g. "Frontend". Used as a board tile label, so keep it short. */
  category: string;
  /** One line on what this group means in practice. */
  summary: string;
  items: Skill[];
};

export type Project = {
  slug: string;
  name: string;
  /** One line. Shown on cards and tiles. */
  blurb: string;
  /** Two or three sentences. Shown when a project is opened. */
  description: string;
  tech: string[];
  year: string;
  role: string;
  /** Both optional — designs must render cleanly when a project has neither. */
  live?: string;
  repo?: string;
  highlights: string[];
  /** Hex color used for property bands, stage art and accents. */
  accent: string;
  /**
   * Optional path to generated artwork for this project (see docs/ART-PROMPTS.md).
   * Designs fall back to their procedural SVG when it is absent, so a profile
   * without art still renders every design correctly.
   */
  art?: string;
};

export type Experience = {
  role: string;
  org: string;
  period: string;
  summary: string;
};

export type Education = {
  degree: string;
  org: string;
  period: string;
};

export type Stat = {
  label: string;
  value: string;
};

export type Profile = {
  name: string;
  /** Two characters, for tokens, favicons and tight corners. */
  initials: string;
  role: string;
  tagline: string;
  location: string;
  availability: string;
  /** Long form — a paragraph or two. */
  bio: string;
  /** One sentence, for tiles and meta descriptions. */
  bioShort: string;
  /** Light, human detail. Powers the "REST" corner and the arcade's easter eggs. */
  offbeat: string[];
  stats: Stat[];
  skills: SkillGroup[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  links: Link[];
};
