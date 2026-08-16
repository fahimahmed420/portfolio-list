"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Profile } from "@/data/types";
import { usePanZoom } from "@/lib/usePanZoom";
import { PixelIcon } from "./PixelIcons";
import Tile from "./Tile";
import { DeedModal, type Selection } from "./Deed";
import {
  buildBoard,
  CHANCE_CARDS,
  CHEST_CARDS,
  COLS,
  ROWS,
  TILE_COUNT,
} from "./tiles";

const CELL = 140;
const FRAME = 18;
const BOARD_W = COLS * CELL;
const BOARD_H = ROWS * CELL;
const CONTENT_W = BOARD_W + FRAME * 2;
const CONTENT_H = BOARD_H + FRAME * 2;

const INK = "#2b2118";
const PAPER = "#f4ead3";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const d6 = () => 1 + Math.floor(Math.random() * 6);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

export default function Devopoly({ profile }: { profile: Profile }) {
  const board = useMemo(() => buildBoard(profile), [profile]);
  const [selection, setSelection] = useState<Selection>(null);
  const [tokenAt, setTokenAt] = useState(0);
  const [dice, setDice] = useState<[number, number]>([3, 4]);
  const [rolling, setRolling] = useState(false);
  /* Only offer the touch hint to touch devices — it read as nonsense on desktop. */
  const [hintOpen, setHintOpen] = useState(false);
  useEffect(() => {
    setHintOpen(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  /* House rule: every lap of the board pays out, the way passing GO does. */
  const [bank, setBank] = useState(1500);
  const [laps, setLaps] = useState(0);
  const alive = useRef(true);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const { containerRef, scale, zoomIn, zoomOut, fit } = usePanZoom({
    contentWidth: CONTENT_W,
    contentHeight: CONTENT_H,
    padding: 28,
    minScale: 0.2,
    maxScale: 2,
  });

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /* Stable, so the modal's focus trap doesn't tear down and rebuild each render. */
  const closeDeed = useCallback(() => setSelection(null), []);

  const roll = useCallback(async () => {
    if (rolling) return;
    setRolling(true);
    setHintOpen(false);
    try {
      await runRoll();
    } finally {
      // Must always clear, or an interrupted roll leaves the button dead.
      setRolling(false);
    }

    async function runRoll() {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const a = d6();
    const b = d6();

    if (!reduced) {
      for (let i = 0; i < 8; i++) {
        if (!alive.current) return;
        setDice([d6(), d6()]);
        await sleep(70);
      }
    }
    if (!alive.current) return;
    setDice([a, b]);
    await sleep(reduced ? 0 : 280);

    let pos = tokenAt;
    let passedStart = false;
    if (reduced) {
      passedStart = tokenAt + a + b >= TILE_COUNT;
      pos = (pos + a + b) % TILE_COUNT;
      setTokenAt(pos);
    } else {
      for (let i = 0; i < a + b; i++) {
        if (!alive.current) return;
        pos = (pos + 1) % TILE_COUNT;
        if (pos === 0) passedStart = true;
        setTokenAt(pos);
        await sleep(165);
      }
      await sleep(260);
    }

    if (passedStart) {
      setBank((v) => v + 200);
      setLaps((v) => v + 1);
    }

    if (!alive.current) return;
    setSelection({ type: "tile", index: pos });
    }
  }, [rolling, tokenAt]);

  /* Arrow keys walk the perimeter, so the board is navigable without a mouse. */
  const onBoardKeyDown = (e: React.KeyboardEvent) => {
    const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!forward && !back) return;
    const active = document.activeElement as HTMLElement | null;
    const current = Number(active?.dataset?.tileIndex ?? "-1");
    if (Number.isNaN(current) || current < 0) return;
    e.preventDefault();
    const next = (current + (forward ? 1 : -1) + TILE_COUNT) % TILE_COUNT;
    boardRef.current
      ?.querySelector<HTMLElement>(`[data-tile-index="${next}"]`)
      ?.focus();
  };

  return (
    <div
      className="relative h-dvh w-full overflow-hidden"
      style={{
        // Photographed walnut, tiled (ART-PROMPTS A2), over the old gradient as
        // a fallback if the texture ever fails to load.
        backgroundColor: "#4a2c12",
        backgroundImage: "url(/art/wood.webp)",
        backgroundSize: "620px",
      }}
    >
      {/* Vignette — pushes focus to the middle of the table. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Board viewport. Inset on wide screens so the side panels get gutters. */}
      <div
        ref={containerRef}
        className="no-scrollbar absolute inset-0 z-[2] grid overflow-auto xl:left-[196px] xl:right-[196px]"
        style={{ touchAction: "pan-x pan-y" }}
      >
        <div
          className="m-auto"
          style={{ width: CONTENT_W * scale, height: CONTENT_H * scale }}
        >
          <div
            style={{
              width: CONTENT_W,
              height: CONTENT_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              className="h-full w-full border-[6px] shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              style={{
                borderColor: "#1c1410",
                background: "linear-gradient(150deg, #2f4f3a, #26402f)",
                padding: FRAME - 6,
              }}
            >
              <div
                ref={boardRef}
                onKeyDown={onBoardKeyDown}
                role="group"
                aria-label="Devopoly board"
                className="grid h-full w-full gap-0"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
                  gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
                  backgroundColor: PAPER,
                }}
              >
                {board.map((tile) => (
                  <Tile
                    key={tile.index}
                    tile={tile}
                    hasToken={tokenAt === tile.index}
                    onOpen={() => setSelection({ type: "tile", index: tile.index })}
                  />
                ))}

                <CenterPanel
                  profile={profile}
                  dice={dice}
                  rolling={rolling}
                  bank={bank}
                  laps={laps}
                  onRoll={roll}
                  onSelect={setSelection}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <HowToPlay />
      <StatsClipboard profile={profile} />
      <ConnectCard profile={profile} />

      {/* Bottom-left: clear of the shared chrome and of the table-side props. */}
      <div className="absolute bottom-4 left-3 z-40 flex flex-col gap-1.5">
        <ZoomBtn onClick={zoomIn} label="Zoom in">
          +
        </ZoomBtn>
        <ZoomBtn onClick={zoomOut} label="Zoom out">
          −
        </ZoomBtn>
        <ZoomBtn onClick={fit} label="Fit board to screen">
          ⤢
        </ZoomBtn>
      </div>

      {hintOpen && (
        <button
          onClick={() => setHintOpen(false)}
          className="absolute top-3 left-1/2 z-40 -translate-x-1/2 border-2 px-3 py-1.5 font-pixel text-[6.5px] leading-relaxed text-[#f4ead3]"
          style={{ backgroundColor: "rgba(28,20,16,0.85)", borderColor: "#7a6448" }}
        >
          PINCH TO ZOOM · DRAG TO PAN · TAP A TILE
        </button>
      )}

      <DeedModal
        selection={selection}
        profile={profile}
        board={board}
        onClose={closeDeed}
        onSelect={setSelection}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Centre panel                                                        */
/* ------------------------------------------------------------------ */

function CenterPanel({
  profile,
  dice,
  rolling,
  bank,
  laps,
  onRoll,
  onSelect,
}: {
  profile: Profile;
  dice: [number, number];
  rolling: boolean;
  bank: number;
  laps: number;
  onRoll: () => void;
  onSelect: (s: Selection) => void;
}) {
  return (
    <div
      style={{ gridColumn: "2 / 8", gridRow: "2 / 6", borderColor: INK }}
      className="relative flex flex-col overflow-hidden border-[2px] px-7 py-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(120,90,50,0.6) 0 1px, transparent 1px), radial-gradient(circle at 75% 70%, rgba(120,90,50,0.5) 0 1px, transparent 1px)",
          backgroundSize: "9px 9px, 14px 14px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 text-center">
        <p className="font-pixel text-[8px] tracking-[0.3em] text-[#7a6448]">
          WELCOME TO
        </p>
        <h1
          className="mt-3 font-pixel text-[52px] leading-none text-[#f0b03a]"
          style={{
            textShadow:
              "3px 0 0 #2b2118, -3px 0 0 #2b2118, 0 -3px 0 #2b2118, 0 3px 0 #2b2118, 0 7px 0 #8a5a2b, 0 11px 0 #2b2118",
          }}
        >
          DEVOPOLY
        </h1>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-[2px] w-16 bg-[#c9b894]" />
          <p className="font-pixel text-[8px] tracking-wide text-[#4a3b2c]">
            ★ THE GAME OF BUILDING IDEAS ★
          </p>
          <span className="h-[2px] w-16 bg-[#c9b894]" />
        </div>
      </div>

      {/* Middle */}
      {/* items-center, not items-start — the columns are uneven, and hugging the
          top left a band of dead paper above the contact strip. */}
      <div className="relative z-10 mt-5 flex flex-1 items-center justify-between gap-5">
        <div className="flex w-[188px] shrink-0 flex-col gap-3">
          <Deck
            color="#3a6ea5"
            title="PROJECTS"
            sub="See what I've built"
            icon="laptop"
            onClick={() => onSelect({ type: "deck", deck: "projects" })}
          />
          <Deck
            color="#c2382e"
            title="SKILLS"
            sub="Tools of the trade"
            icon="star"
            onClick={() => onSelect({ type: "deck", deck: "skills" })}
          />
        </div>

        <div className="flex flex-1 flex-col items-center gap-3 pt-1">
          <Desk />
          <div className="flex gap-2">
            <MiniDeck
              label="CHANCE"
              color="#c2382e"
              icon="question"
              onClick={() =>
                onSelect({ type: "draw", deck: "chance", text: pick(CHANCE_CARDS) })
              }
            />
            <MiniDeck
              label="CHEST"
              color="#3a6ea5"
              icon="chest"
              onClick={() =>
                onSelect({ type: "draw", deck: "chest", text: pick(CHEST_CARDS) })
              }
            />
          </div>
        </div>

        <div className="flex w-[188px] shrink-0 flex-col items-end gap-3">
          <StickyNote profile={profile} />
          <Ledger bank={bank} laps={laps} />
          <DiceBox dice={dice} rolling={rolling} onRoll={onRoll} />
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 border-2 border-dashed border-[#c9b894] px-4 py-2.5 text-[11px] text-[#4a3b2c]">
          <Fact icon="palm" text={profile.location} />
          <Fact icon="doc" text={profile.availability} />
          {profile.links
            .filter((l) => l.kind === "email" || l.kind === "site")
            .map((l) => (
              <Fact key={l.kind} icon={l.kind === "email" ? "megaphone" : "cloud"} text={l.handle} />
            ))}
        </div>
        <p className="mt-2.5 text-center font-pixel text-[7.5px] tracking-wide text-[#7a6448]">
          COLLECT EXPERIENCE · BUILD PROJECTS · LEVEL UP
        </p>
      </div>
    </div>
  );
}

function Fact({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <PixelIcon name={icon} size={14} />
      {text}
    </span>
  );
}

function Deck({
  color,
  title,
  sub,
  icon,
  onClick,
}: {
  color: string;
  title: string;
  sub: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute top-[5px] left-[5px] h-full w-full border-[2px]"
        style={{ borderColor: INK, backgroundColor: color, opacity: 0.55 }}
      />
      <span
        aria-hidden
        className="absolute top-[2.5px] left-[2.5px] h-full w-full border-[2px]"
        style={{ borderColor: INK, backgroundColor: color, opacity: 0.8 }}
      />
      <button
        onClick={onClick}
        className="relative flex w-full flex-col items-center gap-2 border-[2px] px-3 py-3 transition-transform hover:-translate-y-[3px]"
        style={{ borderColor: INK, backgroundColor: color }}
      >
        <span
          className="font-pixel text-[10px] text-white"
          style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.5)" }}
        >
          {title}
        </span>
        <span className="border-[2px] border-[#2b2118]/30 bg-white/15 p-1.5">
          <PixelIcon name={icon} size={30} />
        </span>
        <span className="text-center text-[10px] text-white/85">{sub}</span>
      </button>
    </div>
  );
}

function MiniDeck({
  label,
  color,
  icon,
  onClick,
}: {
  label: string;
  color: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 border-[2px] px-2.5 py-1.5 transition-transform hover:-translate-y-[2px]"
      style={{ borderColor: INK, backgroundColor: color }}
    >
      <PixelIcon name={icon} size={16} />
      <span
        className="font-pixel text-[6.5px] text-white"
        style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.5)" }}
      >
        {label}
      </span>
    </button>
  );
}

/**
 * The desk scene.
 *
 * Illustrated (see docs/ART-PROMPTS.md A1) — the CSS-and-icon composite this
 * replaced never read as a person at a desk. `pixelated` is essential: without
 * it the browser smooths the sprite and the whole pixel-art effect dies.
 */
function Desk() {
  return (
    <div className="relative flex w-full max-w-[248px] flex-col items-center">
      <img
        src="/art/devopoly-desk.webp"
        alt=""
        aria-hidden
        className="w-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

function StickyNote({ profile }: { profile: Profile }) {
  return (
    <div
      className="w-full -rotate-2 border-[2px] px-3 py-2.5 shadow-[3px_4px_0_rgba(0,0,0,0.25)]"
      style={{ borderColor: INK, backgroundColor: "#f7e08a" }}
    >
      <p className="font-pixel text-[7.5px] text-[#4a3b2c]">ABOUT ME</p>
      <p className="mt-2 text-[11px] leading-[1.5] text-[#3d3125]">
        {profile.bioShort}
      </p>
    </div>
  );
}

/** Bank and laps — the only persistent state a round of the board keeps. */
function Ledger({ bank, laps }: { bank: number; laps: number }) {
  return (
    <div
      className="flex w-full items-center justify-between gap-2 border-[2px] px-2.5 py-1.5"
      style={{ borderColor: INK, backgroundColor: "#e8dcc0" }}
    >
      <span className="font-pixel text-[6.5px] text-[#7a6448]">BANK</span>
      <motion.span
        key={bank}
        initial={{ scale: 1.25, color: "#3f8f4e" }}
        animate={{ scale: 1, color: "#2b2118" }}
        className="font-pixel text-[8px]"
      >
        ${bank.toLocaleString()}
      </motion.span>
      <span className="font-pixel text-[6.5px] text-[#7a6448]">
        {laps} {laps === 1 ? "LAP" : "LAPS"}
      </span>
    </div>
  );
}

function DiceBox({
  dice,
  rolling,
  onRoll,
}: {
  dice: [number, number];
  rolling: boolean;
  onRoll: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-end gap-2">
      <div className="flex gap-2">
        <Die value={dice[0]} rolling={rolling} />
        <Die value={dice[1]} rolling={rolling} />
      </div>
      <button
        onClick={onRoll}
        disabled={rolling}
        className="w-full border-[2px] px-3 py-2 font-pixel text-[8px] text-[#f4ead3] transition-transform hover:-translate-y-[2px] active:translate-y-0 disabled:opacity-60"
        style={{
          borderColor: INK,
          backgroundColor: rolling ? "#7a6448" : "#c2382e",
          boxShadow: `0 3px 0 ${INK}`,
        }}
      >
        {rolling ? "ROLLING…" : "ROLL DICE"}
      </button>
      <p className="text-center text-[9.5px] leading-tight text-[#7a6448]">
        or click any tile
      </p>
    </div>
  );
}

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  const on = PIPS[value] ?? PIPS[1];
  return (
    <motion.div
      animate={rolling ? { rotate: [0, -14, 12, 0], y: [0, -5, 0] } : { rotate: 0 }}
      transition={{ duration: 0.32, repeat: rolling ? Infinity : 0 }}
      className="grid h-[38px] w-[38px] grid-cols-3 grid-rows-3 gap-[2px] border-[2px] p-[4px]"
      style={{
        borderColor: INK,
        backgroundColor: "#f7f4ec",
        boxShadow: `0 3px 0 ${INK}`,
      }}
      aria-label={`Die showing ${value}`}
      role="img"
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="h-full w-full rounded-[1px]"
          style={{ backgroundColor: on.includes(i) ? INK : "transparent" }}
        />
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Table-side props (wide screens only)                                */
/* ------------------------------------------------------------------ */

function HowToPlay() {
  const steps = [
    "Explore the board to know the journey",
    "Click any property to learn more",
    "Or roll the dice for a guided tour",
    "Land on RETIRE to get in touch",
  ];
  return (
    <aside className="absolute top-1/2 left-5 z-30 hidden w-[176px] -translate-y-1/2 xl:block">
      <div
        className="border-[3px] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
        style={{ borderColor: INK, backgroundColor: PAPER }}
      >
        <div className="mb-3 flex justify-center gap-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className="h-2.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#8d99a6" }}
            />
          ))}
        </div>
        <h2 className="font-pixel text-[9px] text-[#2b2118]">HOW TO PLAY</h2>
        <span className="mt-2 mb-3 block h-[2px] w-full bg-[#c9b894]" />
        <ol className="space-y-2.5">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-2 text-[11.5px] leading-snug text-[#4a3b2c]">
              <span className="font-pixel text-[7px] text-[#7a6448]">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}

function StatsClipboard({ profile }: { profile: Profile }) {
  const top = profile.skills.slice(0, 6);
  return (
    <aside className="absolute top-6 right-5 z-30 hidden w-[176px] xl:block">
      <div
        className="border-[3px] px-4 pt-6 pb-4 shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
        style={{ borderColor: INK, backgroundColor: "#c8a06a" }}
      >
        <span
          className="absolute top-[-10px] left-1/2 h-5 w-16 -translate-x-1/2 border-[3px]"
          style={{ borderColor: INK, backgroundColor: "#8d99a6" }}
        />
        <div
          className="border-[2px] px-3 py-3"
          style={{ borderColor: INK, backgroundColor: PAPER }}
        >
          <h2 className="text-center font-pixel text-[9px] text-[#2b2118]">MY STATS</h2>
          <span className="mt-2 mb-3 block h-[2px] w-full bg-[#c9b894]" />
          <ul className="space-y-2">
            {top.map((g) => {
              const avg = Math.round(
                g.items.reduce((a, s) => a + s.level, 0) / Math.max(g.items.length, 1),
              );
              return (
                <li key={g.category} className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] text-[#4a3b2c]">
                    {g.category}
                  </span>
                  {/* Pips, not stars — a 10px star turns to mush at this size. */}
                  <span
                    className="flex shrink-0 gap-[2px]"
                    aria-label={`${avg} out of 5`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="h-[7px] w-[7px] border"
                        style={{
                          borderColor: "#7a6448",
                          backgroundColor: n <= avg ? "#c2382e" : "transparent",
                        }}
                      />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function ConnectCard({ profile }: { profile: Profile }) {
  return (
    <aside className="absolute right-5 bottom-6 z-30 hidden w-[176px] xl:block">
      <div
        className="border-[3px] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
        style={{ borderColor: INK, backgroundColor: PAPER }}
      >
        <h2 className="font-pixel text-[9px] text-[#2b2118]">LET&apos;S CONNECT</h2>
        <span className="mt-2 mb-3 block h-[2px] w-full bg-[#c9b894]" />
        <ul className="space-y-2">
          {profile.links.map((l) => (
            <li key={l.kind}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] text-[#4a3b2c] transition hover:text-[#c2382e]"
              >
                <span
                  aria-hidden
                  className="h-[7px] w-[7px] shrink-0"
                  style={{ backgroundColor: "#c2382e" }}
                />
                <span className="truncate">{l.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function ZoomBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center border-2 text-[15px] text-[#f4ead3] transition hover:bg-[#c2382e]"
      style={{ borderColor: "#7a6448", backgroundColor: "rgba(28,20,16,0.85)" }}
    >
      {children}
    </button>
  );
}
