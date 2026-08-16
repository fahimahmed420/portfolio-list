"use client";

import type { Profile, Project } from "@/data/types";
import { seeded } from "@/lib/derive";

const PAPER = "#fdf6e3";
const INK = "#111111";
const RED = "#e63946";
const YELLOW = "#ffd23f";

/**
 * Comic outline built from eight offset shadows rather than
 * `-webkit-text-stroke`, which paints the stroke centred on the glyph edge and
 * eats into the fill — at 3px it visibly mangles the letterforms.
 */
function outline(width: number, color: string, drop?: string) {
  const w = width;
  const ring = [
    `${-w}px ${-w}px 0 ${color}`,
    `${w}px ${-w}px 0 ${color}`,
    `${-w}px ${w}px 0 ${color}`,
    `${w}px ${w}px 0 ${color}`,
    `0 ${-w}px 0 ${color}`,
    `0 ${w}px 0 ${color}`,
    `${-w}px 0 0 ${color}`,
    `${w}px 0 0 ${color}`,
  ];
  if (drop) ring.push(drop);
  return ring.join(", ");
}

/** Chapter titles are generated so they keep working for any project list. */
const ARCS = [
  "THE FIRST BUILD",
  "THE CLIENT",
  "THE BUG THAT WOULDN'T DIE",
  "SHIP DAY",
  "THE REWRITE",
  "THE LONG NIGHT",
  "THE HANDOFF",
  "THE ENCORE",
];

