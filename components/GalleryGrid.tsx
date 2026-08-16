"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DesignMeta } from "@/designs/types";
import Poster from "./Poster";

/**
 * Twenty-one cards is past the point where a flat grid is browsable, so the
 * gallery filters by tag. Tags come from the registry rather than a hardcoded
 * list, so adding a design with a new tag surfaces the filter automatically.
 */
export default function GalleryGrid({ designs }: { designs: DesignMeta[] }) {
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of designs) {
      for (const t of d.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n > 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [designs]);

  const shown = tag ? designs.filter((d) => d.tags.includes(tag)) : designs;

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-2 sm:mt-12">
        <button
          onClick={() => setTag(null)}
          aria-pressed={tag === null}
          className={`min-h-[44px] rounded-full border px-3.5 font-mono text-[12px] transition ${
            tag === null
              ? "border-shell-accent bg-shell-accent/15 text-shell-accent"
              : "border-shell-line text-shell-dim hover:border-shell-dim/60 hover:text-shell-text"
          }`}
        >
          all {designs.length}
        </button>
        {tags.map(([t, n]) => (
          <button
            key={t}
            onClick={() => setTag(tag === t ? null : t)}
            aria-pressed={tag === t}
            className={`min-h-[44px] rounded-full border px-3.5 font-mono text-[12px] transition ${
              tag === t
                ? "border-shell-accent bg-shell-accent/15 text-shell-accent"
                : "border-shell-line text-shell-dim hover:border-shell-dim/60 hover:text-shell-text"
            }`}
          >
            {t} <span className="opacity-50">{n}</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-4 font-mono text-[12px] text-shell-dim">
        {shown.length} {shown.length === 1 ? "design" : "designs"}
        {tag ? ` tagged “${tag}”` : ""}
      </p>

      <section className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((d) => (
          <Link
            key={d.slug}
            href={`/d/${d.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-shell-line bg-shell-raised transition-all duration-200 hover:-translate-y-1 hover:border-shell-dim/50 hover:shadow-2xl hover:shadow-black/40"
          >
            <div className="relative aspect-[16/10] overflow-hidden border-b border-shell-line">
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
                <Poster kind={d.poster} />
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[19px] font-semibold tracking-[-0.01em]">
                  {d.name}
                </h2>
                <span className="flex shrink-0 gap-1 pt-1.5">
                  {d.palette.map((c) => (
                    <span
                      key={c}
                      className="h-3 w-3 rounded-full ring-1 ring-black/40"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
              </div>

              <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-shell-dim">
                {d.pitch}
              </p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {d.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-shell-line px-2.5 py-1 font-mono text-[11px] text-shell-dim"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <p className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-shell-accent">
                Open design
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </p>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
