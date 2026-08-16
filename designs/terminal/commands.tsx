"use client";

import type { ReactNode } from "react";
import type { Profile, Project } from "@/data/types";
import { readable } from "@/lib/derive";

export type CommandResult =
  | { kind: "output"; node: ReactNode }
  | { kind: "clear" }
  | { kind: "theme" };

export type CommandSpec = {
  name: string;
  args?: string;
  description: string;
};

/** Everything `help` lists, and everything Tab completes against. */
export const COMMANDS: CommandSpec[] = [
  { name: "help", description: "list every command" },
  { name: "whoami", description: "the short version" },
  { name: "about", description: "the longer version" },
  { name: "projects", description: "list shipped work" },
  { name: "open", args: "<project>", description: "open one project in full" },
  { name: "tree", description: "the whole profile as a file tree" },
  { name: "skills", description: "the toolkit, by group" },
  { name: "experience", description: "roles and education" },
  { name: "stats", description: "numbers that mean something" },
  { name: "contact", description: "how to get in touch" },
  { name: "theme", description: "toggle light / dark" },
  { name: "clear", description: "wipe the scrollback" },
];

/* ---------------------------------------------------------------- */
/* Presentational atoms                                              */
/* ---------------------------------------------------------------- */

function Panel({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-1.5 border-l-2 pl-3" style={{ borderColor: accent ?? "var(--t-accent)" }}>
      <p className="mb-1 font-semibold" style={{ color: accent ?? "var(--t-accent)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ k, v }: { k: string; v: ReactNode }) {
  return (
    <p className="flex flex-wrap gap-x-2">
      <span className="w-28 shrink-0" style={{ color: "var(--t-dim)" }}>
        {k}
      </span>
      <span>{v}</span>
    </p>
  );
}

function Bar({ level }: { level: number }) {
  return (
    <span style={{ color: "var(--t-accent)" }}>
      {"█".repeat(level)}
      <span style={{ color: "var(--t-dim)" }}>{"░".repeat(5 - level)}</span>
    </span>
  );
}

function ProjectBlock({ p, bg }: { p: Project; bg: string }) {
  return (
    <Panel title={`${p.name}  —  ${p.year}`} accent={readable(p.accent, bg)}>
      <p className="mb-1.5" style={{ color: "var(--t-dim)" }}>
        {p.role}
      </p>
      <p className="mb-2 max-w-[72ch] whitespace-pre-line">{p.description}</p>
      <p className="mb-1">
        <span style={{ color: "var(--t-dim)" }}>stack </span>
        {p.tech.join(" · ")}
      </p>
      {p.highlights.map((h) => (
        <p key={h}>
          <span style={{ color: "var(--t-accent)" }}>+ </span>
          {h}
        </p>
      ))}
      {(p.live || p.repo) && (
        <p className="mt-1.5 flex gap-4">
          {p.live && (
            <a
              href={p.live}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: "var(--t-link)" }}
            >
              live ↗
            </a>
          )}
          {p.repo && (
            <a
              href={p.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: "var(--t-link)" }}
            >
              source ↗
            </a>
          )}
        </p>
      )}
    </Panel>
  );
}

export function Err({ children }: { children: ReactNode }) {
  return <p style={{ color: "var(--t-err)" }}>{children}</p>;
}

/* ---------------------------------------------------------------- */
/* Runner                                                            */
/* ---------------------------------------------------------------- */

/**
 * `bg` is the terminal's current background. Project accents are property-band
 * colours, so they have to be lifted or darkened per theme to stay legible as
 * text — see `readable` in lib/derive.
 */
