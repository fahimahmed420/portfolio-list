"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSticky } from "@/lib/useSticky";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { seeded } from "@/lib/derive";

const CABINET = "#12121f";
const HOT = "#ff3d8b";
const COOL = "#41d5f0";
const GOLD = "#ffd23f";

const CHUTE_X = 91; // where the claw delivers, in stage %
const GRAB_RADIUS = 9; // how close in % counts as a grab — generous on purpose
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Phase = "idle" | "descending" | "closing" | "lifting" | "delivering";

type Prize = { project: Project; x: number; row: number };

export default function ClawMachine({ profile }: { profile: Profile }) {
  const [clawX, setClawX] = useState(50);
  const [phase, setPhase] = useState<Phase>("idle");
  const [held, setHeld] = useState<Project | null>(null);
  /* How far the claw reaches, as a % of the tank. Set per drop from the
     target's row so the claw actually closes around the prize instead of
     shutting in mid-air above it. */
  const [descend, setDescend] = useState(74);
  const [won, setWon] = useSticky<string[]>("claw.won", []);
  const [open, setOpen] = useState<Project | null>(null);
  const [message, setMessage] = useState("Line it up and drop.");
  const alive = useRef(true);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /* Prizes fan across the pit in two rows, deterministically. A prize in the
     claw must leave the pit, or it renders twice — once held, once still lying
     there, which is what made the grab look like teleportation. */
  const prizes: Prize[] = profile.projects
    .filter((p) => !won.includes(p.slug) && p.slug !== held?.slug)
    .map((project, i) => {
      const n = profile.projects.length;
      // Stop short of 80% — the prize chute occupies the right edge, and a
      // capsule landing inside it reads as a rendering bug.
      const spread = 66 / Math.max(n - 1, 1);
      return {
        project,
        x: 10 + i * spread + (seeded(project.slug) - 0.5) * 3,
        row: i % 2,
      };
    });

  const move = useCallback(
    (dir: -1 | 1) => {
      if (phase !== "idle") return;
      setClawX((x) => Math.max(6, Math.min(94, x + dir * 5)));
    },
    [phase],
  );

  const drop = useCallback(async () => {
    if (phase !== "idle") return;
    try {
      await runDrop();
    } finally {
      // Must always return to idle, or the controls stay locked out.
      setPhase("idle");
    }

    async function runDrop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = (ms: number) => (reduced ? 0 : ms);

    // Nearest un-won prize within reach.
    let target: Prize | null = null;
    let best = Infinity;
    for (const p of prizes) {
      const d = Math.abs(p.x - clawX);
      if (d < GRAB_RADIUS && d < best) {
        best = d;
        target = p;
      }
    }

    // Line the claw up over the prize before descending. Without this the
    // prize snaps sideways into the claw on contact, which reads as magnetism
    // rather than a grab.
    if (target) {
      setClawX(target.x);
      setMessage("Lining up…");
      await sleep(t(420));
      if (!alive.current) return;
    }

    setDescend(target ? (target.row === 0 ? 79 : 69) : 74);
    setPhase("descending");
    setMessage("Dropping…");
    await sleep(t(760));
    if (!alive.current) return;

    setPhase("closing");
    await sleep(t(330));
    if (!alive.current) return;

    if (target) setHeld(target.project);
    setPhase("lifting");
    setMessage(target ? "Got one!" : "So close.");
    await sleep(t(760));
    if (!alive.current) return;

    if (!target) {
      setMessage("Missed — nudge the claw and try again.");
      return;
    }

    setPhase("delivering");
    setClawX(CHUTE_X);
    await sleep(t(780));
    if (!alive.current) return;

    setWon((w) => [...w, target!.project.slug]);
    setHeld(null);
    setMessage(`${target.project.name} — into the chute.`);
    setOpen(target.project);
    }
  }, [clawX, phase, prizes]);

  /* Cabinet controls. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        move(1);
      } else if (e.key === " " || e.key === "Enter") {
        if (open) return;
        e.preventDefault();
        drop();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, drop, open]);

  // Idle arm is long enough to read as a cable rather than a speck.
  const armPct = phase === "descending" || phase === "closing" ? descend : 18;

  return (
    <div
      className="min-h-dvh w-full px-3 py-6 sm:px-6 sm:py-10"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #241a3d 0%, #14101f 55%, #0a0812 100%)",
        color: "#eceafd",
      }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Cabinet */}
        <div
          className="rounded-3xl border-4 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.7)] sm:p-5"
          style={{
            borderColor: "#2b2450",
            background: `linear-gradient(160deg, #2a2350, ${CABINET})`,
          }}
        >
          {/* Marquee */}
          <div
            className="mb-3 rounded-xl border-2 px-4 py-3 text-center"
            style={{
              borderColor: HOT,
              background: `linear-gradient(180deg, ${HOT}33, transparent)`,
            }}
          >
            <h1
              className="font-pixel text-[13px] leading-relaxed sm:text-[18px]"
              style={{ color: GOLD, textShadow: `0 0 12px ${GOLD}88` }}
            >
              {profile.name.toUpperCase()}
            </h1>
            <p className="mt-2 font-pixel text-[7px] text-white/45 sm:text-[8px]">
              {profile.role.toUpperCase()}
            </p>
          </div>

          {/* Glass */}
          <div
            className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border-2"
            style={{
              borderColor: COOL,
              background:
                "linear-gradient(180deg, rgba(65,213,240,0.10) 0%, rgba(10,8,18,0.9) 55%, rgba(30,20,50,0.95) 100%)",
            }}
          >
            {/* rail */}
            <div
              className="absolute inset-x-0 top-3 h-1 rounded"
              style={{ backgroundColor: "#ffffff22" }}
            />

            {/* claw assembly */}
            {/* inset-y-0 gives the assembly a definite height, without which the
                arm's percentage height resolves to nothing and no cable draws. */}
            <motion.div
              className="absolute inset-y-0 z-20"
              animate={{ left: `${clawX}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              style={{ translateX: "-50%" }}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={{ height: `${armPct}%` }}
                transition={{ duration: 0.72, ease: "easeInOut" }}
                style={{ height: `${armPct}%` }}
              >
                <div className="w-[3px] flex-1 bg-white/45" />
                <Claw closed={phase === "closing" || phase === "lifting" || phase === "delivering"} />
                {held && (
                  <div className="-mt-1">
                    <Capsule project={held} size={48} />
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* prize pit */}
            <div className="absolute inset-x-0 bottom-0 h-[52%]">
              <div
                className="absolute inset-x-0 bottom-0 h-full rounded-t-[40%]"
                style={{ background: "linear-gradient(180deg,#3a2a5e,#1b1430)" }}
              />
              {prizes.map((p) => (
                <div
                  key={p.project.slug}
                  className="absolute"
                  style={{
                    left: `${p.x}%`,
                    bottom: p.row === 0 ? "8%" : "30%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <Capsule project={p.project} size={p.row === 0 ? 54 : 46} />
                </div>
              ))}
            </div>

            {/* chute */}
            <div
              className="absolute right-2 bottom-0 h-[28%] w-[13%] rounded-t-lg border-2 border-b-0"
              style={{ borderColor: GOLD, backgroundColor: "#00000066" }}
            >
              <p className="mt-1 text-center font-pixel text-[6px]" style={{ color: GOLD }}>
                PRIZE
              </p>
            </div>

            {/* glass glare */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.10) 0 18%, transparent 32%)",
              }}
            />
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <CabButton onClick={() => move(-1)} label="Move claw left" disabled={phase !== "idle"}>
              ◀
            </CabButton>
            <button
              onClick={drop}
              disabled={phase !== "idle"}
              className="rounded-full border-4 px-7 py-3 font-pixel text-[10px] tracking-wider text-white transition-transform active:translate-y-[3px] disabled:opacity-40"
              style={{
                borderColor: "#00000055",
                backgroundColor: HOT,
                boxShadow: `0 5px 0 #00000066, 0 0 24px ${HOT}66`,
              }}
            >
              DROP
            </button>
            <CabButton onClick={() => move(1)} label="Move claw right" disabled={phase !== "idle"}>
              ▶
            </CabButton>
          </div>

          <p
            aria-live="polite"
            className="mt-3 text-center font-pixel text-[7px] leading-relaxed text-white/50 sm:text-[8px]"
          >
            {message}
          </p>
          <p className="mt-2 text-center font-mono text-[10.5px] text-white/25">
            arrows steer · space drops · {won.length}/{profile.projects.length} won
          </p>

          {won.length === profile.projects.length && (
            <div className="mt-3 text-center">
              <button
                onClick={() => {
                  setWon([]);
                  setMessage("Restocked. Go again.");
                }}
                className="rounded-lg border px-4 py-2 font-mono text-[12px] text-white/70 transition hover:text-white"
                style={{ borderColor: "#ffffff2a" }}
              >
                Restock the machine
              </button>
            </div>
          )}
        </div>

        {/* The honest path: everything reachable without playing. */}
        <PrizeList profile={profile} won={won} onOpen={setOpen} />
        <About profile={profile} />
      </div>

      <PrizeModal project={open} onClose={close} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CabButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="grid h-12 w-12 place-items-center rounded-full border-4 text-white transition-transform active:translate-y-[3px] disabled:opacity-40"
      style={{
        borderColor: "#00000055",
        backgroundColor: COOL,
        boxShadow: "0 5px 0 #00000066",
      }}
    >
      {children}
    </button>
  );
}

