"use client";

import { motion } from "framer-motion";
import { PixelIcon } from "./PixelIcons";
import type { BoardTile } from "./tiles";

/** Long labels need a smaller pixel size — the font is very wide. */
function labelSize(label: string) {
  if (label.length > 13) return "text-[5.5px]";
  if (label.length > 10) return "text-[6.5px]";
  return "text-[7.5px]";
}

export default function Tile({
  tile,
  hasToken,
  onOpen,
}: {
  tile: BoardTile;
  hasToken: boolean;
  onOpen: () => void;
}) {
  const isCorner = tile.kind === "corner";

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ gridColumn: tile.grid.col, gridRow: tile.grid.row }}
      data-tile-index={tile.index}
      aria-label={`${tile.label}. ${tile.sub}`}
      className="group relative flex flex-col overflow-hidden border-[2px] border-[#2b2118] bg-[#f4ead3] text-[#2b2118] transition-transform duration-150 hover:z-20 hover:-translate-y-[3px] hover:shadow-[0_6px_0_rgba(43,33,24,0.35)] focus-visible:z-20 focus-visible:outline-[3px] focus-visible:outline-[#2b2118]"
    >
      {/* Colour band. Corners have none — they read as anchors, not property. */}
      {!isCorner && (
        <div
          className="flex min-h-[24px] items-center justify-center border-b-[2px] border-[#2b2118] px-1 py-[5px]"
          style={{ backgroundColor: tile.band }}
        >
          <span
            className={`font-pixel leading-none text-white ${labelSize(tile.label)}`}
            style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.55)" }}
          >
            {tile.label}
          </span>
        </div>
      )}

      <div
        className={`flex flex-1 flex-col items-center justify-center gap-1 px-1.5 ${
          isCorner ? "py-2" : "py-1"
        }`}
      >
        <PixelIcon name={tile.icon} size={isCorner ? 46 : 32} />

        {isCorner && (
          <span className="font-pixel text-[8px] leading-none text-[#2b2118]">
            {tile.label}
          </span>
        )}

        {/* Three lines, not two — project blurbs were truncating mid-word. */}
        <span
          className={`text-center font-sans leading-[1.2] text-[#4a3b2c] ${
            isCorner ? "line-clamp-2 text-[8px]" : "line-clamp-3 text-[8.5px]"
          }`}
        >
          {tile.sub}
        </span>

        {tile.price && (
          <span className="font-pixel text-[7px] leading-none text-[#7a6448]">
            {tile.price}
          </span>
        )}
      </div>

      {/* Paper grain, so every tile isn't a flat swatch. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(120,90,50,0.5) 0 1px, transparent 1px), radial-gradient(circle at 70% 65%, rgba(120,90,50,0.4) 0 1px, transparent 1px)",
          backgroundSize: "7px 7px, 11px 11px",
        }}
      />

      {hasToken && (
        <motion.span
          layoutId="devopoly-token"
          transition={{ type: "spring", stiffness: 520, damping: 34 }}
          className="pointer-events-none absolute right-1.5 bottom-1.5 z-30"
        >
          <Token />
        </motion.span>
      )}
    </button>
  );
}

/** A Monopoly-ish pawn, drawn as pixels. */
export function Token({ size = 22 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 12 14"
      width={size}
      height={size}
      className="crisp drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]"
      aria-hidden
    >
      {[
        ["4", "1", "4", "1"],
        ["3", "2", "6", "1"],
        ["3", "3", "6", "1"],
        ["4", "4", "4", "1"],
        ["4", "5", "4", "1"],
        ["3", "6", "6", "1"],
        ["3", "7", "6", "1"],
        ["2", "8", "8", "1"],
        ["2", "9", "8", "1"],
        ["1", "10", "10", "1"],
        ["1", "11", "10", "1"],
        ["2", "12", "8", "1"],
      ].map(([x, y, w, h], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          fill={i < 4 ? "#e05a3a" : i < 8 ? "#c2382e" : "#9c2a21"}
        />
      ))}
      <rect x="4" y="2" width="2" height="1" fill="#f08a6a" />
      <rect x="3" y="8" width="2" height="1" fill="#e05a3a" />
    </svg>
  );
}
