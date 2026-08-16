import { coord } from "@/lib/derive";

/**
 * Gallery thumbnails, drawn rather than screenshotted.
 *
 * Each poster abstracts its design's composition — the board's perimeter, the
 * terminal's window, the arcade's horizon, the magazine's grid. Hand-drawn SVG
 * keeps the gallery to a single fast request and lets the thumbnails stay
 * crisp at any card size, which screenshots would not.
 */

const VB = { width: 320, height: 200 };

export default function Poster({ kind }: { kind: string }) {
  const common = {
    viewBox: `0 0 ${VB.width} ${VB.height}`,
    preserveAspectRatio: "xMidYMid slice" as const,
    className: "h-full w-full",
    "aria-hidden": true,
  };

  if (kind === "board") return <BoardPoster {...common} />;
  if (kind === "terminal") return <TerminalPoster {...common} />;
  if (kind === "arcade") return <ArcadePoster {...common} />;
  if (kind === "sheet") return <SheetPoster {...common} />;
  if (kind === "cards") return <CardsPoster {...common} />;
  if (kind === "tree") return <TreePoster {...common} />;
  if (kind === "device") return <DevicePoster {...common} />;
  if (kind === "claw") return <ClawPoster {...common} />;
  if (kind === "cartridge") return <CartridgePoster {...common} />;
  if (kind === "desktop") return <DesktopPoster {...common} />;
  if (kind === "corkboard") return <CorkboardPoster {...common} />;
  if (kind === "starmap") return <StarMapPoster {...common} />;
  if (kind === "newspaper") return <NewspaperPoster {...common} />;
  if (kind === "gallery") return <GalleryPoster {...common} />;
  if (kind === "album") return <AlbumPoster {...common} />;
  if (kind === "citymap") return <CityMapPoster {...common} />;
  if (kind === "inventory") return <InventoryPoster {...common} />;
  if (kind === "comic") return <ComicPoster {...common} />;
  if (kind === "departures") return <DeparturesPoster {...common} />;
  if (kind === "casino") return <CasinoPoster {...common} />;
  return <MagazinePoster {...common} />;
}

function CityMapPoster(props: P) {
  const pins = [
    { x: 58, y: 56, c: "#7ee787" },
    { x: 246, y: 48, c: "#4cc2ff" },
    { x: 92, y: 152, c: "#f2c94c" },
    { x: 258, y: 158, c: "#e8503a" },
  ];
  const missions = [
    { x: 150, y: 74, c: "#C2382E" },
    { x: 196, y: 118, c: "#7B4FA8" },
    { x: 118, y: 106, c: "#2E9E6B" },
  ];
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#1a2029" />
      <path d="M-10 140 C 60 122, 110 168, 180 152 C 250 136, 290 178, 330 164 L330 210 L-10 210 Z" fill="#12283a" />
      {[[24, 84, 46, 34], [188, 24, 42, 30], [230, 96, 40, 28]].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#1c3324" />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <rect
          key={`b${i}`}
          x={16 + (i % 8) * 38}
          y={22 + Math.floor(i / 8) * 60}
          width="22"
          height="18"
          rx="2"
          fill="#232c37"
        />
      ))}
      <g stroke="#39434f" strokeWidth="7" strokeLinecap="round">
        {[36, 96, 178].map((y) => (
          <line key={y} x1="8" y1={y} x2="312" y2={y} />
        ))}
        {[44, 128, 210, 286].map((x) => (
          <line key={x} x1={x} y1="8" x2={x} y2="192" />
        ))}
      </g>
      {missions.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r="9" fill={m.c} stroke="#0c1016" strokeWidth="2" />
      ))}
      {pins.map((p, i) => (
        <g key={i}>
          <path d={`M${p.x} ${p.y + 9} l-8 -13 a9.5 9.5 0 1 1 16 0 Z`} fill={p.c} stroke="#0c1016" strokeWidth="2" />
          <circle cx={p.x} cy={p.y - 5} r="3.4" fill="#0c1016" />
        </g>
      ))}
      {/* HUD stars */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d="M0 -6l1.8 3.9 4.2.5-3.1 2.9.9 4.2L0 3.4l-3.8 2.1.9-4.2-3.1-2.9 4.2-.5Z"
          transform={`translate(${240 + i * 16} 20)`}
          fill={i < 4 ? "#f2c94c" : "none"}
          stroke="#f2c94c"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

function InventoryPoster(props: P) {
  const PANELC = "#c6c6c6";
  const SLOTC = "#8b8b8b";
  const items = ["#C2382E", "#2E7FC2", "#7B4FA8", "#E0A02E", "#2E9E6B", "#B5651D"];
  const slot = (x: number, y: number, s = 26) => (
    <>
      <rect x={x} y={y} width={s} height={s} fill={SLOTC} />
      <rect x={x} y={y} width={s} height="3" fill="#373737" />
      <rect x={x} y={y} width="3" height={s} fill="#373737" />
      <rect x={x + s - 3} y={y} width="3" height={s} fill="#ffffff" />
      <rect x={x} y={y + s - 3} width={s} height="3" fill="#ffffff" />
    </>
  );
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#4a7ab8" />
      <rect y="96" width="320" height="104" fill="#2d5a3d" />
      <rect x="26" y="18" width="268" height="164" fill={PANELC} />
      <rect x="26" y="18" width="268" height="4" fill="#ffffff" />
      <rect x="26" y="18" width="4" height="164" fill="#ffffff" />
      <rect x="290" y="18" width="4" height="164" fill="#373737" />
      <rect x="26" y="178" width="268" height="4" fill="#373737" />
      {/* avatar box */}
      <g>{slot(40, 32, 52)}</g>
      <rect x="56" y="42" width="20" height="14" fill="#c68642" />
      <rect x="56" y="42" width="20" height="5" fill="#3b2a1a" />
      <rect x="56" y="58" width="20" height="16" fill="#3f7d4e" />
      {/* item grid */}
      {Array.from({ length: 18 }, (_, i) => {
        const x = 110 + (i % 6) * 30;
        const y = 34 + Math.floor(i / 6) * 30;
        return (
          <g key={i}>
            {slot(x, y)}
            {i < items.length && (
              <>
                <rect x={x + 7} y={y + 7} width="6" height="6" fill={items[i]} />
                <rect x={x + 15} y={y + 7} width="5" height="5" fill={items[i]} opacity="0.7" />
                <rect x={x + 7} y={y + 15} width="5" height="5" fill={items[i]} opacity="0.8" />
                <rect x={x + 14} y={y + 14} width="6" height="6" fill={items[i]} opacity="0.6" />
              </>
            )}
          </g>
        );
      })}
      {/* hotbar */}
      {Array.from({ length: 5 }, (_, i) => (
        <g key={`h${i}`}>
          {slot(110 + i * 30, 138, 26)}
          <rect x={118 + i * 30} y={152} width="9" height="3" fill="#8a5a2b" />
          <rect x={124 + i * 30} y={144} width="9" height="4" fill={items[i]} />
        </g>
      ))}
      {/* tooltip */}
      <rect x="188" y="96" width="98" height="42" fill="#100010" opacity="0.95" />
      <rect x="190" y="98" width="94" height="38" fill="none" stroke="#26006b" strokeWidth="2" />
      <rect x="196" y="104" width="46" height="5" rx="1" fill="#ffaa00" />
      <rect x="196" y="114" width="72" height="3.5" rx="1" fill="#a8a8a8" />
      <rect x="196" y="122" width="58" height="3.5" rx="1" fill="#a8a8a8" />
    </svg>
  );
}

