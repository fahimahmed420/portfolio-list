"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { deriveType, seeded } from "@/lib/derive";

const WALL = "#eae6df";
const INK = "#1c1a17";
const BRASS = "#8a7a5c";

export default function Exhibition({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);

  /* Rooms are derived from the work itself, not stored on the profile. */
  const rooms = useMemo(() => {
    const map = new Map<string, Project[]>();
    for (const p of profile.projects) {
      const { type } = deriveType(p);
      map.set(type, [...(map.get(type) ?? []), p]);
    }
    return [...map.entries()].map(([name, projects]) => ({ name, projects }));
  }, [profile.projects]);

  const [room, setRoom] = useState(0);
  const current = rooms[room];

  return (
    <div className="min-h-dvh w-full" style={{ backgroundColor: WALL, color: INK }}>
      {/* Entrance */}
      <header className="mx-auto max-w-5xl px-5 pt-14 pb-10 text-center sm:px-8">
        <p className="text-[11px] tracking-[0.32em] uppercase" style={{ color: BRASS }}>
          Now showing
        </p>
        <h1
          className="mt-4 font-display leading-[1.02] tracking-[-0.02em]"
          style={{ fontSize: "clamp(2rem,6vw,4rem)" }}
        >
          {profile.name}
        </h1>
        <p className="mt-3 font-display text-lg italic" style={{ color: `${INK}99` }}>
          {profile.role} — {profile.projects.length} works, {rooms.length} rooms
        </p>
        <p className="mx-auto mt-6 max-w-[58ch] text-[15.5px] leading-[1.75]" style={{ color: `${INK}bb` }}>
          {profile.tagline}
        </p>
      </header>

      {/* Room navigation */}
      <nav
        className="sticky top-0 z-30 border-y backdrop-blur-sm"
        style={{ borderColor: `${INK}1f`, backgroundColor: "rgba(234,230,223,0.92)" }}
        aria-label="Rooms"
      >
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-5 py-2.5 sm:px-8">
          {rooms.map((r, i) => (
            <button
              key={r.name}
              onClick={() => setRoom(i)}
              aria-current={i === room}
              className="min-h-[42px] shrink-0 rounded-full px-4 text-[12px] tracking-[0.14em] whitespace-nowrap uppercase transition"
              style={{
                backgroundColor: i === room ? INK : "transparent",
                color: i === room ? WALL : `${INK}88`,
              }}
            >
              {r.name} <span className="opacity-50">({r.projects.length})</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Gallery wall */}
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="mb-8 text-center text-[12px] tracking-[0.24em] uppercase" style={{ color: BRASS }}>
          Room {String(room + 1).padStart(2, "0")} — {current?.name}
        </p>

        <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2">
          {current?.projects.map((p, i) => (
            <Exhibit
              key={p.slug}
              project={p}
              number={profile.projects.indexOf(p) + 1}
              offset={i % 2 === 1}
              onOpen={() => setOpen(p)}
            />
          ))}
        </div>
      </main>

      <CuratorWing profile={profile} />
      <ExhibitModal project={open} onClose={close} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The hung work.
 *
 * The six paintings (ART-PROMPTS B3) arrived as one 3×2 contact sheet, so each
 * exhibit shows a window onto it rather than a separate file — six requests
 * become one, and no image editor was needed to cut them apart.
 */
const WORKS_COLS = 3;
const WORKS_ROWS = 2;

function Canvas({ project, index }: { project: Project; index: number }) {
  const i = index % (WORKS_COLS * WORKS_ROWS);
  const col = i % WORKS_COLS;
  const row = Math.floor(i / WORKS_COLS);
  return (
    <div
      className="h-full w-full"
      role="img"
      aria-label={`Abstract work for ${project.name}`}
      style={{
        backgroundImage: "url(/art/gallery-works.webp)",
        backgroundSize: `${WORKS_COLS * 100}% ${WORKS_ROWS * 100}%`,
        backgroundPosition: `${(col / (WORKS_COLS - 1)) * 100}% ${(row / (WORKS_ROWS - 1)) * 100}%`,
      }}
    />
  );
}

/** Retained so a profile without the art still hangs something. */
function CanvasFallback({ project }: { project: Project }) {
  const s = seeded(project.slug);
  const s2 = seeded(project.slug + "x");
  const { color } = deriveType(project);

  return (
    <svg viewBox="0 0 100 76" className="h-full w-full" aria-hidden>
      <rect width="100" height="76" fill="#f4f1ea" />
      <rect
        x={8 + s * 12}
        y={8 + s2 * 10}
        width={38 + s * 22}
        height={30 + s2 * 18}
        fill={project.accent}
      />
      <circle cx={68 - s * 14} cy={44 - s2 * 12} r={12 + s2 * 8} fill={color} opacity="0.9" />
      <rect
        x={0}
        y={54 + s * 8}
        width="100"
        height={2 + s2 * 2}
        fill={INK}
        opacity="0.5"
      />
      <rect
        x={22 + s2 * 30}
        y={0}
        width={2 + s * 2}
        height="76"
        fill={INK}
        opacity="0.35"
      />
    </svg>
  );
}

function Exhibit({
  project,
  number,
  offset,
  onOpen,
}: {
  project: Project;
  number: number;
  offset: boolean;
  onOpen: () => void;
}) {
  // The reveal moves the work, it never hides it: an opacity-0 start means a
  // missed IntersectionObserver leaves the exhibit permanently blank.
  return (
    <motion.button
      onClick={onOpen}
      initial={{ y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={`group block w-full text-left ${offset ? "sm:mt-16" : ""}`}
    >
      {/* Frame */}
      <div className="relative">
        {/* picture light */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-6 left-1/2 h-16 w-3/4 -translate-x-1/2 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,240,200,0.7), transparent 70%)",
          }}
        />
        {/* Mat inside a dark frame — a near-white frame on a near-white wall
            disappeared entirely and the works read as floating swatches. */}
        <div
          className="relative overflow-hidden border-[7px] shadow-[0_18px_38px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:-translate-y-1.5 sm:border-[9px]"
          style={{
            borderColor: "#2e2823",
            outline: `10px solid #f7f5f0`,
            outlineOffset: "-17px",
          }}
        >
          <div className="aspect-[4/3]">
            <Canvas project={project} index={number - 1} />
          </div>
        </div>
      </div>

      {/* Plaque */}
      <div
        className="mx-auto mt-5 w-fit max-w-full border px-4 py-2.5 text-center"
        style={{ borderColor: `${BRASS}88`, backgroundColor: "#f2eee7" }}
      >
        <p className="text-[10.5px] tracking-[0.2em] uppercase" style={{ color: BRASS }}>
          No. {String(number).padStart(3, "0")}
        </p>
        <p className="mt-1 font-display text-xl leading-tight">{project.name}</p>
        <p className="mt-0.5 text-[12.5px] italic" style={{ color: `${INK}88` }}>
          {project.tech.slice(0, 3).join(", ")}, {project.year}
        </p>
      </div>
    </motion.button>
  );
}

function CuratorWing({ profile }: { profile: Profile }) {
  return (
    <section
      className="border-t"
      style={{ borderColor: `${INK}1f`, backgroundColor: "#f2eee7" }}
    >
      <div className="mx-auto grid max-w-5xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-[11px] tracking-[0.24em] uppercase" style={{ color: BRASS }}>
            Curator&apos;s statement
          </p>
          <p className="mt-5 text-[16.5px] leading-[1.8] whitespace-pre-line">
            {profile.bio}
          </p>

          <p className="mt-10 text-[11px] tracking-[0.24em] uppercase" style={{ color: BRASS }}>
            Provenance
          </p>
          <ol className="mt-4 space-y-4">
            {profile.experience.map((e) => (
              <li key={`${e.org}-${e.period}`} className="grid gap-1 sm:grid-cols-[130px_1fr]">
                <p className="text-[12px] tracking-[0.12em] uppercase" style={{ color: `${INK}88` }}>
                  {e.period}
                </p>
                <div>
                  <p className="font-display text-lg">{e.role}</p>
                  <p className="text-[13px]" style={{ color: BRASS }}>
                    {e.org}
                  </p>
                  <p className="mt-1 text-[14.5px] leading-relaxed">{e.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <p className="text-[11px] tracking-[0.24em] uppercase" style={{ color: BRASS }}>
            Techniques
          </p>
          <div className="mt-4 space-y-3.5">
            {profile.skills.map((g) => (
              <div key={g.category} className="border-b pb-3" style={{ borderColor: `${INK}18` }}>
                <p className="font-display text-lg">{g.category}</p>
                <p className="mt-0.5 text-[13.5px] leading-relaxed" style={{ color: `${INK}99` }}>
                  {g.items.map((s) => s.name).join(", ")}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-9 text-[11px] tracking-[0.24em] uppercase" style={{ color: BRASS }}>
            Enquiries
          </p>
          <p className="mt-2.5 text-[14px]" style={{ color: `${INK}aa` }}>
            {profile.availability} · {profile.location}
          </p>
          <ul className="mt-3 space-y-1.5">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-3 border-b py-1.5 transition-opacity hover:opacity-60"
                  style={{ borderColor: `${INK}18` }}
                >
                  <span className="text-[11px] tracking-[0.16em] uppercase" style={{ color: `${INK}88` }}>
                    {l.label}
                  </span>
                  <span className="truncate font-display text-[14.5px]">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function ExhibitModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(project !== null, onClose);
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-2xl overflow-y-auto p-6 outline-none sm:p-8"
        style={{ backgroundColor: WALL, color: INK }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 border px-2.5 py-1 text-[13px] transition hover:bg-black hover:text-white"
          style={{ borderColor: `${INK}44` }}
        >
          ✕
        </button>

        <p className="text-[11px] tracking-[0.24em] uppercase" style={{ color: BRASS }}>
          {deriveType(project).type} · {project.year}
        </p>
        <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
          {project.name}
        </h2>
        <p className="mt-1.5 font-display text-lg italic" style={{ color: `${INK}88` }}>
          {project.blurb}
        </p>

        <div className="my-6 border-[10px]" style={{ borderColor: "#f6f3ed", outline: `1px solid ${INK}22` }}>
          <div className="aspect-[16/9]">
            <Canvas project={project} index={0} />
          </div>
        </div>

        <p className="text-[15.5px] leading-[1.8] whitespace-pre-line">
          {project.description}
        </p>

        {project.highlights.length > 0 && (
          <>
            <p className="mt-7 text-[11px] tracking-[0.24em] uppercase" style={{ color: BRASS }}>
              Notes on the work
            </p>
            <ul className="mt-3 space-y-2">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[14.5px]">
                  <span style={{ color: BRASS }}>—</span>
                  {h}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-7 text-[11px] tracking-[0.24em] uppercase" style={{ color: BRASS }}>
          Medium
        </p>
        <p className="mt-2 text-[14.5px] italic">{project.tech.join(", ")}</p>

        {(project.live || project.repo) && (
          <p className="mt-7 flex flex-wrap gap-x-8 gap-y-2 text-[12.5px] tracking-[0.12em] uppercase">
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className="border-b pb-1" style={{ borderColor: BRASS }}>
                View the work ↗
              </a>
            )}
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noopener noreferrer" className="border-b pb-1" style={{ borderColor: `${INK}44` }}>
                Technical notes ↗
              </a>
            )}
          </p>
        )}
      </motion.div>
    </div>
  );
}
