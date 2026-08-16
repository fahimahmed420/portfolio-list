"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { seeded } from "@/lib/derive";

const CORK = "#9c6f42";
const MANILA = "#e0c48f";
const PAPER = "#f4ecd8";
const INK = "#2a2118";
const RED = "#b3271e";

export default function CaseFiles({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <div
      className="min-h-dvh w-full px-4 py-8 sm:px-8 sm:py-12"
      style={{
        // Photographed cork (ART-PROMPTS A6), with a vignette over the top.
        backgroundColor: CORK,
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(255,220,160,0.12), rgba(0,0,0,0.28) 85%), url(/art/cork.webp)",
        backgroundSize: "auto, 620px",
        color: INK,
      }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Case board header */}
        <header className="mb-10 text-center">
          <div
            className="mx-auto inline-block -rotate-1 border-2 px-6 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.4)]"
            style={{ borderColor: INK, backgroundColor: PAPER }}
          >
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase" style={{ color: RED }}>
              Confidential · Case Board
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl">{profile.name}</h1>
            <p className="mt-1 font-mono text-[12.5px]" style={{ color: `${INK}99` }}>
              {profile.role} — {profile.projects.length} cases on file
            </p>
          </div>
        </header>

        {/* Corkboard with pinned folders */}
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {profile.projects.map((p, i) => (
            <CaseFolder key={p.slug} project={p} index={i} onOpen={() => setOpen(p)} />
          ))}
        </div>

        <Dossier profile={profile} />
        <NewCase profile={profile} />
      </div>

      <CaseModal project={open} onClose={close} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Pin({ color = RED }: { color?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      className="absolute top-1 left-1/2 z-10 -translate-x-1/2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
      aria-hidden
    >
      <circle cx="11" cy="8" r="6.5" fill={color} />
      <circle cx="8.8" cy="5.8" r="2" fill="#ffffff" opacity="0.45" />
      <rect x="10.2" y="12" width="1.6" height="8" fill="#5c5c5c" />
    </svg>
  );
}

function CaseFolder({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const tilt = (seeded(project.slug) - 0.5) * 4.5;

  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ y: -6, rotate: 0 }}
      initial={{ rotate: tilt }}
      animate={{ rotate: tilt }}
      className="relative block w-full pt-3 text-left"
    >
      <Pin color={index % 3 === 0 ? RED : index % 3 === 1 ? "#1e5fb3" : "#e0a02e"} />
      <div
        className="border-2 shadow-[0_12px_26px_rgba(0,0,0,0.45)]"
        style={{ borderColor: "#a8834f", backgroundColor: MANILA }}
      >
        {/* folder tab */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ backgroundColor: "#d4b47c", borderBottom: `1px solid #a8834f` }}
        >
          <span className="font-mono text-[10.5px] tracking-[0.18em]" style={{ color: `${INK}bb` }}>
            CASE #{String(index + 1).padStart(3, "0")}
          </span>
          <span className="font-mono text-[10.5px]" style={{ color: `${INK}88` }}>
            {project.year}
          </span>
        </div>

        <div className="px-3 py-3">
          <h2 className="font-display text-xl leading-tight">{project.name}</h2>
          <p className="mt-1.5 text-[13px] leading-snug" style={{ color: `${INK}aa` }}>
            {project.blurb}
          </p>

          {/* evidence strip */}
          <div className="mt-3 flex flex-wrap gap-1">
            {project.tech.slice(0, 4).map((t) => (
              <span
                key={t}
                className="border px-1.5 py-[2px] font-mono text-[9.5px]"
                style={{ borderColor: `${INK}44`, backgroundColor: PAPER }}
              >
                {t}
              </span>
            ))}
            {project.tech.length > 4 && (
              <span className="font-mono text-[9.5px]" style={{ color: `${INK}77` }}>
                +{project.tech.length - 4}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span
              className="-rotate-6 border-2 px-2 py-[2px] font-mono text-[9px] tracking-[0.16em]"
              style={{ borderColor: RED, color: RED }}
            >
              {project.live ? "SOLVED" : "CLOSED"}
            </span>
            <span className="font-mono text-[10px]" style={{ color: `${INK}88` }}>
              open file →
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function Dossier({ profile }: { profile: Profile }) {
  return (
    <section className="mt-14">
      <div
        className="rotate-[0.4deg] border-2 px-5 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.4)] sm:px-8"
        style={{ borderColor: INK, backgroundColor: PAPER }}
      >
        <p className="font-mono text-[11px] tracking-[0.24em] uppercase" style={{ color: RED }}>
          Investigator dossier
        </p>
        <div className="mt-5 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[13.5px] leading-[1.65] whitespace-pre-line">
              {profile.bio}
            </p>
            <p className="mt-4 font-mono text-[12.5px]" style={{ color: `${INK}88` }}>
              Based {profile.location} · {profile.availability}
            </p>
          </div>

          <div>
            <p className="mb-3 font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: `${INK}88` }}>
              Known methods
            </p>
            <div className="space-y-3">
              {profile.skills.map((g) => (
                <div key={g.category}>
                  <p className="font-mono text-[12px] font-bold">{g.category}</p>
                  <p className="font-mono text-[12px]" style={{ color: `${INK}99` }}>
                    {g.items.map((s) => s.name).join(" · ")}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-5 mb-2 font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: `${INK}88` }}>
              Service record
            </p>
            <ol className="space-y-2">
              {profile.experience.map((e) => (
                <li key={`${e.org}-${e.period}`} className="font-mono text-[12.5px]">
                  <span className="font-bold">{e.role}</span>
                  <span style={{ color: `${INK}88` }}>
                    {" "}
                    — {e.org}, {e.period}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewCase({ profile }: { profile: Profile }) {
  return (
    <section className="mt-10 mb-10">
      <div
        className="-rotate-[0.5deg] border-2 px-5 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.4)]"
        style={{ borderColor: INK, backgroundColor: MANILA }}
      >
        <h2 className="font-display text-2xl">Open a new case</h2>
        <p className="mt-1.5 font-mono text-[13px]" style={{ color: `${INK}aa` }}>
          Bring me something that isn&apos;t working yet.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {profile.links.map((l) => (
            <li key={l.kind}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3 border-2 px-3 py-2 transition hover:bg-[#2a2118] hover:text-[#f4ecd8]"
                style={{ borderColor: `${INK}55`, backgroundColor: PAPER }}
              >
                <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase">
                  {l.label}
                </span>
                <span className="truncate font-mono text-[12.5px]">{l.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CaseModal({
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
        initial={{ opacity: 0, y: 18, rotate: -1.2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-2xl overflow-y-auto border-2 outline-none"
        style={{ borderColor: INK, backgroundColor: PAPER, color: INK }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-3"
          style={{ backgroundColor: MANILA, borderBottom: `2px solid ${INK}` }}
        >
          <span className="font-mono text-[11px] tracking-[0.2em]" style={{ color: `${INK}aa` }}>
            CASE FILE — {project.year}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="border-2 px-2 py-0.5 font-mono text-[12px] transition hover:bg-[#2a2118] hover:text-[#f4ecd8]"
            style={{ borderColor: INK }}
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl leading-tight">{project.name}</h2>
              <p className="mt-1 font-mono text-[12.5px]" style={{ color: `${INK}99` }}>
                Lead investigator: {project.role}
              </p>
            </div>
            <span
              className="shrink-0 rotate-[8deg] border-[3px] px-3 py-1 font-mono text-[11px] tracking-[0.18em]"
              style={{ borderColor: RED, color: RED }}
            >
              {project.live ? "SOLVED" : "CLOSED"}
            </span>
          </div>

          <Section title="The brief">
            <p className="font-mono text-[13.5px] leading-[1.8]">{project.blurb}</p>
          </Section>

          <Section title="Case notes">
            <p className="font-mono text-[13.5px] leading-[1.8] whitespace-pre-line">
              {project.description}
            </p>
          </Section>

          <Section title="Evidence log">
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {project.tech.map((t, i) => (
                <li
                  key={t}
                  className="flex items-baseline gap-2 border px-2.5 py-1.5 font-mono text-[12.5px]"
                  style={{ borderColor: `${INK}44`, backgroundColor: "#efe4cc" }}
                >
                  <span style={{ color: RED }}>{String(i + 1).padStart(2, "0")}</span>
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          {project.highlights.length > 0 && (
            <Section title="Verdict">
              <ul className="space-y-2">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 font-mono text-[13px]">
                    <span style={{ color: RED }}>✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(project.live || project.repo) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 px-4 py-2 font-mono text-[12.5px] transition hover:bg-[#2a2118] hover:text-[#f4ecd8]"
                  style={{ borderColor: INK }}
                >
                  Visit the scene ↗
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 px-4 py-2 font-mono text-[12.5px] transition hover:bg-[#2a2118] hover:text-[#f4ecd8]"
                  style={{ borderColor: `${INK}66` }}
                >
                  Read the transcript ↗
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3
        className="mb-2 border-b font-mono text-[11px] tracking-[0.2em] uppercase"
        style={{ color: RED, borderColor: `${INK}33` }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
