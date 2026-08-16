"use client";

import { useCallback, useState } from "react";
import { useSticky } from "@/lib/useSticky";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { deriveDifficulty, deriveStats, deriveType, hue, seeded } from "@/lib/derive";

const SHELL = "#c0392b";
const SHELL_DARK = "#8e2a20";
const SCREEN = "#9bbc3f";
const SCREEN_DARK = "#31421f";
const CASE = "#2b2b2b";

export default function FieldGuide({ profile }: { profile: Profile }) {
  const [index, setIndex] = useState(0);
  const [caught, setCaught] = useSticky<string[]>("fieldguide.caught", []);
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);

  const current = profile.projects[index];
  /* Computed across the whole set so no two specimens collide. */
  const rotations = rotationsFor(profile.projects);

  const onCatch = useCallback(() => {
    if (!current) return;
    setCaught((c) => (c.includes(current.slug) ? c : [...c, current.slug]));
    setOpen(current);
  }, [current]);

  if (!current) return null;

  return (
    <div
      className="min-h-dvh w-full px-3 py-6 sm:px-6 sm:py-10"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #3b4252 0%, #22262f 55%, #14161b 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <h1 className="font-display text-2xl text-white sm:text-3xl">
            {profile.name}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-white/50">
            {profile.role} · {profile.projects.length} specimens catalogued
          </p>
        </header>

        {/* Device */}
        <div
          className="rounded-2xl border-4 p-3 shadow-[0_30px_70px_rgba(0,0,0,0.6)] sm:p-5"
          style={{
            borderColor: SHELL_DARK,
            background: `linear-gradient(150deg, ${SHELL} 0%, ${SHELL_DARK} 100%)`,
          }}
        >
          {/* Lights */}
          <div className="mb-3 flex items-center gap-2.5 sm:mb-4">
            <span
              className="grid h-8 w-8 place-items-center rounded-full border-[3px] sm:h-10 sm:w-10"
              style={{ borderColor: "#e8e8e8", backgroundColor: "#4aa3df" }}
            >
              <motion.span
                className="h-3 w-3 rounded-full bg-white/70 sm:h-4 sm:w-4"
                animate={{ opacity: [0.35, 0.9, 0.35] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
            </span>
            {["#e04a3a", "#e0c23a", "#4ad06a"].map((c) => (
              <span
                key={c}
                className="h-2.5 w-2.5 rounded-full border sm:h-3 sm:w-3"
                style={{ backgroundColor: c, borderColor: "#00000033" }}
              />
            ))}
            <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase">
              Field Guide
            </span>
          </div>

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.15fr_1fr]">
            <EntryPanel
              project={current}
              rotation={rotations[index] ?? 0}
              number={index + 1}
              caught={caught.includes(current.slug)}
              onCatch={onCatch}
            />
            <IndexPanel
              profile={profile}
              index={index}
              caught={caught}
              onSelect={setIndex}
            />
          </div>

          {/* Control deck: a real cross-shaped D-pad, not two loose arrows. */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <DPad
              onPrev={() =>
                setIndex((i) => (i - 1 + profile.projects.length) % profile.projects.length)
              }
              onNext={() => setIndex((i) => (i + 1) % profile.projects.length)}
            />

            <div className="flex flex-col items-end gap-2">
              <span
                className="rounded px-2 py-1 font-mono text-[10px] text-white/70"
                style={{ backgroundColor: "#00000055" }}
              >
                {caught.length}/{profile.projects.length} CAUGHT
              </span>
              <span className="flex gap-2">
                <span
                  className="grid h-9 w-9 place-items-center rounded-full border-2 font-mono text-[11px] text-white"
                  style={{ borderColor: "#00000044", backgroundColor: "#c0392b" }}
                >
                  B
                </span>
                <span
                  className="grid h-9 w-9 place-items-center rounded-full border-2 font-mono text-[11px] text-white"
                  style={{ borderColor: "#00000044", backgroundColor: "#2b6cb0" }}
                >
                  A
                </span>
              </span>
            </div>
          </div>
        </div>

        <TypeChart profile={profile} />
        <Trade profile={profile} />
      </div>

      <SpecimenModal
        project={open}
        rotation={open ? (rotations[profile.projects.indexOf(open)] ?? 0) : 0}
        onClose={close}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Cross-shaped D-pad; left and right are live, up/down are dressing. */
function DPad({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const pad = "grid place-items-center text-white/80 transition-transform";
  const face = { backgroundColor: CASE, borderColor: "#00000055" };
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-[2px]">
      <span />
      <span className={`${pad} h-9 w-11 rounded-t-md border-2`} style={face}>
        ▲
      </span>
      <span />

      <button
        onClick={onPrev}
        aria-label="Previous specimen"
        className={`${pad} h-11 w-11 rounded-l-md border-2 active:translate-x-[-1px]`}
        style={face}
      >
        ◀
      </button>
      <span className="grid h-11 w-11 place-items-center border-y-2" style={face}>
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#00000055" }} />
      </span>
      <button
        onClick={onNext}
        aria-label="Next specimen"
        className={`${pad} h-11 w-11 rounded-r-md border-2 active:translate-x-[1px]`}
        style={face}
      >
        ▶
      </button>

      <span />
      <span className={`${pad} h-9 w-11 rounded-b-md border-2`} style={face}>
        ▼
      </span>
      <span />
    </div>
  );
}

/** The base sprite is a red dragon, so rotations are measured from red. */
const SPRITE_HUE = 6;
/** Below this many degrees apart, two swaps read as the same creature. */
const MIN_SEPARATION = 34;

const circularGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
};

/**
 * A hue rotation per project, nudged apart where accents are close.
 *
 * Two projects can share a hue family — an orange and an amber sit 10° apart —
 * and would palette-swap to visibly the same creature. Anything too near an
 * already-assigned rotation gets pushed around the wheel until it is distinct.
 */
function rotationsFor(projects: Project[]): number[] {
  const used: number[] = [];
  return projects.map((p) => {
    let r = Math.round(hue(p.accent) - SPRITE_HUE);
    let guard = 0;
    while (used.some((u) => circularGap(r, u) < MIN_SEPARATION) && guard++ < 12) {
      r = (r + MIN_SEPARATION + 6) % 360;
    }
    used.push(r);
    return r;
  });
}

/**
 * Specimen sprite (ART-PROMPTS B1), palette-swapped per project.
 *
 * One illustrated sprite rotated to each project's accent hue gives six
 * distinct creatures from a single 40KB asset — which is exactly how the games
 * this references produced variants, so it reads as deliberate. Projects whose
 * accent is close to the sprite's own red get a nudge so no two look alike.
 */
function SpecimenArt({ rotation }: { rotation: number }) {
  return (
    <img
      src="/art/creature.webp"
      alt=""
      aria-hidden
      className="h-full w-full object-contain"
      style={{
        imageRendering: "pixelated",
        filter: `hue-rotate(${rotation}deg) saturate(1.05)`,
      }}
    />
  );
}

/** Kept as the fallback for a profile shipped without the sprite. */
function SpecimenArtFallback({ project }: { project: Project }) {
  const s = seeded(project.slug);
  const s2 = seeded(project.slug + "b");
  const { color } = deriveType(project);
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <ellipse cx="50" cy="88" rx="30" ry="5" fill={SCREEN_DARK} opacity="0.35" />
      {/* body */}
      <ellipse cx="50" cy="60" rx={22 + s * 8} ry={20 + s2 * 6} fill={project.accent} />
      {/* head */}
      <circle cx="50" cy={34 + s * 4} r={15 + s2 * 4} fill={project.accent} />
      {/* ears / spikes */}
      <polygon
        points={`${38 - s * 4},${26} ${44},${10 + s2 * 6} ${48},${26}`}
        fill={color}
      />
      <polygon
        points={`${52},${26} ${56},${10 + s * 6} ${62 + s2 * 4},${26}`}
        fill={color}
      />
      {/* eyes */}
      <circle cx="45" cy={33 + s * 3} r="2.6" fill={SCREEN_DARK} />
      <circle cx="56" cy={33 + s * 3} r="2.6" fill={SCREEN_DARK} />
      {/* belly */}
      <ellipse cx="50" cy="64" rx={11 + s * 3} ry={10} fill="#ffffff" opacity="0.28" />
      {/* feet */}
      <ellipse cx="40" cy="80" rx="7" ry="4.5" fill={color} />
      <ellipse cx="60" cy="80" rx="7" ry="4.5" fill={color} />
    </svg>
  );
}

function EntryPanel({
  project,
  rotation,
  number,
  caught,
  onCatch,
}: {
  project: Project;
  rotation: number;
  number: number;
  caught: boolean;
  onCatch: () => void;
}) {
  const { type, color } = deriveType(project);
  const stats = deriveStats(project);
  const diff = deriveDifficulty(project);

  return (
    <div
      className="rounded-xl border-4 p-3 sm:p-4"
      style={{ borderColor: "#e8e8e8", backgroundColor: CASE }}
    >
      {/* Screen */}
      <div
        className="relative overflow-hidden rounded-md border-2"
        style={{ borderColor: SCREEN_DARK, backgroundColor: SCREEN }}
      >
        {/* LCD scan texture — a flat green field read as a blank panel. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(49,66,31,0.55) 0 1px, transparent 1px 3px)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, rgba(49,66,31,0.5) 0 1px, transparent 1px 4px)",
          }}
        />
        {/* stage the specimen stands on */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 h-[10px] w-[58%] -translate-x-1/2 rounded-[50%]"
          style={{ bottom: 74, backgroundColor: SCREEN_DARK, opacity: 0.28 }}
        />

        <div className="relative flex items-start justify-between px-2.5 pt-2">
          <span
            className="font-mono text-[11px] font-bold"
            style={{ color: SCREEN_DARK }}
          >
            No.{String(number).padStart(3, "0")}
          </span>
          <span
            className="rounded px-1.5 py-[1px] font-mono text-[10px] font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {type.toUpperCase()}
          </span>
        </div>

        {/* Scale only. Starting at opacity 0 meant the specimen was invisible
            whenever the entry animation didn't run — the screen just went blank. */}
        <motion.div
          key={project.slug}
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative mx-auto h-[150px] w-[150px] sm:h-[180px] sm:w-[180px]"
        >
          <SpecimenArt rotation={rotation} />
        </motion.div>

        <div
          className="relative border-t-2 px-2.5 py-2"
          style={{ borderColor: SCREEN_DARK, backgroundColor: "#8fb038" }}
        >
          <p
            className="font-display text-xl leading-tight"
            style={{ color: SCREEN_DARK }}
          >
            {project.name}
          </p>
          <p className="mt-0.5 text-[12px]" style={{ color: "#4a5c27" }}>
            {project.blurb}
          </p>
        </div>
      </div>

      {/* Stats */}
      <dl className="mt-3 space-y-1.5">
        {(
          [
            ["POWER", stats.power],
            ["CRAFT", stats.craft],
            ["SCALE", stats.scale],
            ["POLISH", stats.polish],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <dt className="w-14 shrink-0 font-mono text-[9.5px] text-white/45">{k}</dt>
            <dd className="flex flex-1 items-center gap-2">
              <span className="h-1.5 flex-1 rounded-full bg-white/10">
                <motion.span
                  className="block h-full rounded-full"
                  style={{ backgroundColor: project.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${v}%` }}
                  transition={{ duration: 0.5 }}
                />
              </span>
              <span className="w-6 text-right font-mono text-[10px] text-white/50">
                {v}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] text-white/40">
          RARITY {"★".repeat(diff)}
          <span className="text-white/15">{"★".repeat(5 - diff)}</span>
        </p>
        <button
          onClick={onCatch}
          className="min-h-[44px] rounded-md border-2 px-4 font-mono text-[11px] font-bold tracking-wider text-white uppercase transition-transform active:translate-y-[2px]"
          style={{
            borderColor: "#00000044",
            backgroundColor: caught ? "#4ad06a" : SHELL,
            boxShadow: "0 3px 0 #00000055",
          }}
        >
          {caught ? "✓ Caught — read" : "Catch it"}
        </button>
      </div>
    </div>
  );
}

function IndexPanel({
  profile,
  index,
  caught,
  onSelect,
}: {
  profile: Profile;
  index: number;
  caught: string[];
  onSelect: (i: number) => void;
}) {
  return (
    <div
      className="rounded-xl border-4 p-3 sm:p-4"
      style={{ borderColor: "#e8e8e8", backgroundColor: CASE }}
    >
      <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-white/45 uppercase">
        Index
      </p>
      <ul
        className="max-h-[340px] space-y-1 overflow-y-auto rounded-md border-2 p-1.5"
        style={{ borderColor: "#00000055", backgroundColor: "#1e1e1e" }}
      >
        {profile.projects.map((p, i) => {
          const active = i === index;
          const { type, color } = deriveType(p);
          return (
            <li key={p.slug}>
              <button
                onClick={() => onSelect(i)}
                aria-current={active}
                className="flex w-full items-center gap-2.5 rounded px-2 py-2 text-left transition"
                style={{
                  backgroundColor: active ? `${p.accent}2a` : "transparent",
                  outline: active ? `1px solid ${p.accent}` : "none",
                }}
              >
                <span className="w-9 shrink-0 font-mono text-[10px] text-white/35">
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] text-white/85">
                    {p.name}
                  </span>
                  <span className="block truncate text-[11px] text-white/35">
                    {p.year} · {p.role}
                  </span>
                </span>
                <span
                  className="shrink-0 rounded px-1.5 py-[1px] font-mono text-[8.5px] text-white"
                  style={{ backgroundColor: color }}
                >
                  {type.toUpperCase()}
                </span>
                <span className="w-4 shrink-0 text-center text-[11px]">
                  {caught.includes(p.slug) ? "●" : "○"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[12.5px] leading-relaxed text-white/45">
        {profile.bioShort}
      </p>
    </div>
  );
}

function TypeChart({ profile }: { profile: Profile }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-xl text-white">Type chart</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile.skills.map((g) => (
          <div
            key={g.category}
            className="rounded-xl border p-4"
            style={{ borderColor: "#ffffff18", backgroundColor: "#ffffff08" }}
          >
            <h3 className="font-display text-lg text-white">{g.category}</h3>
            <p className="mt-1 text-[12.5px] text-white/45">{g.summary}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {g.items.map((s) => (
                <li
                  key={s.name}
                  className="rounded px-2 py-1 font-mono text-[10.5px] text-white"
                  style={{
                    backgroundColor: `rgba(255,255,255,${0.06 + s.level * 0.04})`,
                  }}
                >
                  {s.name}
                  <span className="ml-1.5 opacity-50">{s.level}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Trade({ profile }: { profile: Profile }) {
  return (
    <section className="mt-10 mb-10">
      <div
        className="rounded-xl border p-5"
        style={{ borderColor: "#ffffff18", backgroundColor: "#ffffff08" }}
      >
        <h2 className="font-display text-xl text-white">Trade with me</h2>
        <p className="mt-1.5 text-[14px] text-white/50">
          {profile.availability} · {profile.location}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {profile.links.map((l) => (
            <li key={l.kind}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2 transition hover:border-white/35"
                style={{ borderColor: "#ffffff18" }}
              >
                <span className="font-mono text-[10.5px] tracking-wider text-white/40 uppercase">
                  {l.label}
                </span>
                <span className="truncate text-[13px] text-white/80">{l.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SpecimenModal({
  project,
  rotation,
  onClose,
}: {
  project: Project | null;
  rotation: number;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(project !== null, onClose);
  if (!project) return null;
  const { type, color } = deriveType(project);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-lg overflow-y-auto rounded-xl border-4 p-5 outline-none"
        style={{ borderColor: "#e8e8e8", backgroundColor: CASE, color: "#eceff4" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 rounded border px-2 py-0.5 text-sm text-white/50 transition hover:text-white"
          style={{ borderColor: "#ffffff2a" }}
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <span
            className="h-16 w-16 shrink-0 rounded-md border-2"
            style={{ borderColor: SCREEN_DARK, backgroundColor: SCREEN }}
          >
            <SpecimenArt rotation={rotation} />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] text-white/40">
              {project.year} · {project.role}
            </p>
            <h2 className="font-display text-2xl leading-tight">{project.name}</h2>
            <span
              className="mt-1 inline-block rounded px-1.5 py-[1px] font-mono text-[9.5px] text-white"
              style={{ backgroundColor: color }}
            >
              {type.toUpperCase()}
            </span>
          </div>
        </div>

        <p className="mt-4 text-[14.5px] leading-relaxed whitespace-pre-line text-white/75">
          {project.description}
        </p>

        {project.highlights.length > 0 && (
          <>
            <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-white/35 uppercase">
              Abilities
            </p>
            <ul className="mt-2 space-y-1.5">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 text-[14px] text-white/70">
                  <span style={{ color: project.accent }}>▸</span>
                  {h}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-white/35 uppercase">
          Moveset
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded border px-2 py-1 text-[12px] text-white/70"
              style={{ borderColor: "#ffffff22" }}
            >
              {t}
            </li>
          ))}
        </ul>

        {(project.live || project.repo) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: project.accent }}
              >
                Visit site ↗
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border px-4 py-2.5 text-[13px] transition-transform hover:-translate-y-0.5"
                style={{ borderColor: "#ffffff2a" }}
              >
                Source ↗
              </a>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