function ComicPoster(props: P) {
  const INK = "#111111";
  const RED = "#e63946";
  const YELLOW = "#ffd23f";
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#fdf6e3" />
      <defs>
        <pattern id="ben" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.7" fill={RED} opacity="0.4" />
        </pattern>
      </defs>
      {/* cover band */}
      <rect x="12" y="10" width="296" height="58" fill={RED} stroke={INK} strokeWidth="4" />
      <rect x="12" y="10" width="296" height="58" fill="url(#ben)" />
      <rect x="34" y="26" width="180" height="18" rx="2" fill={YELLOW} stroke={INK} strokeWidth="3" />
      <rect x="240" y="22" width="48" height="14" fill="#fff" stroke={INK} strokeWidth="3" />
      {/* panels */}
      {[
        { x: 12, y: 78, w: 140, h: 52, c: RED },
        { x: 160, y: 78, w: 148, h: 52, c: "#3a8ee6" },
        { x: 12, y: 138, w: 92, h: 52, c: "#2E9E6B" },
        { x: 112, y: 138, w: 92, h: 52, c: YELLOW },
        { x: 212, y: 138, w: 96, h: 52, c: "#7B4FA8" },
      ].map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#fffdf6" stroke={INK} strokeWidth="4" />
          <circle cx={p.x + p.w - 10} cy={p.y + 10} r="14" fill={p.c} opacity="0.5" />
          {i < 2 ? (
            <>
              <rect x={p.x + 8} y={p.y + 10} width={p.w - 30} height="13" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
              <rect x={p.x + 8} y={p.y + 30} width={p.w - 40} height="4" rx="1" fill={INK} opacity="0.55" />
              <rect x={p.x + 8} y={p.y + 38} width={p.w - 60} height="4" rx="1" fill={INK} opacity="0.4" />
            </>
          ) : (
            <>
              <rect x={p.x + 8} y={p.y + 12} width="44" height="10" rx="2" fill={INK} />
              <rect x={p.x + 8} y={p.y + 30} width={p.w - 26} height="4" rx="1" fill={INK} opacity="0.45" />
              <rect x={p.x + 8} y={p.y + 38} width={p.w - 44} height="4" rx="1" fill={INK} opacity="0.3" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

function DeparturesPoster(props: P) {
  const AMBERC = "#f5a524";
  const PALEC = "#e8e8e8";
  const rows = [
    { d: 116, s: 60, c: "#3aa06a" },
    { d: 96, s: 48, c: PALEC },
    { d: 132, s: 54, c: AMBERC },
    { d: 88, s: 44, c: "#8a8a8a" },
    { d: 124, s: 58, c: PALEC },
  ];
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#141414" />
      <rect x="16" y="14" width="288" height="172" fill="#0b0b0c" stroke="#ffffff1a" />
      {/* header */}
      <rect x="28" y="26" width="86" height="7" rx="1" fill={PALEC} />
      <rect x="252" y="24" width="40" height="12" rx="1" fill={AMBERC} />
      <rect x="28" y="44" width="264" height="1.2" fill="#ffffff22" />
      {/* column heads */}
      {[28, 84, 176, 220].map((x, i) => (
        <rect key={i} x={x} y="52" width={[36, 52, 28, 40][i]} height="4" rx="1" fill="#8a8a8a" />
      ))}
      {/* flap rows */}
      {rows.map((r, i) => {
        const y = 68 + i * 22;
        return (
          <g key={i}>
            {Array.from({ length: 4 }, (_, j) => (
              <rect key={`f${j}`} x={28 + j * 13} y={y} width="11" height="16" rx="1.5" fill="#1a1a1c" />
            ))}
            {Array.from({ length: 7 }, (_, j) => (
              <g key={`d${j}`}>
                <rect x={84 + j * 13} y={y} width="11" height="16" rx="1.5" fill="#1a1a1c" />
                <rect x={86 + j * 13} y={y + 5} width="7" height="5" fill={AMBERC} opacity={j * 13 < r.d - 84 ? 0.9 : 0.15} />
              </g>
            ))}
            {Array.from({ length: 2 }, (_, j) => (
              <rect key={`g${j}`} x={180 + j * 13} y={y} width="11" height="16" rx="1.5" fill="#1a1a1c" />
            ))}
            {Array.from({ length: 6 }, (_, j) => (
              <g key={`s${j}`}>
                <rect x={220 + j * 13} y={y} width="11" height="16" rx="1.5" fill="#1a1a1c" />
                <rect x={222 + j * 13} y={y + 5} width="7" height="5" fill={r.c} opacity={j * 13 < r.s ? 0.9 : 0.12} />
              </g>
            ))}
            <rect x="28" y={y + 18} width="264" height="1" fill="#ffffff10" />
          </g>
        );
      })}
    </svg>
  );
}

function CasinoPoster(props: P) {
  const GOLDC = "#d4af37";
  const CREAMC = "#f5f2ea";
  const chips = [
    { x: 80, c: "#a4243b" },
    { x: 130, c: "#1d4e89" },
    { x: 180, c: "#2e7d4f" },
    { x: 230, c: "#4a3b6b" },
  ];
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#072019" />
      <ellipse cx="160" cy="210" rx="180" ry="130" fill="#17563f" />
      <ellipse cx="160" cy="210" rx="180" ry="130" fill="none" stroke={GOLDC} strokeWidth="3" />
      <ellipse cx="160" cy="212" rx="156" ry="112" fill="none" stroke={GOLDC} strokeOpacity="0.35" strokeWidth="1.5" />
      {/* title */}
      <rect x="104" y="22" width="112" height="10" rx="2" fill={GOLDC} />
      <rect x="128" y="40" width="64" height="5" rx="1" fill="#cfe3d8" opacity="0.7" />
      {/* betting spots */}
      {chips.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy="118" r="27" fill="#00000044" stroke={GOLDC} strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx={c.x} cy="114" r="16" fill={c.c} stroke="#00000055" />
          {Array.from({ length: 8 }, (_, j) => (
            <rect
              key={j}
              x={c.x - 1.4}
              y="99"
              width="2.8"
              height="5"
              fill={CREAMC}
              opacity="0.9"
              transform={`rotate(${j * 45} ${c.x} 114)`}
            />
          ))}
          <circle cx={c.x} cy="114" r="10" fill="none" stroke={CREAMC} strokeWidth="1" strokeDasharray="2.5 2.5" />
          <circle cx={c.x + 20} cy="132" r="8" fill={CREAMC} />
          <text
            x={c.x + 20}
            y="136"
            textAnchor="middle"
            fill={i % 2 ? "#a4243b" : "#141414"}
            style={{ font: "10px serif" }}
          >
            {["♠", "♥", "♦", "♣"][i]}
          </text>
        </g>
      ))}
      {/* playing card */}
      <g transform="rotate(-8 268 160)">
        <rect x="246" y="132" width="46" height="62" rx="5" fill={CREAMC} stroke={GOLDC} strokeWidth="2" />
        <text x="254" y="148" fill="#a4243b" style={{ font: "12px serif" }}>♥</text>
        <rect x="254" y="156" width="30" height="4" rx="1" fill="#141414" opacity="0.6" />
        <rect x="254" y="164" width="22" height="3" rx="1" fill="#141414" opacity="0.35" />
      </g>
    </svg>
  );
}

