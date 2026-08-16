"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile, Project } from "@/data/types";
import { readable } from "@/lib/derive";

type WinId = "projects" | "about" | "experience" | "skills" | "contact" | string;

type Win = {
  id: WinId;
  title: string;
  x: number;
  y: number;
  w: number;
  z: number;
  /** Minimised windows stay in the dock and can be restored from it. */
  minimised?: boolean;
  /** Maximised windows fill the desktop; the previous rect is kept to restore. */
  maximised?: boolean;
  restore?: { x: number; y: number; w: number };
  /** Project windows carry the slug they render. */
  project?: Project;
};

const ICONS: { id: WinId; title: string; glyph: string; tint: string }[] = [
  { id: "projects", title: "Projects", glyph: "folder", tint: "#4a9eff" },
  { id: "about", title: "About Me", glyph: "user", tint: "#f0a91e" },
  { id: "experience", title: "Experience", glyph: "monitor", tint: "#4ade80" },
  { id: "skills", title: "Skills", glyph: "gear", tint: "#a855f7" },
  { id: "contact", title: "Contact", glyph: "mail", tint: "#fb7185" },
];

export default function DesktopOS({ profile }: { profile: Profile }) {
  const [wins, setWins] = useState<Win[]>([]);
  const [top, setTop] = useState(10);
  const [clock, setClock] = useState("--:--");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    tick();
    const t = window.setInterval(tick, 15_000);
    return () => window.clearInterval(t);
  }, []);

  const focus = useCallback((id: WinId) => {
    setTop((z) => {
      const next = z + 1;
      setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: next } : w)));
      return next;
    });
  }, []);

  const open = useCallback(
    (id: WinId, title: string, project?: Project) => {
      setWins((ws) => {
        if (ws.some((w) => w.id === id)) return ws;
        // Cascade so a new window never lands exactly on the last one.
        const n = ws.length;
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const wide = vw > 900;
        return [
          ...ws,
          {
            id,
            title,
            x: (wide ? 150 : 12) + n * 26,
            y: 70 + n * 24,
            w: project ? 460 : id === "projects" ? 520 : 440,
            z: 0,
            project,
          },
        ];
      });
      focus(id);
    },
    [focus],
  );

  const close = useCallback((id: WinId) => {
    setWins((ws) => ws.filter((w) => w.id !== id));
  }, []);

  const minimise = useCallback((id: WinId) => {
    setWins((ws) =>
      ws.map((w) => (w.id === id ? { ...w, minimised: true } : w)),
    );
  }, []);

  const restore = useCallback((id: WinId) => {
    setWins((ws) =>
      ws.map((w) => (w.id === id ? { ...w, minimised: false } : w)),
    );
  }, []);

  /** Toggles maximise, remembering the floating rect so it can be restored. */
  const toggleMax = useCallback((id: WinId) => {
    setWins((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        if (w.maximised) {
          return {
            ...w,
            maximised: false,
            x: w.restore?.x ?? w.x,
            y: w.restore?.y ?? w.y,
            w: w.restore?.w ?? w.w,
          };
        }
        return {
          ...w,
          maximised: true,
          restore: { x: w.x, y: w.y, w: w.w },
        };
      }),
    );
  }, []);

  const moveTo = useCallback((id: WinId, x: number, y: number) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  return (
    <div
      className="relative h-dvh w-full overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(160deg, #223052 0%, #1d2433 45%, #12161f 100%)",
      }}
    >
      {/* wallpaper glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 25% 15%, rgba(74,158,255,0.18), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(240,169,30,0.12), transparent 50%)",
        }}
      />

      {/* Menu bar */}
      <div
        className="relative z-50 flex h-8 items-center gap-4 px-3 text-[12.5px] backdrop-blur-md"
        style={{ backgroundColor: "rgba(10,14,22,0.75)", color: "#e8eaf0" }}
      >
        <span className="font-semibold">{profile.initials}OS</span>
        <span className="text-white/55">{profile.name}</span>
        <span className="ml-auto text-white/45">{profile.availability}</span>
        <span className="tabular-nums">{clock}</span>
      </div>

      {/* Icons */}
      <div className="relative z-10 flex flex-col flex-wrap gap-1 p-3" style={{ maxHeight: "calc(100dvh - 150px)" }}>
        {ICONS.map((ic) => (
          <button
            key={ic.id}
            onDoubleClick={() => open(ic.id, ic.title)}
            onClick={() => open(ic.id, ic.title)}
            className="flex w-24 flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 text-center transition hover:bg-white/10 focus-visible:bg-white/10"
          >
            <DeskIcon glyph={ic.glyph} tint={ic.tint} />
            <span className="text-[11.5px] leading-tight text-white/85">{ic.title}</span>
          </button>
        ))}
      </div>

      {/* Windows */}
      {wins.map((w) => (
        <Window
          key={w.id}
          win={w}
          onClose={() => close(w.id)}
          onMinimise={() => minimise(w.id)}
          onToggleMax={() => toggleMax(w.id)}
          onFocus={() => focus(w.id)}
          onMove={(x, y) => moveTo(w.id, x, y)}
        >
          <WindowBody win={w} profile={profile} onOpenProject={open} />
        </Window>
      ))}

      {/* Dock */}
      {/* Clears the shared design chrome, which sits at the bottom centre. */}
      <div className="absolute inset-x-0 bottom-16 z-50 flex justify-center px-3">
        <div
          className="flex items-end gap-2 rounded-2xl border px-3 py-2 backdrop-blur-md"
          style={{ borderColor: "#ffffff1f", backgroundColor: "rgba(12,16,26,0.7)" }}
        >
          {ICONS.map((ic) => {
            const win = wins.find((w) => w.id === ic.id);
            const isOpen = Boolean(win);
            return (
              <button
                key={ic.id}
                onClick={() => {
                  if (!win) return open(ic.id, ic.title);
                  // Restore first, otherwise a minimised window is unreachable.
                  if (win.minimised) restore(ic.id);
                  focus(ic.id);
                }}
                title={ic.title}
                aria-label={ic.title}
                className="group relative grid h-11 w-11 place-items-center rounded-xl transition-transform hover:-translate-y-1.5"
                style={{ backgroundColor: `${ic.tint}22` }}
              >
                <DeskIcon glyph={ic.glyph} tint={ic.tint} size={24} />
                {isOpen && (
                  <span
                    className="absolute -bottom-[3px] rounded-full transition-all"
                    style={{
                      backgroundColor: ic.tint,
                      height: 4,
                      width: win?.minimised ? 12 : 4,
                      opacity: win?.minimised ? 0.6 : 1,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {wins.length === 0 && (
        <p className="pointer-events-none absolute bottom-32 left-1/2 z-10 -translate-x-1/2 text-[12.5px] text-white/35">
          Click an icon to open a window · drag the title bar to move it
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function DeskIcon({
  glyph,
  tint,
  size = 38,
}: {
  glyph: string;
  tint: string;
  size?: number;
}) {
  const common = { fill: "none", stroke: tint, strokeWidth: 1.7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {glyph === "folder" && (
        <>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" {...common} fill={`${tint}22`} />
        </>
      )}
      {glyph === "user" && (
        <>
          <circle cx="12" cy="9" r="3.4" {...common} fill={`${tint}22`} />
          <path d="M5 20a7 7 0 0 1 14 0" {...common} />
        </>
      )}
      {glyph === "monitor" && (
        <>
          <rect x="3" y="5" width="18" height="12" rx="2" {...common} fill={`${tint}22`} />
          <path d="M9 20h6M12 17v3" {...common} />
        </>
      )}
      {glyph === "gear" && (
        <>
          <circle cx="12" cy="12" r="3" {...common} />
          <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" {...common} />
        </>
      )}
      {glyph === "mail" && (
        <>
          <rect x="3" y="5.5" width="18" height="13" rx="2" {...common} fill={`${tint}22`} />
          <path d="m3.6 7 8.4 6 8.4-6" {...common} />
        </>
      )}
      {glyph === "file" && (
        <>
          <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" {...common} fill={`${tint}22`} />
          <path d="M14 3v4h4" {...common} />
        </>
      )}
    </svg>
  );
}

function Window({
  win,
  children,
  onClose,
  onMinimise,
  onToggleMax,
  onFocus,
  onMove,
}: {
  win: Win;
  children: React.ReactNode;
  onClose: () => void;
  onMinimise: () => void;
  onToggleMax: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    onFocus();
    if (win.maximised) return; // a maximised window doesn't drag
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    // Keep the title bar reachable no matter how far it is dragged.
    const x = Math.max(-win.w + 90, Math.min(window.innerWidth - 60, e.clientX - drag.current.dx));
    const y = Math.max(32, Math.min(window.innerHeight - 60, e.clientY - drag.current.dy));
    onMove(x, y);
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  if (win.minimised) return null;

  const box = win.maximised
    ? { left: 8, top: 40, width: "calc(100vw - 16px)", height: "calc(100dvh - 128px)" }
    : {
        left: win.x,
        top: win.y,
        width: `min(${win.w}px, calc(100vw - 24px))`,
        height: undefined,
      };

  return (
    <div
      role="dialog"
      aria-label={win.title}
      onPointerDown={onFocus}
      className="absolute flex flex-col overflow-hidden rounded-xl border shadow-2xl"
      style={{
        ...box,
        zIndex: 20 + win.z,
        borderColor: "#ffffff22",
        backgroundColor: "rgba(20,25,36,0.94)",
        backdropFilter: "blur(12px)",
        color: "#e8eaf0",
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex cursor-grab items-center gap-2 border-b px-3 py-2 active:cursor-grabbing"
        style={{ borderColor: "#ffffff14", backgroundColor: "rgba(255,255,255,0.05)" }}
      >
        {/* All three lights do their job — decorative ones read as broken. */}
        <button
          onClick={onClose}
          aria-label={`Close ${win.title}`}
          title="Close"
          className="h-3 w-3 shrink-0 rounded-full transition hover:brightness-125"
          style={{ backgroundColor: "#ff5f57" }}
        />
        <button
          onClick={onMinimise}
          aria-label={`Minimise ${win.title}`}
          title="Minimise"
          className="h-3 w-3 shrink-0 rounded-full transition hover:brightness-125"
          style={{ backgroundColor: "#febc2e" }}
        />
        <button
          onClick={onToggleMax}
          aria-label={`${win.maximised ? "Restore" : "Maximise"} ${win.title}`}
          title={win.maximised ? "Restore" : "Maximise"}
          className="h-3 w-3 shrink-0 rounded-full transition hover:brightness-125"
          style={{ backgroundColor: "#28c840" }}
        />
        <span className="mx-auto truncate text-[12.5px] text-white/70">{win.title}</span>
        <span className="w-[42px]" />
      </div>

      <div
        className={`overflow-y-auto overscroll-contain px-4 py-4 text-[14px] leading-relaxed ${
          win.maximised ? "flex-1" : "max-h-[62dvh]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function WindowBody({
  win,
  profile,
  onOpenProject,
}: {
  win: Win;
  profile: Profile;
  onOpenProject: (id: string, title: string, p?: Project) => void;
}) {
  if (win.project) {
    const p = win.project;
    const ink = readable(p.accent, "#141924");
    return (
      <div>
        <p className="text-[12px] text-white/40">
          {p.year} · {p.role}
        </p>
        <h2 className="mt-1 text-xl font-semibold" style={{ color: ink }}>
          {p.name}
        </h2>
        <p className="mt-3 whitespace-pre-line text-white/75">{p.description}</p>
        {p.highlights.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-[13.5px] text-white/65">
                <span style={{ color: ink }}>▸</span>
                {h}
              </li>
            ))}
          </ul>
        )}
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {p.tech.map((t) => (
            <li
              key={t}
              className="rounded border px-2 py-1 text-[12px] text-white/70"
              style={{ borderColor: "#ffffff22" }}
            >
              {t}
            </li>
          ))}
        </ul>
        {(p.live || p.repo) && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {p.live && (
              <a href={p.live} target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2 text-[13px] font-medium" style={{ backgroundColor: p.accent, color: "#12161f" }}>
                Visit ↗
              </a>
            )}
            {p.repo && (
              <a href={p.repo} target="_blank" rel="noopener noreferrer" className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: "#ffffff2a" }}>
                Source ↗
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  switch (win.id) {
    case "projects":
      return (
        <ul className="space-y-1">
          {profile.projects.map((p) => (
            <li key={p.slug}>
              <button
                onDoubleClick={() => onOpenProject(`p-${p.slug}`, p.name, p)}
                onClick={() => onOpenProject(`p-${p.slug}`, p.name, p)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/10"
              >
                <DeskIcon glyph="file" tint={p.accent} size={26} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px]">{p.name}</span>
                  <span className="block truncate text-[12px] text-white/40">{p.blurb}</span>
                </span>
                <span className="shrink-0 text-[11.5px] text-white/30">{p.year}</span>
              </button>
            </li>
          ))}
        </ul>
      );

    case "about":
      return (
        <div>
          <h2 className="text-xl font-semibold">{profile.name}</h2>
          <p className="mt-0.5 text-[13px] text-white/50">
            {profile.role} · {profile.location}
          </p>
          <p className="mt-3 whitespace-pre-line text-white/75">{profile.bio}</p>
          <ul className="mt-4 space-y-1 text-[13px] text-white/50">
            {profile.offbeat.map((o) => (
              <li key={o}>— {o}</li>
            ))}
          </ul>
        </div>
      );

    case "experience":
      return (
        <ol className="space-y-4">
          {profile.experience.map((e) => (
            <li key={`${e.org}-${e.period}`}>
              <p className="font-medium">{e.role}</p>
              <p className="text-[12.5px] text-white/45">
                {e.org} · {e.period}
              </p>
              <p className="mt-1 text-[13.5px] text-white/65">{e.summary}</p>
            </li>
          ))}
          {profile.education.map((e) => (
            <li key={e.degree} className="border-t pt-4" style={{ borderColor: "#ffffff14" }}>
              <p className="font-medium">{e.degree}</p>
              <p className="text-[12.5px] text-white/45">
                {e.org} · {e.period}
              </p>
            </li>
          ))}
        </ol>
      );

    case "skills":
      return (
        <div className="space-y-4">
          {profile.skills.map((g) => (
            <div key={g.category}>
              <p className="text-[13px] font-medium">{g.category}</p>
              <p className="text-[12px] text-white/40">{g.summary}</p>
              <ul className="mt-2 space-y-1">
                {g.items.map((s) => (
                  <li key={s.name} className="flex items-center gap-2.5">
                    <span className="w-36 shrink-0 truncate text-[13px] text-white/75">
                      {s.name}
                    </span>
                    <span className="h-1.5 flex-1 rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-[#4a9eff]"
                        style={{ width: `${s.level * 20}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "contact":
      return (
        <div>
          <p className="text-white/70">
            {profile.availability} — based in {profile.location}.
          </p>
          <ul className="mt-3 space-y-1.5">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2 transition hover:border-white/35"
                  style={{ borderColor: "#ffffff1a" }}
                >
                  <span className="text-[12px] text-white/45">{l.label}</span>
                  <span className="truncate text-[13px]">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
}
