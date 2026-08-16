"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { deriveAttributes, deriveDifficulty, deriveXp, readable } from "@/lib/derive";

const BG = "#101820";
const GOLD = "#e8c547";
const TEAL = "#5bc0be";
const RED = "#c14953";
const PAPER = "#dfe6ec";

type Screen = "menu" | "start" | "load" | "options" | "credits";

const MENU: { id: Screen; label: string; note: string }[] = [
  { id: "start", label: "START GAME", note: "Who you're playing as" },
  { id: "load", label: "LOAD PROJECT", note: "Pick a cartridge" },
  { id: "options", label: "OPTIONS", note: "Skills and settings" },
  { id: "credits", label: "CREDITS", note: "History and contact" },
];

export default function Cartridge({ profile }: { profile: Profile }) {
  const [screen, setScreen] = useState<Screen>("menu");
  const [cursor, setCursor] = useState(0);
  const [slot, setSlot] = useState<Project | null>(null);

  const back = useCallback(() => {
    setSlot(null);
    setScreen("menu");
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;

      if (screen === "menu") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCursor((c) => (c + 1) % MENU.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setCursor((c) => (c - 1 + MENU.length) % MENU.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          setScreen(MENU[cursor].id);
        }
      } else if (e.key === "Backspace" || e.key === "Escape") {
        e.preventDefault();
        if (slot) setSlot(null);
        else back();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, cursor, slot, back]);

  return (
    <div
      className="min-h-dvh w-full px-3 py-6 sm:px-6 sm:py-10"
      style={{ backgroundColor: "#080c11", color: PAPER }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Console shell */}
        <div
          className="relative overflow-hidden rounded-xl border-4 shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
          style={{ borderColor: "#1e2a36", backgroundColor: BG }}
        >
          {/* scanlines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0 1px, transparent 1px 3px)",
            }}
          />

          <div className="relative z-10 min-h-[520px] px-5 py-7 sm:px-9 sm:py-10">
            {screen === "menu" && (
              <TitleScreen
                profile={profile}
                cursor={cursor}
                onHover={setCursor}
                onPick={setScreen}
              />
            )}
            {screen === "start" && <CharacterSelect profile={profile} onBack={back} />}
            {screen === "load" && (
              <Shelf
                profile={profile}
                slot={slot}
                onSlot={setSlot}
                onBack={back}
              />
            )}
            {screen === "options" && <Options profile={profile} onBack={back} />}
            {screen === "credits" && <Credits profile={profile} onBack={back} />}
          </div>
        </div>

        <p className="mt-4 text-center font-pixel text-[7px] leading-relaxed text-white/25">
          ARROWS SELECT · ENTER CONFIRMS · ESC GOES BACK
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CartridgeArt({
  project,
  width = 118,
}: {
  project?: Project;
  width?: number;
}) {
  const h = width * 1.18;
  const accent = project?.accent ?? GOLD;
  return (
    <svg width={width} height={h} viewBox="0 0 100 118" aria-hidden>
      {/* body */}
      <path
        d="M8 4h84a4 4 0 0 1 4 4v88a4 4 0 0 1-4 4H70l-6 10H36l-6-10H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"
        fill="#2a3642"
        stroke="#0d1218"
        strokeWidth="2.5"
      />
      {/* label — box art (ART-PROMPTS B4) clipped into the label window, tinted
          by the project accent so each cartridge still reads as its own */}
      <defs>
        <clipPath id={`lbl-${project?.slug ?? "blank"}`}>
          <rect x="14" y="14" width="72" height="52" rx="2" />
        </clipPath>
      </defs>
      <rect x="14" y="14" width="72" height="52" rx="2" fill={accent} />
      <image
        href="/art/cartridge-label.webp"
        x="14"
        y="14"
        width="72"
        height="52"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#lbl-${project?.slug ?? "blank"})`}
        opacity="0.92"
      />
      <rect
        x="14"
        y="14"
        width="72"
        height="52"
        rx="2"
        fill={accent}
        opacity="0.28"
        clipPath={`url(#lbl-${project?.slug ?? "blank"})`}
      />
      <rect x="14" y="14" width="72" height="12" rx="2" fill="#00000055" />
      {/* ridges */}
      {[74, 80, 86].map((y) => (
        <rect key={y} x="16" y={y} width="68" height="3" rx="1.5" fill="#1c242e" />
      ))}
      {/* connector */}
      <rect x="36" y="100" width="28" height="6" fill="#0d1218" />
    </svg>
  );
}

function ScreenHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-7 flex items-center justify-between gap-4">
      <h2 className="font-pixel text-[12px] sm:text-[15px]" style={{ color: GOLD }}>
        {title}
      </h2>
      <button
        onClick={onBack}
        className="rounded border-2 px-3 py-1.5 font-pixel text-[7px] transition hover:bg-white/10"
        style={{ borderColor: "#ffffff33" }}
      >
        ◀ BACK
      </button>
    </div>
  );
}