function NewspaperPoster(props: P) {
  const INK = "#14130f";
  const RED = "#8c1c13";
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#f2efe6" />
      {/* masthead */}
      <rect x="18" y="12" width="284" height="1" fill={INK} opacity="0.5" />
      <rect x="52" y="18" width="216" height="20" rx="1" fill={INK} />
      <rect x="18" y="44" width="284" height="1.5" fill={INK} />
      <rect x="120" y="50" width="80" height="5" rx="1" fill={RED} />
      <rect x="18" y="60" width="284" height="1.5" fill={INK} />
      {/* lead headline */}
      <rect x="18" y="70" width="172" height="11" rx="1" fill={INK} />
      <rect x="18" y="85" width="132" height="11" rx="1" fill={INK} />
      {/* drop cap + columns */}
      <rect x="18" y="104" width="16" height="18" fill={RED} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={`a${i}`}
          x={i < 2 ? 38 : 18}
          y={104 + i * 9}
          width={i < 2 ? 62 : 82}
          height="3.5"
          rx="1"
          fill={INK}
          opacity="0.5"
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={`b${i}`} x="108" y={104 + i * 9} width="82" height="3.5" rx="1" fill={INK} opacity="0.42" />
      ))}
      {/* right rail */}
      <rect x="200" y="70" width="1" height="118" fill={INK} opacity="0.25" />
      <rect x="210" y="70" width="60" height="5" rx="1" fill={RED} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={`c${i}`} x="210" y={82 + i * 9} width={i === 9 ? 52 : 88} height="3.5" rx="1" fill={INK} opacity="0.4" />
      ))}
      {/* bottom banner */}
      <rect x="18" y="176" width="284" height="2" fill={INK} />
      <rect x="18" y="184" width="70" height="5" rx="1" fill={INK} opacity="0.6" />
    </svg>
  );
}

function GalleryPoster(props: P) {
  const INK = "#1c1a17";
  const frames = [
    { x: 34, y: 46, w: 74, h: 58, c: "#C2382E", a: "#2E7FC2" },
    { x: 126, y: 34, w: 68, h: 82, c: "#7B4FA8", a: "#E0A02E" },
    { x: 212, y: 50, w: 74, h: 54, c: "#2E9E6B", a: "#B5651D" },
  ];
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#eae6df" />
      {/* floor */}
      <rect y="150" width="320" height="50" fill="#ded9d0" />
      <rect y="150" width="320" height="1.5" fill={INK} opacity="0.18" />
      {frames.map((f, i) => (
        <g key={i}>
          {/* picture light */}
          <ellipse cx={f.x + f.w / 2} cy={f.y - 6} rx={f.w * 0.7} ry="16" fill="#fff0c8" opacity="0.5" />
          {/* frame */}
          <rect x={f.x - 6} y={f.y - 6} width={f.w + 12} height={f.h + 12} fill="#f6f3ed" stroke={INK} strokeOpacity="0.18" />
          <rect x={f.x} y={f.y} width={f.w} height={f.h} fill={`${f.c}33`} />
          <rect x={f.x + 6} y={f.y + 7} width={f.w * 0.5} height={f.h * 0.5} fill={f.c} />
          <circle cx={f.x + f.w * 0.72} cy={f.y + f.h * 0.6} r={f.w * 0.16} fill={f.a} opacity="0.7" />
          <rect x={f.x} y={f.y + f.h * 0.74} width={f.w} height="2" fill={INK} opacity="0.45" />
          {/* plaque */}
          <rect x={f.x + f.w / 2 - 22} y={f.y + f.h + 16} width="44" height="16" fill="#f2eee7" stroke="#8a7a5c" strokeOpacity="0.6" />
          <rect x={f.x + f.w / 2 - 14} y={f.y + f.h + 20} width="28" height="3" rx="1" fill="#8a7a5c" />
          <rect x={f.x + f.w / 2 - 10} y={f.y + f.h + 26} width="20" height="2.5" rx="1" fill={INK} opacity="0.4" />
        </g>
      ))}
      {/* room label */}
      <rect x="124" y="12" width="72" height="5" rx="1" fill="#8a7a5c" />
    </svg>
  );
}

