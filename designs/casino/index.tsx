"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { deriveDifficulty, deriveStats, hash } from "@/lib/derive";

const FELT = "#0f3d2e";
const GOLD = "#d4af37";
const CREAM = "#f5f2ea";
const CRIMSON = "#a4243b";

const SUITS = ["♠", "♥", "♦", "♣"] as const;

/** Chip denomination derived from how much a project carries. */
function stake(project: Project) {
  return (deriveDifficulty(project) + project.highlights.length) * 25;
}

export default function Casino({ profile }: { profile: Profile }) {
  const [bet, setBet] = useState<string | null>(null);
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);

  const bankroll = profile.projects.reduce((a, p) => a + stake(p), 0);

  const place = (p: Project) => {
    setBet(p.slug);
    window.setTimeout(() => setOpen(p), 420);
  };

  return (
    <div
      className="min-h-dvh w-full px-3 py-6 sm:px-6 sm:py-10"
      style={{
        // Woven felt (ART-PROMPTS A4) under a lighting gradient.
        backgroundColor: FELT,
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(40,120,90,0.55) 0%, rgba(7,32,25,0.85) 70%), url(/art/felt.webp)",
        backgroundSize: "auto, 560px",
        color: CREAM,
      }}
    >
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <p className="font-display text-[12px] tracking-[0.34em] uppercase" style={{ color: GOLD }}>
            The house of
          </p>
          <h1
            className="mt-3 font-display leading-none tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem,6.5vw,3.8rem)", color: GOLD }}
          >
            {profile.name}
          </h1>
          <p className="mt-3 text-[14.5px]" style={{ color: "#cfe3d8" }}>
            {profile.role} · {profile.location}
          </p>
        </header>

        {/* Table */}
        <div
          className="relative mt-10 overflow-hidden rounded-t-[46%] border-[6px] px-4 pt-10 pb-12 sm:px-10"
          style={{
            borderColor: GOLD,
            background: "radial-gradient(ellipse at 50% 110%, #17563f, #0d3527 70%)",
            boxShadow: "inset 0 0 70px rgba(0,0,0,0.5), 0 24px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* felt arcs */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-6 bottom-0 rounded-t-[46%] border-2"
            style={{ borderColor: `${GOLD}44` }}
          />
          <p
            className="relative text-center font-display text-[13px] tracking-[0.26em] uppercase"
            style={{ color: `${GOLD}cc` }}
          >
            Place your bet
          </p>

          {/* Narrow enough that six spots stay on one arc — a lone chip wrapping
              to a second row broke the shape of the table. */}
          <div className="relative mt-9 flex flex-wrap justify-center gap-x-3 gap-y-8 sm:gap-x-5">
            {profile.projects.map((p, i) => (
              <BetSpot
                key={p.slug}
                project={p}
                index={i}
                active={bet === p.slug}
                onPlace={() => place(p)}
              />
            ))}
          </div>

          <p className="relative mt-10 text-center text-[12.5px]" style={{ color: "#9fc0b1" }}>
            Minimum bet {Math.min(...profile.projects.map(stake))} · Table limit{" "}
            {Math.max(...profile.projects.map(stake))}
          </p>
        </div>

        {/* Rail */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <Heading>Chips on hand</Heading>
            <div className="mt-4 space-y-3">
              {profile.skills.map((g, i) => {
                const avg =
                  g.items.reduce((a, s) => a + s.level, 0) / Math.max(g.items.length, 1);
                return (
                  <div
                    key={g.category}
                    className="flex items-center gap-3 border-b pb-3"
                    style={{ borderColor: "#ffffff14" }}
                  >
                    <Chip value={Math.round(avg * 100)} index={i} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg">{g.category}</p>
                      <p className="text-[12.5px]" style={{ color: "#9fc0b1" }}>
                        {g.items.map((s) => s.name).join(" · ")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <Heading>Bankroll</Heading>
            <p className="mt-3 font-display text-4xl" style={{ color: GOLD }}>
              {bankroll.toLocaleString()}
            </p>
            <p className="text-[12.5px]" style={{ color: "#9fc0b1" }}>
              accumulated across {profile.projects.length} hands
            </p>

            <ol className="mt-5 space-y-4">
              {profile.experience.map((e) => (
                <li key={`${e.org}-${e.period}`} className="border-l-2 pl-3.5" style={{ borderColor: `${GOLD}66` }}>
                  <p className="font-display text-lg">{e.role}</p>
                  <p className="text-[12px] tracking-[0.12em] uppercase" style={{ color: GOLD }}>
                    {e.org} · {e.period}
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "#cfe3d8" }}>
                    {e.summary}
                  </p>
                </li>
              ))}
              {profile.education.map((e) => (
                <li key={e.degree} className="border-l-2 pl-3.5" style={{ borderColor: "#ffffff22" }}>
                  <p className="font-display text-lg">{e.degree}</p>
                  <p className="text-[12px] tracking-[0.12em] uppercase" style={{ color: "#9fc0b1" }}>
                    {e.org} · {e.period}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* House rules / about */}
        <section className="mt-10">
          <Heading>House rules</Heading>
          <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed whitespace-pre-line" style={{ color: "#cfe3d8" }}>
            {profile.bio}
          </p>
        </section>

        <section className="mt-10 mb-8">
          <Heading>Cash out</Heading>
          <p className="mt-3 text-[14px]" style={{ color: "#9fc0b1" }}>
            {profile.availability}
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-3 rounded-lg border px-4 py-2.5 transition hover:border-[#d4af37]"
                  style={{ borderColor: "#ffffff1f" }}
                >
                  <span className="text-[11.5px] tracking-[0.16em] uppercase" style={{ color: "#9fc0b1" }}>
                    {l.label}
                  </span>
                  <span className="truncate font-display text-[15px]">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <HandModal project={open} onClose={close} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="border-b pb-2 font-display text-[12px] tracking-[0.24em] uppercase"
      style={{ borderColor: `${GOLD}44`, color: GOLD }}
    >
      {children}
    </h2>
  );
}

function Chip({
  value,
  index,
  size = 54,
  color,
}: {
  value: number;
  index: number;
  size?: number;
  color?: string;
}) {
  const palette = ["#a4243b", "#1d4e89", "#2e7d4f", "#4a3b6b", "#b8860b"];
  const c = color ?? palette[index % palette.length];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="shrink-0">
      <circle cx="20" cy="20" r="19" fill={c} stroke="#00000055" strokeWidth="1.5" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="18.5"
          y="1.5"
          width="3"
          height="6"
          fill={CREAM}
          opacity="0.9"
          transform={`rotate(${i * 45} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="13" fill={CREAM} opacity="0.14" />
      <circle cx="20" cy="20" r="13" fill="none" stroke={CREAM} strokeWidth="1.2" strokeDasharray="3 3" />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fill={CREAM}
        style={{ font: "700 11px var(--font-inter), sans-serif" }}
      >
        {value}
      </text>
    </svg>
  );
}

function BetSpot({
  project,
  index,
  active,
  onPlace,
}: {
  project: Project;
  index: number;
  active: boolean;
  onPlace: () => void;
}) {
  const amount = stake(project);
  const suit = SUITS[hash(project.slug) % SUITS.length];

  return (
    <button
      onClick={onPlace}
      className="group flex w-[104px] flex-col items-center gap-2.5 sm:w-[118px]"
      aria-label={`Place bet on ${project.name}`}
    >
      {/* betting circle */}
      <span
        className="relative grid h-[92px] w-[92px] place-items-center rounded-full border-2 transition-transform group-hover:-translate-y-1.5"
        style={{
          borderColor: active ? GOLD : `${GOLD}66`,
          backgroundColor: active ? `${GOLD}1f` : "#00000033",
          boxShadow: active ? `0 0 26px ${GOLD}55` : "none",
        }}
      >
        {/* chip stack */}
        <motion.span
          className="absolute"
          animate={active ? { y: [-26, 0], rotate: [8, 0] } : { y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          <Chip value={amount} index={index} size={54} />
        </motion.span>
        <span
          className="absolute -right-1 -bottom-1 grid h-7 w-7 place-items-center rounded-full text-[15px]"
          style={{
            backgroundColor: CREAM,
            color: suit === "♥" || suit === "♦" ? CRIMSON : "#141414",
          }}
        >
          {suit}
        </span>
      </span>

      <span className="text-center">
        <span className="block font-display text-[15px] leading-tight">{project.name}</span>
        <span className="mt-0.5 block text-[11.5px]" style={{ color: "#9fc0b1" }}>
          {active ? "dealing…" : `bet ${amount}`}
        </span>
      </span>
    </button>
  );
}

function HandModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(project !== null, onClose);
  if (!project) return null;

  const suit = SUITS[hash(project.slug) % SUITS.length];
  const red = suit === "♥" || suit === "♦";
  const stats = deriveStats(project);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, rotateY: -22, y: 24 }}
        animate={{ opacity: 1, rotateY: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 outline-none sm:p-8"
        style={{
          backgroundColor: CREAM,
          color: "#141414",
          boxShadow: `0 0 0 3px ${GOLD}, 0 24px 60px rgba(0,0,0,0.6)`,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded border px-2 py-0.5 text-[13px] transition hover:bg-black hover:text-white"
          style={{ borderColor: "#00000033" }}
        >
          ✕
        </button>

        {/* card corners */}
        <span
          className="absolute top-4 left-5 text-2xl leading-none"
          style={{ color: red ? CRIMSON : "#141414" }}
          aria-hidden
        >
          {suit}
        </span>
        <span
          className="absolute right-5 bottom-4 rotate-180 text-2xl leading-none"
          style={{ color: red ? CRIMSON : "#141414" }}
          aria-hidden
        >
          {suit}
        </span>

        <div className="mt-6 text-center">
          <p className="font-display text-[11.5px] tracking-[0.24em] uppercase" style={{ color: "#7a7268" }}>
            {project.year} · {project.role}
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight">{project.name}</h2>
          <p className="mt-1.5 font-display text-lg italic" style={{ color: "#5a5248" }}>
            {project.blurb}
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-4 gap-2 border-y py-4" style={{ borderColor: "#00000018" }}>
          {(
            [
              ["Pot", stats.power],
              ["Odds", stats.craft],
              ["Reach", stats.scale],
              ["Polish", stats.polish],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="text-center">
              <dt className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: "#8a8278" }}>
                {k}
              </dt>
              <dd className="mt-1 font-display text-xl">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-[15px] leading-relaxed whitespace-pre-line">
          {project.description}
        </p>

        {project.highlights.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-[14px]">
                <span style={{ color: CRIMSON }}>♦</span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded-full border px-2.5 py-1 text-[12px]"
              style={{ borderColor: "#00000026" }}
            >
              {t}
            </li>
          ))}
        </ul>

        {(project.live || project.repo) && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: FELT, color: GOLD }}
              >
                Collect winnings ↗
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border px-5 py-2.5 text-[13px] transition-transform hover:-translate-y-0.5"
                style={{ borderColor: "#00000033" }}
              >
                Check the deck ↗
              </a>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
