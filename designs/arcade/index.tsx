"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { readable } from "@/lib/derive";

const PINK = "#ff2e88";
const CYAN = "#00e5ff";
const GOLD = "#ffd43b";
const VOID_BG = "#08060f";

const glow = (c: string, strength = 1) => ({
  textShadow: `0 0 ${4 * strength}px ${c}, 0 0 ${12 * strength}px ${c}88, 0 0 ${
    28 * strength
  }px ${c}44`,
});

/** Difficulty is a stand-in for scope — more moving parts, harder stage. */
const difficultyOf = (p: Project) =>
  Math.max(1, Math.min(5, Math.round(p.tech.length * 0.8)));

export default function Arcade({ profile }: { profile: Profile }) {
  const [started, setStarted] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [open, setOpen] = useState<Project | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const stages = profile.projects;
  /* Stable, so the modal's focus trap survives re-renders intact. */
  const closeStage = useCallback(() => setOpen(null), []);
  /* Note: page-level content animates position only, never opacity — an entry
     fade that fails to run would leave the whole design blank. */

  /* Attract mode: any key or click starts the machine. */
  useEffect(() => {
    if (started) return;
    const go = () => setStarted(true);
    window.addEventListener("keydown", go);
    window.addEventListener("pointerdown", go);
    return () => {
      window.removeEventListener("keydown", go);
      window.removeEventListener("pointerdown", go);
    };
  }, [started]);

  /* Cabinet controls. */
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!started || open) return;
      const cols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      let next = cursor;
      if (e.key === "ArrowRight") next = cursor + 1;
      else if (e.key === "ArrowLeft") next = cursor - 1;
      else if (e.key === "ArrowDown") next = cursor + cols;
      else if (e.key === "ArrowUp") next = cursor - cols;
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(stages[cursor] ?? null);
        return;
      } else return;

      e.preventDefault();
      next = Math.max(0, Math.min(stages.length - 1, next));
      setCursor(next);
      gridRef.current
        ?.querySelector<HTMLElement>(`[data-stage="${next}"]`)
        ?.focus();
    },
    [cursor, open, stages, started],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <div
      className="relative min-h-dvh w-full overflow-x-hidden font-pixel"
      style={{ backgroundColor: VOID_BG, color: "#e9e6ff" }}
    >
      <Backdrop />
      <Scanlines />

      {!started ? (
        <Attract profile={profile} onStart={() => setStarted(true)} />
      ) : (
        <motion.main
          initial={{ y: 8 }}
          animate={{ y: 0 }}
          className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-6 pb-44 sm:px-6"
        >
            <Marquee profile={profile} />
            <Hud profile={profile} />

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
              <section>
                <SectionHeading color={CYAN}>SELECT STAGE</SectionHeading>
                <div
                  ref={gridRef}
                  className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {stages.map((p, i) => (
                    <StageCard
                      key={p.slug}
                      project={p}
                      index={i}
                      active={cursor === i}
                      onFocus={() => setCursor(i)}
                      onOpen={() => setOpen(p)}
                    />
                  ))}
                </div>
                <p className="mt-4 text-[8px] leading-relaxed text-white/35">
                  ARROWS MOVE · ENTER SELECTS · ESC EXITS
                </p>
              </section>

              <aside className="space-y-8">
                <HighScores profile={profile} />
                <Credits profile={profile} />
              </aside>
            </div>
          </motion.main>
      )}

      {started && (
        <>
          <CabinetSides />
          <ControlDeck
            onMove={(d) => {
              const next = Math.max(0, Math.min(stages.length - 1, cursor + d));
              setCursor(next);
              gridRef.current
                ?.querySelector<HTMLElement>(`[data-stage="${next}"]`)
                ?.focus();
            }}
            onFire={() => setOpen(stages[cursor] ?? null)}
          />
        </>
      )}

      <StageModal project={open} onClose={closeStage} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {/* neon horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          background: `linear-gradient(to top, ${PINK}22, transparent 70%)`,
        }}
      />
      {/* The grid is the signature of this design — at 30% opacity under a
          0.75 vignette it was invisible. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[38%] opacity-70"
        style={{
          backgroundImage: `repeating-linear-gradient(to right, ${CYAN}cc 0 1px, transparent 1px 56px), repeating-linear-gradient(to top, ${CYAN}cc 0 1px, transparent 1px 40px)`,
          transform: "perspective(340px) rotateX(66deg)",
          transformOrigin: "bottom",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, transparent 42%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}

function Scanlines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-45"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)",
      }}
    />
  );
}

function SectionHeading({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <h2 className="text-[11px] tracking-wider" style={{ color, ...glow(color, 0.7) }}>
      {children}
    </h2>
  );
}

function Attract({
  profile,
  onStart,
}: {
  profile: Profile;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.99 }}
      animate={{ scale: 1 }}
      className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 text-center"
    >
      <p className="text-[9px] tracking-[0.4em] text-white/45">A PORTFOLIO BY</p>

      <h1
        className="mt-6 text-[clamp(22px,7vw,60px)] leading-[1.25]"
        style={{ color: GOLD, ...glow(GOLD, 1.2) }}
      >
        {profile.name.toUpperCase()}
      </h1>

      <p
        className="mt-5 text-[clamp(8px,2vw,13px)] leading-relaxed"
        style={{ color: CYAN, ...glow(CYAN, 0.6) }}
      >
        {profile.role.toUpperCase()}
      </p>

      <p className="mt-8 max-w-[46ch] font-sans text-sm leading-relaxed text-white/60">
        {profile.tagline}
      </p>

      <motion.p
        animate={{ opacity: [1, 0.15, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="mt-12 text-[11px]"
        style={{ color: PINK, ...glow(PINK, 0.9) }}
      >
        INSERT COIN
      </motion.p>

      <button
        onClick={onStart}
        className="mt-6 border-2 px-6 py-3 text-[9px] transition-transform hover:-translate-y-0.5"
        style={{ borderColor: CYAN, color: CYAN, ...glow(CYAN, 0.4) }}
      >
        PRESS START
      </button>

      <p className="mt-10 text-[7px] tracking-widest text-white/25">
        © {new Date().getFullYear()} · {profile.stats[0]?.value ?? "—"}{" "}
        {profile.stats[0]?.label?.toUpperCase() ?? ""}
      </p>
    </motion.div>
  );
}

/** The lit header board across the top of the cabinet. */
function Marquee({ profile }: { profile: Profile }) {
  return (
    <div
      className="mb-6 rounded-lg border-2 px-4 py-3 text-center"
      style={{
        borderColor: PINK,
        background: `linear-gradient(180deg, ${PINK}2e, transparent 75%)`,
        boxShadow: `0 0 30px ${PINK}33, inset 0 0 20px ${PINK}22`,
      }}
    >
      <p
        className="text-[10px] leading-relaxed sm:text-[13px]"
        style={{ color: GOLD, ...glow(GOLD, 0.9) }}
      >
        {profile.name.toUpperCase()}
      </p>
      <p className="mt-2 text-[7px] tracking-[0.3em] text-white/40">
        {profile.projects.length} STAGES · 1 PLAYER
      </p>
    </div>
  );
}

/** Cabinet side art — decorative, and only where there's room for it. */
function CabinetSides() {
  return (
    <>
      {/* Screen-printed cabinet art (ART-PROMPTS A3). The source is a mirrored
          pair in one file, so each side shows half of it. */}
      {["left-0", "right-0"].map((side) => (
        <div
          key={side}
          aria-hidden
          className={`pointer-events-none fixed ${side} top-0 z-0 hidden h-dvh w-[132px] xl:block`}
          style={{
            backgroundImage: "url(/art/arcade-side.webp)",
            backgroundSize: "200% 100%",
            backgroundPosition: side === "left-0" ? "left center" : "right center",
            backgroundRepeat: "no-repeat",
            opacity: 0.85,
          }}
        >
          <div
            className="absolute inset-y-0 w-[3px]"
            style={{
              [side === "left-0" ? "right" : "left"]: 0,
              background: `linear-gradient(180deg, transparent, ${PINK}, ${CYAN}, transparent)`,
              opacity: 0.55,
            } as React.CSSProperties}
          />
        </div>
      ))}
    </>
  );
}

/** Physical controls that drive the same actions as the keyboard. */
function ControlDeck({
  onMove,
  onFire,
}: {
  onMove: (dir: -1 | 1) => void;
  onFire: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-20">
      <div
        className="mx-auto flex max-w-md items-center justify-between gap-6 rounded-t-2xl border-x-2 border-t-2 px-6 py-4"
        style={{
          borderColor: `${CYAN}44`,
          background: "linear-gradient(180deg, #1a1030, #0a0714)",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.6)",
        }}
      >
        {/* joystick */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMove(-1)}
            aria-label="Previous stage"
            className="grid h-9 w-9 place-items-center rounded-md border text-white/70 transition active:translate-y-[2px]"
            style={{ borderColor: `${CYAN}55`, backgroundColor: "#ffffff0a" }}
          >
            ◀
          </button>
          <span className="relative grid h-12 w-12 place-items-center">
            <span
              className="absolute bottom-0 h-4 w-10 rounded-full"
              style={{ backgroundColor: "#241a3d" }}
            />
            <span className="absolute bottom-3 h-6 w-[5px]" style={{ backgroundColor: "#8d99a6" }} />
            <span
              className="absolute bottom-7 h-6 w-6 rounded-full"
              style={{ backgroundColor: PINK, boxShadow: `0 0 14px ${PINK}88` }}
            />
          </span>
          <button
            onClick={() => onMove(1)}
            aria-label="Next stage"
            className="grid h-9 w-9 place-items-center rounded-md border text-white/70 transition active:translate-y-[2px]"
            style={{ borderColor: `${CYAN}55`, backgroundColor: "#ffffff0a" }}
          >
            ▶
          </button>
        </div>

        <button
          onClick={onFire}
          aria-label="Open selected stage"
          className="grid h-14 w-14 place-items-center rounded-full border-4 text-[8px] font-bold text-black transition active:translate-y-[3px]"
          style={{
            borderColor: "#00000066",
            backgroundColor: GOLD,
            boxShadow: `0 5px 0 #00000066, 0 0 20px ${GOLD}66`,
          }}
        >
          PLAY
        </button>
      </div>
    </div>
  );
}