function AlbumPoster(props: P) {
  const GREEN = "#1db954";
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#0d0d0d" />
      <rect width="320" height="96" fill="#C2382E" opacity="0.28" />
      {/* cover */}
      <g transform="translate(20 22)">
        <rect width="76" height="76" fill="#141414" />
        <circle cx="26" cy="26" r="20" fill="#C2382E" />
        <rect x="40" y="8" width="30" height="30" fill="#2E7FC2" opacity="0.9" />
        <polygon points="8,70 26,40 44,70" fill="#7B4FA8" opacity="0.9" />
        <circle cx="55" cy="55" r="15" fill="#E0A02E" opacity="0.85" />
        <rect y="35" width="76" height="1.2" fill="#f5f5f5" opacity="0.5" />
      </g>
      {/* title block */}
      <rect x="108" y="42" width="40" height="5" rx="1" fill="#f5f5f5" opacity="0.7" />
      <rect x="108" y="54" width="150" height="20" rx="2" fill="#f5f5f5" />
      <rect x="108" y="82" width="112" height="5" rx="1" fill="#b3b3b3" />
      {/* play button */}
      <circle cx="40" cy="120" r="15" fill={GREEN} />
      <polygon points="35,112 35,128 48,120" fill="#0d0d0d" />
      <rect x="64" y="112" width="52" height="16" rx="8" fill="none" stroke="#ffffff44" />
      {/* tracklist */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="20" y={146 + i * 13} width="6" height="4" rx="1" fill={i === 0 ? GREEN : "#b3b3b3"} />
          <rect x="34" y={145 + i * 13} width={110 - i * 12} height="5" rx="1" fill={i === 0 ? GREEN : "#f5f5f5"} opacity={i === 0 ? 1 : 0.75} />
          <rect x="200" y={146 + i * 13} width={60 - i * 8} height="4" rx="1" fill="#b3b3b3" opacity="0.5" />
          <rect x="284" y={146 + i * 13} width="16" height="4" rx="1" fill="#b3b3b3" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

function DesktopPoster(props: P) {
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#1d2433" />
      <ellipse cx="80" cy="30" rx="120" ry="70" fill="#4a9eff" opacity="0.16" />
      <ellipse cx="256" cy="160" rx="100" ry="60" fill="#f0a91e" opacity="0.10" />
      {/* menu bar */}
      <rect width="320" height="14" fill="#0a0e16" opacity="0.85" />
      <rect x="8" y="4.5" width="22" height="5" rx="1" fill="#e8eaf0" />
      <rect x="38" y="4.5" width="40" height="5" rx="1" fill="#e8eaf0" opacity="0.5" />
      <rect x="286" y="4.5" width="26" height="5" rx="1" fill="#e8eaf0" opacity="0.7" />
      {/* desktop icons */}
      {[
        ["#4a9eff", 0],
        ["#f0a91e", 1],
        ["#4ade80", 2],
      ].map(([c, i]) => (
        <g key={i as number}>
          <rect x="12" y={26 + (i as number) * 34} width="22" height="18" rx="3" fill={c as string} opacity="0.35" stroke={c as string} strokeWidth="1.4" />
          <rect x="10" y={48 + (i as number) * 34} width="26" height="4" rx="1" fill="#e8eaf0" opacity="0.55" />
        </g>
      ))}
      {/* windows */}
      {[
        { x: 62, y: 40, w: 140, h: 92, z: 0 },
        { x: 130, y: 66, w: 150, h: 96, z: 1 },
      ].map((w, i) => (
        <g key={i}>
          <rect x={w.x} y={w.y} width={w.w} height={w.h} rx="7" fill="#141924" stroke="#ffffff33" strokeWidth="1.4" />
          <rect x={w.x} y={w.y} width={w.w} height="15" rx="7" fill="#ffffff12" />
          <rect x={w.x} y={w.y + 9} width={w.w} height="6" fill="#ffffff12" />
          {["#ff5f57", "#febc2e", "#28c840"].map((c, j) => (
            <circle key={c} cx={w.x + 10 + j * 10} cy={w.y + 7.5} r="3" fill={c} />
          ))}
          {[0, 1, 2, 3].map((r) => (
            <rect
              key={r}
              x={w.x + 10}
              y={w.y + 26 + r * 11}
              width={w.w - 20 - r * 14}
              height="4.5"
              rx="1.5"
              fill="#e8eaf0"
              opacity={0.42 - r * 0.06}
            />
          ))}
        </g>
      ))}
      {/* dock */}
      <rect x="98" y="176" width="124" height="20" rx="10" fill="#0c101a" opacity="0.8" stroke="#ffffff1f" strokeWidth="1" />
      {["#4a9eff", "#f0a91e", "#4ade80", "#a855f7", "#fb7185"].map((c, i) => (
        <rect key={c} x={106 + i * 22} y="180" width="14" height="12" rx="4" fill={c} opacity="0.55" />
      ))}
    </svg>
  );
}

function CorkboardPoster(props: P) {
  const folders = [
    { x: 24, y: 46, rot: -3, pin: "#b3271e" },
    { x: 118, y: 34, rot: 2, pin: "#1e5fb3" },
    { x: 212, y: 50, rot: -1.5, pin: "#e0a02e" },
  ];
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#8a5f34" />
      <g opacity="0.25">
        {Array.from({ length: 130 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 37) % 320}
            cy={((i * 53) % 200) + 3}
            r="1.4"
            fill="#000"
          />
        ))}
      </g>
      {/* header note */}
      <g transform="rotate(-1 160 20)">
        <rect x="88" y="8" width="144" height="26" fill="#f4ecd8" stroke="#2a2118" strokeWidth="1.5" />
        <rect x="98" y="14" width="60" height="4" rx="1" fill="#b3271e" />
        <rect x="98" y="23" width="106" height="5" rx="1" fill="#2a2118" opacity="0.7" />
      </g>
      {/* red string */}
      <path d="M52 60 L150 48 L242 64" stroke="#b3271e" strokeWidth="1.4" fill="none" opacity="0.75" />
      {folders.map((f, i) => (
        <g key={i} transform={`rotate(${f.rot} ${f.x + 42} ${f.y + 50})`}>
          <rect x={f.x} y={f.y} width="84" height="98" fill="#e0c48f" stroke="#a8834f" strokeWidth="1.5" />
          <rect x={f.x} y={f.y} width="84" height="16" fill="#d4b47c" />
          <rect x={f.x + 6} y={f.y + 6} width="34" height="4" rx="1" fill="#2a2118" opacity="0.55" />
          <rect x={f.x + 6} y={f.y + 24} width="58" height="6" rx="1" fill="#2a2118" opacity="0.75" />
          <rect x={f.x + 6} y={f.y + 36} width="70" height="3.5" rx="1" fill="#2a2118" opacity="0.35" />
          <rect x={f.x + 6} y={f.y + 44} width="52" height="3.5" rx="1" fill="#2a2118" opacity="0.35" />
          {[0, 1, 2].map((j) => (
            <rect
              key={j}
              x={f.x + 6 + j * 22}
              y={f.y + 56}
              width="19"
              height="9"
              fill="#f4ecd8"
              stroke="#2a2118"
              strokeOpacity="0.35"
            />
          ))}
          <g transform={`rotate(-8 ${f.x + 30} ${f.y + 82})`}>
            <rect x={f.x + 8} y={f.y + 74} width="44" height="14" fill="none" stroke="#b3271e" strokeWidth="1.6" />
            <rect x={f.x + 13} y={f.y + 79} width="34" height="4" rx="1" fill="#b3271e" />
          </g>
          {/* pin */}
          <circle cx={f.x + 42} cy={f.y + 2} r="5" fill={f.pin} />
        </g>
      ))}
    </svg>
  );
}

