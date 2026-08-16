"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, Project } from "@/data/types";
import { coord, deriveDifficulty, readable, seeded } from "@/lib/derive";

const W = 1000;
const H = 700;

const GOLD = "#f2c94c";
const CYAN = "#4cc2ff";
const RED = "#e8503a";
const LAND = "#1a2029";

type Landmark = {
  id: "safehouse" | "office" | "cafe" | "payphone";
  label: string;
  section: string;
  x: number;
  y: number;
  tint: string;
};

const LANDMARKS: Landmark[] = [
  { id: "safehouse", label: "Safehouse", section: "About", x: 168, y: 176, tint: "#7ee787" },
  { id: "office", label: "The Office", section: "Experience", x: 792, y: 152, tint: CYAN },
  { id: "cafe", label: "Internet Café", section: "Projects", x: 286, y: 512, tint: GOLD },
  { id: "payphone", label: "Payphone", section: "Contact", x: 828, y: 556, tint: RED },
];

type Sel =
  | { kind: "landmark"; id: Landmark["id"] }
  | { kind: "mission"; slug: string };

export default function OpenWorld({ profile }: { profile: Profile }) {
  const [sel, setSel] = useState<Sel>({ kind: "landmark", id: "safehouse" });

  /* Missions scattered across the map, deterministic per project. */
  const missions = useMemo(
    () =>
      profile.projects.map((project, i) => {
        const n = Math.max(profile.projects.length, 1);
        const angle = (i / n) * Math.PI * 2 + 0.7;
        const rx = 250 + seeded(project.slug) * 130;
        const ry = 150 + seeded(project.slug + "y") * 110;
        return {
          project,
          x: coord(W / 2 + Math.cos(angle) * rx),
          y: coord(H / 2 + Math.sin(angle) * ry),
        };
      }),
    [profile.projects],
  );

  const activeMission =
    sel.kind === "mission"
      ? profile.projects.find((p) => p.slug === sel.slug) ?? null
      : null;

  return (
    <div
      className="min-h-dvh w-full"
      style={{ backgroundColor: "#0c1016", color: "#e6ecf3" }}
    >
      <div className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px]">
        {/* Map */}
        <div className="min-w-0">
          <div
            className="relative overflow-hidden rounded-lg border"
            style={{ borderColor: "#ffffff1f" }}
          >
            <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="group" aria-label="City map">
              <rect width={W} height={H} fill={LAND} />

              {/* river */}
              <path
                d="M-20 470 C 180 430, 300 560, 520 520 C 720 484, 840 610, 1020 566 L1020 720 L-20 720 Z"
                fill="#12283a"
              />
              {/* parks */}
              {[
                [92, 300, 150, 110],
                [560, 90, 130, 96],
                [660, 330, 120, 88],
              ].map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#1c3324" />
              ))}

              {/* city blocks */}
              {Array.from({ length: 44 }, (_, i) => {
                const bx = 40 + (i % 11) * 88 + seeded(`bx${i}`) * 12;
                const by = 40 + Math.floor(i / 11) * 150 + seeded(`by${i}`) * 16;
                if (by > 430 && bx > 380) return null;
                return (
                  <rect
                    key={i}
                    x={bx}
                    y={by}
                    width={44 + seeded(`bw${i}`) * 26}
                    height={40 + seeded(`bh${i}`) * 30}
                    rx="3"
                    fill="#2f3b4a"
                    stroke="#3d4b5c"
                    strokeWidth="1"
                  />
                );
              })}

              {/* roads */}
              <g stroke="#333c47" strokeWidth="10" strokeLinecap="round">
                {[110, 260, 410, 620].map((y) => (
                  <line key={`h${y}`} x1="20" y1={y} x2={W - 20} y2={y} />
                ))}
                {[130, 330, 530, 730, 900].map((x) => (
                  <line key={`v${x}`} x1={x} y1="20" x2={x} y2={H - 20} />
                ))}
              </g>
              <g stroke="#4a5666" strokeWidth="2" strokeDasharray="12 14">
                {[110, 260, 410, 620].map((y) => (
                  <line key={`hd${y}`} x1="20" y1={y} x2={W - 20} y2={y} />
                ))}
              </g>

              {/* mission markers */}
              {missions.map((m) => {
                const on = sel.kind === "mission" && sel.slug === m.project.slug;
                return (
                  <g
                    key={m.project.slug}
                    role="button"
                    tabIndex={0}
                    aria-label={`Mission: ${m.project.name}`}
                    onClick={() => setSel({ kind: "mission", slug: m.project.slug })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSel({ kind: "mission", slug: m.project.slug });
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Invisible hit area, so a mission marker stays tappable
                        once the map scales down. */}
                    <circle cx={m.x} cy={m.y} r="64" fill="transparent" />
                    {on && <circle cx={m.x} cy={m.y} r="30" fill={m.project.accent} opacity="0.22" />}
                    <circle
                      cx={m.x}
                      cy={m.y}
                      r="17"
                      fill={m.project.accent}
                      stroke="#0c1016"
                      strokeWidth="3"
                    />
                    <text
                      x={m.x}
                      y={m.y + 6}
                      textAnchor="middle"
                      fill="#0c1016"
                      style={{ font: "700 16px var(--font-inter), sans-serif" }}
                    >
                      {m.project.name.charAt(0)}
                    </text>
                    <text
                      x={m.x}
                      y={m.y + 36}
                      textAnchor="middle"
                      fill="#e6ecf3"
                      opacity={on ? 1 : 0.6}
                      style={{ font: "500 13px var(--font-inter), sans-serif" }}
                    >
                      {m.project.name}
                    </text>
                  </g>
                );
              })}

              {/* landmarks */}
              {LANDMARKS.map((l) => {
                const on = sel.kind === "landmark" && sel.id === l.id;
                return (
                  <g
                    key={l.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${l.label}: ${l.section}`}
                    onClick={() => setSel({ kind: "landmark", id: l.id })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSel({ kind: "landmark", id: l.id });
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <circle cx={l.x} cy={l.y - 4} r="66" fill="transparent" />
                    {on && <circle cx={l.x} cy={l.y - 6} r="34" fill={l.tint} opacity="0.18" />}
                    {/* waypoint pin */}
                    <path
                      d={`M${l.x} ${l.y + 14} l-13 -20 a15 15 0 1 1 26 0 Z`}
                      fill={l.tint}
                      stroke="#0c1016"
                      strokeWidth="3"
                    />
                    <circle cx={l.x} cy={l.y - 12} r="5.5" fill="#0c1016" />
                    <text
                      x={l.x}
                      y={l.y + 34}
                      textAnchor="middle"
                      fill={on ? l.tint : "#e6ecf3"}
                      style={{ font: "600 14px var(--font-inter), sans-serif" }}
                    >
                      {l.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* HUD overlay */}
            <Hud profile={profile} />
          </div>

          <p className="mt-3 text-center text-[12px] text-white/30">
            Select a waypoint or a mission marker
          </p>
        </div>

        {/* Detail rail */}
        <aside className="min-w-0 space-y-5">
          {activeMission ? (
            <MissionBrief project={activeMission} />
          ) : (
            <LandmarkPanel
              landmark={LANDMARKS.find((l) => sel.kind === "landmark" && l.id === sel.id)!}
              profile={profile}
              onMission={(slug) => setSel({ kind: "mission", slug })}
            />
          )}
          <Abilities profile={profile} />
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Hud({ profile }: { profile: Profile }) {
  const wanted = Math.min(
    5,
    Math.round(
      profile.skills.reduce(
        (a, g) => a + g.items.reduce((b, s) => b + s.level, 0) / g.items.length,
        0,
      ) / Math.max(profile.skills.length, 1),
    ),
  );
  return (
    <div className="pointer-events-none absolute top-3 right-3 flex flex-col items-end gap-2">
      <span className="flex gap-1" aria-label={`Skill rating ${wanted} of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <svg key={n} width="18" height="18" viewBox="0 0 20 20" aria-hidden>
            <path
              d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.3 6L10 15l-5.4 2.9 1.3-6L1.4 7.8l6-.7Z"
              fill={n <= wanted ? GOLD : "transparent"}
              stroke={n <= wanted ? GOLD : "#ffffff44"}
              strokeWidth="1.4"
            />
          </svg>
        ))}
      </span>
      {profile.stats.slice(0, 2).map((s) => (
        <span
          key={s.label}
          className="rounded px-2 py-1 font-mono text-[12px]"
          style={{ backgroundColor: "rgba(12,16,22,0.8)", color: GOLD }}
        >
          {s.value}{" "}
          <span className="text-white/40">{s.label.toUpperCase()}</span>
        </span>
      ))}
    </div>
  );
}

