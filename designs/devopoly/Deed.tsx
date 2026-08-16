"use client";

import { motion } from "framer-motion";
import type { Profile, Project, SkillGroup } from "@/data/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { PixelIcon } from "./PixelIcons";
import type { BoardTile } from "./tiles";

export type Selection =
  | { type: "tile"; index: number }
  | { type: "deck"; deck: "projects" | "skills" }
  | { type: "project"; slug: string }
  | { type: "draw"; deck: "chance" | "chest"; text: string }
  | null;

const PAPER = "#f4ead3";
const INK = "#2b2118";

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export function DeedModal({
  selection,
  profile,
  board,
  onClose,
  onSelect,
}: {
  selection: Selection;
  profile: Profile;
  board: BoardTile[];
  onClose: () => void;
  onSelect: (s: Selection) => void;
}) {
  const trapRef = useFocusTrap(selection !== null, onClose);

  if (!selection) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="relative z-10 max-h-[86dvh] w-full max-w-[480px] overflow-y-auto overscroll-contain border-[3px] shadow-[0_18px_0_rgba(0,0,0,0.4)] outline-none"
        style={{ backgroundColor: PAPER, borderColor: INK }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center border-[2px] font-pixel text-[9px] transition hover:bg-[#2b2118] hover:text-[#f4ead3]"
          style={{ borderColor: INK, color: INK }}
        >
          ×
        </button>
        <Body
          selection={selection}
          profile={profile}
          board={board}
          onSelect={onSelect}
        />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

function Body({
  selection,
  profile,
  board,
  onSelect,
}: {
  selection: NonNullable<Selection>;
  profile: Profile;
  board: BoardTile[];
  onSelect: (s: Selection) => void;
}) {
  if (selection.type === "draw") {
    return <DrawCard deck={selection.deck} text={selection.text} />;
  }

  if (selection.type === "deck") {
    return selection.deck === "projects" ? (
      <ProjectList profile={profile} onSelect={onSelect} />
    ) : (
      <SkillList profile={profile} />
    );
  }

  if (selection.type === "project") {
    const project = profile.projects.find((p) => p.slug === selection.slug);
    return project ? <ProjectDeed project={project} /> : null;
  }

  const tile = board[selection.index];
  if (!tile) return null;

  if (tile.kind === "project" && tile.project)
    return <ProjectDeed project={tile.project} />;
  if (tile.kind === "skill" && tile.skill) return <SkillDeed group={tile.skill} />;
  if (tile.kind === "value" && tile.value)
    return (
      <>
        <Band color={tile.value.band} label={tile.value.label} price={tile.price} />
        <div className="px-5 py-5">
          <IconRow name={tile.value.icon} sub={tile.value.sub} />
          <p className="mt-3 text-[13.5px] leading-relaxed text-[#4a3b2c]">
            {tile.value.body}
          </p>
        </div>
      </>
    );

  switch (tile.corner) {
    case "start":
      return <AboutDeed profile={profile} />;
    case "levelup":
      return <ExperienceDeed profile={profile} />;
    case "retire":
      return <ContactDeed profile={profile} />;
    case "rest":
      return <RestDeed profile={profile} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Band({
  color,
  label,
  price,
  kicker,
}: {
  color: string;
  label: string;
  price?: string;
  kicker?: string;
}) {
  return (
    <div
      className="border-b-[3px] px-4 py-3"
      style={{ backgroundColor: color, borderColor: INK }}
    >
      {kicker && (
        <p
          className="mb-1 font-pixel text-[6.5px] tracking-wider text-white/75"
          style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.5)" }}
        >
          {kicker}
        </p>
      )}
      <div className="flex items-end justify-between gap-3">
        <h2
          className="font-pixel text-[13px] leading-tight text-white"
          style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.5)" }}
        >
          {label}
        </h2>
        {price && (
          <span
            className="shrink-0 font-pixel text-[8px] text-white/85"
            style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.5)" }}
          >
            {price}
          </span>
        )}
      </div>
    </div>
  );
}

function IconRow({ name, sub }: { name: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 border-b-2 border-dashed border-[#c9b894] pb-3">
      <PixelIcon name={name} size={40} />
      <p className="font-pixel text-[8px] leading-[1.6] text-[#7a6448]">{sub}</p>
    </div>
  );
}

function Stars({ level }: { level: number }) {
  return (
    <span className="flex gap-[2px]" aria-label={`${level} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= level ? "opacity-100" : "opacity-20"}>
          <PixelIcon name="star" size={11} />
        </span>
      ))}
    </span>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li
          key={t}
          className="border-[2px] border-[#2b2118] bg-[#e8dcc0] px-1.5 py-[3px] font-pixel text-[6.5px] text-[#4a3b2c]"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function PixelButton({
  href,
  children,
  color = INK,
}: {
  href: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 border-[2px] px-3 py-2 font-pixel text-[7px] text-[#f4ead3] transition-transform hover:-translate-y-[2px] active:translate-y-0"
      style={{
        backgroundColor: color,
        borderColor: INK,
        boxShadow: `0 3px 0 ${INK}`,
      }}
    >
      {children}
    </a>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 font-pixel text-[7.5px] tracking-wider text-[#7a6448] uppercase">
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* Deeds                                                               */
/* ------------------------------------------------------------------ */

function ProjectDeed({ project }: { project: Project }) {
  return (
    <>
      <Band
        color={project.accent}
        label={project.name.toUpperCase()}
        kicker="Project Card"
      />
      <div className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-dashed border-[#c9b894] pb-3 font-pixel text-[6.5px] text-[#7a6448]">
          <span>{project.year}</span>
          <span>·</span>
          <span>{project.role}</span>
        </div>

        <p className="text-[13.5px] leading-relaxed whitespace-pre-line text-[#3d3125]">
          {project.description}
        </p>

        {project.highlights.length > 0 && (
          <div>
            <SectionTitle>Highlights</SectionTitle>
            <ul className="space-y-1.5">
              {project.highlights.map((h) => (
                <li
                  key={h}
                  className="flex gap-2 text-[13px] leading-snug text-[#4a3b2c]"
                >
                  <span
                    aria-hidden
                    className="mt-[6px] h-[6px] w-[6px] shrink-0"
                    style={{ backgroundColor: project.accent }}
                  />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <SectionTitle>Tech Stack</SectionTitle>
          <Chips items={project.tech} />
        </div>

        {(project.live || project.repo) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {project.live && (
              <PixelButton href={project.live} color={project.accent}>
                VISIT SITE
              </PixelButton>
            )}
            {project.repo && <PixelButton href={project.repo}>SOURCE</PixelButton>}
          </div>
        )}
      </div>
    </>
  );
}

function SkillDeed({ group }: { group: SkillGroup }) {
  return (
    <>
      <Band color="#7b4fa8" label={group.category.toUpperCase()} kicker="Skill Deed" />
      <div className="px-5 py-5">
        <IconRow name="star" sub={group.summary} />
        <ul className="mt-4 space-y-2">
          {group.items.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] text-[#3d3125]">{s.name}</span>
              <Stars level={s.level} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function AboutDeed({ profile }: { profile: Profile }) {
  return (
    <>
      <Band color="#3f8f4e" label="START" kicker="Every journey begins here" />
      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <PixelIcon name="person" size={52} />
          <div>
            <h3 className="font-pixel text-[11px] text-[#2b2118]">{profile.name}</h3>
            <p className="mt-1 font-pixel text-[6.5px] text-[#7a6448]">
              {profile.role}
            </p>
          </div>
        </div>

        <p className="border-y-2 border-dashed border-[#c9b894] py-3 text-[13.5px] leading-relaxed text-[#3d3125] italic">
          “{profile.tagline}”
        </p>

        <p className="text-[13.5px] leading-relaxed whitespace-pre-line text-[#4a3b2c]">
          {profile.bio}
        </p>

        <div>
          <SectionTitle>By the numbers</SectionTitle>
          <ul className="grid grid-cols-2 gap-2">
            {profile.stats.map((s) => (
              <li
                key={s.label}
                className="border-[2px] border-[#2b2118] bg-[#e8dcc0] px-2 py-2"
              >
                <p className="font-pixel text-[10px] text-[#2b2118]">{s.value}</p>
                <p className="mt-1 text-[10.5px] leading-tight text-[#7a6448]">
                  {s.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function ExperienceDeed({ profile }: { profile: Profile }) {
  return (
    <>
      <Band color="#e0a02e" label="LEVEL UP!" kicker="The road so far" />
      <div className="space-y-5 px-5 py-5">
        <div>
          <SectionTitle>Experience</SectionTitle>
          <ol className="space-y-3">
            {profile.experience.map((e) => (
              <li
                key={`${e.org}-${e.period}`}
                className="border-l-[3px] border-[#e0a02e] pl-3"
              >
                <p className="font-pixel text-[8px] text-[#2b2118]">{e.role}</p>
                <p className="mt-1 text-[11.5px] text-[#7a6448]">
                  {e.org} · {e.period}
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-[#4a3b2c]">
                  {e.summary}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {profile.education.length > 0 && (
          <div>
            <SectionTitle>Education</SectionTitle>
            <ul className="space-y-2">
              {profile.education.map((e) => (
                <li key={e.degree} className="flex items-start gap-2.5">
                  <PixelIcon name="cap" size={20} />
                  <div>
                    <p className="text-[13px] text-[#3d3125]">{e.degree}</p>
                    <p className="text-[11.5px] text-[#7a6448]">
                      {e.org} · {e.period}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

function ContactDeed({ profile }: { profile: Profile }) {
  return (
    <>
      <Band color="#2e8b8b" label="RETIRE" kicker="Enjoy the freedom you built" />
      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <PixelIcon name="palm" size={44} />
          <p className="text-[13.5px] leading-snug text-[#3d3125]">
            {profile.availability} · {profile.location}
          </p>
        </div>

        <div>
          <SectionTitle>Let&apos;s connect</SectionTitle>
          <ul className="space-y-2">
            {profile.links.map((l) => (
              <li key={l.kind}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 border-[2px] border-[#2b2118] bg-[#e8dcc0] px-3 py-2 transition hover:-translate-y-[2px] hover:bg-[#2b2118] hover:text-[#f4ead3]"
                >
                  <span className="font-pixel text-[7px]">{l.label}</span>
                  <span className="truncate text-[12px]">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function RestDeed({ profile }: { profile: Profile }) {
  return (
    <>
      <Band color="#3a6ea5" label="REST" kicker="Take a break, recharge" />
      <div className="px-5 py-5">
        <IconRow name="sleep" sub="Off the clock" />
        <ul className="mt-4 space-y-2.5">
          {profile.offbeat.map((o) => (
            <li key={o} className="flex gap-2.5 text-[13.5px] text-[#4a3b2c]">
              <span aria-hidden className="mt-[7px] h-[6px] w-[6px] bg-[#3a6ea5]" />
              {o}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ProjectList({
  profile,
  onSelect,
}: {
  profile: Profile;
  onSelect: (s: Selection) => void;
}) {
  return (
    <>
      <Band color="#3a6ea5" label="PROJECTS" kicker="See what I've built" price={`${profile.projects.length}`} />
      <ul className="divide-y-2 divide-dashed divide-[#c9b894]">
        {profile.projects.map((p) => (
          <li key={p.slug}>
            <button
              onClick={() => onSelect({ type: "project", slug: p.slug })}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#e8dcc0]"
            >
              <span
                aria-hidden
                className="h-9 w-[6px] shrink-0"
                style={{ backgroundColor: p.accent }}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-pixel text-[8px] text-[#2b2118]">
                  {p.name}
                </span>
                <span className="mt-1 block truncate text-[12px] text-[#7a6448]">
                  {p.blurb}
                </span>
              </span>
              <span className="font-pixel text-[8px] text-[#7a6448]">›</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function SkillList({ profile }: { profile: Profile }) {
  return (
    <>
      <Band color="#7b4fa8" label="SKILLS" kicker="Tools of the trade" />
      <div className="space-y-5 px-5 py-5">
        {profile.skills.map((g) => (
          <div key={g.category}>
            <SectionTitle>{g.category}</SectionTitle>
            <ul className="space-y-1.5">
              {g.items.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-[#3d3125]">{s.name}</span>
                  <Stars level={s.level} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

function DrawCard({ deck, text }: { deck: "chance" | "chest"; text: string }) {
  const isChance = deck === "chance";
  return (
    <>
      <Band
        color={isChance ? "#c2382e" : "#3a6ea5"}
        label={isChance ? "CHANCE" : "COMMUNITY CHEST"}
      />
      <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
        <PixelIcon name={isChance ? "question" : "chest"} size={64} />
        <p className="font-pixel text-[9px] leading-[1.9] text-[#3d3125]">{text}</p>
      </div>
    </>
  );
}
