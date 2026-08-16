"use client";

import { useMemo, useState } from "react";
import type { Profile, Project } from "@/data/types";
import { usePanZoom } from "@/lib/usePanZoom";
import { coord, deriveXp } from "@/lib/derive";

/**
 * Canvas is sized from the longest branch rather than fixed at 1000, so nodes
 * on a group with many skills can't run off the edge and get clipped.
 * `buildTree` returns the size it needs alongside the geometry.
 */
const R0 = 150; // distance from hub to the first node on a branch
const STEP = 86; // spacing between nodes — labels were landing on the next node
const MARGIN = 96; // room for the node radius plus its label beneath

const BRANCH_COLORS = [
  "#4cc2ff",
  "#f0a91e",
  "#a855f7",
  "#4ade80",
  "#fb7185",
  "#38bdf8",
  "#facc15",
];

type Node = {
  id: string;
  label: string;
  level: number;
  x: number;
  y: number;
  branch: number;
  branchName: string;
  color: string;
  /** Projects whose stack mentions this skill. */
  projects: Project[];
};

/** A skill and a tech string match if either contains the other. */
function relatedProjects(skill: string, profile: Profile): Project[] {
  const s = skill.toLowerCase();
  return profile.projects.filter((p) =>
    p.tech.some((t) => {
      const tt = t.toLowerCase();
      return tt.includes(s) || s.includes(tt);
    }),
  );
}

