"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Profile } from "@/data/types";
import { COMMANDS, runCommand } from "./commands";

type Line = { id: number; prompt?: string; node: ReactNode };

const THEMES = {
  dark: {
    "--t-bg": "#0d1117",
    "--t-chrome": "#161b22",
    "--t-fg": "#e6edf3",
    "--t-dim": "#7d8590",
    "--t-accent": "#7ee787",
    "--t-link": "#58a6ff",
    "--t-err": "#ff7b72",
    "--t-line": "#30363d",
  },
  light: {
    "--t-bg": "#fdf6e3",
    "--t-chrome": "#eee8d5",
    "--t-fg": "#073642",
    "--t-dim": "#93a1a1",
    "--t-accent": "#657b0c",
    "--t-link": "#268bd2",
    "--t-err": "#dc322f",
    "--t-line": "#d8d0bb",
  },
} as const;

export default function Terminal({ profile }: { profile: Profile }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [booted, setBooted] = useState(false);
  const [theme, setTheme] = useState<keyof typeof THEMES>("dark");

  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const alive = useRef(true);

  const push = useCallback((node: ReactNode, prompt?: string) => {
    setLines((ls) => [...ls, { id: nextId.current++, node, prompt }]);
  }, []);

  const host = profile.name.split(" ")[0]?.toLowerCase() ?? "guest";
  const prompt = `${host}@portfolio:~$`;

  /* Boot sequence — establishes the metaphor before handing over the prompt. */
  useEffect(() => {
    alive.current = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const boot: ReactNode[] = [
      // A short POST before the shell — sells the machine, and every line is
      // derived from the profile rather than invented.
      <Post key="post" profile={profile} />,
      <span key="1" style={{ color: "var(--t-dim)" }}>
        booting portfolio.sh …
      </span>,
      <span key="2" style={{ color: "var(--t-dim)" }}>
        loading profile … <span style={{ color: "var(--t-accent)" }}>ok</span>
      </span>,
      <span key="3" style={{ color: "var(--t-dim)" }}>
        mounting /projects ({profile.projects.length} entries) …{" "}
        <span style={{ color: "var(--t-accent)" }}>ok</span>
      </span>,
      <Banner key="4" profile={profile} />,
      <span key="5">
        Type <span style={{ color: "var(--t-accent)" }}>help</span> to begin, or click
        a command in the sidebar.
      </span>,
    ];

    if (reduced) {
      boot.forEach((n) => push(n));
      setBooted(true);
      return;
    }

    let i = 0;
    const tick = () => {
      if (!alive.current) return;
      if (i < boot.length) {
        push(boot[i]);
        i += 1;
        window.setTimeout(tick, i === 4 ? 320 : 190);
      } else {
        setBooted(true);
      }
    };
    const t = window.setTimeout(tick, 220);
    return () => {
      alive.current = false;
      window.clearTimeout(t);
    };
  }, [profile, push]);

  /* Keep the newest output in view. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, booted]);

  const submit = useCallback(
    (raw: string) => {
      const value = raw.trim();
      push(null, `${prompt} ${raw}`);
      if (value) {
        setHistory((h) => [value, ...h]);
        setHistIdx(-1);
      }
      const result = runCommand(value, profile, THEMES[theme]["--t-bg"]);
      if (result.kind === "clear") {
        setLines([]);
        return;
      }
      if (result.kind === "theme") {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
        push(
          <span style={{ color: "var(--t-dim)" }}>
            theme → {theme === "dark" ? "light" : "dark"}
          </span>,
        );
        return;
      }
      if (result.node) push(result.node);
    },
    [profile, prompt, push, theme],
  );

  const complete = useCallback(() => {
    const parts = input.split(/\s+/);
    if (parts.length <= 1) {
      const matches = COMMANDS.map((c) => c.name).filter((n) =>
        n.startsWith(parts[0] ?? ""),
      );
      if (matches.length === 1) setInput(matches[0] + " ");
      else if (matches.length > 1) push(<span>{matches.join("   ")}</span>);
      return;
    }
    // Second token completes against project slugs.
    const stem = parts[parts.length - 1];
    const matches = profile.projects
      .map((p) => p.slug)
      .filter((s) => s.startsWith(stem));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      setInput(parts.join(" "));
    } else if (matches.length > 1) {
      push(<span>{matches.join("   ")}</span>);
    }
  }, [input, profile.projects, push]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const i = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = histIdx - 1;
      if (i < 0) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(i);
        setInput(history[i]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="min-h-dvh w-full px-3 py-4 font-code sm:px-6 sm:py-8"
      style={{
        ...(THEMES[theme] as Record<string, string>),
        backgroundColor: "var(--t-bg)",
        color: "var(--t-fg)",
      }}
    >
      <div
        className="mx-auto flex h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-lg border shadow-2xl sm:h-[calc(100dvh-4rem)]"
        style={{ borderColor: "var(--t-line)", backgroundColor: "var(--t-bg)" }}
      >
        {/* Title bar */}
        <div
          className="flex shrink-0 items-center gap-2 border-b px-3 py-2"
          style={{ borderColor: "var(--t-line)", backgroundColor: "var(--t-chrome)" }}
        >
          <span className="flex gap-1.5">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span
                key={c}
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </span>
          <p className="flex-1 text-center text-xs" style={{ color: "var(--t-dim)" }}>
            {host}@portfolio — bash — 80×24
          </p>
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="text-xs transition hover:opacity-70"
            style={{ color: "var(--t-dim)" }}
          >
            {theme === "dark" ? "☾" : "☀"}
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Scrollback */}
          <div
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            className="min-w-0 flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed sm:text-sm"
          >
            {lines.map((l) => (
              <div key={l.id}>
                {l.prompt && (
                  <p className="mt-2 break-all">
                    <span style={{ color: "var(--t-accent)" }}>{prompt.slice(0, -1)}</span>
                    <span style={{ color: "var(--t-link)" }}>$</span>{" "}
                    {l.prompt.slice(prompt.length + 1)}
                  </p>
                )}
                {l.node}
              </div>
            ))}

            {booted && (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="shrink-0">
                  <span style={{ color: "var(--t-accent)" }}>{prompt.slice(0, -1)}</span>
                  <span style={{ color: "var(--t-link)" }}>$</span>
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal input"
                  /* The global focus ring drew a box around the whole prompt
                     line. In a shell the caret is the focus affordance, and it
                     is always visible here because the field is autofocused. */
                  className="min-w-0 flex-1 border-0 bg-transparent outline-none focus:outline-none focus-visible:outline-none"
                  style={{ color: "var(--t-fg)", caretColor: "var(--t-accent)" }}
                />
              </div>
            )}
          </div>

          {/* Hints — so a visitor who won't type still gets everywhere. */}
          <aside
            className="hidden w-52 shrink-0 overflow-y-auto border-l px-3 py-3 md:block"
            style={{ borderColor: "var(--t-line)" }}
          >
            <p className="mb-2 text-[11px] tracking-wider uppercase" style={{ color: "var(--t-dim)" }}>
              Commands
            </p>
            <ul className="space-y-0.5">
              {COMMANDS.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => {
                      const text = c.args
                        ? `${c.name} ${profile.projects[0]?.slug ?? ""}`.trim()
                        : c.name;
                      submit(text);
                      inputRef.current?.focus();
                    }}
                    className="w-full rounded px-2 py-1 text-left text-[12.5px] transition hover:opacity-100"
                    style={{ color: "var(--t-fg)" }}
                  >
                    <span style={{ color: "var(--t-accent)" }}>{c.name}</span>
                    <span className="block text-[11px]" style={{ color: "var(--t-dim)" }}>
                      {c.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* The sidebar is gone on phones, so the same commands ride along the
            bottom as a scrollable strip — nobody should hit a blank prompt. */}
        <div
          className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto border-t px-3 py-2 md:hidden"
          style={{ borderColor: "var(--t-line)", backgroundColor: "var(--t-chrome)" }}
        >
          {COMMANDS.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                submit(
                  c.args
                    ? `${c.name} ${profile.projects[0]?.slug ?? ""}`.trim()
                    : c.name,
                );
                inputRef.current?.focus();
              }}
              className="min-h-[44px] shrink-0 rounded border px-3 text-[12px] whitespace-nowrap"
              style={{ borderColor: "var(--t-line)", color: "var(--t-accent)" }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Power-on self test. Device names come from the profile's own shape. */
function Post({ profile }: { profile: Profile }) {
  const skills = profile.skills.reduce((a, g) => a + g.items.length, 0);
  const rows: [string, string][] = [
    ["BIOS", `${profile.initials}-BIOS v${profile.experience.length}.${profile.projects.length}`],
    ["Memory test", `${skills * 512}K OK`],
    ["Detecting drives", `${profile.projects.length} volumes found`],
    ["Toolchain", profile.skills.map((g) => g.category).join(", ")],
  ];
  return (
    <div className="mb-3">
      {rows.map(([k, v]) => (
        <p key={k} className="flex flex-wrap gap-x-2">
          <span className="w-36 shrink-0" style={{ color: "var(--t-dim)" }}>
            {k}
          </span>
          <span>{v}</span>
        </p>
      ))}
      <p style={{ color: "var(--t-dim)" }}>
        POST complete — <span style={{ color: "var(--t-accent)" }}>no errors</span>
      </p>
    </div>
  );
}

/**
 * Box-drawn nameplate, built from the profile at render time.
 *
 * Figlet-style lettering would have to be hardcoded per name, which breaks the
 * moment the profile changes — this sizes itself to whatever it is given.
 */
function Banner({ profile }: { profile: Profile }) {
  const rows = [
    profile.name.toUpperCase(),
    profile.role,
    `${profile.location} · ${profile.availability}`,
  ];
  const inner = Math.max(...rows.map((r) => r.length)) + 4;
  const rule = (l: string, r: string) => l + "─".repeat(inner) + r;

  return (
    <div className="my-3 overflow-x-auto">
      <pre className="text-[11px] leading-[1.5] sm:text-[13px]">
        <span style={{ color: "var(--t-dim)" }}>{rule("┌", "┐")}</span>
        {"\n"}
        {rows.map((row, i) => (
          <span key={row}>
            <span style={{ color: "var(--t-dim)" }}>│</span>
            {"  "}
            <span
              style={{
                color: i === 0 ? "var(--t-accent)" : "var(--t-fg)",
                opacity: i === 2 ? 0.7 : 1,
              }}
            >
              {row}
            </span>
            {" ".repeat(inner - 2 - row.length)}
            <span style={{ color: "var(--t-dim)" }}>│</span>
            {"\n"}
          </span>
        ))}
        <span style={{ color: "var(--t-dim)" }}>{rule("└", "┘")}</span>
      </pre>
    </div>
  );
}
