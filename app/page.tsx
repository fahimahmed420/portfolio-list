import { designs } from "@/designs/registry";
import { profile } from "@/data/profile";
import GalleryGrid from "@/components/GalleryGrid";

export default function GalleryPage() {
  return (
    <main className="relative min-h-dvh">
      {/* Faint grid, so the page reads as a drawing board rather than a void. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-24 sm:px-8 sm:pt-24">
        <header className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.22em] text-shell-accent uppercase">
            {designs.length} designs · one content file
          </p>
          <h1 className="mt-5 text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
            Portfolio designs,
            <br />
            ready to wear.
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-shell-dim">
            Each design is a complete portfolio driven by the same content file.
            Pick one, edit{" "}
            <code className="rounded bg-shell-raised px-1.5 py-0.5 font-mono text-[14px] text-shell-text">
              data/profile.ts
            </code>
            , and it&apos;s yours — no design code to touch.
          </p>

          <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-shell-line bg-shell-raised px-3.5 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-shell-accent" />
            <p className="text-[13px] text-shell-dim">
              Everything shown belongs to{" "}
              <span className="text-shell-text">{profile.name}</span>, a
              placeholder person. No real data here.
            </p>
          </div>
        </header>

        <GalleryGrid designs={designs} />

        <footer className="mt-20 border-t border-shell-line pt-8">
          <p className="max-w-2xl text-[14px] leading-relaxed text-shell-dim">
            Adding a fifth design means creating{" "}
            <code className="font-mono text-[13px] text-shell-text">
              designs/&lt;slug&gt;/
            </code>{" "}
            with a <code className="font-mono text-[13px]">meta.ts</code> and an{" "}
            <code className="font-mono text-[13px]">index.tsx</code> that takes a{" "}
            <code className="font-mono text-[13px]">Profile</code> — then one line
            in the registry. The gallery, routing and metadata follow on their own.
          </p>
        </footer>
      </div>
    </main>
  );
}
