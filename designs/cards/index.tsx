"use client";

import { useCallback, useRef, useState } from "react";
import { useSticky } from "@/lib/useSticky";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import {
  deriveAttributes,
  deriveRarity,
  deriveStats,
  deriveType,
  coord,
  deriveXp,
  RARITY_META,
  readable,
  seeded,
} from "@/lib/derive";

const DECK_LIMIT = 5;

export default function TradingCards({ profile }: { profile: Profile }) {
  const attributes = deriveAttributes(profile);
  const xp = deriveXp(profile);
  const [open, setOpen] = useState<Project | null>(null);
  const [deck, setDeck] = useSticky<string[]>("cards.deck", []);
  const close = useCallback(() => setOpen(null), []);

  const toggleDeck = useCallback((slug: string) => {
    setDeck((d) =>
      d.includes(slug)
        ? d.filter((s) => s !== slug)
        : d.length >= DECK_LIMIT
          ? d
          : [...d, slug],
    );
  }, []);

  return (
    <div
      className="min-h-dvh w-full px-4 pt-10 pb-40 sm:px-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% -10%, #1b1b3a 0%, #0d0d1c 45%, #07070f 100%)",
        color: "#e8e6f2",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
            Base Set · {profile.projects.length + 1} cards
          </p>
          <h1
            className="mt-4 font-display leading-none tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.2rem,7vw,4rem)" }}
          >
            {profile.name}
          </h1>
          <p className="mt-3 text-[15px] text-white/55">{profile.tagline}</p>
        </header>

        {/* The character card */}
        <div className="mt-12 flex justify-center">
          <HeroCard profile={profile} attributes={attributes} xp={xp} />
        </div>

        <div className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl">Project cards</h2>
            <p className="font-mono text-[12px] text-white/40">
              click a card to read the case study
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {profile.projects.map((p) => (
              <ProjectCard
                key={p.slug}
                project={p}
                inDeck={deck.includes(p.slug)}
                deckFull={deck.length >= DECK_LIMIT}
                onOpen={() => setOpen(p)}
                onToggleDeck={() => toggleDeck(p.slug)}
              />
            ))}
          </div>
        </div>

        <Collection profile={profile} />
      </div>

      <DeckTray
        profile={profile}
        deck={deck}
        onRemove={toggleDeck}
        onClear={() => setDeck([])}
      />
      <CardModal project={open} onClose={close} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card art — generated, never fetched                                 */
/* ------------------------------------------------------------------ */

function CardArt({ project }: { project: Project }) {
  const s = seeded(project.slug);
  const { color } = deriveType(project);
  const shapes = Array.from({ length: 7 }, (_, i) => {
    const r = seeded(`${project.slug}-${i}`);
    return {
      cx: 10 + r * 80,
      cy: 12 + seeded(`${project.slug}-y-${i}`) * 66,
      rad: 4 + r * 16,
    };
  });

  return (
    <svg viewBox="0 0 100 90" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`bg-${project.slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={project.accent} stopOpacity="0.85" />
          <stop offset="1" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect width="100" height="90" fill={`url(#bg-${project.slug})`} />
      {shapes.map((sh, i) =>
        i % 2 === 0 ? (
          <circle
            key={i}
            cx={sh.cx}
            cy={sh.cy}
            r={sh.rad}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.22}
            strokeWidth="1.2"
          />
        ) : (
          <rect
            key={i}
            x={sh.cx - sh.rad / 2}
            y={sh.cy - sh.rad / 2}
            width={sh.rad}
            height={sh.rad}
            fill="#ffffff"
            fillOpacity={0.13}
            transform={`rotate(${s * 60} ${sh.cx} ${sh.cy})`}
          />
        ),
      )}
      <rect y="70" width="100" height="20" fill="#000" opacity="0.25" />
    </svg>
  );
}

