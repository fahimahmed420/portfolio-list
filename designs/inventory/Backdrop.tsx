/**
 * Voxel landscape behind the inventory panel.
 *
 * Everything is axis-aligned rects on an 8px block grid, which is what makes it
 * read as a block world rather than an illustration of one. Drawn once at
 * module scope cost — no images, and it recolours by editing constants here.
 */

const B = 8; // block size
const b = (n: number) => n * B;

const SKY_TOP = "#5b93d6";
const SKY_LOW = "#8fc0ea";
/* Paired tones are deliberately close. A wide delta turns the checker into
   something that reads as a transparency grid rather than block texture. */
const GRASS = "#5a9c3f";
const GRASS_DK = "#54933a";
const DIRT = "#7b5735";
const DIRT_DK = "#745231";
const STONE = "#8e8e8e";
const STONE_DK = "#888888";
const DEEP = "#6f6f6f";
const DEEP_DK = "#6a6a6a";
const WOOD = "#9c6b3f";
const WOOD_DK = "#7d5531";
const ROOF = "#8f3b2f";
const ROOF_DK = "#87372c";
const GLASS = "#a8d8ef";
const LEAF = "#3f7d34";
const LEAF_DK = "#356b2c";

/** A run of blocks with a subtle two-tone checker so the surface has grain. */
function Blocks({
  x,
  y,
  w,
  h,
  a,
  c,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  a: string;
  c: string;
}) {
  const out = [];
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      out.push(
        <rect
          key={`${i}-${j}`}
          x={b(x + i)}
          y={b(y + j)}
          width={B}
          height={B}
          fill={(i + j) % 2 === 0 ? a : c}
        />,
      );
    }
  }
  return <g>{out}</g>;
}

function Tree({ x, ground }: { x: number; ground: number }) {
  return (
    <g>
      <Blocks x={x} y={ground - 4} w={1} h={4} a={WOOD} c={WOOD_DK} />
      <Blocks x={x - 2} y={ground - 8} w={5} h={3} a={LEAF} c={LEAF_DK} />
      <Blocks x={x - 1} y={ground - 9} w={3} h={1} a={LEAF} c={LEAF_DK} />
    </g>
  );
}

export default function Backdrop() {
  /* World is 80×45 blocks. Sized so that when it covers a desktop viewport the
     blocks land around 18px — small enough to read as terrain, big enough to
     stay unmistakably voxel. A 40-block world scaled to 4.5× and the whole
     composition fell off the sides. */
  const G = 33; // ground line, in blocks from the top

  return (
    <svg
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="mcsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SKY_TOP} />
          <stop offset="1" stopColor={SKY_LOW} />
        </linearGradient>
      </defs>

      <rect width="640" height="360" fill="url(#mcsky)" />

      {/* sun and clouds, all blocky */}
      <rect x={b(66)} y={b(3)} width={b(3)} height={b(3)} fill="#f7f0b5" />
      <Blocks x={6} y={5} w={6} h={1} a="#ffffff" c="#f0f4f8" />
      <Blocks x={8} y={4} w={3} h={1} a="#ffffff" c="#f0f4f8" />
      <Blocks x={44} y={7} w={5} h={1} a="#ffffff" c="#f0f4f8" />
      <Blocks x={26} y={3} w={4} h={1} a="#ffffff" c="#f0f4f8" />

      {/* distant hills */}
      <Blocks x={0} y={G - 4} w={12} h={4} a={GRASS_DK} c="#427a2f" />
      <Blocks x={3} y={G - 6} w={6} h={2} a={GRASS_DK} c="#427a2f" />
      <Blocks x={56} y={G - 5} w={14} h={5} a={GRASS_DK} c="#427a2f" />
      <Blocks x={60} y={G - 7} w={7} h={2} a={GRASS_DK} c="#427a2f" />

      {/* The GUI panel sits over the middle third, so the builds live out on
          the flanks where they stay visible. */}
      <g>
        <Blocks x={4} y={G - 2} w={12} h={2} a={STONE} c={STONE_DK} />
        <Blocks x={4} y={G - 7} w={12} h={5} a={WOOD} c={WOOD_DK} />
        <Blocks x={6} y={G - 6} w={2} h={2} a={GLASS} c="#9fcfe6" />
        <Blocks x={12} y={G - 6} w={2} h={2} a={GLASS} c="#9fcfe6" />
        <Blocks x={9} y={G - 4} w={2} h={4} a={WOOD_DK} c="#6f4a2a" />
        <Blocks x={3} y={G - 8} w={14} h={1} a={ROOF} c={ROOF_DK} />
        <Blocks x={4} y={G - 9} w={12} h={1} a={ROOF} c={ROOF_DK} />
        <Blocks x={5} y={G - 10} w={10} h={1} a={ROOF} c={ROOF_DK} />
        <Blocks x={6} y={G - 11} w={8} h={1} a={ROOF} c={ROOF_DK} />
        <Blocks x={7} y={G - 12} w={6} h={1} a={ROOF} c={ROOF_DK} />
        <Blocks x={13} y={G - 13} w={2} h={3} a={STONE_DK} c={STONE} />
        <rect x={b(8)} y={b(G - 5)} width={3} height={B} fill={WOOD_DK} />
        <rect x={b(8) - 1} y={b(G - 5) - 4} width={5} height={5} fill="#ffcf4a" />
      </g>

      {/* stone tower on the right flank */}
      <g>
        <Blocks x={68} y={G - 12} w={5} h={12} a={STONE} c={STONE_DK} />
        <Blocks x={67} y={G - 14} w={7} h={2} a={STONE_DK} c={STONE} />
        <Blocks x={70} y={G - 10} w={2} h={2} a={GLASS} c="#9fcfe6" />
        <Blocks x={70} y={G - 6} w={2} h={2} a={GLASS} c="#9fcfe6" />
        <rect x={b(74)} y={b(G - 15)} width={B} height={b(2)} fill={ROOF} />
      </g>

      <Tree x={14} ground={G} />
      <Tree x={46} ground={G} />
      <Tree x={52} ground={G} />

      {/* ground: grass cap over dirt, with a stone seam lower down */}
      <Blocks x={0} y={G} w={80} h={1} a={GRASS} c={GRASS_DK} />
      <Blocks x={0} y={G + 1} w={80} h={11} a={DIRT} c={DIRT_DK} />
    </svg>
  );
}