/**
 * Claw with two hinged fingers.
 *
 * The fingers rotate about the hinge rather than animating their `d`: framer
 * cannot interpolate a path string, and attempting it set `d="undefined"`
 * mid-animation, which the browser rejected outright.
 */
function Claw({ closed }: { closed: boolean }) {
  const finger = (d: string, deg: number) => (
    <g
      style={{
        transformOrigin: "23px 9px",
        transform: `rotate(${closed ? deg : 0}deg)`,
        transition: "transform 260ms ease-in-out",
      }}
    >
      <path d={d} stroke="#cfd6e4" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  );

  return (
    <svg width="46" height="34" viewBox="0 0 46 34" aria-hidden>
      <rect x="17" y="0" width="12" height="9" rx="2" fill="#cfd6e4" />
      {finger("M23 9 L10 30", 20)}
      {finger("M23 9 L36 30", -20)}
      <circle cx="23" cy="9" r="4" fill="#9aa5b8" />
    </svg>
  );
}

/** A gachapon capsule carrying the project's initial. */
function Capsule({ project, size = 50 }: { project: Project; size?: number }) {
  const letter = project.name.charAt(0).toUpperCase();
  return (
    <div
      className="relative grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(160deg, ${project.accent}, ${project.accent}99)`,
        boxShadow: `inset 0 -6px 10px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.45)`,
      }}
      title={project.name}
    >
      <span
        className="absolute inset-x-0 top-0 h-1/2 rounded-t-full"
        style={{ background: "rgba(255,255,255,0.22)" }}
      />
      <span
        className="relative font-pixel text-white"
        style={{ fontSize: size * 0.3, textShadow: "1px 1px 0 rgba(0,0,0,0.45)" }}
      >
        {letter}
      </span>
    </div>
  );
}