/** Shared holo sheen + cursor tilt. */
function useTilt() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setT({
      rx: (0.5 - py) * 14,
      ry: (px - 0.5) * 14,
      mx: px * 100,
      my: py * 100,
      active: true,
    });
  };
  const onLeave = () => setT({ rx: 0, ry: 0, mx: 50, my: 50, active: false });

  return { ref, t, onMove, onLeave };
}

function HoloSheen({ mx, my, active }: { mx: number; my: number; active: boolean }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 transition-opacity duration-200"
      style={{
        opacity: active ? 0.55 : 0,
        background: `radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.08) 28%, transparent 55%), conic-gradient(from ${mx * 3.6}deg at ${mx}% ${my}%, #ff6ec7aa, #6ec7ffaa, #c7ff6eaa, #ffd76eaa, #ff6ec7aa)`,
        mixBlendMode: "color-dodge",
      }}
    />
  );
}

function HeroCard({
  profile,
  attributes,
  xp,
}: {
  profile: Profile;
  attributes: ReturnType<typeof deriveAttributes>;
  xp: ReturnType<typeof deriveXp>;
}) {
  const { ref, t, onMove, onLeave } = useTilt();
  const gold = RARITY_META.legendary.color;

  return (
    <div style={{ perspective: 1100 }}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative w-[300px] overflow-hidden rounded-2xl border-[3px] p-4 transition-transform duration-150 sm:w-[340px]"
        style={{
          borderColor: gold,
          background: "linear-gradient(160deg, #241d33, #14101f)",
          transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 40px ${RARITY_META.legendary.glow}`,
        }}
      >
        <HoloSheen {...t} />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: gold }}
            >
              Legendary
            </p>
            <h2 className="mt-1 font-display text-2xl leading-tight">{profile.name}</h2>
          </div>
          <span
            className="shrink-0 rounded-md border px-2 py-1 font-mono text-[11px]"
            style={{ borderColor: gold, color: gold }}
          >
            LV {xp.level}
          </span>
        </div>

        {/* The art panel was a bare gradient; the project cards all carry
            generated art, so the hero looked like the unfinished one. */}
        <div
          className="relative mt-3 grid h-40 place-items-center overflow-hidden rounded-lg border"
          style={{ borderColor: `${gold}66`, background: "linear-gradient(140deg,#3a2f52,#1d1730)" }}
        >
          <svg viewBox="0 0 100 64" className="absolute inset-0 h-full w-full" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={i}
                cx={50}
                cy={32}
                r={10 + i * 9}
                fill="none"
                stroke={gold}
                strokeOpacity={0.22 - i * 0.03}
                strokeWidth="0.7"
              />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={`r${i}`}
                x1="50"
                y1="32"
                x2={coord(50 + Math.cos((i / 6) * Math.PI * 2) * 60)}
                y2={coord(32 + Math.sin((i / 6) * Math.PI * 2) * 60)}
                stroke={gold}
                strokeOpacity="0.12"
                strokeWidth="0.6"
              />
            ))}
          </svg>
          <span
            className="relative font-display text-6xl"
            style={{ color: gold, textShadow: `0 0 26px ${gold}55` }}
          >
            {profile.initials}
          </span>
        </div>

        <p className="relative mt-3 text-[12.5px] leading-snug text-white/65">
          {profile.role} · {profile.location}
        </p>

        {/* Label and value sit together — justify-between across a half-card
            column pushed them to opposite edges and broke the pairing. */}
        <ul className="relative mt-3 grid grid-cols-3 gap-x-2 gap-y-2">
          {attributes.map((a) => (
            <li key={a.code} className="flex items-baseline gap-1.5">
              <span className="font-mono text-[10px] text-white/45">{a.code}</span>
              <span className="font-mono text-[13px]" style={{ color: gold }}>
                {a.score}
              </span>
            </li>
          ))}
        </ul>

        <p className="relative mt-3 border-t pt-2 font-mono text-[10px] text-white/35" style={{ borderColor: "#ffffff1a" }}>
          {profile.availability}
        </p>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  inDeck,
  deckFull,
  onOpen,
  onToggleDeck,
}: {
  project: Project;
  inDeck: boolean;
  deckFull: boolean;
  onOpen: () => void;
  onToggleDeck: () => void;
}) {
  const { ref, t, onMove, onLeave } = useTilt();
  const rarity = deriveRarity(project);
  const meta = RARITY_META[rarity];
  const { type, color } = deriveType(project);
  const stats = deriveStats(project);

  return (
    <div style={{ perspective: 900 }}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative overflow-hidden rounded-xl border-2 transition-transform duration-150"
        style={{
          borderColor: meta.color,
          background: "linear-gradient(160deg, #1a1730, #0f0d1c)",
          transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
          boxShadow: t.active
            ? `0 18px 40px rgba(0,0,0,0.55), 0 0 26px ${meta.glow}`
            : "0 8px 20px rgba(0,0,0,0.4)",
        }}
      >
        <HoloSheen {...t} />

        <button onClick={onOpen} className="relative block w-full text-left">
          <span className="flex items-start justify-between gap-2 px-2.5 pt-2.5">
            <span
              className="font-mono text-[9px] tracking-[0.16em] uppercase"
              style={{ color: meta.color }}
            >
              {meta.label}
            </span>
            <span
              className="rounded border px-1.5 py-[2px] font-mono text-[9px]"
              style={{ borderColor: color, color }}
            >
              {type}
            </span>
          </span>

          <span className="mt-2 block h-[104px] overflow-hidden">
            <CardArt project={project} />
          </span>

          <span className="block px-2.5 pt-2">
            <span className="block truncate font-display text-[17px] leading-tight">
              {project.name}
            </span>
            <span className="mt-1 line-clamp-2 block text-[11.5px] leading-snug text-white/50">
              {project.blurb}
            </span>
          </span>

          <span className="mt-2.5 block space-y-1 px-2.5">
            {(
              [
                ["POW", stats.power],
                ["CRA", stats.craft],
                ["SCA", stats.scale],
                ["POL", stats.polish],
              ] as const
            ).map(([k, v]) => (
              <span key={k} className="flex items-center gap-2">
                <span className="w-7 shrink-0 font-mono text-[9px] text-white/35">{k}</span>
                <span className="h-[4px] flex-1 rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${v}%`, backgroundColor: project.accent }}
                  />
                </span>
                <span className="w-5 shrink-0 text-right font-mono text-[9px] text-white/45">
                  {v}
                </span>
              </span>
            ))}
          </span>

          <span className="mt-2.5 flex items-center justify-between px-2.5 pb-2 font-mono text-[9px] text-white/30">
            <span>{project.year}</span>
            <span>{project.tech.length} tech</span>
          </span>
        </button>

        <button
          onClick={onToggleDeck}
          disabled={!inDeck && deckFull}
          className="relative min-h-[44px] w-full border-t font-mono text-[10px] tracking-wider uppercase transition disabled:opacity-30"
          style={{
            borderColor: "#ffffff14",
            color: inDeck ? "#0d0d1c" : meta.color,
            backgroundColor: inDeck ? meta.color : "transparent",
          }}
        >
          {inDeck ? "in deck ✓" : deckFull ? "deck full" : "+ add to deck"}
        </button>
      </div>
    </div>
  );
}

