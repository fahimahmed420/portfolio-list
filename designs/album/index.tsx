"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { seeded } from "@/lib/derive";

const GREEN = "#1db954";
const BG = "#0d0d0d";
const DIM = "#b3b3b3";

/** Run time derived from how much there is to say about a project. */
function runtime(p: Project) {
  const secs = 96 + p.description.length * 0.32 + p.highlights.length * 24;
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function totalRuntime(projects: Project[]) {
  const secs = projects.reduce((a, p) => {
    const [m, s] = runtime(p).split(":").map(Number);
    return a + m * 60 + s;
  }, 0);
  return `${Math.floor(secs / 60)} min ${secs % 60} sec`;
}

export default function Album({ profile }: { profile: Profile }) {
  const [track, setTrack] = useState<Project | null>(null);

  return (
    <div className="min-h-dvh w-full pb-24" style={{ backgroundColor: BG, color: "#f5f5f5" }}>
      {/* Header with cover */}
      <header
        className="px-5 pt-12 pb-8 sm:px-10"
        style={{
          background: `linear-gradient(180deg, ${profile.projects[0]?.accent ?? GREEN}44 0%, ${BG} 100%)`,
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-end">
          <Cover profile={profile} />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold tracking-wide uppercase">Album</p>
            <h1
              className="mt-2 font-semibold leading-[0.95] tracking-[-0.03em]"
              style={{ fontSize: "clamp(2.2rem,7vw,4.6rem)" }}
            >
              {profile.name}
            </h1>
            <p className="mt-4 text-[14px]" style={{ color: DIM }}>
              <span className="font-semibold text-white">{profile.role}</span> ·{" "}
              {profile.projects.length} tracks · {totalRuntime(profile.projects)} ·{" "}
              {profile.location}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 sm:px-10">
        {/* Controls */}
        <div className="flex items-center gap-5 py-6">
          <button
            onClick={() => setTrack(profile.projects[0] ?? null)}
            aria-label="Play first track"
            className="grid h-14 w-14 place-items-center rounded-full transition-transform hover:scale-105"
            style={{ backgroundColor: GREEN }}
          >
            <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden>
              <path d="M2 1.5v19l16-9.5Z" fill="#0d0d0d" />
            </svg>
          </button>
          <a
            href={profile.links.find((l) => l.kind === "email")?.href ?? "#"}
            className="grid min-h-[44px] place-items-center rounded-full border px-5 text-[13px] font-semibold transition hover:scale-105"
            style={{ borderColor: "#ffffff44" }}
          >
            Follow
          </a>
          <p className="ml-auto text-[12.5px]" style={{ color: DIM }}>
            {profile.availability}
          </p>
        </div>

        {/* Tracklist */}
        <section>
          <div
            className="grid grid-cols-[28px_1fr_auto] gap-4 border-b px-3 pb-2 text-[11.5px] tracking-[0.14em] uppercase sm:grid-cols-[28px_1fr_180px_auto]"
            style={{ borderColor: "#ffffff18", color: DIM }}
          >
            <span>#</span>
            <span>Title</span>
            <span className="hidden sm:block">Credits</span>
            <span>⏱</span>
          </div>

          <ul className="mt-1">
            {profile.projects.map((p, i) => {
              const playing = track?.slug === p.slug;
              return (
                <li key={p.slug}>
                  <button
                    onClick={() => setTrack(playing ? null : p)}
                    className="group grid w-full grid-cols-[28px_1fr_auto] items-center gap-4 rounded-md px-3 py-2.5 text-left transition hover:bg-white/10 sm:grid-cols-[28px_1fr_180px_auto]"
                  >
                    <span
                      className="text-[13.5px] tabular-nums"
                      style={{ color: playing ? GREEN : DIM }}
                    >
                      {playing ? "▶" : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block truncate text-[15px] font-medium"
                        style={{ color: playing ? GREEN : "#f5f5f5" }}
                      >
                        {p.name}
                      </span>
                      <span className="block truncate text-[12.5px]" style={{ color: DIM }}>
                        {p.blurb}
                      </span>
                    </span>
                    <span
                      className="hidden truncate text-[12.5px] sm:block"
                      style={{ color: DIM }}
                    >
                      {p.tech.slice(0, 2).join(", ")}
                    </span>
                    <span className="text-[12.5px] tabular-nums" style={{ color: DIM }}>
                      {runtime(p)}
                    </span>
                  </button>

                  {playing && <LinerNotes project={p} />}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Artist bio */}
        <section className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">About the artist</h2>
            <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line" style={{ color: DIM }}>
              {profile.bio}
            </p>
            <ul className="mt-5 space-y-1 text-[13.5px]" style={{ color: DIM }}>
              {profile.offbeat.map((o) => (
                <li key={o}>· {o}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Credits</h2>
            <div className="mt-3 space-y-4">
              {profile.skills.map((g) => (
                <div key={g.category}>
                  <p className="text-[13.5px] font-semibold">{g.category}</p>
                  <p className="mt-0.5 text-[13.5px]" style={{ color: DIM }}>
                    {g.items.map((s) => s.name).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Discography */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold">Discography</h2>
          <ol className="mt-4 space-y-3">
            {profile.experience.map((e) => (
              <li
                key={`${e.org}-${e.period}`}
                className="flex gap-4 rounded-lg p-3 transition hover:bg-white/5"
              >
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded text-[11px] font-semibold"
                  style={{ backgroundColor: "#ffffff12", color: DIM }}
                >
                  {e.period.split(" ")[0]}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium">{e.role}</span>
                  <span className="block text-[13px]" style={{ color: GREEN }}>
                    {e.org} · {e.period}
                  </span>
                  <span className="mt-1 block text-[13.5px]" style={{ color: DIM }}>
                    {e.summary}
                  </span>
                </span>
              </li>
            ))}
            {profile.education.map((e) => (
              <li key={e.degree} className="flex gap-4 p-3">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded text-[11px] font-semibold"
                  style={{ backgroundColor: "#ffffff0c", color: DIM }}
                >
                  {e.period.split(" ")[0]}
                </span>
                <span>
                  <span className="block text-[15px] font-medium">{e.degree}</span>
                  <span className="block text-[13px]" style={{ color: DIM }}>
                    {e.org} · {e.period}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Follow */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold">Follow the artist</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-3 rounded-lg px-4 py-3 transition hover:bg-white/10"
                  style={{ backgroundColor: "#ffffff0a" }}
                >
                  <span className="text-[12.5px]" style={{ color: DIM }}>
                    {l.label}
                  </span>
                  <span className="truncate text-[14px] font-medium">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <NowPlaying project={track} profile={profile} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Album art. Uses the illustrated sleeve (ART-PROMPTS B2) when it is present
 * and falls back to the generated composition, so a profile shipped without
 * the art still renders a cover.
 */
function Cover({ profile }: { profile: Profile }) {
  const colors = profile.projects.slice(0, 4).map((p) => p.accent);
  while (colors.length < 4) colors.push(GREEN);

  return (
    <div
      className="h-[190px] w-[190px] shrink-0 overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.6)] sm:h-[220px] sm:w-[220px]"
      aria-hidden
    >
      <img
        src="/art/album-cover.webp"
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function CoverFallback({ profile }: { profile: Profile }) {
  const colors = profile.projects.slice(0, 4).map((p) => p.accent);
  while (colors.length < 4) colors.push(GREEN);
  return (
    <div className="h-full w-full" aria-hidden>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <rect width="100" height="100" fill="#141414" />
        <circle cx="34" cy="34" r="26" fill={colors[0]} />
        <rect x="52" y="10" width="40" height="40" fill={colors[1]} opacity="0.9" />
        <polygon points="10,92 34,52 58,92" fill={colors[2]} opacity="0.9" />
        <circle cx="72" cy="72" r="20" fill={colors[3]} opacity="0.85" />
        <rect y="46" width="100" height="1.5" fill="#f5f5f5" opacity="0.5" />
        <text
          x="50"
          y="94"
          textAnchor="middle"
          fill="#f5f5f5"
          opacity="0.9"
          style={{ font: "600 7px var(--font-inter), sans-serif" }}
        >
          {profile.initials}
        </text>
      </svg>
    </div>
  );
}

function LinerNotes({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="overflow-hidden"
    >
      <div
        className="mx-3 mb-3 rounded-lg px-4 py-4"
        style={{ backgroundColor: "#ffffff0a", borderLeft: `3px solid ${project.accent}` }}
      >
        <p className="text-[11.5px] tracking-[0.16em] uppercase" style={{ color: DIM }}>
          Liner notes · {project.year} · {project.role}
        </p>
        <p className="mt-2.5 text-[14.5px] leading-relaxed whitespace-pre-line">
          {project.description}
        </p>

        {project.highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-[13.5px]" style={{ color: DIM }}>
                <span style={{ color: project.accent }}>▸</span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-3.5 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded-full px-2.5 py-1 text-[11.5px]"
              style={{ backgroundColor: "#ffffff12", color: DIM }}
            >
              {t}
            </li>
          ))}
        </ul>

        {(project.live || project.repo) && (
          <div className="mt-4 flex flex-wrap gap-2.5">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-4 py-2 text-[12.5px] font-semibold"
                style={{ backgroundColor: GREEN, color: "#0d0d0d" }}
              >
                Listen live ↗
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border px-4 py-2 text-[12.5px]"
                style={{ borderColor: "#ffffff33" }}
              >
                Source ↗
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NowPlaying({
  project,
  profile,
}: {
  project: Project | null;
  profile: Profile;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t px-4 py-2.5 pb-16 backdrop-blur-md sm:pb-2.5"
      style={{ borderColor: "#ffffff18", backgroundColor: "rgba(18,18,18,0.95)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <span
          className="h-11 w-11 shrink-0 rounded"
          style={{
            background: project
              ? `linear-gradient(135deg, ${project.accent}, #141414)`
              : "#232323",
          }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-medium">
            {project ? project.name : "Nothing playing"}
          </span>
          <span className="block truncate text-[11.5px]" style={{ color: DIM }}>
            {project ? profile.name : "Pick a track to read its liner notes"}
          </span>
        </span>
        <span
          className="hidden h-1 w-40 overflow-hidden rounded-full sm:block"
          style={{ backgroundColor: "#ffffff1f" }}
        >
          <motion.span
            key={project?.slug ?? "none"}
            className="block h-full rounded-full"
            style={{ backgroundColor: project ? GREEN : "#ffffff33" }}
            initial={{ width: "0%" }}
            animate={{ width: project ? "42%" : "0%" }}
            transition={{ duration: 0.6 }}
          />
        </span>
        <span className="shrink-0 text-[11.5px] tabular-nums" style={{ color: DIM }}>
          {project ? runtime(project) : "0:00"}
        </span>
      </div>
    </div>
  );
}