function PrizeList({
  profile,
  won,
  onOpen,
}: {
  profile: Profile;
  won: string[];
  onOpen: (p: Project) => void;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-1 font-display text-xl">Prize list</h2>
      <p className="mb-4 text-[13px] text-white/40">
        Every prize, readable without winning it.
      </p>
      {/* min-w-0 on the item: a grid child defaults to min-width:auto and
          refuses to shrink below its content, overflowing narrow screens. */}
      <ul className="grid gap-2 sm:grid-cols-2">
        {profile.projects.map((p) => (
          <li key={p.slug} className="min-w-0">
            <button
              onClick={() => onOpen(p)}
              className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition hover:border-white/30"
              style={{ borderColor: "#ffffff16", backgroundColor: "#ffffff07" }}
            >
              <Capsule project={p} size={34} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px]">{p.name}</span>
                <span className="block truncate text-[12px] text-white/40">{p.blurb}</span>
              </span>
              {won.includes(p.slug) && (
                <span className="shrink-0 font-mono text-[10px]" style={{ color: GOLD }}>
                  WON
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function About({ profile }: { profile: Profile }) {
  return (
    <section className="mt-10 mb-10 grid gap-8 sm:grid-cols-2">
      <div>
        <h2 className="mb-3 font-display text-xl">About the operator</h2>
        <p className="text-[14.5px] leading-relaxed whitespace-pre-line text-white/60">
          {profile.bio}
        </p>
      </div>
      <div>
        <h2 className="mb-3 font-display text-xl">Skills on the counter</h2>
        <div className="space-y-3">
          {profile.skills.map((g) => (
            <div key={g.category}>
              <p className="font-mono text-[10.5px] tracking-wider text-white/35 uppercase">
                {g.category}
              </p>
              <p className="mt-1 text-[13px] text-white/60">
                {g.items.map((s) => s.name).join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <ul className="mt-5 space-y-1.5">
          {profile.links.map((l) => (
            <li key={l.kind}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3 text-[13px] text-white/55 transition hover:text-white"
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
    </section>
  );
}

function PrizeModal({
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
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 p-6 outline-none"
        style={{
          borderColor: project.accent,
          background: "linear-gradient(160deg,#1d1636,#0d0a18)",
          color: "#eceafd",
          boxShadow: `0 0 50px ${project.accent}55`,
        }}
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
          <Capsule project={project} size={52} />
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] text-white/40">
              {project.year} · {project.role}
            </p>
            <h2 className="font-display text-2xl leading-tight">{project.name}</h2>
          </div>
        </div>

        <p className="mt-4 text-[14.5px] leading-relaxed whitespace-pre-line text-white/75">
          {project.description}
        </p>

        {project.highlights.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-[14px] text-white/65">
                <span style={{ color: project.accent }}>▸</span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-5 flex flex-wrap gap-1.5">
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