function Collection({ profile }: { profile: Profile }) {
  return (
    <section className="mt-20 grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="mb-5 font-display text-2xl">Ability index</h2>
        <div className="space-y-5">
          {profile.skills.map((g) => (
            <div key={g.category}>
              <p className="font-mono text-[11px] tracking-[0.16em] text-white/40 uppercase">
                {g.category}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <li
                    key={s.name}
                    className="rounded-md border px-2 py-1 text-[12px]"
                    style={{
                      borderColor: `rgba(255,255,255,${0.08 + s.level * 0.05})`,
                      color: `rgba(232,230,242,${0.45 + s.level * 0.11})`,
                    }}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-5 font-display text-2xl">Trainer card</h2>
        <p className="max-w-[56ch] text-[15px] leading-relaxed whitespace-pre-line text-white/65">
          {profile.bio}
        </p>
        <ul className="mt-6 space-y-2">
          {profile.links.map((l) => (
            <li key={l.kind}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2 transition hover:border-white/30"
                style={{ borderColor: "#ffffff14" }}
              >
                <span className="font-mono text-[11px] tracking-[0.14em] text-white/40 uppercase">
                  {l.label}
                </span>
                <span className="truncate text-[13.5px]">{l.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DeckTray({
  profile,
  deck,
  onRemove,
  onClear,
}: {
  profile: Profile;
  deck: string[];
  onRemove: (slug: string) => void;
  onClear: () => void;
}) {
  const cards = deck
    .map((s) => profile.projects.find((p) => p.slug === s))
    .filter(Boolean) as Project[];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-20 sm:pb-24">
      <div
        className="mx-auto flex max-w-3xl items-center gap-3 rounded-xl border px-3 py-2.5 backdrop-blur-md"
        style={{ borderColor: "#ffffff1f", backgroundColor: "rgba(10,10,20,0.85)" }}
      >
        <span className="shrink-0 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
          Deck {cards.length}/{DECK_LIMIT}
        </span>

        <ul className="no-scrollbar flex min-h-[34px] flex-1 items-center gap-1.5 overflow-x-auto">
          {cards.length === 0 && (
            <li className="font-mono text-[11px] text-white/25">
              draft up to {DECK_LIMIT} cards
            </li>
          )}
          {cards.map((p) => (
            <li key={p.slug}>
              <button
                onClick={() => onRemove(p.slug)}
                className="flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] whitespace-nowrap transition hover:opacity-70"
                style={{ borderColor: p.accent, color: readable(p.accent, "#0a0a14") }}
                aria-label={`Remove ${p.name} from deck`}
              >
                {p.name}
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>

        {cards.length > 0 && (
          <button
            onClick={onClear}
            className="shrink-0 font-mono text-[10px] text-white/35 transition hover:text-white/70"
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}

function CardModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(project !== null, onClose);
  if (!project) return null;

  const rarity = deriveRarity(project);
  const meta = RARITY_META[rarity];
  const { type, color } = deriveType(project);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-lg overflow-y-auto rounded-xl border-2 p-6 outline-none"
        style={{
          borderColor: meta.color,
          background: "linear-gradient(160deg,#171430,#0c0a16)",
          color: "#e8e6f2",
          boxShadow: `0 0 50px ${meta.glow}`,
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

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded border px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase"
            style={{ borderColor: meta.color, color: meta.color }}
          >
            {meta.label}
          </span>
          <span
            className="rounded border px-2 py-0.5 font-mono text-[10px]"
            style={{ borderColor: color, color }}
          >
            {type}
          </span>
          <span className="font-mono text-[11px] text-white/35">
            {project.year} · {project.role}
          </span>
        </div>

        <h2 className="mt-3 font-display text-3xl leading-tight">{project.name}</h2>
        <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-line text-white/75">
          {project.description}
        </p>

        {project.highlights.length > 0 && (
          <ul className="mt-5 space-y-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-[14px] text-white/65">
                <span style={{ color: readable(project.accent, "#0c0a16") }}>▸</span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 font-mono text-[10px] tracking-[0.16em] text-white/35 uppercase">
          Abilities
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded border px-2 py-1 text-[12px] text-white/70"
              style={{ borderColor: "#ffffff20" }}
            >
              {t}
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
                className="rounded-lg px-4 py-2.5 text-[13px] font-medium transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: project.accent, color: "#0c0a16" }}
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
