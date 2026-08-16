"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { coord, deriveDifficulty, deriveStats, seeded } from "@/lib/derive";

const CYAN = "#5ad1ff";
const AMBER = "#ffb347";
const PALE = "#c2f5ff";

const CHART = 720; // star map viewBox, square

export default function StarMap({ profile }: { profile: Profile }) {
  const [selected, setSelected] = useState(0);
  const active = profile.projects[selected];

  /* Planets on concentric orbits, deterministic per project. */
  const planets = useMemo(
    () =>
      profile.projects.map((project, i) => {
        const n = profile.projects.length;
        // Innermost orbit clears the star's 66px glow — planets were colliding
        // with the corona and their labels were unreadable over it.
        const orbit = 152 + (i % 3) * 78 + Math.floor(i / 3) * 32;
        const angle = (i / n) * Math.PI * 2 + seeded(project.slug) * 0.9;
        return {
          project,
          orbit,
          angle,
          x: coord(CHART / 2 + Math.cos(angle) * orbit),
          y: coord(CHART / 2 + Math.sin(angle) * orbit * 0.82),
          r: coord(13 + deriveDifficulty(project) * 2.4),
        };
      }),
    [profile.projects],
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        x: coord(seeded(`sx${i}`) * CHART),
        y: coord(seeded(`sy${i}`) * CHART),
        r: coord(0.5 + seeded(`sr${i}`) * 1.3),
        o: coord(0.25 + seeded(`so${i}`) * 0.6),
      })),
    [],
  );

  if (!active) return null;

  return (
    <div
      className="min-h-dvh w-full"
      style={{
        // Deep space plate (ART-PROMPTS A7); the SVG star field sits on top.
        backgroundColor: "#03060e",
        backgroundImage:
          "radial-gradient(ellipse at 50% 30%, rgba(13,26,51,0.65) 0%, rgba(3,6,14,0.9) 70%), url(/art/space.webp)",
        backgroundSize: "auto, cover",
        backgroundAttachment: "fixed",
        color: PALE,
      }}
    >
      {/* HUD bar */}
      <header
        className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-4 py-3 font-mono text-[11px] tracking-[0.16em] uppercase sm:px-8"
        style={{ borderColor: `${CYAN}33` }}
      >
        <span style={{ color: AMBER }}>◆ Mission Control</span>
        <span className="text-white/45">CMDR {profile.name}</span>
        <span className="text-white/30">{profile.location}</span>
        <span className="ml-auto" style={{ color: CYAN }}>
          {profile.projects.length} worlds charted
        </span>
      </header>

      <div className="grid gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_400px]">
        {/* Star map */}
        <div className="min-w-0">
          <svg
            viewBox={`0 0 ${CHART} ${CHART}`}
            className="mx-auto block w-full max-w-[640px]"
            role="group"
            aria-label="Star map"
          >
            <defs>
              <radialGradient id="sun">
                <stop offset="0" stopColor="#fff6d8" />
                <stop offset="0.45" stopColor={AMBER} />
                <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {stars.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
            ))}

            {/* orbits */}
            {[...new Set(planets.map((p) => p.orbit))].map((o) => (
              <ellipse
                key={o}
                cx={CHART / 2}
                cy={CHART / 2}
                rx={o}
                ry={o * 0.82}
                fill="none"
                stroke={CYAN}
                strokeOpacity="0.16"
                strokeWidth="1"
              />
            ))}

            {/* home star */}
            <circle cx={CHART / 2} cy={CHART / 2} r="66" fill="url(#sun)" />
            <circle cx={CHART / 2} cy={CHART / 2} r="26" fill="#fff2cc" />
            <text
              x={CHART / 2}
              y={CHART / 2 + 5}
              textAnchor="middle"
              fill="#5a3d0a"
              style={{ font: "600 15px var(--font-inter), sans-serif" }}
            >
              {profile.initials}
            </text>

            {planets.map((p, i) => {
              const isActive = i === selected;
              return (
                <g
                  key={p.project.slug}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.project.name}. ${p.project.blurb}`}
                  onClick={() => setSelected(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(i);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {/* Invisible hit area — the drawn planet is far under a
                      finger once the chart scales down on a phone. */}
                  <circle cx={p.x} cy={p.y} r={Math.max(p.r + 16, 46)} fill="transparent" />
                  {isActive && (
                    <circle cx={p.x} cy={p.y} r={p.r + 15} fill={p.project.accent} opacity="0.2" />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.r}
                    fill={p.project.accent}
                    stroke={isActive ? PALE : "#ffffff44"}
                    strokeWidth={isActive ? 2.5 : 1.2}
                  />
                  {/* terminator shading */}
                  <path
                    d={`M${p.x} ${p.y - p.r} a ${p.r} ${p.r} 0 0 0 0 ${p.r * 2} Z`}
                    fill="#000"
                    opacity="0.28"
                  />
                  <text
                    x={p.x}
                    y={p.y + p.r + 17}
                    textAnchor="middle"
                    fill={isActive ? PALE : "#c2f5ff"}
                    opacity={isActive ? 1 : 0.55}
                    style={{ font: "500 13px var(--font-inter), sans-serif" }}
                  >
                    {p.project.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <p className="mt-3 text-center font-mono text-[11px] text-white/30">
            select a world on the chart, or from the manifest
          </p>
        </div>

        {/* Briefing rail */}
        <aside className="min-w-0 space-y-8">
          <Briefing project={active} />
          <Manifest
            profile={profile}
            selected={selected}
            onSelect={setSelected}
          />
          <Systems profile={profile} />
          <Log profile={profile} />
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-lg border p-4"
      style={{ borderColor: `${CYAN}2e`, backgroundColor: "rgba(90,209,255,0.04)" }}
    >
      <h2
        className="mb-3 font-mono text-[11px] tracking-[0.22em] uppercase"
        style={{ color: CYAN }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Briefing({ project }: { project: Project }) {
  const stats = deriveStats(project);
  return (
    <Panel title="Mission briefing">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-10 w-10 shrink-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 32% 30%, #ffffff55, ${project.accent} 55%, #00000088)`,
          }}
        />
        <div className="min-w-0">
          <h3 className="text-xl font-semibold">{project.name}</h3>
          <p className="font-mono text-[11.5px] text-white/40">
            {project.year} · {project.role}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[14px] leading-relaxed whitespace-pre-line text-white/70">
        {project.description}
      </p>

      {project.highlights.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2.5 text-[13px] text-white/60">
              <span style={{ color: AMBER }}>▸</span>
              {h}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {(
          [
            ["Thrust", stats.power],
            ["Precision", stats.craft],
            ["Range", stats.scale],
            ["Integrity", stats.polish],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <dt className="font-mono text-[10px] tracking-wider text-white/35 uppercase">
              {k}
            </dt>
            <dd className="mt-1 flex items-center gap-2">
              <span className="h-1 flex-1 rounded-full bg-white/10">
                <motion.span
                  className="block h-full rounded-full"
                  style={{ backgroundColor: project.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${v}%` }}
                  transition={{ duration: 0.5 }}
                />
              </span>
              <span className="font-mono text-[10.5px] text-white/45">{v}</span>
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <li
            key={t}
            className="rounded border px-2 py-1 font-mono text-[11px] text-white/60"
            style={{ borderColor: `${CYAN}33` }}
          >
            {t}
          </li>
        ))}
      </ul>

      {(project.live || project.repo) && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="grid min-h-[44px] place-items-center rounded px-3.5 font-mono text-[11.5px] tracking-wider uppercase transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: project.accent, color: "#03060e" }}
            >
              Land ↗
            </a>
          )}
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="grid min-h-[44px] place-items-center rounded border px-3.5 font-mono text-[11.5px] tracking-wider uppercase transition-transform hover:-translate-y-0.5"
              style={{ borderColor: `${CYAN}44`, color: PALE }}
            >
              Schematics ↗
            </a>
          )}
        </div>
      )}
    </Panel>
  );
}

function Manifest({
  profile,
  selected,
  onSelect,
}: {
  profile: Profile;
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <Panel title="Manifest">
      <ul className="space-y-1">
        {profile.projects.map((p, i) => (
          <li key={p.slug}>
            <button
              onClick={() => onSelect(i)}
              aria-current={i === selected}
              className="flex min-h-[44px] w-full items-center gap-2.5 rounded px-2 text-left transition"
              style={{
                backgroundColor: i === selected ? `${p.accent}22` : "transparent",
              }}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: p.accent }}
              />
              <span className="min-w-0 flex-1 truncate text-[13.5px]">{p.name}</span>
              <span className="shrink-0 font-mono text-[10.5px] text-white/30">
                {p.year}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Systems({ profile }: { profile: Profile }) {
  return (
    <Panel title="Onboard systems">
      <div className="space-y-3.5">
        {profile.skills.map((g) => {
          const avg =
            g.items.reduce((a, s) => a + s.level, 0) / Math.max(g.items.length, 1);
          const pct = Math.round((avg / 5) * 100);
          return (
            <div key={g.category}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13.5px]">{g.category}</p>
                <p className="font-mono text-[10.5px]" style={{ color: pct >= 80 ? "#4ade80" : AMBER }}>
                  {pct >= 80 ? "NOMINAL" : "OPERATIONAL"} {pct}%
                </p>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: CYAN }}
                />
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-white/35">
                {g.items.map((s) => s.name).join(" · ")}
              </p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Log({ profile }: { profile: Profile }) {
  return (
    <Panel title="Mission log">
      <ol className="space-y-3.5">
        {profile.experience.map((e) => (
          <li key={`${e.org}-${e.period}`} className="border-l-2 pl-3" style={{ borderColor: `${AMBER}66` }}>
            <p className="text-[14px]">{e.role}</p>
            <p className="font-mono text-[11px] text-white/40">
              {e.org} · {e.period}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/55">{e.summary}</p>
          </li>
        ))}
      </ol>

      <div className="mt-5 border-t pt-4" style={{ borderColor: `${CYAN}22` }}>
        <p className="text-[13.5px] text-white/60">{profile.availability}</p>
        <ul className="mt-2.5 space-y-1.5">
          {profile.links.map((l) => (
            <li key={l.kind}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3 text-[12.5px] text-white/50 transition hover:text-white"
              >
                <span className="font-mono text-[10.5px] tracking-wider uppercase">
                  {l.label}
                </span>
                <span className="truncate">{l.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