function StarMapPoster(props: P) {
  const planets = [
    { a: 0.6, o: 46, c: "#C2382E", r: 7 },
    { a: 2.0, o: 46, c: "#2E7FC2", r: 6 },
    { a: 3.5, o: 72, c: "#7B4FA8", r: 9 },
    { a: 5.0, o: 72, c: "#E0A02E", r: 7 },
    { a: 1.2, o: 94, c: "#2E9E6B", r: 8 },
    { a: 4.2, o: 94, c: "#B5651D", r: 6 },
  ];
  const cx = 160;
  const cy = 100;
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#070d1c" />
      {Array.from({ length: 70 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 61) % 320}
          cy={(i * 43) % 200}
          r={0.5 + ((i * 7) % 10) / 9}
          fill="#fff"
          opacity={0.25 + ((i * 13) % 10) / 16}
        />
      ))}
      <defs>
        <radialGradient id="poster-sun">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.45" stopColor="#ffb347" />
          <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {[46, 72, 94].map((o) => (
        <ellipse
          key={o}
          cx={cx}
          cy={cy}
          rx={o}
          ry={o * 0.82}
          fill="none"
          stroke="#5ad1ff"
          strokeOpacity="0.2"
        />
      ))}
      <circle cx={cx} cy={cy} r="30" fill="url(#poster-sun)" />
      <circle cx={cx} cy={cy} r="12" fill="#fff2cc" />
      {planets.map((p, i) => {
        const x = coord(cx + Math.cos(p.a) * p.o);
        const y = coord(cy + Math.sin(p.a) * p.o * 0.82);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={p.r} fill={p.c} stroke="#ffffff44" />
            <path d={`M${x} ${y - p.r} a ${p.r} ${p.r} 0 0 0 0 ${p.r * 2} Z`} fill="#000" opacity="0.3" />
          </g>
        );
      })}
      {/* HUD */}
      <rect y="0" width="320" height="14" fill="#03060e" opacity="0.8" />
      <rect x="10" y="5" width="42" height="4" rx="1" fill="#ffb347" />
      <rect x="60" y="5" width="56" height="4" rx="1" fill="#c2f5ff" opacity="0.5" />
      <rect x="242" y="180" width="66" height="12" rx="2" fill="#5ad1ff" opacity="0.12" stroke="#5ad1ff" strokeOpacity="0.35" />
    </svg>
  );
}

function DevicePoster(props: P) {
  const SCREEN = "#9bbc3f";
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#22262f" />
      <rect x="18" y="14" width="284" height="172" rx="12" fill="#c0392b" stroke="#8e2a20" strokeWidth="3" />
      {/* lights */}
      <circle cx="42" cy="34" r="11" fill="#4aa3df" stroke="#e8e8e8" strokeWidth="3" />
      {["#e04a3a", "#e0c23a", "#4ad06a"].map((c, i) => (
        <circle key={c} cx={70 + i * 14} cy="34" r="4.5" fill={c} />
      ))}
      {/* left panel */}
      <rect x="30" y="52" width="140" height="122" rx="7" fill="#2b2b2b" stroke="#e8e8e8" strokeWidth="3" />
      <rect x="40" y="62" width="120" height="76" rx="3" fill={SCREEN} stroke="#31421f" strokeWidth="2" />
      {/* creature */}
      <ellipse cx="100" cy="112" rx="22" ry="17" fill="#2E7FC2" />
      <circle cx="100" cy="92" r="13" fill="#2E7FC2" />
      <polygon points="88,84 93,72 97,84" fill="#3a8ee6" />
      <polygon points="103,84 108,72 112,84" fill="#3a8ee6" />
      <circle cx="96" cy="91" r="2.4" fill="#31421f" />
      <circle cx="105" cy="91" r="2.4" fill="#31421f" />
      {/* stat bars */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="40" y={146 + i * 9} width="110" height="4" rx="2" fill="#ffffff16" />
          <rect x="40" y={146 + i * 9} width={54 + i * 22} height="4" rx="2" fill="#2E7FC2" />
        </g>
      ))}
      {/* right panel list */}
      <rect x="180" y="52" width="110" height="122" rx="7" fill="#2b2b2b" stroke="#e8e8e8" strokeWidth="3" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x="188"
            y={62 + i * 22}
            width="94"
            height="18"
            rx="3"
            fill={i === 1 ? "#2E7FC244" : "#1e1e1e"}
          />
          <rect x="194" y={69 + i * 22} width="14" height="4" rx="1" fill="#ffffff33" />
          <rect x="214" y={69 + i * 22} width="42" height="4" rx="1" fill="#ffffff66" />
        </g>
      ))}
    </svg>
  );
}

