"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project, SkillGroup } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { deriveRarity, RARITY_META, seeded } from "@/lib/derive";
import Backdrop from "./Backdrop";

const PANEL = "#c6c6c6";
const SLOT = "#8b8b8b";
const DARK = "#373737";
const TEXT = "#3f3f3f";

/* Classic beveled GUI edges, built from insets rather than images. */
const bevelOut = {
  boxShadow: `inset 3px 3px 0 #ffffff, inset -3px -3px 0 ${DARK}`,
};
const bevelIn = {
  boxShadow: `inset 3px 3px 0 ${DARK}, inset -3px -3px 0 #ffffff`,
};

type Hover =
  | { kind: "project"; project: Project }
  | { kind: "skill"; group: SkillGroup }
  | { kind: "book" }
  | null;

export default function Inventory({ profile }: { profile: Profile }) {
  const [hover, setHover] = useState<Hover>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState<Project | null>(null);
  const [book, setBook] = useState(false);
  const close = useCallback(() => setOpen(null), []);

  /* Size the grid to the content. A fixed 27-slot chest left three-quarters of
     the screen as empty sockets, which read as broken rather than roomy. */
  const COLS = 9;
  const SLOTS = Math.max(COLS, Math.ceil(profile.projects.length / COLS) * COLS);

  return (
    <div
      className="relative min-h-dvh w-full px-3 py-6 font-pixel sm:px-6 sm:py-10"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      <Backdrop />
      {/* Light touch only — at 0.45 the world went grey and lost the point of
          having a world. The panel gets its own shadow instead. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: "rgba(8,14,26,0.22)" }}
      />

      <div className="relative mx-auto max-w-2xl">
        {/* Window */}
        <div
          className="p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
          style={{ backgroundColor: PANEL, ...bevelOut }}
        >
          <div className="px-4 py-4">
            {/* Player panel */}
            <div className="flex flex-wrap items-start gap-4">
              <div
                className="grid h-[132px] w-[104px] shrink-0 place-items-center"
                style={{ backgroundColor: SLOT, ...bevelIn }}
              >
                <Avatar profile={profile} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] leading-relaxed" style={{ color: TEXT }}>
                  {profile.name.toUpperCase()}
                </p>
                <p className="mt-2.5 font-sans text-[13px] leading-relaxed" style={{ color: "#5a5a5a" }}>
                  {profile.role} · {profile.location}
                </p>
                <p className="mt-2 font-sans text-[13.5px] leading-relaxed" style={{ color: "#4a4a4a" }}>
                  {profile.bioShort}
                </p>

                {/* health / hunger style rows from stats */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {profile.stats.slice(0, 3).map((s) => (
                    <span key={s.label} className="font-sans text-[12px]" style={{ color: TEXT }}>
                      <span className="font-pixel text-[8px]">{s.value}</span> {s.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Book + crafting */}
              <div className="flex shrink-0 gap-2">
                <Slot
                  label="Written book — career history"
                  onMouseEnter={() => setHover({ kind: "book" })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setBook(true)}
                >
                  <BookIcon />
                </Slot>
              </div>
            </div>

            {/* Item grid */}
            <p className="mt-6 mb-2 text-[8px]" style={{ color: TEXT }}>
              ITEMS
            </p>
            {/* Columns cap at 44px but may shrink: nine fixed 44px cells came
                to 428px and overflowed a 375px phone by 87px. */}
            <div
              className="grid w-full max-w-fit gap-1"
              style={{ gridTemplateColumns: "repeat(auto-fill, 44px)" }}
            >
              {Array.from({ length: SLOTS }, (_, i) => {
                const project = profile.projects[i];
                if (!project) return <EmptySlot key={i} fluid />;
                return (
                  <Slot
                    key={i}
                    fluid
                    label={`${project.name} — ${project.blurb}`}
                    onMouseEnter={() => setHover({ kind: "project", project })}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setOpen(project)}
                  >
                    <ItemIcon project={project} />
                    <span
                      className="absolute right-0.5 bottom-0 text-[7px]"
                      style={{ color: "#fff", textShadow: "1px 1px 0 #3f3f3f" }}
                    >
                      {project.tech.length}
                    </span>
                  </Slot>
                );
              })}
            </div>

            {/* Hotbar = skills */}
            <p className="mt-5 mb-2 text-[8px]" style={{ color: TEXT }}>
              TOOLBAR
            </p>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map((g) => (
                <Slot
                  key={g.category}
                  label={`${g.category} — ${g.summary}`}
                  big
                  onMouseEnter={() => setHover({ kind: "skill", group: g })}
                  onMouseLeave={() => setHover(null)}
                >
                  <ToolIcon seed={g.category} />
                </Slot>
              ))}
            </div>

            {/* Crafting recipe = contact */}
            <p className="mt-6 mb-2 text-[8px]" style={{ color: TEXT }}>
              CRAFTING — GET IN TOUCH
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }, (_, i) => {
                  const link = profile.links[i % profile.links.length];
                  const filled = i % 2 === 0;
                  return filled ? (
                    <a
                      key={i}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${link.label} — ${link.handle}`}
                      className="relative grid h-11 w-11 place-items-center transition hover:brightness-110"
                      style={{ backgroundColor: SLOT, ...bevelIn }}
                    >
                      <LinkIcon kind={link.kind} />
                    </a>
                  ) : (
                    <EmptySlot key={i} />
                  );
                })}
              </div>

              <span className="text-[14px]" style={{ color: TEXT }}>
                →
              </span>

              <div
                className="grid h-14 w-14 place-items-center"
                style={{ backgroundColor: SLOT, ...bevelIn }}
                title={profile.availability}
              >
                <span className="text-[7px] leading-tight" style={{ color: TEXT }}>
                  HIRE
                </span>
              </div>

              <p className="font-sans text-[13px]" style={{ color: "#4a4a4a" }}>
                {profile.availability}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[7px] leading-relaxed text-white/70">
          HOVER FOR DETAIL · CLICK AN ITEM TO OPEN IT
        </p>
      </div>

      <Tooltip hover={hover} pos={pos} />
      <ItemModal project={open} onClose={close} />
      <BookModal profile={profile} open={book} onClose={() => setBook(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Slot({
  children,
  label,
  big,
  fluid,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  label: string;
  big?: boolean;
  /** Fills its grid cell instead of taking a fixed width — used in the item grid. */
  fluid?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  const size = fluid ? "aspect-square w-full" : big ? "h-14 w-14" : "h-11 w-11";
  return (
    <Tag
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      aria-label={label}
      title={label}
      className={`relative grid place-items-center transition ${size} ${
        onClick ? "hover:brightness-110" : ""
      }`}
      style={{ backgroundColor: SLOT, ...bevelIn }}
    >
      {children}
    </Tag>
  );
}

function EmptySlot({ fluid }: { fluid?: boolean }) {
  return (
    <div
      className={fluid ? "aspect-square w-full" : "h-11 w-11"}
      style={{ backgroundColor: SLOT, ...bevelIn }}
    />
  );
}

/**
 * Blocky item sprite generated from the project slug.
 *
 * Drawn on an 8×8 grid and mirrored down the middle: a 4×4 field of random
 * cells read as noise, whereas symmetry reads as an object.
 */
function ItemIcon({ project }: { project: Project }) {
  const N = 8;
  const cells: boolean[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const mx = x < N / 2 ? x : N - 1 - x;
      // Taper the top and bottom rows so the sprite has a silhouette.
      const edge = y === 0 || y === N - 1 ? 0.66 : 0.4;
      cells.push(seeded(`${project.slug}-${mx}-${y}`) > edge);
    }
  }
  return (
    <svg width="28" height="28" viewBox="0 0 8 8" className="crisp" aria-hidden>
      {cells.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i % N}
            y={Math.floor(i / N)}
            width="1"
            height="1"
            fill={project.accent}
            opacity={0.6 + ((i * 5) % 4) * 0.13}
          />
        ) : null,
      )}
    </svg>
  );
}

function ToolIcon({ seed }: { seed: string }) {
  const hue = Math.floor(seeded(seed) * 360);
  return (
    <svg width="30" height="30" viewBox="0 0 12 12" className="crisp" aria-hidden>
      <rect x="2" y="8" width="2" height="3" fill="#8a5a2b" />
      <rect x="3" y="6" width="2" height="3" fill="#8a5a2b" />
      <rect x="4" y="2" width="6" height="2" fill={`hsl(${hue} 60% 55%)`} />
      <rect x="4" y="4" width="4" height="2" fill={`hsl(${hue} 60% 45%)`} />
      <rect x="8" y="1" width="2" height="2" fill={`hsl(${hue} 60% 65%)`} />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 12 12" className="crisp" aria-hidden>
      <rect x="2" y="1" width="8" height="10" fill="#8a3b2b" />
      <rect x="3" y="2" width="6" height="8" fill="#e8dcc0" />
      <rect x="4" y="3" width="4" height="1" fill="#8a8a8a" />
      <rect x="4" y="5" width="4" height="1" fill="#8a8a8a" />
      <rect x="4" y="7" width="3" height="1" fill="#8a8a8a" />
      <rect x="9" y="1" width="1" height="10" fill="#f2c94c" />
    </svg>
  );
}

function LinkIcon({ kind }: { kind: string }) {
  const color =
    kind === "github" ? "#3f3f3f" : kind === "email" ? "#e8503a" : "#3a8ee6";
  return (
    <svg width="24" height="24" viewBox="0 0 8 8" className="crisp" aria-hidden>
      <rect x="1" y="2" width="6" height="4" fill={color} />
      <rect x="1" y="2" width="6" height="1" fill="#ffffff" opacity="0.35" />
      <rect x="2" y="4" width="4" height="1" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

function Avatar({ profile }: { profile: Profile }) {
  return (
    <svg width="72" height="104" viewBox="0 0 9 13" className="crisp" aria-hidden>
      {/* head */}
      <rect x="2" y="0" width="5" height="5" fill="#c68642" />
      <rect x="2" y="0" width="5" height="1.6" fill="#3b2a1a" />
      <rect x="3" y="2" width="1" height="1" fill="#2b3a55" />
      <rect x="5" y="2" width="1" height="1" fill="#2b3a55" />
      <rect x="3.5" y="4" width="2" height="0.6" fill="#8a5a3a" />
      {/* body */}
      <rect x="2" y="5" width="5" height="4" fill="#3f7d4e" />
      <rect x="1" y="5" width="1" height="4" fill="#c68642" />
      <rect x="7" y="5" width="1" height="4" fill="#c68642" />
      {/* legs */}
      <rect x="2.5" y="9" width="1.8" height="4" fill="#2b3a55" />
      <rect x="4.7" y="9" width="1.8" height="4" fill="#2b3a55" />
      <text
        x="4.5"
        y="12.6"
        textAnchor="middle"
        fill="#ffffff"
        style={{ font: "1.6px var(--font-inter), sans-serif" }}
      >
        {profile.initials}
      </text>
    </svg>
  );
}

/** Cursor-following tooltip, styled like an item card. */
function Tooltip({ hover, pos }: { hover: Hover; pos: { x: number; y: number } }) {
  if (!hover) return null;

  let title = "";
  let titleColor = "#ffffff";
  let lines: string[] = [];

  if (hover.kind === "project") {
    const r = deriveRarity(hover.project);
    title = hover.project.name;
    titleColor = RARITY_META[r].color;
    lines = [
      RARITY_META[r].label,
      hover.project.blurb,
      "",
      ...hover.project.tech.slice(0, 5),
      "",
      "Click to open",
    ];
  } else if (hover.kind === "skill") {
    title = hover.group.category;
    titleColor = "#55ff55";
    lines = [hover.group.summary, "", ...hover.group.items.map((s) => `${s.name} ${"■".repeat(s.level)}`)];
  } else {
    title = "Written Book";
    titleColor = "#ffaa00";
    lines = ["Career history", "", "Click to read"];
  }

  const left = Math.min(pos.x + 16, (typeof window !== "undefined" ? window.innerWidth : 1200) - 280);
  const top = Math.min(pos.y + 16, (typeof window !== "undefined" ? window.innerHeight : 800) - 240);

  return (
    <div
      className="pointer-events-none fixed z-50 max-w-[260px] px-3 py-2"
      style={{
        left,
        top,
        backgroundColor: "#100010f0",
        boxShadow: "inset 0 0 0 2px #26006b, inset 0 0 0 4px #100010",
      }}
    >
      <p className="text-[9px] leading-relaxed" style={{ color: titleColor }}>
        {title}
      </p>
      {lines.map((l, i) =>
        l === "" ? (
          <span key={i} className="block h-2" />
        ) : (
          <p key={i} className="font-sans text-[12px] leading-snug" style={{ color: "#a8a8a8" }}>
            {l}
          </p>
        ),
      )}
    </div>
  );
}

function ItemModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(project !== null, onClose);
  if (!project) return null;
  const r = deriveRarity(project);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-lg overflow-y-auto p-1.5 font-pixel outline-none"
        style={{ backgroundColor: PANEL, ...bevelOut }}
      >
        <div className="px-5 py-5">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 h-7 w-7 text-[10px]"
            style={{ backgroundColor: SLOT, ...bevelOut, color: TEXT }}
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <span
              className="grid h-14 w-14 shrink-0 place-items-center"
              style={{ backgroundColor: SLOT, ...bevelIn }}
            >
              <ItemIcon project={project} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] leading-relaxed" style={{ color: RARITY_META[r].color }}>
                {project.name.toUpperCase()}
              </p>
              <p className="mt-2 font-sans text-[12.5px]" style={{ color: "#5a5a5a" }}>
                {RARITY_META[r].label} · {project.year} · {project.role}
              </p>
            </div>
          </div>

          <p className="mt-4 font-sans text-[14px] leading-relaxed whitespace-pre-line" style={{ color: "#3f3f3f" }}>
            {project.description}
          </p>

          {project.highlights.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-2 font-sans text-[13.5px]" style={{ color: "#4a4a4a" }}>
                  <span style={{ color: project.accent }}>▪</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 mb-2 text-[7.5px]" style={{ color: TEXT }}>
            CRAFTED FROM
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <li
                key={t}
                className="px-2 py-1 font-sans text-[12px]"
                style={{ backgroundColor: SLOT, ...bevelIn, color: "#2b2b2b" }}
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
                  className="px-4 py-2.5 text-[7.5px]"
                  style={{ backgroundColor: "#7a9a5a", ...bevelOut, color: "#fff" }}
                >
                  VISIT ↗
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-[7.5px]"
                  style={{ backgroundColor: SLOT, ...bevelOut, color: TEXT }}
                >
                  SOURCE ↗
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function BookModal({
  profile,
  open,
  onClose,
}: {
  profile: Profile;
  open: boolean;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, rotateY: -12 }}
        animate={{ opacity: 1, rotateY: 0 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-md overflow-y-auto px-7 py-7 font-pixel outline-none"
        style={{ backgroundColor: "#e8dcc0", boxShadow: "0 0 0 10px #8a3b2b, 0 20px 50px rgba(0,0,0,0.6)" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 h-6 w-6 text-[10px]"
          style={{ color: "#5a4a34" }}
        >
          ✕
        </button>

        <p className="text-[9px] leading-relaxed" style={{ color: "#5a4a34" }}>
          CAREER HISTORY
        </p>
        <div className="mt-4 space-y-4">
          {profile.experience.map((e) => (
            <div key={`${e.org}-${e.period}`}>
              <p className="text-[8px] leading-relaxed" style={{ color: "#3b2a1a" }}>
                {e.role.toUpperCase()}
              </p>
              <p className="mt-1.5 font-sans text-[12px]" style={{ color: "#7a6448" }}>
                {e.org} · {e.period}
              </p>
              <p className="mt-1 font-sans text-[13px] leading-relaxed" style={{ color: "#4a3b2c" }}>
                {e.summary}
              </p>
            </div>
          ))}
          {profile.education.map((e) => (
            <div key={e.degree}>
              <p className="text-[8px] leading-relaxed" style={{ color: "#3b2a1a" }}>
                {e.degree.toUpperCase()}
              </p>
              <p className="mt-1.5 font-sans text-[12px]" style={{ color: "#7a6448" }}>
                {e.org} · {e.period}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