export function runCommand(
  raw: string,
  profile: Profile,
  bg = "#0d1117",
): CommandResult {
  const [name, ...args] = raw.trim().split(/\s+/);
  const cmd = name.toLowerCase();

  switch (cmd) {
    case "help":
      return {
        kind: "output",
        node: (
          <div className="my-1">
            {COMMANDS.map((c) => (
              <p key={c.name} className="flex flex-wrap gap-x-2">
                <span className="w-32 shrink-0" style={{ color: "var(--t-accent)" }}>
                  {c.name}
                  {c.args ? ` ${c.args}` : ""}
                </span>
                <span style={{ color: "var(--t-dim)" }}>{c.description}</span>
              </p>
            ))}
            <p className="mt-2" style={{ color: "var(--t-dim)" }}>
              Tab completes · ↑ ↓ walk history
            </p>
          </div>
        ),
      };

    case "whoami":
      return {
        kind: "output",
        node: (
          <div className="my-1">
            <p className="text-lg font-semibold" style={{ color: "var(--t-accent)" }}>
              {profile.name}
            </p>
            <p>{profile.role}</p>
            <p style={{ color: "var(--t-dim)" }}>{profile.tagline}</p>
          </div>
        ),
      };

    case "about":
      return {
        kind: "output",
        node: (
          <div className="my-1 max-w-[74ch]">
            <p className="mb-2 whitespace-pre-line">{profile.bio}</p>
            <Field k="location" v={profile.location} />
            <Field k="status" v={profile.availability} />
          </div>
        ),
      };

    case "ls":
    case "projects":
      return {
        kind: "output",
        node: (
          <div className="my-1">
            {profile.projects.map((p) => (
              <p key={p.slug} className="flex flex-wrap gap-x-3">
                <span
                  className="w-28 shrink-0"
                  style={{ color: readable(p.accent, bg) }}
                >
                  {p.slug}
                </span>
                <span>{p.blurb}</span>
              </p>
            ))}
            <p className="mt-2" style={{ color: "var(--t-dim)" }}>
              {profile.projects.length} projects · run{" "}
              <span style={{ color: "var(--t-accent)" }}>open &lt;name&gt;</span> for detail
            </p>
          </div>
        ),
      };

    case "open":
    case "cat": {
      const slug = (args[0] ?? "").toLowerCase().replace(/\.md$/, "");
      if (!slug)
        return { kind: "output", node: <Err>usage: open &lt;project&gt;</Err> };
      const p = profile.projects.find(
        (x) => x.slug === slug || x.name.toLowerCase() === slug,
      );
      if (!p)
        return {
          kind: "output",
          node: <Err>no project named &quot;{slug}&quot; — try `projects`</Err>,
        };
      return { kind: "output", node: <ProjectBlock p={p} bg={bg} /> };
    }

    case "tree": {
      // Drawn from the profile, so the tree is never out of date with it.
      const lines: { depth: number; last: boolean[]; label: string; tint?: string }[] =
        [];
      const push = (depth: number, last: boolean[], label: string, tint?: string) =>
        lines.push({ depth, last, label, tint });

      push(0, [], "~");
      push(1, [false], "about.md");
      push(1, [false], "projects/", "var(--t-accent)");
      profile.projects.forEach((p, i) =>
        push(2, [false, i === profile.projects.length - 1], `${p.slug}.md`, p.accent),
      );
      push(1, [false], "skills/", "var(--t-accent)");
      profile.skills.forEach((g, i) =>
        push(2, [false, i === profile.skills.length - 1], `${g.category.toLowerCase()}.txt`),
      );
      push(1, [true], "contact.vcf");

      return {
        kind: "output",
        node: (
          <div className="my-1">
            {lines.map((l, i) => (
              <p key={i}>
                <span style={{ color: "var(--t-dim)" }}>
                  {l.depth === 0
                    ? ""
                    : "│  ".repeat(Math.max(l.depth - 1, 0)) +
                      (l.last[l.depth - 1] ? "└─ " : "├─ ")}
                </span>
                <span style={{ color: l.tint ?? "inherit" }}>{l.label}</span>
              </p>
            ))}
            <p className="mt-2" style={{ color: "var(--t-dim)" }}>
              {profile.projects.length} projects · {profile.skills.length} skill groups
            </p>
          </div>
        ),
      };
    }

    case "skills":
      return {
        kind: "output",
        node: (
          <div className="my-1">
            {profile.skills.map((g) => (
              <div key={g.category} className="mb-3">
                <p style={{ color: "var(--t-accent)" }}>{g.category}</p>
                <p className="mb-1" style={{ color: "var(--t-dim)" }}>
                  {g.summary}
                </p>
                {g.items.map((s) => (
                  <p key={s.name} className="flex gap-x-3">
                    <span className="w-40 shrink-0">{s.name}</span>
                    <Bar level={s.level} />
                  </p>
                ))}
              </div>
            ))}
          </div>
        ),
      };

    case "experience":
      return {
        kind: "output",
        node: (
          <div className="my-1">
            {profile.experience.map((e) => (
              <Panel key={`${e.org}-${e.period}`} title={`${e.role} @ ${e.org}`}>
                <p className="mb-1" style={{ color: "var(--t-dim)" }}>
                  {e.period}
                </p>
                <p className="max-w-[72ch]">{e.summary}</p>
              </Panel>
            ))}
            {profile.education.map((e) => (
              <Panel key={e.degree} title={e.degree}>
                <p style={{ color: "var(--t-dim)" }}>
                  {e.org} · {e.period}
                </p>
              </Panel>
            ))}
          </div>
        ),
      };

    case "stats":
      return {
        kind: "output",
        node: (
          <div className="my-1">
            {profile.stats.map((s) => (
              <Field
                key={s.label}
                k={s.label}
                v={<span style={{ color: "var(--t-accent)" }}>{s.value}</span>}
              />
            ))}
          </div>
        ),
      };

    case "contact":
      return {
        kind: "output",
        node: (
          <div className="my-1">
            {profile.links.map((l) => (
              <p key={l.kind} className="flex flex-wrap gap-x-2">
                <span className="w-28 shrink-0" style={{ color: "var(--t-dim)" }}>
                  {l.label}
                </span>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: "var(--t-link)" }}
                >
                  {l.handle}
                </a>
              </p>
            ))}
          </div>
        ),
      };

    case "clear":
      return { kind: "clear" };

    case "theme":
      return { kind: "theme" };

    case "sudo":
      return {
        kind: "output",
        node: <Err>nice try. this incident will be reported.</Err>,
      };

    case "":
      return { kind: "output", node: null };

    default:
      return {
        kind: "output",
        node: (
          <Err>
            command not found: {cmd} — run `help` to see what is available
          </Err>
        ),
      };
  }
}