function ClawPoster(props: P) {
  const prizes = [
    { x: 52, c: "#C2382E" },
    { x: 96, c: "#2E7FC2" },
    { x: 140, c: "#7B4FA8" },
    { x: 186, c: "#E0A02E" },
    { x: 230, c: "#2E9E6B" },
  ];
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#14101f" />
      <rect x="14" y="10" width="292" height="180" rx="14" fill="#2a2350" stroke="#41d5f0" strokeWidth="2" />
      {/* marquee */}
      <rect x="28" y="20" width="264" height="26" rx="6" fill="#ff3d8b33" stroke="#ff3d8b" strokeWidth="1.5" />
      <rect x="96" y="30" width="128" height="7" rx="2" fill="#ffd23f" />
      {/* glass */}
      <rect x="28" y="54" width="264" height="126" rx="8" fill="#0a0812" opacity="0.8" />
      {/* rail + claw */}
      <rect x="34" y="62" width="252" height="3" rx="1.5" fill="#ffffff33" />
      <rect x="150" y="65" width="3" height="34" fill="#ffffff77" />
      <path d="M151 99 L141 118" stroke="#cfd6e4" strokeWidth="4" strokeLinecap="round" />
      <path d="M152 99 L163 118" stroke="#cfd6e4" strokeWidth="4" strokeLinecap="round" />
      <circle cx="151.5" cy="99" r="5" fill="#9aa5b8" />
      {/* pit */}
      <path d="M28 180 Q160 118 292 180 Z" fill="#3a2a5e" />
      {prizes.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={i % 2 ? 154 : 166} r={i % 2 ? 13 : 15} fill={p.c} />
          <path
            d={`M${p.x - (i % 2 ? 13 : 15)} ${i % 2 ? 154 : 166} a ${i % 2 ? 13 : 15} ${i % 2 ? 13 : 15} 0 0 1 ${(i % 2 ? 13 : 15) * 2} 0 Z`}
            fill="#ffffff33"
          />
        </g>
      ))}
      {/* chute */}
      <rect x="262" y="140" width="30" height="40" rx="4" fill="#00000088" stroke="#ffd23f" strokeWidth="1.5" />
    </svg>
  );
}

function CartridgePoster(props: P) {
  const carts = [
    { x: 30, c: "#e8c547" },
    { x: 122, c: "#5bc0be" },
    { x: 214, c: "#c14953" },
  ];
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#101820" />
      {/* scanlines */}
      <g opacity="0.3">
        {Array.from({ length: 50 }, (_, i) => (
          <rect key={i} y={i * 4} width="320" height="1.4" fill="#000" />
        ))}
      </g>
      {/* title */}
      <rect x="30" y="20" width="150" height="14" rx="2" fill="#e8c547" />
      <rect x="30" y="42" width="96" height="7" rx="2" fill="#5bc0be" />
      {/* menu */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="44"
            y={64 + i * 16}
            width={i === 0 ? 84 : 70}
            height="7"
            rx="2"
            fill="#dfe6ec"
            opacity={i === 0 ? 0.95 : 0.4}
          />
          {i === 0 && <polygon points="30,64 30,73 38,68.5" fill="#e8c547" />}
        </g>
      ))}
      {/* cartridges on a shelf */}
      {carts.map((c, i) => (
        <g key={i} transform={`translate(${c.x} 132)`}>
          <path
            d="M4 2h56a3 3 0 0 1 3 3v46a3 3 0 0 1-3 3H46l-4 6H22l-4-6H4a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z"
            fill="#2a3642"
            stroke="#0d1218"
            strokeWidth="2"
          />
          <rect x="9" y="9" width="46" height="28" rx="1.5" fill={c.c} />
          <rect x="9" y="9" width="46" height="7" fill="#00000033" />
          <rect x="13" y="21" width="28" height="3" rx="1" fill="#00000055" />
          <rect x="13" y="28" width="36" height="2.5" rx="1" fill="#00000033" />
          {[41, 45.5, 50].map((y) => (
            <rect key={y} x="11" y={y} width="42" height="2" rx="1" fill="#1c242e" />
          ))}
        </g>
      ))}
      <rect x="24" y="192" width="272" height="2" fill="#ffffff14" />
    </svg>
  );
}

type P = React.SVGProps<SVGSVGElement>;

function BoardPoster(props: P) {
  const COLS = 8;
  const ROWS = 6;
  const cw = VB.width / COLS;
  const ch = VB.height / ROWS;
  const bands = [
    "#c2382e",
    "#3f8f4e",
    "#e0a02e",
    "#3a6ea5",
    "#7b4fa8",
    "#2e8b8b",
    "#b8478f",
    "#8a5a2b",
  ];

  const cells: React.ReactElement[] = [];
  let n = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const perimeter = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
      if (!perimeter) continue;
      const corner =
        (r === 0 || r === ROWS - 1) && (c === 0 || c === COLS - 1);
      const x = c * cw;
      const y = r * ch;
      cells.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width={cw} height={ch} fill="#f4ead3" stroke="#2b2118" strokeWidth="1.5" />
          {!corner && (
            <rect
              x={x + 1}
              y={y + 1}
              width={cw - 2}
              height={ch * 0.3}
              fill={bands[n % bands.length]}
            />
          )}
          {corner ? (
            <rect x={x + cw / 2 - 6} y={y + ch / 2 - 6} width="12" height="12" fill="#8a5a2b" />
          ) : (
            <rect x={x + cw / 2 - 5} y={y + ch * 0.55} width="10" height="7" fill="#c9b894" />
          )}
        </g>,
      );
      if (!corner) n++;
    }
  }

  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#4a2c12" />
      <g>{cells}</g>
      <rect
        x={cw}
        y={ch}
        width={cw * 6}
        height={ch * 4}
        fill="#f4ead3"
        stroke="#2b2118"
        strokeWidth="1.5"
      />
      {/* wordmark stand-in */}
      <rect x={cw + 30} y={ch + 26} width={cw * 6 - 60} height="16" fill="#f0b03a" />
      <rect x={cw + 30} y={ch + 44} width={cw * 6 - 60} height="4" fill="#8a5a2b" />
      <rect x={cw + 20} y={ch + 64} width="52" height="38" fill="#3a6ea5" stroke="#2b2118" strokeWidth="1.5" />
      <rect x={cw + 20} y={ch + 106} width="52" height="20" fill="#c2382e" stroke="#2b2118" strokeWidth="1.5" />
      <rect x={cw * 6 - 34} y={ch + 64} width="48" height="30" fill="#f7e08a" stroke="#2b2118" strokeWidth="1.5" />
      <rect x={cw * 6 - 24} y={ch + 102} width="16" height="16" fill="#f7f4ec" stroke="#2b2118" strokeWidth="1.5" />
      <rect x={cw * 6 - 4} y={ch + 102} width="16" height="16" fill="#f7f4ec" stroke="#2b2118" strokeWidth="1.5" />
    </svg>
  );
}

