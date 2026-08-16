/**
 * Hand-drawn pixel art, authored as bitmaps.
 *
 * Each icon is a list of rows; every character is one pixel, mapped to a colour
 * through the icon's own palette. `.` is transparent. Rows are padded to the
 * longest row at render time, so a miscounted row shifts a pixel rather than
 * breaking the drawing.
 *
 * Rendering as <rect> with shape-rendering:crispEdges means these stay sharp at
 * any zoom and cost zero network requests — which is the whole point, since the
 * board can be pinch-zoomed on a phone.
 */

type Icon = {
  palette: Record<string, string>;
  rows: string[];
};

const K = "#2b2118"; // outline / hair
const SKIN = "#e8b98a";
const PAPER = "#f4ead3";

export const ICONS: Record<string, Icon> = {
  /* ---------- corners ---------- */

  person: {
    palette: { k: K, s: SKIN, b: "#1b1410", g: "#3f7d4e", d: "#2c5c39" },
    rows: [
      "................",
      ".....kkkkkk.....",
      "....kkkkkkkk....",
      "....kssssssk....",
      "....ksbssbsk....",
      "....kssssssk....",
      ".....sssbss.....",
      "......ssss......",
      "....gggggggg....",
      "...gggggggggg...",
      "..gggggggggggg..",
      "..ggg.gggg.ggg..",
      "..dd..gggg..dd..",
      "......gggg......",
      "......dd.dd.....",
      "................",
    ],
  },

  trophy: {
    palette: { g: "#e0a02e", d: "#a8701a", l: "#f7d377", k: K },
    rows: [
      "................",
      "..kkkkkkkkkkkk..",
      "..kllllllllllk..",
      ".kkgggggggggggk.",
      ".kgglgggggggggk.",
      ".kgglggggggggdk.",
      "..kglgggggggdk..",
      "..kggggggggddk..",
      "...kgggggggdk...",
      "....kgggggdk....",
      ".....kgggdk.....",
      "......kddk......",
      "......kddk......",
      "....kkddddkk....",
      "...kdddddddk....",
      "................",
    ],
  },

  palm: {
    palette: { g: "#3f8f4e", d: "#2c6b39", t: "#8a5a2b", s: "#f2d98a", k: K },
    rows: [
      "................",
      "......ggg.......",
      "...ggggggggg....",
      "..ggddgggddgg...",
      ".gg..dg.gd..gg..",
      "......gtg.......",
      "......tgt.......",
      "......gtg.......",
      "......tgt.......",
      ".......tg.......",
      ".......gt.......",
      "......tgt.......",
      "......tgt.......",
      "....sssssss.....",
      "..sssssssssss...",
      "................",
    ],
  },

  sleep: {
    palette: { k: K, s: SKIN, b: "#4a6fa5", z: "#7fa8d8", g: "#3f7d4e" },
    rows: [
      "...........z....",
      "..........zzz...",
      "...........z....",
      "........zz......",
      ".......z..z.....",
      "........zz......",
      "................",
      "....kkkkkk......",
      "...kssssssk.....",
      "...ksbssbsk.....",
      "...kssssssk.....",
      "....ssssss......",
      "..gggggggggg....",
      ".gggggggggggg...",
      ".bbbbbbbbbbbb...",
      ".bb........bb...",
    ],
  },

  /* ---------- deck icons ---------- */

  star: {
    palette: { g: "#f2c14e", d: "#c9911f", l: "#ffe9a8", k: K },
    rows: [
      "................",
      ".......kk.......",
      "......klgk......",
      "......klgk......",
      ".....kklggkk....",
      "..kkkklggkkkkk..",
      "..klllggggggdk..",
      "...kllgggggdk...",
      "....klggggdk....",
      "....klgggdk.....",
      "...klgggggdk....",
      "..klggkkkggdk...",
      "..klgk...kgdk...",
      "..kkk.....kkk...",
      "................",
      "................",
    ],
  },

  laptop: {
    palette: { k: K, s: "#5b6b7a", c: "#0f1a14", g: "#7ee787", w: "#c9d4de" },
    rows: [
      "................",
      "...kkkkkkkkkk...",
      "...kssssssssk...",
      "...kscccccc sk..",
      "...kscggcccsk...",
      "...kscggggcsk...",
      "...ksccggccsk...",
      "...kscgggcccsk..",
      "...ksccccccsk...",
      "...kssssssssk...",
      "...kkkkkkkkkk...",
      "..kwwwwwwwwwwk..",
      ".kwwwwwwwwwwwwk.",
      ".kkkkkkkkkkkkkk.",
      "................",
      "................",
    ],
  },

  /* ---------- practice tiles ---------- */

  book: {
    palette: { r: "#c2382e", g: "#3f8f4e", b: "#3a6ea5", w: PAPER, k: K },
    rows: [
      "................",
      "................",
      "..kkkkkkkkkkkk..",
      "..krrrrrrrrrrk..",
      "..kwwwwwwwwwwk..",
      "..kkkkkkkkkkkk..",
      "..kkkkkkkkkkkk..",
      "..kgggggggggak..",
      "..kwwwwwwwwwwk..",
      "..kkkkkkkkkkkk..",
      "..kkkkkkkkkkkk..",
      "..kbbbbbbbbbbk..",
      "..kwwwwwwwwwwk..",
      "..kkkkkkkkkkkk..",
      "................",
      "................",
    ],
  },

  hammer: {
    palette: { h: "#8d99a6", d: "#5b6b7a", w: "#8a5a2b", k: K },
    rows: [
      "................",
      ".........kkkk...",
      "........khhhhk..",
      ".......khhhhhk..",
      ".......khhhhk...",
      "......kwwkhhk...",
      ".....kwwk.kk....",
      "....kwwk........",
      "...kwwk.........",
      "..kwwk..........",
      "..kwk...........",
      ".kwk............",
      ".kk.............",
      "................",
      "................",
      "................",
    ],
  },

  glass: {
    palette: { g: "#8d99a6", c: "#a8d8e8", k: K, w: "#5b6b7a" },
    rows: [
      "................",
      "....kkkkkk......",
      "...kcccccck.....",
      "..kcccccccck....",
      "..kcccccccck....",
      "..kcccccccck....",
      "..kcccccccck....",
      "...kcccccck.....",
      "....kkkkkk......",
      "......kkwwk.....",
      ".......kwwwk....",
      "........kwwwk...",
      ".........kwwwk..",
      "..........kwwk..",
      "...........kk...",
      "................",
    ],
  },

  rocket: {
    palette: { r: "#c2382e", w: "#e8e9ec", c: "#a8d8e8", o: "#e8a02e", k: K },
    rows: [
      "................",
      ".......kk.......",
      "......kwwk......",
      "......kwwk......",
      ".....kwccwk.....",
      ".....kwccwk.....",
      "....kwwwwwwk....",
      "....kwwwwwwk....",
      "...krwwwwwwrk...",
      "..krrkwwwwkrrk..",
      "..krrkwwwwkrrk..",
      "...kk.kkkk.kk...",
      "......kook......",
      ".......ko.......",
      "................",
      "................",
    ],
  },

  cap: {
    palette: { k: K, d: "#1b1410", g: "#e0a02e" },
    rows: [
      "................",
      "................",
      ".......kk.......",
      "....kkkkkkkk....",
      "..kkkkkkkkkkkk..",
      "kkkkkkkkkkkkkkkk",
      "..dddddddddddd..",
      "....dddddddd....",
      "....d......d....",
      "....d......dg...",
      "....dddddddg....",
      "...........g....",
      "...........g....",
      "..........ggg...",
      "...........g....",
      "................",
    ],
  },

  recycle: {
    palette: { g: "#3f8f4e", l: "#5fbf6e", k: K },
    rows: [
      "................",
      ".......kk.......",
      "......kggk......",
      ".....kggggk.....",
      ".....kg..gk.....",
      "....kgk..kgk....",
      "....kg....gk....",
      "...kgk....kgk...",
      "..kggk....kggk..",
      "..kgk......kgk..",
      ".kggkk....kkggk.",
      ".kgggk....kgggk.",
      "..kkk......kkk..",
      "................",
      "................",
      "................",
    ],
  },

  check: {
    palette: { w: PAPER, k: K, g: "#3f8f4e", c: "#8d99a6" },
    rows: [
      "................",
      "......kkkk......",
      "...kkkccckkk....",
      "...kwwwwwwwk....",
      "...kwwwwwwwk....",
      "...kwwwwwggk....",
      "...kwwwwggwk....",
      "...kwgwggwwk....",
      "...kwggggwwk....",
      "...kwwggwwwk....",
      "...kwwgwwwwk....",
      "...kwwwwwwwk....",
      "...kkkkkkkkk....",
      "................",
      "................",
      "................",
    ],
  },

  brush: {
    palette: { w: "#8d99a6", h: "#8a5a2b", c: "#c2382e", k: K },
    rows: [
      "................",
      "..........kk....",
      ".........khhk...",
      "........khhk....",
      ".......khhk.....",
      "......khhk......",
      ".....kwwk.......",
      "....kwwwk.......",
      "...kwwwwk.......",
      "...kwwwk........",
      "..kcccck........",
      "..kcccck........",
      "...kcck.........",
      "....kk..........",
      "................",
      "................",
    ],
  },

  code: {
    palette: { g: "#3f8f4e", k: K },
    rows: [
      "................",
      "................",
      "....kk......kk..",
      "...kgk.....kgk..",
      "..kgk.....kgk...",
      ".kgk..kk.kgk....",
      "kgk..kgk.kgk....",
      "kgk..kgk..kgk...",
      "kgk.kgk....kgk..",
      ".kgk.kk.....kgk.",
      "..kgk........kgk",
      "...kgk......kgk.",
      "....kk.....kgk..",
      "...........kk...",
      "................",
      "................",
    ],
  },

  users: {
    palette: { s: SKIN, k: K, b: "#3a6ea5", g: "#3f8f4e" },
    rows: [
      "................",
      "...kkk....kkk...",
      "..kssssk.ksssk..",
      "..ksssskkkssssk.",
      "..kssssk.ksssk..",
      "...kkk....kkk...",
      "..bbbbb..ggggg..",
      ".bbbbbbbggggggg.",
      "bbbbbbbbgggggggg",
      "bbbbbbbbgggggggg",
      "bb.bb.bbgg.gg.gg",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
  },

  wrench: {
    palette: { w: "#8d99a6", d: "#5b6b7a", k: K },
    rows: [
      "................",
      "..kkk....kkk....",
      ".kwwwk..kwwwk...",
      ".kwwwwkkwwwwk...",
      ".kwwwwwwwwwk....",
      "..kwwwwwwwk.....",
      "...kwwwwwk......",
      "....kwwwk.......",
      "....kwwwk.......",
      ".....kwwk.......",
      ".....kwwk.......",
      "......kwwk......",
      "......kwwk......",
      ".......kwk......",
      ".......kk.......",
      "................",
    ],
  },

  bulb: {
    palette: { y: "#f2c14e", l: "#ffe9a8", d: "#8d99a6", k: K },
    rows: [
      "................",
      ".....kkkk.......",
      "....kyyyyk......",
      "...kylyyyyk.....",
      "...kylyyyyk.....",
      "...kyyyyyyk.....",
      "...kyyyyyyk.....",
      "....kyyyyk......",
      "....kyyyyk......",
      "....kddddk......",
      "....kddddk......",
      "....kddddk......",
      ".....kddk.......",
      "......kk........",
      "................",
      "................",
    ],
  },

  cloud: {
    palette: { c: "#a8d8e8", w: "#e8f4fa", k: K },
    rows: [
      "................",
      "................",
      "......kkkk......",
      ".....kwwwwk.....",
      "...kkwwwwwwkk...",
      "..kwwwwwwwwwwk..",
      ".kwwwwwwwwwwwwk.",
      ".kcccccccccccck.",
      "..kcccccccccck..",
      "...kkkkkkkkkk...",
      "................",
      "......kkkk......",
      ".....kcccck.....",
      "......kcck......",
      ".......kk.......",
      "................",
    ],
  },

  gear: {
    palette: { g: "#8d99a6", d: "#5b6b7a", k: K },
    rows: [
      "................",
      "....kk.kk.kk....",
      "...kggkggkggk...",
      "...kgggggggggk..",
      "..kkggggggggkk..",
      "..kgggkkkkgggk..",
      "..kggk....kggk..",
      "kkkgk......kgkkk",
      "kggk........kggk",
      "kkkgk......kgkkk",
      "..kggk....kggk..",
      "..kgggkkkkgggk..",
      "..kkggggggggkk..",
      "...kgggggggggk..",
      "...kggkggkggk...",
      "....kk.kk.kk....",
    ],
  },

  chart: {
    palette: { g: "#3f8f4e", b: "#3a6ea5", y: "#f2c14e", k: K },
    rows: [
      "................",
      "................",
      "............kk..",
      "...........kggk.",
      "........kk.kggk.",
      ".......kyyk.ggk.",
      ".......kyyk.ggk.",
      "....kk.kyyk.ggk.",
      "...kbbkkyyk.ggk.",
      "...kbbkkyyk.ggk.",
      "...kbbkkyyk.ggk.",
      "...kbbkkyykkggk.",
      "kkkkkkkkkkkkkkkk",
      "................",
      "................",
      "................",
    ],
  },

  doc: {
    palette: { w: PAPER, k: K, b: "#3a6ea5", g: "#8d99a6" },
    rows: [
      "................",
      "...kkkkkkkkk....",
      "...kwwwwwwwk....",
      "...kwbbbbbwk....",
      "...kwwwwwwwk....",
      "...kwggggggk....",
      "...kwggggwwk....",
      "...kwwwwwwwk....",
      "...kwggggggk....",
      "...kwggggwwk....",
      "...kwwwwwwwk....",
      "...kwggggggk....",
      "...kwwwwwwwk....",
      "...kkkkkkkkk....",
      "................",
      "................",
    ],
  },

  megaphone: {
    palette: { o: "#e8a02e", d: "#b5651d", w: "#e8e9ec", k: K },
    rows: [
      "................",
      "............kk..",
      "..........kkook.",
      "........kkoooak.",
      "......kkoooook..",
      "....kkoooooook..",
      "..kkooooooooak..",
      "..koooooooook...",
      "..kwwooooooak...",
      "..kwwkkoooook...",
      "...kwwkkoodk....",
      "....kwwkkkk.....",
      "....kwwk........",
      ".....kk.........",
      "................",
      "................",
    ],
  },

  dice: {
    palette: { w: "#f7f4ec", k: K, d: "#8d99a6" },
    rows: [
      "................",
      "..kkkkkkkkkkkk..",
      "..kwwwwwwwwwwk..",
      "..kwkkwwwwkkwk..",
      "..kwkkwwwwkkwk..",
      "..kwwwwwwwwwwk..",
      "..kwwwwkkwwwwk..",
      "..kwwwwkkwwwwk..",
      "..kwwwwwwwwwwk..",
      "..kwkkwwwwkkwk..",
      "..kwkkwwwwkkwk..",
      "..kwwwwwwwwwwk..",
      "..kkkkkkkkkkkk..",
      "................",
      "................",
      "................",
    ],
  },

  chest: {
    palette: { w: "#8a5a2b", d: "#5c3a1a", g: "#e0a02e", k: K },
    rows: [
      "................",
      "................",
      "...kkkkkkkkkk...",
      "..kwwwwwwwwwwk..",
      "..kwddddddddwk..",
      "..kwwwwwwwwwwk..",
      "..kggggggggggk..",
      "..kkkkkkkkkkkk..",
      "..kwwwwggwwwwk..",
      "..kwddwggwddwk..",
      "..kwddwggwddwk..",
      "..kwwwwggwwwwk..",
      "..kkkkkkkkkkkk..",
      "................",
      "................",
      "................",
    ],
  },

  question: {
    palette: { w: PAPER, k: K, r: "#c2382e" },
    rows: [
      "................",
      "................",
      "....kkkkkkk.....",
      "...krrrrrrrk....",
      "..krrkkkkkrrk...",
      "..krrk...krrk...",
      "..kkk....krrk...",
      ".........krrk...",
      "......kkkrrk....",
      ".....krrrrrk....",
      ".....krrrk......",
      ".....kkkk.......",
      "................",
      ".....krrk.......",
      ".....krrk.......",
      "......kk........",
    ],
  },
};

export type IconName = keyof typeof ICONS;

export function PixelIcon({
  name,
  size = 32,
  className,
  title,
}: {
  name: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  const icon = ICONS[name] ?? ICONS.star;
  const height = icon.rows.length;
  const width = icon.rows.reduce((m, r) => Math.max(m, r.length), 0);

  const rects: React.ReactElement[] = [];
  icon.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || ch === " ") {
        x += 1;
        continue;
      }
      // Merge horizontal runs of the same colour into one rect — roughly a
      // 4x reduction in DOM nodes across the board.
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run += 1;
      const fill = icon.palette[ch];
      if (fill) {
        rects.push(
          <rect
            key={`${y}-${x}`}
            x={x}
            y={y}
            width={run}
            height={1}
            fill={fill}
          />,
        );
      }
      x += run;
    }
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      className={`crisp ${className ?? ""}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {rects}
    </svg>
  );
}
