/**
 * Converts the generated PNGs in public/art to WebP at sensible sizes.
 *
 * The raw exports are ~2.5MB each; the whole set was 31MB, which would undo
 * the "no image downloads" property the collection was built around. Textures
 * tile so they don't need to be large, and nothing here is displayed anywhere
 * near its native resolution.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = "public/art";
// name -> max width. Tileable textures go small; hero art keeps more detail.
const WIDTHS = {
  "wood.png": 900,
  "felt.png": 900,
  "parchment.png": 900,
  "cork.png": 900,
  "space.png": 1600,
  "arcade-side.png": 500,
  "devopoly-desk.png": 900,
  "comic-panels.png": 1400,
  "gallery-works.png": 1400,
  "album-cover.png": 900,
  "cartridge-label.png": 800,
  "plush.png": 600,
  "card-art.png": 800,
};

let before = 0;
let after = 0;

for (const [file, width] of Object.entries(WIDTHS)) {
  const src = path.join(DIR, file);
  if (!fs.existsSync(src)) continue;
  before += fs.statSync(src).size;
  const out = src.replace(/\.png$/, ".webp");
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  after += fs.statSync(out).size;
  fs.unlinkSync(src);
  console.log(`${file} -> ${path.basename(out)}  ${(fs.statSync(out).size / 1024).toFixed(0)}KB`);
}

console.log(
  `\n${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(1)}MB`,
);