function TerminalPoster(props: P) {
  const rows = [
    [60, "#7ee787"],
    [130, "#e6edf3"],
    [96, "#e6edf3"],
    [0, ""],
    [48, "#58a6ff"],
    [150, "#e6edf3"],
    [112, "#e6edf3"],
    [78, "#7d8590"],
    [0, ""],
    [44, "#7ee787"],
  ] as const;

  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#0d1117" />
      <rect x="18" y="16" width="284" height="168" rx="6" fill="#0d1117" stroke="#30363d" strokeWidth="1.5" />
      <rect x="18" y="16" width="284" height="22" rx="6" fill="#161b22" />
      <rect x="18" y="32" width="284" height="6" fill="#161b22" />
      {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
        <circle key={c} cx={31 + i * 13} cy="27" r="4" fill={c} />
      ))}
      <g>
        {rows.map(([w, c], i) =>
          w === 0 ? null : (
            <rect key={i} x="32" y={52 + i * 12} width={w} height="5" rx="1" fill={c as string} />
          ),
        )}
      </g>
      <rect x="32" y="172" width="7" height="8" fill="#7ee787" />
      <rect x="238" y="46" width="1.5" height="130" fill="#30363d" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="250" y={54 + i * 16} width={40 - i * 4} height="4" rx="1" fill="#7d8590" />
      ))}
    </svg>
  );
}

function ArcadePoster(props: P) {
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#08060f" />
      {/* horizon grid */}
      <g opacity="0.5">
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={160 + (i - 4) * 12}
            y1="132"
            x2={160 + (i - 4) * 78}
            y2="200"
            stroke="#00e5ff"
            strokeWidth="1"
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={134 + i * i * 3.4 + i * 5}
            x2="320"
            y2={134 + i * i * 3.4 + i * 5}
            stroke="#00e5ff"
            strokeWidth="1"
          />
        ))}
      </g>
      <rect y="120" width="320" height="80" fill="url(#glow)" opacity="0.35" />
      <defs>
        <linearGradient id="glow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff2e88" />
          <stop offset="1" stopColor="#ff2e88" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* title bar */}
      <rect x="40" y="24" width="240" height="12" rx="1" fill="#ffd43b" />
      <rect x="86" y="44" width="148" height="6" rx="1" fill="#00e5ff" />

      {/* stage cards */}
      {[
        ["#ff2e88", 26],
        ["#00e5ff", 118],
        ["#ffd43b", 210],
      ].map(([c, x], i) => (
        <g key={i}>
          <rect
            x={x as number}
            y="70"
            width="84"
            height="52"
            fill={`${c}18`}
            stroke={c as string}
            strokeWidth="1.5"
          />
          <rect x={(x as number) + 8} y="80" width="42" height="5" fill={c as string} />
          <rect x={(x as number) + 8} y="92" width="62" height="4" fill="#ffffff44" />
          <rect x={(x as number) + 8} y="100" width="50" height="4" fill="#ffffff33" />
          {[0, 1, 2, 3, 4].map((n) => (
            <rect
              key={n}
              x={(x as number) + 8 + n * 8}
              y="110"
              width="5"
              height="5"
              fill={n <= 2 + i ? (c as string) : "#ffffff22"}
            />
          ))}
        </g>
      ))}

      {/* scanlines */}
      <g opacity="0.35">
        {Array.from({ length: 50 }, (_, i) => (
          <rect key={i} y={i * 4} width="320" height="1.4" fill="#000" />
        ))}
      </g>
    </svg>
  );
}

function SheetPoster(props: P) {
  const INK = "#2b2118";
  const GOLD = "#b8863b";
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#150f0b" />
      <rect x="16" y="12" width="288" height="176" fill="#e9dfc4" stroke={GOLD} strokeWidth="2" />
      {/* sigil + name */}
      <rect x="28" y="24" width="40" height="40" fill="#f4ecd6" stroke={GOLD} strokeWidth="2" />
      <rect x="38" y="36" width="20" height="16" fill={GOLD} opacity="0.7" />
      <rect x="78" y="28" width="120" height="12" rx="1" fill={INK} />
      <rect x="78" y="46" width="76" height="7" rx="1" fill="#8c2f26" />
      {/* xp bar */}
      <rect x="78" y="60" width="150" height="8" fill="#d6c8a4" stroke={INK} strokeWidth="1.5" />
      <rect x="79" y="61" width="96" height="6" fill={GOLD} />
      {/* attribute blocks */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={28 + i * 44}
            y="84"
            width="38"
            height="44"
            fill="#f2e9d0"
            stroke={INK}
            strokeWidth="1.5"
          />
          <rect x={38 + i * 44} y="90" width="18" height="5" fill="#8c2f26" />
          <rect x={36 + i * 44} y="101" width="22" height="14" fill={INK} opacity="0.8" />
          <rect x={40 + i * 44} y="119" width="14" height="4" fill={GOLD} />
        </g>
      ))}
      {/* quest rows */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="212"
            y={84 + i * 24}
            width="76"
            height="20"
            fill="#f2e9d0"
            stroke={INK}
            strokeWidth="1.5"
          />
          <rect x="218" y={90 + i * 24} width="8" height="8" fill={["#C2382E", "#2E7FC2", "#7B4FA8"][i]} />
          <rect x="232" y={91 + i * 24} width="42" height="5" fill={INK} opacity="0.6" />
        </g>
      ))}
      {/* body text lines */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x="28"
          y={142 + i * 11}
          width={i === 3 ? 108 : 172}
          height="5"
          rx="1"
          fill={INK}
          opacity="0.35"
        />
      ))}
    </svg>
  );
}

