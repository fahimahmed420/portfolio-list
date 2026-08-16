"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import {
  deriveAttributes,
  deriveDifficulty,
  deriveXp,
  type Attribute,
} from "@/lib/derive";

const INK = "#2b2118";
const PARCHMENT = "#e9dfc4";
const GOLD = "#b8863b";
const BLOOD = "#8c2f26";

export default function CharacterSheet({ profile }: { profile: Profile }) {
  const attributes = deriveAttributes(profile);
  const xp = deriveXp(profile);
  const [quest, setQuest] = useState<Project | null>(null);
  const closeQuest = useCallback(() => setQuest(null), []);

  return (
    <div
      className="min-h-dvh w-full px-3 py-6 sm:px-6 sm:py-10"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #2a201a 0%, #150f0b 60%, #0d0908 100%)",
      }}
    >
      <div
        className="relative mx-auto max-w-6xl border-[3px] px-4 py-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)] sm:px-8 sm:py-10"
        style={{
          borderColor: GOLD,
          backgroundColor: PARCHMENT,
          color: INK,
          // Real parchment (ART-PROMPTS A5) instead of a dot pattern.
          backgroundImage: "url(/art/parchment.webp)",
          backgroundSize: "760px",
        }}
      >
        <Corners />

        <Header profile={profile} xp={xp} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[330px_1fr]">
          <aside className="space-y-8">
            <Attributes attributes={attributes} />
            <Proficiencies attributes={attributes} />
          </aside>

          <div className="space-y-10 lg:min-w-0">
            <Biography profile={profile} />
            <QuestLog profile={profile} onOpen={setQuest} />
            <Chronicle profile={profile} />
            <PartyInvite profile={profile} />
          </div>
        </div>
      </div>

      <QuestModal project={quest} onClose={closeQuest} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Corners() {
  return (
    <>
      {[
        "top-1 left-1",
        "top-1 right-1 rotate-90",
        "bottom-1 right-1 rotate-180",
        "bottom-1 left-1 -rotate-90",
      ].map((pos) => (
        <svg
          key={pos}
          className={`pointer-events-none absolute ${pos}`}
          width="26"
          height="26"
          viewBox="0 0 26 26"
          aria-hidden
        >
          <path
            d="M2 24V8a6 6 0 0 1 6-6h16"
            fill="none"
            stroke={GOLD}
            strokeWidth="2"
          />
          <circle cx="8" cy="8" r="2.5" fill={GOLD} />
        </svg>
      ))}
    </>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2
        className="font-display text-[13px] tracking-[0.24em] uppercase"
        style={{ color: BLOOD }}
      >
        {children}
      </h2>
      <span className="h-px flex-1" style={{ backgroundColor: `${INK}33` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
    </div>
  );
}

function Header({
  profile,
  xp,
}: {
  profile: Profile;
  xp: ReturnType<typeof deriveXp>;
}) {
  return (
    <header className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
      {/* Sigil */}
      <div
        className="grid h-24 w-24 shrink-0 place-items-center border-[3px] font-display text-4xl"
        style={{
          borderColor: GOLD,
          backgroundColor: "#f4ecd6",
          boxShadow: `inset 0 0 0 3px ${PARCHMENT}, 0 6px 0 rgba(0,0,0,0.15)`,
        }}
      >
        {profile.initials}
      </div>

      <div className="min-w-0">
        <p
          className="font-display text-[12px] tracking-[0.26em] uppercase"
          style={{ color: `${INK}88` }}
        >
          Character Sheet
        </p>
        <h1
          className="mt-1 font-display leading-none tracking-[-0.02em]"
          style={{ fontSize: "clamp(2rem,6vw,3.6rem)" }}
        >
          {profile.name}
        </h1>
        <p className="mt-2 font-display text-lg italic" style={{ color: BLOOD }}>
          {profile.role} · Level {xp.level}
        </p>

        {/* XP bar */}
        <div className="mt-4 max-w-md">
          <div className="mb-1 flex items-baseline justify-between text-[11px] tracking-[0.14em] uppercase">
            <span style={{ color: `${INK}88` }}>Experience</span>
            <span style={{ color: `${INK}88` }}>
              {xp.into} / {xp.next}
            </span>
          </div>
          <div
            className="h-3 border-2"
            style={{ borderColor: INK, backgroundColor: "#d6c8a4" }}
          >
            <motion.div
              className="h-full"
              style={{ backgroundColor: GOLD }}
              initial={{ width: 0 }}
              animate={{ width: `${xp.pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function Attributes({ attributes }: { attributes: Attribute[] }) {
  return (
    <section>
      <Rule>Attributes</Rule>
      {/* Three across: five attributes in two columns strands the last one. */}
      <ul className="grid grid-cols-3 gap-2.5">
        {attributes.map((a) => (
          <li
            key={a.code}
            className="border-2 px-2 pt-2 pb-3 text-center"
            style={{ borderColor: INK, backgroundColor: "#f2e9d0" }}
            title={a.summary}
          >
            <p
              className="font-display text-[11px] tracking-[0.16em]"
              style={{ color: BLOOD }}
            >
              {a.code}
            </p>
            <p className="mt-1 font-display text-4xl leading-none">{a.score}</p>
            <p
              className="mx-auto mt-1.5 w-11 border-2 text-[12px]"
              style={{ borderColor: INK, backgroundColor: PARCHMENT }}
            >
              {a.modifier >= 0 ? `+${a.modifier}` : a.modifier}
            </p>
            <p className="mt-2 text-[11px] leading-tight" style={{ color: `${INK}99` }}>
              {a.name}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Proficiencies({ attributes }: { attributes: Attribute[] }) {
  return (
    <section>
      <Rule>Proficiencies</Rule>
      <div className="space-y-4">
        {attributes.map((a) => (
          <div key={a.code}>
            <p
              className="mb-1.5 font-display text-[12px] tracking-[0.12em] uppercase"
              style={{ color: `${INK}aa` }}
            >
              {a.name}
            </p>
            <ul className="space-y-1">
              {a.group.items.map((s) => (
                <li key={s.name} className="flex items-center gap-2 text-[13px]">
                  <span className="flex shrink-0 gap-[3px]" aria-hidden>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="h-[7px] w-[7px] rotate-45"
                        style={{
                          backgroundColor: n <= s.level ? GOLD : "transparent",
                          border: `1px solid ${n <= s.level ? GOLD : `${INK}44`}`,
                        }}
                      />
                    ))}
                  </span>
                  <span className="min-w-0 truncate">{s.name}</span>
                  <span className="sr-only">{s.level} of 5</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Biography({ profile }: { profile: Profile }) {
  return (
    <section>
      <Rule>Biography</Rule>
      <p className="font-display text-[21px] leading-snug italic" style={{ color: BLOOD }}>
        “{profile.tagline}”
      </p>
      <p className="mt-4 text-[15.5px] leading-[1.75] whitespace-pre-line">
        {profile.bio}
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {profile.stats.slice(0, 3).map((s) => (
          <div
            key={s.label}
            className="border-2 px-3 py-2"
            style={{ borderColor: `${INK}44`, backgroundColor: "#f2e9d0" }}
          >
            <dt className="text-[11px] tracking-[0.14em] uppercase" style={{ color: `${INK}88` }}>
              {s.label}
            </dt>
            <dd className="font-display text-2xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function QuestLog({
  profile,
  onOpen,
}: {
  profile: Profile;
  onOpen: (p: Project) => void;
}) {
  return (
    <section>
      <Rule>Quest Log</Rule>
      <ul className="space-y-3">
        {profile.projects.map((p, i) => {
          const diff = deriveDifficulty(p);
          return (
            <li key={p.slug}>
              <button
                onClick={() => onOpen(p)}
                className="group flex w-full items-start gap-4 border-2 px-4 py-3.5 text-left transition-transform hover:-translate-y-[2px]"
                style={{ borderColor: INK, backgroundColor: "#f2e9d0" }}
              >
                <span
                  className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border-2 font-display text-sm"
                  style={{ borderColor: p.accent, color: p.accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-display text-xl">{p.name}</span>
                    <span
                      className="text-[11px] tracking-[0.14em] uppercase"
                      style={{ color: `${INK}88` }}
                    >
                      {p.year} · {p.role}
                    </span>
                  </span>
                  <span className="mt-1 block text-[14px]" style={{ color: `${INK}bb` }}>
                    {p.blurb}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span
                    className="block text-[10px] tracking-[0.14em] uppercase"
                    style={{ color: `${INK}77` }}
                  >
                    Difficulty
                  </span>
                  <span className="mt-1 block" aria-label={`${diff} of 5`}>
                    {"◆".repeat(diff)}
                    <span style={{ color: `${INK}33` }}>{"◆".repeat(5 - diff)}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Chronicle({ profile }: { profile: Profile }) {
  return (
    <section>
      <Rule>Chronicle</Rule>
      <ol className="space-y-5">
        {profile.experience.map((e) => (
          <li key={`${e.org}-${e.period}`} className="flex gap-4">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45"
              style={{ backgroundColor: GOLD }}
            />
            <div>
              <p className="font-display text-lg">{e.role}</p>
              <p className="text-[12px] tracking-[0.12em] uppercase" style={{ color: BLOOD }}>
                {e.org} · {e.period}
              </p>
              <p className="mt-1.5 max-w-[64ch] text-[14.5px] leading-relaxed">
                {e.summary}
              </p>
            </div>
          </li>
        ))}
        {profile.education.map((e) => (
          <li key={e.degree} className="flex gap-4">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45"
              style={{ backgroundColor: `${INK}55` }}
            />
            <div>
              <p className="font-display text-lg">{e.degree}</p>
              <p className="text-[12px] tracking-[0.12em] uppercase" style={{ color: `${INK}88` }}>
                {e.org} · {e.period}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PartyInvite({ profile }: { profile: Profile }) {
  return (
    <section>
      <Rule>Party Invite</Rule>
      <div
        className="border-2 px-5 py-5"
        style={{ borderColor: GOLD, backgroundColor: "#f4ecd6" }}
      >
        <p className="font-display text-[19px] leading-snug">
          {profile.availability} — currently questing out of {profile.location}.
        </p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {profile.links.map((l) => (
            <li key={l.kind}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3 border-2 px-3 py-2 transition-colors hover:bg-[#2b2118] hover:text-[#e9dfc4]"
                style={{ borderColor: `${INK}44` }}
              >
                <span className="text-[11px] tracking-[0.16em] uppercase">{l.label}</span>
                <span className="truncate font-display text-[14px]">{l.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function QuestModal({
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
      <div className="absolute inset-0 bg-black/75" onClick={onClose} aria-hidden />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-xl overflow-y-auto border-[3px] px-6 py-6 outline-none"
        style={{ borderColor: GOLD, backgroundColor: PARCHMENT, color: INK }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 border-2 px-2 py-0.5 text-sm transition hover:bg-[#2b2118] hover:text-[#e9dfc4]"
          style={{ borderColor: INK }}
        >
          ✕
        </button>

        <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: BLOOD }}>
          Quest · {project.year} · {project.role}
        </p>
        <h2 className="mt-2 font-display text-3xl leading-tight">{project.name}</h2>
        <p className="mt-1 font-display text-lg italic" style={{ color: `${INK}aa` }}>
          {project.blurb}
        </p>

        <p className="mt-5 text-[15px] leading-[1.75] whitespace-pre-line">
          {project.description}
        </p>

        {project.highlights.length > 0 && (
          <>
            <h3
              className="mt-6 mb-2 font-display text-[12px] tracking-[0.2em] uppercase"
              style={{ color: BLOOD }}
            >
              Objectives complete
            </h3>
            <ul className="space-y-1.5">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 text-[14.5px]">
                  <span style={{ color: GOLD }}>✔</span>
                  {h}
                </li>
              ))}
            </ul>
          </>
        )}

        <h3
          className="mt-6 mb-2 font-display text-[12px] tracking-[0.2em] uppercase"
          style={{ color: BLOOD }}
        >
          Loot acquired
        </h3>
        <ul className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li
              key={t}
              className="border-2 px-2 py-1 text-[12px]"
              style={{ borderColor: `${INK}55`, backgroundColor: "#f2e9d0" }}
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
                className="border-2 px-4 py-2 font-display text-[14px] tracking-wide transition-transform hover:-translate-y-[2px]"
                style={{ borderColor: INK, backgroundColor: GOLD, color: INK }}
              >
                Visit the realm ↗
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 px-4 py-2 font-display text-[14px] tracking-wide transition-transform hover:-translate-y-[2px]"
                style={{ borderColor: INK }}
              >
                Read the scrolls ↗
              </a>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