export default function Comic({ profile }: { profile: Profile }) {
  return (
    <div
      className="min-h-dvh w-full px-3 py-6 sm:px-6 sm:py-10"
      style={{ backgroundColor: "#2b2b2b" }}
    >
      <div
        className="mx-auto max-w-4xl border-[5px] px-4 py-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:px-8 sm:py-8"
        style={{ borderColor: INK, backgroundColor: PAPER, color: INK }}
      >
        <Cover profile={profile} />

        <Chapter number={1} title="THE ORIGIN">
          <div className="grid gap-4 sm:grid-cols-3">
            <Panel accent={RED} seed="origin-a" className="sm:col-span-2">
              <Caption>{profile.bio.split("\n\n")[0]}</Caption>
            </Panel>
            <Panel accent="#3a8ee6" seed="origin-b">
              <Bubble>{profile.tagline}</Bubble>
            </Panel>
            <Panel accent="#2E9E6B" seed="origin-c">
              <Caption>
                {profile.bio.split("\n\n")[1] ?? profile.bioShort}
              </Caption>
            </Panel>
            <Panel accent={YELLOW} seed="origin-d" className="sm:col-span-2">
              <div className="grid grid-cols-2 gap-2">
                {profile.stats.slice(0, 4).map((s) => (
                  <div
                    key={s.label}
                    className="border-[3px] bg-white px-2 py-1.5"
                    style={{ borderColor: INK }}
                  >
                    <p className="text-lg leading-none font-black">{s.value}</p>
                    <p className="mt-1 text-[11px] leading-tight uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </Chapter>

        {profile.projects.map((p, i) => (
          <ProjectChapter key={p.slug} project={p} number={i + 2} />
        ))}

        <Chapter number={profile.projects.length + 2} title="THE POWERS">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.skills.map((g, i) => (
              <Panel key={g.category} accent={["#e63946", "#3a8ee6", "#2E9E6B", "#7B4FA8", "#ffd23f"][i % 5]} seed={g.category}>
                <p className="text-lg leading-tight font-black uppercase">{g.category}</p>
                <p className="mt-1 text-[12.5px] leading-snug italic">{g.summary}</p>
                <ul className="mt-2.5 space-y-1">
                  {g.items.map((s) => (
                    <li key={s.name} className="flex items-center justify-between gap-2 text-[12.5px]">
                      <span>{s.name}</span>
                      <span className="tracking-[-1px]" style={{ color: RED }}>
                        {"★".repeat(s.level)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
        </Chapter>

        <Chapter number={profile.projects.length + 3} title="THE RECORD">
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.experience.map((e) => (
              <Panel key={`${e.org}-${e.period}`} accent="#3a8ee6" seed={e.org}>
                <p className="text-[11px] font-black tracking-wider uppercase" style={{ color: RED }}>
                  {e.period}
                </p>
                <p className="mt-1 text-lg leading-tight font-black">{e.role}</p>
                <p className="text-[12.5px] italic">{e.org}</p>
                <p className="mt-2 text-[13px] leading-snug">{e.summary}</p>
              </Panel>
            ))}
            {profile.education.map((e) => (
              <Panel key={e.degree} accent="#7B4FA8" seed={e.degree}>
                <p className="text-[11px] font-black tracking-wider uppercase" style={{ color: RED }}>
                  {e.period}
                </p>
                <p className="mt-1 text-lg leading-tight font-black">{e.degree}</p>
                <p className="text-[12.5px] italic">{e.org}</p>
              </Panel>
            ))}
          </div>
        </Chapter>

        {/* Final panel */}
        <div
          className="mt-8 border-[5px] p-6 text-center sm:p-9"
          style={{ borderColor: INK, backgroundColor: YELLOW }}
        >
          <p className="text-2xl font-black tracking-tight uppercase italic sm:text-4xl">
            To be continued…
          </p>
          <p className="mt-3 text-[14px] font-bold">
            {profile.availability} · {profile.location}
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border-[3px] bg-white px-3 py-2 text-[12.5px] font-bold transition-transform hover:-translate-y-1"
                  style={{ borderColor: INK, boxShadow: `3px 3px 0 ${INK}` }}
                >
                  {l.label} — {l.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-[11px] tracking-[0.2em] uppercase" style={{ color: "#8a8375" }}>
          All characters herein are fictitious
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Halftone({ color, seed }: { color: string; seed: string }) {
  const s = seeded(seed);
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(${color} 28%, transparent 29%)`,
        backgroundSize: `${6 + s * 4}px ${6 + s * 4}px`,
        opacity: 0.35,
      }}
    />
  );
}

/**
 * Panel art (ART-PROMPTS A8) arrived as one 3×2 sheet of six silver-age
 * backgrounds, so each panel windows onto it. `seed` picks which — stable per
 * panel, and varied across the page.
 */
const SCENE_COLS = 3;
const SCENE_ROWS = 2;

function Panel({
  children,
  accent,
  seed,
  className = "",
}: {
  children: React.ReactNode;
  accent: string;
  seed: string;
  className?: string;
}) {
  const i = Math.floor(seeded(seed) * SCENE_COLS * SCENE_ROWS) % (SCENE_COLS * SCENE_ROWS);
  const col = i % SCENE_COLS;
  const row = Math.floor(i / SCENE_COLS);
  return (
    <div
      className={`relative overflow-hidden border-[4px] p-3.5 ${className}`}
      style={{ borderColor: INK, backgroundColor: "#fffdf6" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "url(/art/comic-panels.webp)",
          backgroundSize: `${SCENE_COLS * 100}% ${SCENE_ROWS * 100}%`,
          backgroundPosition: `${(col / (SCENE_COLS - 1)) * 100}% ${(row / (SCENE_ROWS - 1)) * 100}%`,
        }}
      />
      <Halftone color={accent} seed={seed} />
      {/* corner flash */}
      <span
        aria-hidden
        className="absolute -top-6 -right-6 h-14 w-14 rotate-45"
        style={{ backgroundColor: accent, opacity: 0.55 }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="border-[3px] px-2.5 py-2 text-[13px] leading-snug"
      style={{ borderColor: INK, backgroundColor: YELLOW }}
    >
      {children}
    </p>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="relative rounded-2xl border-[3px] bg-white px-3.5 py-3 text-[14px] leading-snug font-bold italic"
      style={{ borderColor: INK }}
    >
      “{children}”
      <span
        aria-hidden
        className="absolute -bottom-3 left-6 h-0 w-0"
        style={{
          borderLeft: `12px solid transparent`,
          borderRight: `6px solid transparent`,
          borderTop: `14px solid ${INK}`,
        }}
      />
    </p>
  );
}

function Sfx({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-block -rotate-6 text-2xl leading-none font-black tracking-tight uppercase italic sm:text-3xl"
      style={{ color, textShadow: outline(2, INK, `4px 4px 0 rgba(0,0,0,0.3)`) }}
    >
      {children}
    </span>
  );
}

function Cover({ profile }: { profile: Profile }) {
  return (
    <header
      className="relative overflow-hidden border-[5px] px-5 py-8 text-center sm:px-8 sm:py-12"
      style={{ borderColor: INK, backgroundColor: RED }}
    >
      <Halftone color="#ffffff" seed="cover" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 text-left">
          <span
            className="border-[3px] bg-white px-2 py-1 text-[11px] font-black uppercase"
            style={{ borderColor: INK }}
          >
            Issue #1
          </span>
          <span
            className="border-[3px] px-2 py-1 text-[11px] font-black uppercase"
            style={{ borderColor: INK, backgroundColor: YELLOW }}
          >
            {profile.projects.length} chapters
          </span>
        </div>

        <h1
          className="mt-6 leading-[0.86] font-black tracking-[-0.03em] uppercase"
          style={{
            fontSize: "clamp(2.4rem,9vw,5.6rem)",
            color: YELLOW,
            textShadow: outline(3, INK, `9px 9px 0 rgba(0,0,0,0.35)`),
          }}
        >
          {profile.name}
        </h1>

        <p
          className="mt-5 inline-block border-[3px] bg-white px-3 py-1.5 text-[13px] font-black tracking-wide uppercase sm:text-[15px]"
          style={{ borderColor: INK }}
        >
          {profile.role}
        </p>
      </div>
    </header>
  );
}

function Chapter({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center border-[3px] text-[15px] font-black"
          style={{ borderColor: INK, backgroundColor: YELLOW }}
        >
          {number}
        </span>
        <h2 className="text-xl leading-none font-black tracking-tight uppercase italic sm:text-2xl">
          {title}
        </h2>
        <span className="h-[4px] flex-1" style={{ backgroundColor: INK }} />
      </div>
      {children}
    </section>
  );
}

function ProjectChapter({ project, number }: { project: Project; number: number }) {
  const arc = ARCS[(number - 2) % ARCS.length];
  return (
    <Chapter number={number} title={`${arc} — ${project.name.toUpperCase()}`}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel accent={project.accent} seed={project.slug} className="sm:col-span-2">
          <Caption>{project.description}</Caption>
        </Panel>

        <Panel accent={project.accent} seed={`${project.slug}-b`}>
          <p className="text-[11px] font-black tracking-wider uppercase" style={{ color: RED }}>
            {project.year} · {project.role}
          </p>
          <Bubble>{project.blurb}</Bubble>
        </Panel>

        {project.highlights.slice(0, 2).map((h, i) => (
          <Panel key={h} accent={project.accent} seed={`${project.slug}-h${i}`}>
            <Sfx color={i === 0 ? YELLOW : "#ffffff"}>
              {i === 0 ? "BAM!" : "POW!"}
            </Sfx>
            <p className="mt-2.5 text-[13px] leading-snug font-bold">{h}</p>
          </Panel>
        ))}

        <Panel accent={project.accent} seed={`${project.slug}-t`}>
          <p className="text-[11px] font-black tracking-wider uppercase">Equipment</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <li
                key={t}
                className="border-[2px] bg-white px-1.5 py-[3px] text-[11.5px] font-bold"
                style={{ borderColor: INK }}
              >
                {t}
              </li>
            ))}
          </ul>
          {(project.live || project.repo) && (
            <p className="mt-3 flex flex-wrap gap-3 text-[12px] font-black uppercase">
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer" className="border-b-[3px]" style={{ borderColor: RED }}>
                  Read on ↗
                </a>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noopener noreferrer" className="border-b-[3px]" style={{ borderColor: INK }}>
                  Source ↗
                </a>
              )}
            </p>
          )}
        </Panel>
      </div>
    </Chapter>
  );
}
