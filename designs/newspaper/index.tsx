"use client";

import type { Profile, Project } from "@/data/types";

const PAPER = "#f2efe6";
const INK = "#14130f";
const RED = "#8c1c13";
const MUTED = "#7a7469";

export default function Broadsheet({ profile }: { profile: Profile }) {
  const [lead, ...rest] = profile.projects;
  const edition = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="min-h-dvh w-full px-4 py-6 sm:px-8 sm:py-10"
      style={{ backgroundColor: "#ddd8cb" }}
    >
      <div
        className="mx-auto max-w-[1120px] px-5 py-8 shadow-[0_12px_40px_rgba(0,0,0,0.25)] sm:px-10 sm:py-10"
        style={{ backgroundColor: PAPER, color: INK }}
      >
        <Masthead profile={profile} edition={edition} />

        {/* Front page */}
        <div className="mt-7 grid gap-x-8 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {lead && <LeadStory project={lead} profile={profile} />}
          </div>
          <aside className="lg:col-span-4 lg:border-l lg:pl-8" style={{ borderColor: `${INK}22` }}>
            <ColumnHead>The Interview</ColumnHead>
            <p className="mt-3 text-[15px] leading-[1.72] whitespace-pre-line">
              {profile.bio}
            </p>
            <dl className="mt-5 border-t pt-4" style={{ borderColor: `${INK}22` }}>
              {profile.stats.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-3 py-1">
                  <dt className="text-[13px]" style={{ color: MUTED }}>
                    {s.label}
                  </dt>
                  <dd className="font-display text-lg">{s.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <Divider />

        {/* Investigations */}
        <section>
          <SectionBanner>Investigations</SectionBanner>
          <div className="mt-6 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Story key={p.slug} project={p} index={i + 2} />
            ))}
          </div>
        </section>

        <Divider />

        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <SectionBanner>Business</SectionBanner>
            <ol className="mt-5 space-y-5">
              {profile.experience.map((e) => (
                <li key={`${e.org}-${e.period}`} className="border-b pb-4" style={{ borderColor: `${INK}18` }}>
                  <h3 className="font-display text-xl leading-tight">{e.role}</h3>
                  <p className="mt-0.5 text-[12px] tracking-[0.14em] uppercase" style={{ color: RED }}>
                    {e.org} · {e.period}
                  </p>
                  <p className="mt-2 text-[14.5px] leading-[1.7]">{e.summary}</p>
                </li>
              ))}
              {profile.education.map((e) => (
                <li key={e.degree}>
                  <h3 className="font-display text-lg">{e.degree}</h3>
                  <p className="text-[12px] tracking-[0.14em] uppercase" style={{ color: MUTED }}>
                    {e.org} · {e.period}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="lg:col-span-5">
            <SectionBanner>Technology</SectionBanner>
            <div className="mt-5 space-y-4">
              {profile.skills.map((g) => (
                <div key={g.category} className="border-b pb-3" style={{ borderColor: `${INK}18` }}>
                  <h3 className="font-display text-lg">{g.category}</h3>
                  <p className="text-[13px]" style={{ color: MUTED }}>
                    {g.summary}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-relaxed">
                    {g.items.map((s) => s.name).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <Divider />

        <section>
          <SectionBanner>Classifieds</SectionBanner>
          <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="font-display text-2xl leading-tight">
                WANTED: interesting problems.
              </p>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                {profile.availability}. Based in {profile.location}. Enquiries to any of
                the below.
              </p>
            </div>
            {profile.links.map((l) => (
              <a
                key={l.kind}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3 border-b py-2 transition-opacity hover:opacity-60"
                style={{ borderColor: `${INK}22` }}
              >
                <span className="text-[11.5px] tracking-[0.16em] uppercase" style={{ color: MUTED }}>
                  {l.label}
                </span>
                <span className="truncate font-display text-[15px]">{l.handle}</span>
              </a>
            ))}
          </div>
        </section>

        <footer
          className="mt-10 border-t pt-4 text-center text-[11px] tracking-[0.16em] uppercase"
          style={{ borderColor: INK, color: MUTED }}
        >
          Printed on demand · All content herein is placeholder
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Masthead({ profile, edition }: { profile: Profile; edition: string }) {
  return (
    <header>
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b pb-1.5 text-[10.5px] tracking-[0.2em] uppercase"
        style={{ borderColor: INK, color: MUTED }}
      >
        <span>Vol. {profile.projects.length} · No. {profile.experience.length}</span>
        <span>{edition}</span>
        <span>{profile.location}</span>
      </div>

      <h1
        className="mt-3 text-center font-display leading-[0.86] tracking-[-0.02em]"
        style={{ fontSize: "clamp(2.2rem,8vw,5.2rem)" }}
      >
        The {profile.name.split(" ").slice(-1)[0]} Times
      </h1>

      <div
        className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-b py-1.5 text-[11px] tracking-[0.18em] uppercase"
        style={{ borderColor: INK }}
      >
        <span style={{ color: RED }}>{profile.role}</span>
        <span style={{ color: MUTED }}>{profile.availability}</span>
      </div>
    </header>
  );
}

function ColumnHead({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="border-b pb-1 text-[11.5px] tracking-[0.24em] uppercase"
      style={{ borderColor: INK, color: RED }}
    >
      {children}
    </h2>
  );
}

function SectionBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="font-display text-[13px] tracking-[0.28em] uppercase">{children}</h2>
      <span className="h-px flex-1" style={{ backgroundColor: `${INK}44` }} />
    </div>
  );
}

function Divider() {
  return (
    <div className="my-9 flex items-center gap-2">
      <span className="h-[3px] flex-1" style={{ backgroundColor: INK }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: RED }} />
      <span className="h-[3px] flex-1" style={{ backgroundColor: INK }} />
    </div>
  );
}

/** Headlines read better in caps-ish news style; keep it derived, not stored. */
function headline(project: Project) {
  return `${project.name}: ${project.blurb.replace(/\.$/, "")}`;
}

function LeadStory({ project, profile }: { project: Project; profile: Profile }) {
  return (
    <article>
      <p className="text-[11.5px] tracking-[0.22em] uppercase" style={{ color: RED }}>
        Breaking · {project.year}
      </p>
      <h2
        className="mt-2 font-display leading-[0.98] tracking-[-0.015em]"
        style={{ fontSize: "clamp(1.9rem,4.6vw,3.2rem)" }}
      >
        {headline(project)}
      </h2>
      <p className="mt-3 text-[12px] tracking-[0.14em] uppercase" style={{ color: MUTED }}>
        By {profile.name} · {project.role}
      </p>

      <div className="mt-4 columns-1 gap-8 sm:columns-2">
        <p className="text-[15px] leading-[1.75] whitespace-pre-line">
          <span
            className="float-left mt-[5px] mr-2.5 font-display leading-[0.72]"
            style={{ fontSize: "3.6em", color: RED }}
          >
            {project.description.trim().charAt(0)}
          </span>
          {project.description.trim().slice(1)}
        </p>
      </div>

      {project.highlights.length > 0 && (
        <ul
          className="mt-5 border-y py-3"
          style={{ borderColor: `${INK}22` }}
        >
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2.5 py-0.5 text-[14px]">
              <span style={{ color: RED }}>▪</span>
              {h}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[12.5px]" style={{ color: MUTED }}>
        Filed under: {project.tech.join(", ")}
      </p>

      {(project.live || project.repo) && (
        <p className="mt-3 flex flex-wrap gap-x-6 text-[12.5px] tracking-[0.1em] uppercase">
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="border-b" style={{ borderColor: RED }}>
              Read on site ↗
            </a>
          )}
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener noreferrer" className="border-b" style={{ borderColor: `${INK}44` }}>
              Source ↗
            </a>
          )}
        </p>
      )}
    </article>
  );
}

function Story({ project, index }: { project: Project; index: number }) {
  return (
    <article className="break-inside-avoid">
      <p className="text-[10.5px] tracking-[0.2em] uppercase" style={{ color: RED }}>
        Page {index} · {project.year}
      </p>
      <h3 className="mt-1.5 font-display text-[22px] leading-[1.08]">
        {headline(project)}
      </h3>
      <p className="mt-1.5 text-[11.5px] tracking-[0.12em] uppercase" style={{ color: MUTED }}>
        {project.role}
      </p>
      <p className="mt-2.5 text-[14px] leading-[1.68]">{project.description}</p>

      {project.highlights.length > 0 && (
        <p className="mt-2.5 text-[13.5px] leading-relaxed" style={{ color: MUTED }}>
          {project.highlights[0]}
        </p>
      )}

      <p className="mt-2.5 border-t pt-2 text-[12px]" style={{ borderColor: `${INK}22`, color: MUTED }}>
        {project.tech.join(" · ")}
      </p>

      {(project.live || project.repo) && (
        <p className="mt-2 flex gap-4 text-[11.5px] tracking-[0.1em] uppercase">
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="border-b" style={{ borderColor: RED }}>
              Site ↗
            </a>
          )}
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener noreferrer" className="border-b" style={{ borderColor: `${INK}44` }}>
              Source ↗
            </a>
          )}
        </p>
      )}
    </article>
  );
}