function Card({
  title,
  kicker,
  tint,
  children,
}: {
  title: string;
  kicker: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-lg border p-4"
      style={{ borderColor: "#ffffff1a", backgroundColor: "#ffffff07" }}
    >
      <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase" style={{ color: tint }}>
        {kicker}
      </p>
      <h2 className="mt-1.5 text-xl font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function LandmarkPanel({
  landmark,
  profile,
  onMission,
}: {
  landmark: Landmark;
  profile: Profile;
  onMission: (slug: string) => void;
}) {
  return (
    <Card title={landmark.label} kicker={landmark.section} tint={landmark.tint}>
      {landmark.id === "safehouse" && (
        <>
          <p className="text-[14.5px] leading-relaxed whitespace-pre-line text-white/70">
            {profile.bio}
          </p>
          <ul className="mt-4 space-y-1 text-[13px] text-white/45">
            {profile.offbeat.map((o) => (
              <li key={o}>— {o}</li>
            ))}
          </ul>
        </>
      )}

      {landmark.id === "office" && (
        <ol className="space-y-4">
          {profile.experience.map((e) => (
            <li key={`${e.org}-${e.period}`}>
              <p className="text-[15px] font-medium">{e.role}</p>
              <p className="font-mono text-[11.5px]" style={{ color: CYAN }}>
                {e.org} · {e.period}
              </p>
              <p className="mt-1 text-[13.5px] text-white/60">{e.summary}</p>
            </li>
          ))}
          {profile.education.map((e) => (
            <li key={e.degree} className="border-t pt-3" style={{ borderColor: "#ffffff14" }}>
              <p className="text-[14.5px]">{e.degree}</p>
              <p className="font-mono text-[11.5px] text-white/40">
                {e.org} · {e.period}
              </p>
            </li>
          ))}
        </ol>
      )}

      {landmark.id === "cafe" && (
        <ul className="space-y-1">
          {profile.projects.map((p) => (
            <li key={p.slug}>
              <button
                onClick={() => onMission(p.slug)}
                className="flex w-full items-center gap-3 rounded px-2 py-2 text-left transition hover:bg-white/10"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: p.accent }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px]">{p.name}</span>
                  <span className="block truncate text-[12px] text-white/40">{p.blurb}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-white/25">
                  {"★".repeat(deriveDifficulty(p))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {landmark.id === "payphone" && (
        <>
          <p className="text-[14px] text-white/65">
            {profile.availability} · {profile.location}
          </p>
          <ul className="mt-3 space-y-1.5">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-3 rounded border px-3 py-2 transition hover:border-white/35"
                  style={{ borderColor: "#ffffff1a" }}
                >
                  <span className="font-mono text-[10.5px] tracking-wider text-white/40 uppercase">
                    {l.label}
                  </span>
                  <span className="truncate text-[13px]">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function MissionBrief({ project }: { project: Project }) {
  const diff = deriveDifficulty(project);
  const ink = readable(project.accent, "#121820");
  return (
    <Card title={project.name} kicker={`Mission · ${project.year}`} tint={ink}>
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[11px] text-white/40">{project.role}</span>
        <span className="font-mono text-[11px]" style={{ color: ink }}>
          {"★".repeat(diff)}
          <span className="text-white/20">{"★".repeat(5 - diff)}</span>
        </span>
      </div>

      <p className="text-[14.5px] leading-relaxed whitespace-pre-line text-white/70">
        {project.description}
      </p>

      {project.highlights.length > 0 && (
        <>
          <p className="mt-4 font-mono text-[10px] tracking-[0.18em] text-white/35 uppercase">
            Objectives
          </p>
          <ul className="mt-2 space-y-1.5">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-[13.5px] text-white/60">
                <span style={{ color: ink }}>✓</span>
                {h}
              </li>
            ))}
          </ul>
        </>
      )}

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <li
            key={t}
            className="rounded border px-2 py-1 font-mono text-[11px] text-white/60"
            style={{ borderColor: "#ffffff22" }}
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
              className="rounded px-3.5 py-2 text-[13px] font-semibold transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: project.accent, color: "#0c1016" }}
            >
              Start mission ↗
            </a>
          )}
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border px-3.5 py-2 text-[13px] transition-transform hover:-translate-y-0.5"
              style={{ borderColor: "#ffffff2a" }}
            >
              Intel ↗
            </a>
          )}
        </div>
      )}
    </Card>
  );
}

function Abilities({ profile }: { profile: Profile }) {
  return (
    <Card title="Abilities" kicker="Character" tint={GOLD}>
      <div className="space-y-3">
        {profile.skills.map((g) => {
          const avg =
            g.items.reduce((a, s) => a + s.level, 0) / Math.max(g.items.length, 1);
          return (
            <div key={g.category}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13.5px]">{g.category}</p>
                <p className="font-mono text-[11px] text-white/35">
                  {Math.round((avg / 5) * 100)}
                </p>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-white/10">
                <motion.span
                  className="block h-full rounded-full"
                  style={{ backgroundColor: GOLD }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(avg / 5) * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
