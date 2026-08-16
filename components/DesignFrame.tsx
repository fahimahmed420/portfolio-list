"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DesignMeta } from "@/designs/types";

/**
 * Design-agnostic chrome that floats above a design: back to gallery,
 * previous/next design, and a hide toggle (press H) so a design can be
 * viewed or screenshotted completely clean.
 *
 * Deliberately neutral — a translucent dark pill reads correctly over both
 * the dark designs and the light editorial one.
 */
export default function DesignFrame({
  meta,
  prev,
  next,
}: {
  meta: DesignMeta;
  prev?: DesignMeta;
  next?: DesignMeta;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Never steal the key while someone is typing into a design.
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "h" || e.key === "H") setHidden((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-3 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-sans text-[11px] text-white/60 backdrop-blur-md transition hover:text-white"
      >
        show chrome · H
      </button>
    );
  }

  return (
    <nav
      aria-label="Design navigation"
      className="fixed bottom-4 left-1/2 z-[100] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-black/65 p-1 font-sans text-white shadow-2xl shadow-black/50 backdrop-blur-md"
    >
      {/* Every control clears 40px of height — this bar is the one piece of UI
          that appears on all 21 designs, so its tap targets fail everywhere. */}
      <Link
        href="/"
        className="flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M5 1.5 1.5 6 5 10.5M1.5 6H11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline">Gallery</span>
      </Link>

      <span className="h-4 w-px bg-white/15" />

      <span className="px-2 text-[12px] font-semibold whitespace-nowrap">
        {meta.name}
      </span>

      <span className="h-4 w-px bg-white/15" />

      <div className="flex items-center">
        {prev && (
          <Link
            href={`/d/${prev.slug}`}
            title={`Previous: ${prev.name}`}
            aria-label={`Previous design: ${prev.name}`}
            className="grid min-h-[40px] min-w-[40px] place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M7.5 2 3.5 6l4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
        {next && (
          <Link
            href={`/d/${next.slug}`}
            title={`Next: ${next.name}`}
            aria-label={`Next design: ${next.name}`}
            className="grid min-h-[40px] min-w-[40px] place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M4.5 2l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>

      <span className="h-4 w-px bg-white/15" />

      <button
        onClick={() => setHidden(true)}
        title="Hide chrome (H)"
        className="grid min-h-[40px] place-items-center rounded-full px-3 text-[11px] text-white/50 transition hover:bg-white/10 hover:text-white"
      >
        hide
      </button>
    </nav>
  );
}
