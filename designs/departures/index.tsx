"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { deriveDifficulty, hash } from "@/lib/derive";

const BOARD = "#0b0b0c";
const AMBER = "#f5a524";
const PALE = "#e8e8e8";
const GREEN = "#3aa06a";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";

/** Flight details derived from the project, so they never drift out of sync. */
function flight(project: Project, i: number) {
  const h = hash(project.slug);
  return {
    code: `${project.name.slice(0, 2).toUpperCase()}${100 + (h % 800)}`,
    gate: `${String.fromCharCode(65 + (h % 4))}${1 + (h % 20)}`,
    time: `${String(6 + ((h + i * 3) % 16)).padStart(2, "0")}:${String((h % 12) * 5).padStart(2, "0")}`,
    status:
      project.live && project.repo
        ? "BOARDING"
        : project.live
          ? "ON TIME"
          : project.repo
            ? "SCHEDULED"
            : "DEPARTED",
  };
}

const STATUS_COLOR: Record<string, string> = {
  BOARDING: GREEN,
  "ON TIME": PALE,
  SCHEDULED: AMBER,
  DEPARTED: "#8a8a8a",
};

export default function Departures({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState<Project | null>(null);
  const [clock, setClock] = useState("--:--");
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    tick();
    const t = window.setInterval(tick, 20_000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-dvh w-full px-3 py-6 sm:px-6 sm:py-10"
      style={{ backgroundColor: "#141414", color: PALE }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Terminal header */}
        <header
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b px-1 pb-3"
          style={{ borderColor: "#ffffff22" }}
        >
          <div>
            <h1 className="font-mono text-xl tracking-[0.16em] uppercase sm:text-2xl">
              {profile.name}
            </h1>
            <p className="mt-1 font-mono text-[12px] tracking-[0.18em] uppercase" style={{ color: "#8a8a8a" }}>
              {profile.role} · Terminal 1
            </p>
          </div>
          <p className="font-mono text-2xl tabular-nums" style={{ color: AMBER }}>
            {clock}
          </p>
        </header>

        {/* Board */}
        <div
          className="mt-5 overflow-x-auto rounded-sm border p-3 sm:p-5"
          style={{ borderColor: "#ffffff1a", backgroundColor: BOARD }}
        >
          {/* Wide enough for every flap column at full width; the wrapper
              scrolls horizontally on narrow screens rather than clipping. */}
          <div className="min-w-[330px] sm:min-w-[700px]">
            <div
              className="grid grid-cols-[64px_1fr_128px] gap-2 border-b pb-2 sm:grid-cols-[76px_1fr_56px_78px_142px] sm:gap-3 font-mono text-[10.5px] tracking-[0.16em] uppercase"
              style={{ borderColor: "#ffffff1a", color: "#8a8a8a" }}
            >
              <span>Flight</span>
              <span>Destination</span>
              {/* Gate and time drop on phones — five flap columns need 700px
                  and a 375px screen simply hasn't got it. */}
              <span className="hidden sm:block">Gate</span>
              <span className="hidden sm:block">Time</span>
              <span>Status</span>
            </div>

            <ul>
              {profile.projects.map((p, i) => {
                const f = flight(p, i);
                return (
                  <li key={p.slug}>
                    <button
                      onClick={() => setOpen(p)}
                      className="grid w-full grid-cols-[64px_1fr_128px] items-center gap-2 border-b py-2.5 sm:grid-cols-[76px_1fr_56px_78px_142px] sm:gap-3 text-left transition hover:bg-white/5"
                      style={{ borderColor: "#ffffff10" }}
                    >
                      <Flap text={f.code} width={6} delay={i} color={PALE} />
                      <Flap text={p.name} width={18} delay={i} color={AMBER} />
                      <span className="hidden sm:contents">
                        <Flap text={f.gate} width={3} delay={i} color={PALE} />
                        <Flap text={f.time} width={5} delay={i} color={PALE} />
                      </span>
                      <Flap
                        text={f.status}
                        width={9}
                        delay={i}
                        color={STATUS_COLOR[f.status] ?? PALE}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: "#6a6a6a" }}>
          Select a flight for boarding details
        </p>

        {/* Services + log */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <BoardHeading>Terminal services</BoardHeading>
            <div className="mt-4 space-y-3">
              {profile.skills.map((g) => (
                <div
                  key={g.category}
                  className="border-b pb-2.5"
                  style={{ borderColor: "#ffffff14" }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-mono text-[13px] tracking-wide uppercase">
                      {g.category}
                    </p>
                    <p className="font-mono text-[11px]" style={{ color: GREEN }}>
                      OPEN
                    </p>
                  </div>
                  <p className="mt-1 font-mono text-[11.5px]" style={{ color: "#8a8a8a" }}>
                    {g.items.map((s) => s.name).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <BoardHeading>Flight log</BoardHeading>
            <ol className="mt-4 space-y-4">
              {profile.experience.map((e) => (
                <li key={`${e.org}-${e.period}`}>
                  <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color: AMBER }}>
                    {e.period}
                  </p>
                  <p className="mt-0.5 font-mono text-[14px] tracking-wide uppercase">
                    {e.role}
                  </p>
                  <p className="font-mono text-[11.5px]" style={{ color: "#8a8a8a" }}>
                    {e.org}
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "#b4b4b4" }}>
                    {e.summary}
                  </p>
                </li>
              ))}
              {profile.education.map((e) => (
                <li key={e.degree}>
                  <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color: AMBER }}>
                    {e.period}
                  </p>
                  <p className="mt-0.5 font-mono text-[14px] tracking-wide uppercase">
                    {e.degree}
                  </p>
                  <p className="font-mono text-[11.5px]" style={{ color: "#8a8a8a" }}>
                    {e.org}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Information desk */}
        <section className="mt-10 mb-6">
          <BoardHeading>Information desk</BoardHeading>
          <p className="mt-3 text-[14px]" style={{ color: "#b4b4b4" }}>
            {profile.availability} · {profile.location}
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-3 border px-3 py-2.5 transition hover:border-white/40"
                  style={{ borderColor: "#ffffff1a" }}
                >
                  <span className="font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: "#8a8a8a" }}>
                    {l.label}
                  </span>
                  <span className="truncate font-mono text-[13px]">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <BoardingPass project={open} onClose={close} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function BoardHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="border-b pb-2 font-mono text-[12px] tracking-[0.22em] uppercase"
      style={{ borderColor: "#ffffff22", color: AMBER }}
    >
      {children}
    </h2>
  );
}

/** Split-flap text: each tile clatters through glyphs before settling. */
function Flap({
  text,
  width,
  delay,
  color,
}: {
  text: string;
  width: number;
  delay: number;
  color: string;
}) {
  const target = text.toUpperCase().padEnd(width, " ").slice(0, width);
  const [display, setDisplay] = useState(() => " ".repeat(width));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    let frame = 0;
    const start = delay * 3;
    const id = window.setInterval(() => {
      frame += 1;
      setDisplay(
        target
          .split("")
          .map((ch, i) => {
            const settleAt = start + 5 + i * 2;
            if (frame >= settleAt) return ch;
            if (frame < start) return " ";
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (frame > start + 6 + width * 2) window.clearInterval(id);
    }, 52);
    return () => window.clearInterval(id);
  }, [target, width, delay]);

  return (
    <span className="flex gap-[2px] overflow-hidden">
      {display.split("").map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="relative grid h-[22px] w-[13px] shrink-0 place-items-center rounded-[2px] font-mono text-[13px] leading-none"
          style={{ backgroundColor: "#1a1a1c", color }}
        >
          {ch}
          <span
            className="absolute inset-x-0 top-1/2 h-px"
            style={{ backgroundColor: "#00000088" }}
          />
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </span>
  );
}

function BoardingPass({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(project !== null, onClose);
  if (!project) return null;
  const f = flight(project, 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-xl overflow-y-auto outline-none"
        style={{ backgroundColor: "#f4f1ea", color: "#141414" }}
      >
        {/* stub header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ backgroundColor: BOARD, color: PALE }}
        >
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase">
            Boarding Pass
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="border px-2 py-0.5 font-mono text-[12px] transition hover:bg-white/10"
            style={{ borderColor: "#ffffff44" }}
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: "#6a6a6a" }}>
                Destination
              </p>
              <p className="font-mono text-2xl tracking-wide uppercase">{project.name}</p>
            </div>
            <p className="font-mono text-[13px]" style={{ color: "#6a6a6a" }}>
              {project.year} · {project.role}
            </p>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-y py-4 sm:grid-cols-4" style={{ borderColor: "#00000022" }}>
            {(
              [
                ["Flight", f.code],
                ["Gate", f.gate],
                ["Boards", f.time],
                ["Class", "★".repeat(deriveDifficulty(project))],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10.5px] tracking-[0.16em] uppercase" style={{ color: "#8a8a8a" }}>
                  {k}
                </dt>
                <dd className="mt-1 font-mono text-[15px]">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-[14.5px] leading-relaxed whitespace-pre-line">
            {project.description}
          </p>

          {project.highlights.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 text-[13.5px]">
                  <span style={{ color: project.accent }}>▸</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 font-mono text-[10.5px] tracking-[0.16em] uppercase" style={{ color: "#8a8a8a" }}>
            Cargo manifest
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <li
                key={t}
                className="border px-2 py-1 font-mono text-[11.5px]"
                style={{ borderColor: "#00000033" }}
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
                  className="px-4 py-2.5 font-mono text-[12px] tracking-wider uppercase"
                  style={{ backgroundColor: BOARD, color: AMBER }}
                >
                  Depart ↗
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border px-4 py-2.5 font-mono text-[12px] tracking-wider uppercase"
                  style={{ borderColor: "#00000044" }}
                >
                  Manifest ↗
                </a>
              )}
            </div>
          )}

          {/* barcode */}
          <div className="mt-6 flex h-12 items-end gap-[2px] border-t pt-4" style={{ borderColor: "#00000022" }}>
            {Array.from({ length: 54 }, (_, i) => (
              <span
                key={i}
                className="block"
                style={{
                  width: (hash(project.slug + i) % 3) + 1,
                  height: "100%",
                  backgroundColor: hash(project.slug + i) % 3 ? "#141414" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