function TitleScreen({
  profile,
  cursor,
  onHover,
  onPick,
}: {
  profile: Profile;
  cursor: number;
  onHover: (i: number) => void;
  onPick: (s: Screen) => void;
}) {
  return (
    <div className="grid items-center gap-10 sm:grid-cols-[1fr_auto]">
      <div>
        <p className="font-pixel text-[7px] tracking-[0.3em] text-white/35">
          NOW PLAYING
        </p>
        <h1
          className="mt-5 font-pixel leading-[1.5]"
          style={{
            fontSize: "clamp(15px,4.4vw,30px)",
            color: GOLD,
            textShadow: `3px 3px 0 ${RED}`,
          }}
        >
          {profile.name.toUpperCase()}
        </h1>
        <p className="mt-4 font-pixel text-[8px] leading-relaxed" style={{ color: TEAL }}>
          {profile.role.toUpperCase()}
        </p>
        <p className="mt-5 max-w-[44ch] text-[14px] leading-relaxed text-white/50">
          {profile.tagline}
        </p>

        <ul className="mt-9 space-y-1">
          {MENU.map((m, i) => (
            <li key={m.id}>
              <button
                onMouseEnter={() => onHover(i)}
                onFocus={() => onHover(i)}
                onClick={() => onPick(m.id)}
                className="flex min-h-[44px] w-full items-baseline gap-3 py-2.5 text-left"
              >
                {/* Render the marker only for the selected row. Hiding the
                    others with an animated opacity meant every arrow showed
                    whenever the blink didn't run. */}
                <span className="w-4 font-pixel text-[10px]" style={{ color: GOLD }}>
                  {cursor === i && (
                    <motion.span
                      animate={{ opacity: [1, 0.25, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ▶
                    </motion.span>
                  )}
                </span>
                <span
                  className="font-pixel text-[10px] transition-colors sm:text-[12px]"
                  style={{ color: cursor === i ? PAPER : "rgba(223,230,236,0.45)" }}
                >
                  {m.label}
                </span>
                <span className="ml-auto hidden text-[12px] text-white/25 sm:block">
                  {m.note}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        className="justify-self-center"
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <CartridgeArt width={150} />
      </motion.div>
    </div>
  );
}

function CharacterSelect({
  profile,
  onBack,
}: {
  profile: Profile;
  onBack: () => void;
}) {
  const attributes = deriveAttributes(profile);
  const xp = deriveXp(profile);

  return (
    <div>
      <ScreenHeader title="CHARACTER SELECT" onBack={onBack} />
      <div className="grid gap-8 sm:grid-cols-[190px_1fr]">
        <div
          className="grid h-[190px] place-items-center rounded-lg border-2"
          style={{ borderColor: TEAL, backgroundColor: "#16222c" }}
        >
          <span className="font-pixel text-[38px]" style={{ color: GOLD }}>
            {profile.initials}
          </span>
        </div>

        <div>
          <p className="font-pixel text-[12px]" style={{ color: PAPER }}>
            {profile.name.toUpperCase()}
          </p>
          <p className="mt-2.5 font-pixel text-[8px]" style={{ color: TEAL }}>
            LV {xp.level} · {profile.location.toUpperCase()}
          </p>
          <p className="mt-4 max-w-[60ch] text-[14.5px] leading-relaxed whitespace-pre-line text-white/60">
            {profile.bio}
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {attributes.map((a) => (
              <li
                key={a.code}
                className="rounded border px-2.5 py-2"
                style={{ borderColor: "#ffffff1f" }}
              >
                <p className="font-pixel text-[7px]" style={{ color: GOLD }}>
                  {a.code}
                </p>
                <p className="mt-1.5 font-pixel text-[11px]">{a.score}</p>
                <p className="mt-1 text-[11px] text-white/35">{a.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Shelf({
  profile,
  slot,
  onSlot,
  onBack,
}: {
  profile: Profile;
  slot: Project | null;
  onSlot: (p: Project | null) => void;
  onBack: () => void;
}) {
  if (slot) {
    const ink = readable(slot.accent, BG);
    return (
      <div>
        <ScreenHeader title="NOW LOADED" onBack={() => onSlot(null)} />
        <div className="grid gap-7 sm:grid-cols-[auto_1fr]">
          <div className="justify-self-center">
            <CartridgeArt project={slot} width={132} />
          </div>
          <div>
            <p className="font-pixel text-[7px] text-white/35">
              {slot.year.toUpperCase()} · {slot.role.toUpperCase()}
            </p>
            <h3 className="mt-3 font-pixel text-[14px]" style={{ color: ink }}>
              {slot.name.toUpperCase()}
            </h3>
            <p className="mt-4 text-[14.5px] leading-relaxed whitespace-pre-line text-white/65">
              {slot.description}
            </p>

            {slot.highlights.length > 0 && (
              <ul className="mt-5 space-y-1.5">
                {slot.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-[13.5px] text-white/55">
                    <span style={{ color: ink }}>▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <ul className="mt-5 flex flex-wrap gap-1.5">
              {slot.tech.map((t) => (
                <li
                  key={t}
                  className="rounded border px-2 py-1 font-pixel text-[6.5px]"
                  style={{ borderColor: "#ffffff2a", color: "rgba(223,230,236,0.7)" }}
                >
                  {t.toUpperCase()}
                </li>
              ))}
            </ul>

            {(slot.live || slot.repo) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {slot.live && (
                  <a
                    href={slot.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border-2 px-4 py-2.5 font-pixel text-[7px] transition-transform hover:-translate-y-0.5"
                    style={{ borderColor: slot.accent, color: ink }}
                  >
                    PLAY ONLINE ↗
                  </a>
                )}
                {slot.repo && (
                  <a
                    href={slot.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border-2 px-4 py-2.5 font-pixel text-[7px] transition-transform hover:-translate-y-0.5"
                    style={{ borderColor: "#ffffff33" }}
                  >
                    SOURCE ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title="LOAD PROJECT" onBack={onBack} />
      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {profile.projects.map((p) => (
          <li key={p.slug}>
            <button
              onClick={() => onSlot(p)}
              className="group flex w-full flex-col items-center gap-2.5 rounded-lg border-2 border-transparent p-2 transition hover:border-white/20"
            >
              <span className="transition-transform group-hover:-translate-y-1.5">
                <CartridgeArt project={p} width={104} />
              </span>
              <span className="text-center font-pixel text-[7px] leading-relaxed">
                {p.name.toUpperCase()}
              </span>
              <span className="font-pixel text-[6px] text-white/30">
                {"★".repeat(deriveDifficulty(p))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Options({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  return (
    <div>
      <ScreenHeader title="OPTIONS" onBack={onBack} />
      <div className="space-y-7">
        {profile.skills.map((g) => (
          <div key={g.category}>
            <p className="font-pixel text-[9px]" style={{ color: TEAL }}>
              {g.category.toUpperCase()}
            </p>
            <p className="mt-1.5 text-[12.5px] text-white/35">{g.summary}</p>
            <ul className="mt-3 space-y-2">
              {g.items.map((s) => (
                <li key={s.name} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-[13.5px] text-white/70">
                    {s.name}
                  </span>
                  <span className="flex gap-1" aria-label={`${s.level} of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="h-3 w-6"
                        style={{
                          backgroundColor: n <= s.level ? GOLD : "#ffffff14",
                        }}
                      />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Credits({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  return (
    <div>
      <ScreenHeader title="CREDITS" onBack={onBack} />
      <div className="space-y-8">
        <div>
          <p className="font-pixel text-[8px]" style={{ color: TEAL }}>
            CAREER HISTORY
          </p>
          <ol className="mt-4 space-y-5">
            {profile.experience.map((e) => (
              <li key={`${e.org}-${e.period}`}>
                <p className="font-pixel text-[9px]" style={{ color: GOLD }}>
                  {e.role.toUpperCase()}
                </p>
                <p className="mt-1.5 font-pixel text-[6.5px] text-white/35">
                  {e.org.toUpperCase()} · {e.period}
                </p>
                <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-white/55">
                  {e.summary}
                </p>
              </li>
            ))}
            {profile.education.map((e) => (
              <li key={e.degree}>
                <p className="font-pixel text-[9px]" style={{ color: GOLD }}>
                  {e.degree.toUpperCase()}
                </p>
                <p className="mt-1.5 font-pixel text-[6.5px] text-white/35">
                  {e.org.toUpperCase()} · {e.period}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="font-pixel text-[8px]" style={{ color: TEAL }}>
            CONTINUE?
          </p>
          <p className="mt-3 text-[14px] text-white/55">
            {profile.availability} · {profile.location}
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-3 rounded border px-3 py-2 transition hover:border-white/35"
                  style={{ borderColor: "#ffffff1f" }}
                >
                  <span className="font-pixel text-[6.5px] text-white/45">
                    {l.label.toUpperCase()}
                  </span>
                  <span className="truncate text-[13px]">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