function Hud({ profile }: { profile: Profile }) {
  return (
    <header
      className="flex flex-wrap items-center justify-between gap-4 border-b-2 pb-4"
      style={{ borderColor: `${CYAN}44` }}
    >
      <div>
        <p className="text-[13px]" style={{ color: GOLD, ...glow(GOLD, 0.7) }}>
          {profile.name.toUpperCase()}
        </p>
        <p className="mt-2 text-[8px] text-white/45">{profile.role.toUpperCase()}</p>
      </div>
      <dl className="flex flex-wrap gap-x-6 gap-y-2">
        {profile.stats.slice(0, 3).map((s) => (
          <div key={s.label}>
            <dt className="text-[7px] tracking-wider text-white/40">
              {s.label.toUpperCase()}
            </dt>
            <dd className="mt-1.5 text-[12px]" style={{ color: PINK, ...glow(PINK, 0.5) }}>
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

function StageCard({
  project,
  index,
  active,
  onFocus,
  onOpen,
}: {
  project: Project;
  index: number;
  active: boolean;
  onFocus: () => void;
  onOpen: () => void;
}) {
  const diff = difficultyOf(project);
  // Fills keep the raw accent; text gets a legible lift off the near-black.
  const ink = readable(project.accent, VOID_BG);
  return (
    <button
      data-stage={index}
      onFocus={onFocus}
      onMouseEnter={onFocus}
      onClick={onOpen}
      className="group relative overflow-hidden border-2 p-4 text-left transition-transform duration-150 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-none"
      style={{
        borderColor: active ? project.accent : "#ffffff22",
        backgroundColor: active ? `${project.accent}14` : "#ffffff06",
        boxShadow: active ? `0 0 22px ${project.accent}55` : "none",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[8px] text-white/40">
          STAGE {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex gap-[3px]" aria-label={`Difficulty ${diff} of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className="h-[7px] w-[7px]"
              style={{
                backgroundColor: n <= diff ? project.accent : "#ffffff1a",
              }}
            />
          ))}
        </span>
      </div>

      <p
        className="mt-4 text-[12px] leading-snug"
        style={{ color: ink, ...glow(project.accent, 0.5) }}
      >
        {project.name.toUpperCase()}
      </p>

      <p className="mt-3 font-sans text-[12.5px] leading-relaxed text-white/60">
        {project.blurb}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.slice(0, 4).map((t) => (
          <li
            key={t}
            className="border px-1.5 py-1 text-[6.5px] text-white/55"
            style={{ borderColor: "#ffffff22" }}
          >
            {t.toUpperCase()}
          </li>
        ))}
      </ul>

      <span
        className="mt-4 block text-[7px] transition-opacity"
        style={{ color: ink, opacity: active ? 1 : 0.55 }}
      >
        ▶ PLAY
      </span>
    </button>
  );
}

function HighScores({ profile }: { profile: Profile }) {
  const rows = profile.skills.flatMap((g) =>
    g.items.map((s) => ({ ...s, group: g.category })),
  );
  const top = rows.sort((a, b) => b.level - a.level).slice(0, 10);

  return (
    <section>
      <SectionHeading color={GOLD}>HIGH SCORES</SectionHeading>
      <ol className="mt-4 space-y-2">
        {top.map((s, i) => (
          <li key={`${s.group}-${s.name}`} className="flex items-center gap-2 text-[8px]">
            <span className="w-5 shrink-0 text-white/35">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-white/75">
              {s.name.toUpperCase()}
            </span>
            <span style={{ color: GOLD }}>{s.level * 20_000}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Credits({ profile }: { profile: Profile }) {
  return (
    <section>
      <SectionHeading color={PINK}>CREDITS</SectionHeading>
      <ul className="mt-4 space-y-2.5">
        {profile.links.map((l) => (
          <li key={l.kind}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[8px] text-white/60 transition hover:text-white"
            >
              <span
                aria-hidden
                className="h-[6px] w-[6px] shrink-0"
                style={{ backgroundColor: PINK }}
              />
              <span className="truncate">{l.label.toUpperCase()}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-5 font-sans text-[12px] leading-relaxed text-white/40">
        {profile.location} · {profile.availability}
      </p>
    </section>
  );
}

function StageModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(project !== null, onClose);

  if (!project) return null;
  const ink = readable(project.accent, "#0c0918");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden />
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative z-10 max-h-[85dvh] w-full max-w-lg overflow-y-auto border-2 p-6 font-pixel outline-none"
            style={{
              borderColor: project.accent,
              backgroundColor: "#0c0918",
              boxShadow: `0 0 40px ${project.accent}55`,
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 border px-2 py-1 text-[8px] text-white/60 transition hover:text-white"
              style={{ borderColor: "#ffffff33" }}
            >
              ESC
            </button>

            <p className="text-[8px] text-white/40">
              {project.year} · {project.role.toUpperCase()}
            </p>
            <h2
              className="mt-3 text-[16px] leading-snug"
              style={{ color: ink, ...glow(project.accent, 0.6) }}
            >
              {project.name.toUpperCase()}
            </h2>

            <p className="mt-5 font-sans text-[14px] leading-relaxed whitespace-pre-line text-white/75">
              {project.description}
            </p>

            {project.highlights.length > 0 && (
              <ul className="mt-5 space-y-2">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-2 font-sans text-[13.5px] text-white/65">
                    <span style={{ color: ink }}>▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-6 text-[7px] tracking-wider text-white/35">POWER-UPS</p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <li
                  key={t}
                  className="border px-2 py-1 text-[7px] text-white/65"
                  style={{ borderColor: `${project.accent}66` }}
                >
                  {t.toUpperCase()}
                </li>
              ))}
            </ul>

            {(project.live || project.repo) && (
              <div className="mt-7 flex flex-wrap gap-3">
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 px-4 py-2.5 text-[8px] transition-transform hover:-translate-y-0.5"
                    style={{ borderColor: project.accent, color: ink }}
                  >
                    PLAY LIVE ↗
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 px-4 py-2.5 text-[8px] text-white/70 transition-transform hover:-translate-y-0.5"
                    style={{ borderColor: "#ffffff33" }}
                  >
                    SOURCE ↗
                  </a>
                )}
              </div>
            )}
          </motion.div>
    </div>
  );
}