export default function SkillTree({ profile }: { profile: Profile }) {
  const [selected, setSelected] = useState<string | null>(null);
  const xp = deriveXp(profile);

  const { nodes, links, SIZE, CX, CY } = useMemo(() => {
    const groups = profile.skills;
    const longest = groups.reduce((m, g) => Math.max(m, g.items.length), 1);
    // Furthest node centre + its radius + label, doubled for both sides.
    const reach = R0 + (longest - 1) * STEP;
    const SIZE = Math.max(720, (reach + MARGIN) * 2);
    const CX = SIZE / 2;
    const CY = SIZE / 2;

    const nodes: Node[] = [];
    const links: { x1: number; y1: number; x2: number; y2: number; color: string }[] =
      [];

    groups.forEach((group, gi) => {
      const color = BRANCH_COLORS[gi % BRANCH_COLORS.length];
      // Branches radiate evenly, starting straight up.
      const base = (-90 + (360 / groups.length) * gi) * (Math.PI / 180);
      let prev = { x: CX, y: CY };

      group.items.forEach((skill, si) => {
        // A gentle alternating fan keeps long branches from reading as a spoke.
        const spread = ((si % 2 === 0 ? 1 : -1) * Math.min(si, 3) * 5.5) * (Math.PI / 180);
        const angle = base + spread;
        const r = R0 + si * STEP;
        const x = coord(CX + Math.cos(angle) * r);
        const y = coord(CY + Math.sin(angle) * r);

        links.push({ x1: prev.x, y1: prev.y, x2: x, y2: y, color });
        prev = { x, y };

        nodes.push({
          id: `${group.category}::${skill.name}`,
          label: skill.name,
          level: skill.level,
          x,
          y,
          branch: gi,
          branchName: group.category,
          color,
          projects: relatedProjects(skill.name, profile),
        });
      });
    });

    return { nodes, links, SIZE, CX, CY };
  }, [profile]);

  const active = nodes.find((n) => n.id === selected) ?? null;
  const totalPoints = nodes.reduce((a, n) => a + n.level, 0);

  const { containerRef, scale, zoomIn, zoomOut, fit } = usePanZoom({
    contentWidth: SIZE,
    contentHeight: SIZE,
    padding: 20,
    minScale: 0.2,
    maxScale: 2.5,
  });

  return (
    <div
      className="flex min-h-dvh w-full flex-col lg:h-dvh lg:flex-row"
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, #101a2e 0%, #080d18 55%, #04060c 100%)",
        color: "#dce6f5",
      }}
    >
      {/* Tree */}
      <div className="relative min-h-[62dvh] flex-1 lg:min-h-0">
        <div
          ref={containerRef}
          className="no-scrollbar absolute inset-0 grid overflow-auto"
          style={{ touchAction: "pan-x pan-y" }}
        >
          <div className="m-auto" style={{ width: SIZE * scale, height: SIZE * scale }}>
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width={SIZE * scale}
              height={SIZE * scale}
              role="group"
              aria-label="Skill tree"
            >
              <defs>
                <radialGradient id="hubGlow">
                  <stop offset="0" stopColor="#4cc2ff" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#4cc2ff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Orbit rings, for depth */}
              {[R0, R0 + STEP * 2, R0 + STEP * 4].map((r) => (
                <circle
                  key={r}
                  cx={CX}
                  cy={CY}
                  r={r}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.045"
                  strokeWidth="1"
                />
              ))}

              {links.map((l, i) => (
                <line
                  key={i}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke={l.color}
                  strokeOpacity="0.3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}

              <circle cx={CX} cy={CY} r={110} fill="url(#hubGlow)" />
              <circle
                cx={CX}
                cy={CY}
                r={54}
                fill="#0b1424"
                stroke="#4cc2ff"
                strokeWidth="3"
              />
              <text
                x={CX}
                y={CY - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#dce6f5"
                style={{ font: "600 30px var(--font-inter), sans-serif" }}
              >
                {profile.initials}
              </text>
              <text
                x={CX}
                y={CY + 22}
                textAnchor="middle"
                fill="#4cc2ff"
                style={{ font: "500 12px var(--font-inter), sans-serif" }}
              >
                LV {xp.level}
              </text>

              {nodes.map((n) => {
                const isActive = n.id === selected;
                const rad = 15 + n.level * 2.6;
                return (
                  <g
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.label}, level ${n.level} of 5, ${n.branchName}`}
                    onClick={() => setSelected(isActive ? null : n.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(isActive ? null : n.id);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Invisible hit area: the drawn node is ~19px on a phone,
                        well under a finger. This enlarges the target without
                        changing anything you can see. */}
                    <circle cx={n.x} cy={n.y} r={Math.max(rad + 14, 30)} fill="transparent" />
                    {isActive && (
                      <circle cx={n.x} cy={n.y} r={rad + 12} fill={n.color} opacity="0.16" />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={rad}
                      fill="#0b1424"
                      stroke={n.color}
                      strokeWidth={isActive ? 4 : 2.5}
                      strokeOpacity={0.35 + n.level * 0.13}
                    />
                    {/* Fill proportion communicates level at a glance. */}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={rad * (n.level / 5) * 0.72}
                      fill={n.color}
                      opacity={0.85}
                    />
                    <text
                      x={n.x}
                      y={n.y + rad + 15}
                      textAnchor="middle"
                      fill={isActive ? n.color : "#dce6f5"}
                      opacity={isActive ? 1 : 0.62}
                      style={{ font: "500 13px var(--font-inter), sans-serif" }}
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 z-20 flex gap-1.5">
          {[
            { fn: zoomIn, label: "Zoom in", glyph: "+" },
            { fn: zoomOut, label: "Zoom out", glyph: "−" },
            { fn: fit, label: "Fit tree to screen", glyph: "⤢" },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.fn}
              aria-label={b.label}
              title={b.label}
              className="grid h-8 w-8 place-items-center rounded border text-sm transition hover:bg-white/10"
              style={{ borderColor: "#ffffff22", backgroundColor: "rgba(8,13,24,0.8)" }}
            >
              {b.glyph}
            </button>
          ))}
        </div>
      </div>

      {/* Detail rail */}
      <aside
        className="w-full shrink-0 overflow-y-auto border-t px-5 py-6 lg:h-dvh lg:w-[360px] lg:border-t-0 lg:border-l"
        style={{ borderColor: "#ffffff14", backgroundColor: "rgba(6,10,18,0.6)" }}
      >
        <p className="font-mono text-[11px] tracking-[0.22em] text-white/35 uppercase">
          Skill Tree
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{profile.name}</h1>
        <p className="mt-1.5 text-[14px] text-white/55">{profile.role}</p>

        <dl className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["Points", String(totalPoints)],
            ["Branches", String(profile.skills.length)],
            ["Nodes", String(nodes.length)],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-lg border px-2.5 py-2"
              style={{ borderColor: "#ffffff14" }}
            >
              <dt className="font-mono text-[10px] tracking-wider text-white/35 uppercase">
                {k}
              </dt>
              <dd className="mt-1 text-xl font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7">
          {active ? (
            <NodeDetail node={active} onClear={() => setSelected(null)} />
          ) : (
            <Legend profile={profile} />
          )}
        </div>

        <div className="mt-8 border-t pt-6" style={{ borderColor: "#ffffff14" }}>
          <p className="text-[14.5px] leading-relaxed text-white/60">{profile.bioShort}</p>
          <ul className="mt-4 space-y-1.5">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-3 text-[13px] text-white/55 transition hover:text-white"
                >
                  <span className="font-mono text-[11px] tracking-wider uppercase">
                    {l.label}
                  </span>
                  <span className="truncate">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Legend({ profile }: { profile: Profile }) {
  return (
    <>
      <p className="text-[13px] leading-relaxed text-white/45">
        Each branch is a skill group; each node is filled in proportion to its level.
        Select a node to see which projects actually used it.
      </p>
      <ul className="mt-4 space-y-2">
        {profile.skills.map((g, i) => (
          <li key={g.category} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRANCH_COLORS[i % BRANCH_COLORS.length] }}
            />
            <span>
              <span className="block text-[14px]">{g.category}</span>
              <span className="block text-[12.5px] text-white/40">{g.summary}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function NodeDetail({ node, onClear }: { node: Node; onClear: () => void }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[11px] tracking-[0.16em] uppercase"
            style={{ color: node.color }}
          >
            {node.branchName}
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{node.label}</h2>
        </div>
        <button
          onClick={onClear}
          className="shrink-0 rounded border px-2 py-0.5 text-[12px] text-white/45 transition hover:text-white"
          style={{ borderColor: "#ffffff22" }}
        >
          clear
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className="h-2 flex-1 rounded-full"
            style={{
              backgroundColor: n <= node.level ? node.color : "#ffffff14",
            }}
          />
        ))}
        <span className="ml-1 font-mono text-[12px] text-white/50">{node.level}/5</span>
      </div>

      <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-white/35 uppercase">
        Used in
      </p>
      {node.projects.length === 0 ? (
        <p className="mt-2 text-[13px] text-white/35">
          No project in this profile lists it — a skill kept sharp off the record.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {node.projects.map((p) => (
            <li
              key={p.slug}
              className="flex items-center gap-2.5 rounded-lg border px-3 py-2"
              style={{ borderColor: "#ffffff14" }}
            >
              <span
                className="h-6 w-[3px] shrink-0 rounded-full"
                style={{ backgroundColor: p.accent }}
              />
              <span className="min-w-0">
                <span className="block text-[13.5px]">{p.name}</span>
                <span className="block truncate text-[12px] text-white/40">{p.blurb}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