function CardsPoster(props: P) {
  const cards = [
    { x: 22, y: 44, rot: -8, c: "#3a8ee6" },
    { x: 116, y: 30, rot: 0, c: "#f0a91e" },
    { x: 210, y: 44, rot: 8, c: "#a855f7" },
  ];
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#0d0d1c" />
      <ellipse cx="160" cy="10" rx="150" ry="70" fill="#2a2450" opacity="0.55" />
      {cards.map((c, i) => (
        <g key={i} transform={`rotate(${c.rot} ${c.x + 44} ${c.y + 62})`}>
          <rect
            x={c.x}
            y={c.y}
            width="88"
            height="124"
            rx="7"
            fill="#161230"
            stroke={c.c}
            strokeWidth="2"
          />
          <rect x={c.x + 7} y={c.y + 9} width="30" height="5" rx="1" fill={c.c} />
          <rect
            x={c.x + 7}
            y={c.y + 20}
            width="74"
            height="46"
            rx="3"
            fill={c.c}
            opacity="0.35"
          />
          <circle cx={c.x + 30} cy={c.y + 40} r="11" fill="none" stroke="#fff" strokeOpacity="0.3" />
          <rect x={c.x + 52} y={c.y + 32} width="14" height="14" fill="#fff" opacity="0.16" />
          <rect x={c.x + 7} y={c.y + 72} width="52" height="6" rx="1" fill="#e8e6f2" opacity="0.8" />
          {[0, 1, 2, 3].map((n) => (
            <g key={n}>
              <rect
                x={c.x + 7}
                y={c.y + 86 + n * 8}
                width="74"
                height="3"
                rx="1.5"
                fill="#fff"
                opacity="0.1"
              />
              <rect
                x={c.x + 7}
                y={c.y + 86 + n * 8}
                width={30 + n * 12}
                height="3"
                rx="1.5"
                fill={c.c}
              />
            </g>
          ))}
        </g>
      ))}
      {/* deck tray */}
      <rect x="60" y="176" width="200" height="16" rx="8" fill="#ffffff10" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={72 + i * 40} y="181" width="32" height="6" rx="3" fill={cards[i].c} />
      ))}
    </svg>
  );
}

function TreePoster(props: P) {
  const COLORS = ["#4cc2ff", "#f0a91e", "#a855f7", "#4ade80", "#fb7185"];
  const cx = 160;
  const cy = 100;
  const nodes: { x: number; y: number; r: number; c: string; x0: number; y0: number }[] =
    [];

  COLORS.forEach((c, gi) => {
    const base = (-90 + (360 / COLORS.length) * gi) * (Math.PI / 180);
    let px = cx;
    let py = cy;
    for (let i = 0; i < 3; i++) {
      const spread = ((i % 2 === 0 ? 1 : -1) * i * 6) * (Math.PI / 180);
      const r = 30 + i * 24;
      const x = coord(cx + Math.cos(base + spread) * r);
      const y = coord(cy + Math.sin(base + spread) * r * 0.82);
      nodes.push({ x, y, r: 5 + i * 1.6, c, x0: px, y0: py });
      px = x;
      py = y;
    }
  });

  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#080d18" />
      <ellipse cx={cx} cy={cy} rx="150" ry="96" fill="#101a2e" />
      {[32, 56, 80].map((r) => (
        <ellipse
          key={r}
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * 0.82}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.05"
        />
      ))}
      {nodes.map((n, i) => (
        <line
          key={`l${i}`}
          x1={n.x0}
          y1={n.y0}
          x2={n.x}
          y2={n.y}
          stroke={n.c}
          strokeOpacity="0.35"
          strokeWidth="1.6"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={`n${i}`}>
          <circle cx={n.x} cy={n.y} r={n.r} fill="#0b1424" stroke={n.c} strokeWidth="1.6" />
          <circle cx={n.x} cy={n.y} r={n.r * 0.5} fill={n.c} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r="20" fill="#0b1424" stroke="#4cc2ff" strokeWidth="2" />
      <rect x={cx - 11} y={cy - 5} width="22" height="10" rx="1" fill="#dce6f5" opacity="0.85" />
    </svg>
  );
}

function MagazinePoster(props: P) {
  return (
    <svg {...props}>
      <rect width={VB.width} height={VB.height} fill="#f7f4ec" />
      {/* masthead */}
      <rect x="24" y="20" width="272" height="1.5" fill="#1a1917" opacity="0.25" />
      <rect x="24" y="30" width="180" height="26" rx="1" fill="#1a1917" />
      <rect x="212" y="38" width="84" height="9" rx="1" fill="#1a1917" opacity="0.3" />
      <rect x="24" y="66" width="272" height="1.5" fill="#1a1917" />

      {/* drop cap + columns */}
      <rect x="24" y="80" width="30" height="34" fill="#9b2c2c" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect
          key={`a${i}`}
          x={i < 3 ? 60 : 24}
          y={i < 3 ? 82 + i * 12 : 82 + i * 12}
          width={i < 3 ? 106 : 142}
          height="4"
          rx="1"
          fill="#1a1917"
          opacity="0.55"
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <rect
          key={`b${i}`}
          x="182"
          y={82 + i * 12}
          width={i === 8 ? 74 : 114}
          height="4"
          rx="1"
          fill="#1a1917"
          opacity="0.35"
        />
      ))}

      {/* pull quote rule */}
      <rect x="182" y="80" width="2" height="108" fill="#9b2c2c" />

      {/* folio */}
      <rect x="24" y="176" width="34" height="12" rx="1" fill="#b08d57" opacity="0.55" />
    </svg>
  );
}
