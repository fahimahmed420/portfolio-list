"use client";

import { useEffect, useState } from "react";
import type { Profile, Project } from "@/data/types";

const PAPER = "#f7f4ec";
const INK = "#1a1917";
const ACCENT = "#9b2c2c";
const GOLD = "#b08d57";

export default function Editorial({ profile }: { profile: Profile }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const issue = String(profile.projects.length).padStart(2, "0");

  return (
    <div
      className="min-h-dvh w-full font-sans"
      style={{ backgroundColor: PAPER, color: INK }}
    >
      {/* Reading progress — a hairline, not a bar. */}
      <div
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left"
        style={{
          backgroundColor: ACCENT,
          transform: `scaleX(${progress})`,
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-[1180px] px-5 pb-28 sm:px-8">
        <Masthead profile={profile} issue={issue} />
        <Opening profile={profile} />
        <Contents profile={profile} />

        <section id="work" className="mt-24 sm:mt-32">
          <SectionRule>Selected Work</SectionRule>
          {profile.projects.map((p, i) => (
            <Spread key={p.slug} project={p} folio={i + 1} />
          ))}
        </section>

        <Toolkit profile={profile} />
        <Record profile={profile} />
        <Colophon profile={profile} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Masthead({ profile, issue }: { profile: Profile; issue: string }) {
  return (
    <header className="pt-10 sm:pt-14">
      <div
        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b pb-3 text-[11px] tracking-[0.18em] uppercase"
        style={{ borderColor: `${INK}22`, color: `${INK}99` }}
      >
        <span>Issue №{issue}</span>
        <span>{profile.location}</span>
        <span>{profile.availability}</span>
      </div>

      <h1
        className="mt-8 font-display leading-[0.9] tracking-[-0.02em]"
        style={{ fontSize: "clamp(2.75rem, 11vw, 8.5rem)" }}
      >
        {profile.name}
      </h1>

      <div
        className="mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-b py-3"
        style={{ borderColor: INK }}
      >
        <p className="font-display text-lg italic sm:text-xl">{profile.role}</p>
        <p className="text-[11px] tracking-[0.18em] uppercase" style={{ color: `${INK}88` }}>
          A portfolio in print
        </p>
      </div>
    </header>
  );
}

function Opening({ profile }: { profile: Profile }) {
  const [first, ...restBio] = profile.bio.split("\n\n");
  const lead = first.trim();
  const dropCap = lead.charAt(0);

  return (
    <section className="mt-14 grid gap-10 sm:mt-20 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="text-[17px] leading-[1.7] sm:text-[18px]">
          <span
            className="float-left mt-[6px] mr-3 font-display leading-[0.74]"
            style={{ fontSize: "4.4em", color: ACCENT }}
          >
            {dropCap}
          </span>
          {lead.slice(1)}
        </p>
        {restBio.map((para) => (
          <p key={para.slice(0, 24)} className="mt-5 text-[16.5px] leading-[1.7]">
            {para.trim()}
          </p>
        ))}
      </div>

      <aside className="lg:col-span-4 lg:col-start-9">
        <blockquote
          className="border-l-2 pl-5 font-display text-[26px] leading-[1.25] italic sm:text-[30px]"
          style={{ borderColor: ACCENT }}
        >
          “{profile.tagline}”
        </blockquote>

        <dl className="mt-9 space-y-3.5">
          {profile.stats.map((s) => (
            <div
              key={s.label}
              className="flex items-baseline justify-between gap-4 border-b pb-2"
              style={{ borderColor: `${INK}18` }}
            >
              <dt className="text-[13px]" style={{ color: `${INK}99` }}>
                {s.label}
              </dt>
              <dd className="font-display text-xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}

function Contents({ profile }: { profile: Profile }) {
  return (
    <nav
      className="mt-20 border-t pt-6 sm:mt-24"
      style={{ borderColor: INK }}
      aria-label="Contents"
    >
      <p className="mb-5 text-[11px] tracking-[0.2em] uppercase" style={{ color: `${INK}88` }}>
        Contents
      </p>
      <ol className="grid gap-x-10 gap-y-1 sm:grid-cols-2">
        {profile.projects.map((p, i) => (
          <li key={p.slug}>
            <a
              href={`#${p.slug}`}
              className="group flex items-baseline gap-3 border-b py-2.5 transition-colors"
              style={{ borderColor: `${INK}14` }}
            >
              <span className="font-display text-sm" style={{ color: GOLD }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-lg transition-colors group-hover:text-[color:var(--accent)]">
                {p.name}
              </span>
              <span
                className="mx-2 hidden flex-1 border-b border-dotted sm:block"
                style={{ borderColor: `${INK}33` }}
              />
              <span className="ml-auto text-[12px] sm:ml-0" style={{ color: `${INK}77` }}>
                {p.year}
              </span>
            </a>
          </li>
        ))}
      </ol>
      <style>{`:root { --accent: ${ACCENT}; }`}</style>
    </nav>
  );
}

function SectionRule({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-12 flex items-center gap-5">
      <h2 className="font-display text-[13px] tracking-[0.22em] uppercase">
        {children}
      </h2>
      <span className="h-px flex-1" style={{ backgroundColor: `${INK}33` }} />
    </div>
  );
}

function Spread({ project, folio }: { project: Project; folio: number }) {
  const even = folio % 2 === 0;
  return (
    <article
      id={project.slug}
      className="grid scroll-mt-16 gap-8 border-t py-14 lg:grid-cols-12 lg:gap-12"
      style={{ borderColor: `${INK}22` }}
    >
      {/* Folio + meta column */}
      <div className={`lg:col-span-3 ${even ? "lg:order-2" : ""}`}>
        <p
          className="font-display leading-none"
          style={{ fontSize: "clamp(3rem,7vw,4.5rem)", color: `${INK}14` }}
        >
          {String(folio).padStart(2, "0")}
        </p>
        <dl className="mt-4 space-y-2.5 text-[13px]">
          <div>
            <dt className="text-[11px] tracking-[0.16em] uppercase" style={{ color: `${INK}77` }}>
              Year
            </dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt className="text-[11px] tracking-[0.16em] uppercase" style={{ color: `${INK}77` }}>
              Role
            </dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt className="text-[11px] tracking-[0.16em] uppercase" style={{ color: `${INK}77` }}>
              Stack
            </dt>
            <dd className="leading-relaxed">{project.tech.join(", ")}</dd>
          </div>
        </dl>
      </div>

      {/* Body column */}
      <div className={`lg:col-span-9 ${even ? "lg:order-1" : ""}`}>
        <div className="flex items-baseline gap-4">
          <span className="h-[10px] w-[10px] shrink-0" style={{ backgroundColor: project.accent }} />
          <h3
            className="font-display leading-[1.05] tracking-[-0.01em]"
            style={{ fontSize: "clamp(1.9rem,4.5vw,3.1rem)" }}
          >
            {project.name}
          </h3>
        </div>

        <p className="mt-4 font-display text-[20px] leading-snug italic" style={{ color: `${INK}bb` }}>
          {project.blurb}
        </p>

        <div className="mt-6 columns-1 gap-10 text-[16px] leading-[1.72] sm:columns-2">
          <p className="whitespace-pre-line">{project.description}</p>
        </div>

        {project.highlights.length > 0 && (
          <ul className="mt-7 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[14.5px] leading-snug">
                <span
                  aria-hidden
                  className="mt-[9px] h-px w-4 shrink-0"
                  style={{ backgroundColor: project.accent }}
                />
                {h}
              </li>
            ))}
          </ul>
        )}

        {(project.live || project.repo) && (
          <p className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[13px] tracking-[0.1em] uppercase">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b pb-1 transition-opacity hover:opacity-60"
                style={{ borderColor: project.accent }}
              >
                Visit site ↗
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b pb-1 transition-opacity hover:opacity-60"
                style={{ borderColor: `${INK}44` }}
              >
                Source ↗
              </a>
            )}
          </p>
        )}
      </div>
    </article>
  );
}

function Toolkit({ profile }: { profile: Profile }) {
  return (
    <section className="mt-24 sm:mt-32">
      <SectionRule>Toolkit</SectionRule>
      <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {profile.skills.map((g) => (
          <div key={g.category}>
            <h3 className="font-display text-2xl">{g.category}</h3>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: `${INK}99` }}>
              {g.summary}
            </p>
            <ul className="mt-4 space-y-1.5">
              {g.items.map((s) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between gap-4 border-b pb-1.5 text-[14.5px]"
                  style={{ borderColor: `${INK}14` }}
                >
                  <span>{s.name}</span>
                  <span className="flex gap-[3px]" aria-label={`${s.level} of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="h-[5px] w-[5px] rounded-full"
                        style={{
                          backgroundColor: n <= s.level ? GOLD : `${INK}1f`,
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
    </section>
  );
}

function Record({ profile }: { profile: Profile }) {
  return (
    <section className="mt-24 sm:mt-32">
      <SectionRule>The Record</SectionRule>
      <ol className="space-y-9">
        {profile.experience.map((e) => (
          <li key={`${e.org}-${e.period}`} className="grid gap-3 lg:grid-cols-12">
            <p
              className="text-[13px] tracking-[0.12em] uppercase lg:col-span-3"
              style={{ color: `${INK}88` }}
            >
              {e.period}
            </p>
            <div className="lg:col-span-9">
              <h3 className="font-display text-2xl">{e.role}</h3>
              <p className="mt-1 text-[14px]" style={{ color: ACCENT }}>
                {e.org}
              </p>
              <p className="mt-2.5 max-w-[62ch] text-[15.5px] leading-relaxed">
                {e.summary}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {profile.education.length > 0 && (
        <ol className="mt-10 space-y-3 border-t pt-8" style={{ borderColor: `${INK}22` }}>
          {profile.education.map((e) => (
            <li key={e.degree} className="grid gap-2 lg:grid-cols-12">
              <p
                className="text-[13px] tracking-[0.12em] uppercase lg:col-span-3"
                style={{ color: `${INK}88` }}
              >
                {e.period}
              </p>
              <p className="lg:col-span-9">
                <span className="font-display text-lg">{e.degree}</span>
                <span className="ml-2 text-[14px]" style={{ color: `${INK}99` }}>
                  {e.org}
                </span>
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Colophon({ profile }: { profile: Profile }) {
  return (
    <footer className="mt-24 border-t pt-10 sm:mt-32" style={{ borderColor: INK }}>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2
            className="font-display leading-[1.05]"
            style={{ fontSize: "clamp(2rem,5vw,3.4rem)" }}
          >
            Let&apos;s make something.
          </h2>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed" style={{ color: `${INK}aa` }}>
            {profile.availability} — based in {profile.location}.
          </p>
        </div>

        <ul className="space-y-2.5 lg:col-span-4 lg:col-start-9">
          {profile.links.map((l) => (
            <li key={l.kind}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-4 border-b py-2 transition-opacity hover:opacity-60"
                style={{ borderColor: `${INK}20` }}
              >
                <span className="text-[11px] tracking-[0.18em] uppercase" style={{ color: `${INK}88` }}>
                  {l.label}
                </span>
                <span className="truncate font-display text-[15px]">{l.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14 space-y-1.5 text-[11px] tracking-[0.14em] uppercase" style={{ color: `${INK}66` }}>
        {profile.offbeat.map((o) => (
          <p key={o}>{o}</p>
        ))}
      </div>
    </footer>
  );
}
