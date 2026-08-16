# Art prompts

Everything in this repo is currently drawn in code — SVG, CSS, and hand-authored
pixel bitmaps. That was deliberate: zero downloads, crisp at any zoom, and it
recolours itself from `profile.accent`. But a handful of places would be
genuinely better as real illustration, and those are listed here.

## Read this first — the reuse tension

Generated art tied to *specific projects* breaks the one rule that makes this
collection reusable: swap `data/profile.ts` and everything still works. A hand
-drawn creature for "Halcyon" is dead weight the moment Halcyon isn't in the
profile.

So the prompts below are split:

- **Tier A — profile-independent.** Backdrops, textures, frames, furniture.
  Generate once, ship forever, works for any profile. **Start here.**
- **Tier B — per-project.** Sprites, covers, labels, panels. Only worth it for
  the one portfolio you actually publish. Treat as adoption work, and keep the
  procedural version as the fallback for anyone else using the design.

Every image should be a **transparent PNG** unless stated otherwise, and every
set must be generated with a **shared style anchor** — generate one, approve it,
then reference it explicitly ("in the exact style of the previous image") for the
rest of the set. Mixed styles inside one set look worse than no art at all.

---

# Tier A — profile-independent (do these first)

## A1 · Devopoly — the desk scene

Replaces the CSS-and-icon composite in the centre of the board
(`designs/devopoly/index.tsx`, the `Desk` component). This is the single biggest
visual upgrade in the collection.

> Pixel art illustration, 16-bit SNES era, side view of a developer sitting at a
> wooden desk working at a chunky CRT monitor showing green code. Character has
> dark messy hair and a green hoodie, seen from behind and slightly to the side.
> On the desk: a steaming coffee mug, a small potted plant, a stack of two books.
> A leather satchel leans against the desk leg. Limited palette of warm browns,
> cream, forest green and muted teal. Clean black outlines, flat shading, no
> gradients, no anti-aliasing. Transparent background. Centred with even margins.

**Size:** 512×384 · **Format:** PNG, transparent
**Wire in:** replace `<Desk />` with an `<img>` at `max-width: 230px`, `image-rendering: pixelated`.

## A2 · Devopoly — wood table backdrop

Replaces the CSS gradient behind the board.

> Seamless tileable texture of dark walnut wood grain, top-down, photographed
> under soft even light. Rich chocolate brown with subtle lighter grain streaks.
> Slightly worn, matte finish, no varnish glare. No objects, no shadows, no
> vignette. Flat and even across the whole frame so it tiles without a visible seam.

**Size:** 1024×1024, tileable · **Format:** JPG (no transparency needed)

## A3 · Arcade — cabinet side art

Replaces the flat gradient panels in `CabinetSides`.

> Retro arcade cabinet side art panel, tall vertical composition. Neon synthwave
> style: hot pink and cyan geometric shapes, a chrome grid horizon, star bursts,
> bold diagonal stripes. 1980s coin-op aesthetic, screen-printed look with flat
> spot colours and hard edges. Very dark near-black background so it fades into
> the page. No text, no characters, no logos.

**Size:** 220×1000 · **Format:** PNG · **Generate:** one, then mirror it for the right side.

## A4 · Casino — felt table surface

Replaces the radial gradient in `designs/casino/index.tsx`.

> Seamless tileable texture of casino table felt, deep emerald green, top-down,
> soft diffused light. Fine woven fabric weave visible up close, slightly darker
> in the weave valleys. Luxurious and even. No logos, no markings, no chips, no
> cards, no vignette, no shadows.

**Size:** 1024×1024, tileable · **Format:** JPG

## A5 · RPG — parchment sheet

Replaces the CSS dot-pattern on the character sheet.

> Seamless tileable aged parchment texture, warm cream and light tan, subtle
> fibrous grain with faint mottling and a few very soft age spots. Flat even
> lighting, no burnt edges, no curl, no torn borders, no writing. Must tile
> invisibly.

**Size:** 1024×1024, tileable · **Format:** JPG

## A6 · Case Files — corkboard

Replaces the CSS dot pattern on the detective board.

> Seamless tileable cork board texture, natural warm tan with visible cork
> granules and darker flecks, flat even lighting, shot straight on. No pins, no
> paper, no frame, no shadows.

**Size:** 1024×1024, tileable · **Format:** JPG

## A7 · Star Map — deep space backdrop

Replaces the CSS radial gradient and procedural star dots.

> Deep space background, wide field of small stars at varying brightness, a faint
> dusty nebula in deep indigo and teal drifting across one corner. Mostly very
> dark — near black — so interface elements sit clearly on top. Subtle, not
> spectacular. No planets, no galaxies, no lens flares, no text.

**Size:** 1920×1080 · **Format:** JPG

## A8 · Comic — panel backgrounds set

The comic currently has halftone dots and flat shapes where illustration should
be. Six reusable backgrounds, not tied to any project.

> Comic book panel background, 1960s silver age style. Bold black ink outlines,
> flat limited colour, visible ben-day halftone dots. Scene: {SCENE}. No
> characters, no speech bubbles, no text, no panel border. Slightly desaturated
> print colours as if on newsprint.

Run six times, swapping `{SCENE}` for:
`a cluttered desk at night lit by a monitor` · `a city skyline at dawn` ·
`an empty meeting room with a whiteboard` · `a server room corridor` ·
`a coffee shop window seat in the rain` · `a rooftop at sunset`

**Size:** 640×420 each · **Format:** PNG

---

# Tier B — per-project (only for the portfolio you actually ship)

Generate one per project in `data/profile.ts`. Approve the first as the style
anchor, then explicitly reference it for the rest.

## B1 · Field Guide — creature sprites

Replaces the procedural blob in `SpecimenArt`. Biggest win in that design.

> Pixel art creature sprite, 32×32 grid upscaled, Game Boy Color era. A small
> friendly original monster representing {CONCEPT}. Body colour {ACCENT}. Front
> facing, standing, full body, clear silhouette, chunky readable pixels, black
> outline, flat shading with one highlight and one shadow tone. Transparent
> background. Original creature design — not based on any existing franchise.

Fill `{CONCEPT}` from what the project *does*, e.g. a commerce platform →
"a sturdy pack-carrying creature with satchels"; a realtime editor →
"a quick twin-tailed creature mid-motion"; an AI agent →
"a wispy floating creature with a glowing core".

**Size:** 256×256 · **Format:** PNG, transparent

## B2 · The Album — cover art

Replaces the generated SVG cover. High impact — it's the hero of that design.

> Album cover artwork, square. Bold minimal graphic design in the style of a
> modern indie record sleeve. Abstract geometric composition using {ACCENT} as
> the dominant colour against deep charcoal. Strong negative space, one clear
> focal shape, slight print grain. No text, no lettering, no faces, no hands.

**Size:** 1000×1000 · **Format:** JPG · **Note:** one cover for the whole album, not per track.

## B3 · The Exhibition — gallery artworks

Replaces the `Canvas` component's abstract SVG.

> Abstract painting suitable for a contemporary gallery wall. {STYLE} using a
> palette built around {ACCENT} with warm neutrals. Visible brush or print
> texture, confident composition, gallery quality. No frame, no signature, no
> text, no figures.

Vary `{STYLE}` across the set so the rooms don't feel repetitive:
`hard-edge geometric abstraction` · `soft colour field with blended bands` ·
`gestural brushwork over a flat ground` · `layered screen-print shapes` ·
`minimal line composition on raw canvas` · `torn-paper collage forms`

**Size:** 1200×900 · **Format:** JPG

## B4 · Cartridge — label art

Replaces the flat coloured rectangle on each cartridge.

> Retro game cartridge label artwork, landscape. Early 90s console box art
> style: bold airbrushed illustration, saturated colours built around {ACCENT},
> dramatic diagonal composition, thick border. Subject: {CONCEPT}. No text, no
> logos, no ratings badges.

**Size:** 512×384 · **Format:** PNG

## B5 · Claw Machine — plush prizes

Replaces the plain gachapon capsules.

> Cute plush toy character, product photo on transparent background, soft felt
> and fleece textures, visible stitching and a small fabric tag. Rounded chunky
> proportions, simple embroidered face. Main colour {ACCENT}. Represents
> {CONCEPT}. Studio lit, soft shadows, seen straight on. Original character design.

**Size:** 400×400 · **Format:** PNG, transparent

## B6 · Trading Cards — card art

Replaces the generated `CardArt` SVG.

> Trading card illustration, portrait orientation, framed vignette composition.
> Painterly fantasy-tech style with dramatic rim lighting. Dominant colour
> {ACCENT} against a dark background. Subject: {CONCEPT} rendered as an
> allegorical object or structure — no people, no faces. Rich detail toward the
> centre, darker at the edges so the card frame reads cleanly.

**Size:** 640×480 · **Format:** JPG

---

# Wiring generated art in

Two things to keep true when you swap code art for image art:

1. **Keep the procedural version as a fallback.** Add an optional `art?: string`
   to `Project` in `data/types.ts`, and have components render `<img>` when it's
   set and the generated SVG when it isn't. That preserves the "swap the profile
   and it still works" contract for everyone who doesn't have your images.

2. **Watch the page weight.** The whole collection currently downloads zero
   images. Serve generated art through `next/image`, and prefer WebP or AVIF over
   PNG for anything without transparency.

For pixel art specifically, always set:

```css
image-rendering: pixelated;
```

Without it the browser smooths the pixels and the whole effect dies.

---

# Reviewing changes visually

`scripts/shots.sh` screenshots every design with headless Chrome — no preview
pane required:

```
npm run dev                    # in another terminal
bash scripts/shots.sh          # defaults to 1440x900
bash scripts/shots.sh 375 812  # mobile pass
```

PNGs land in `.shots/`. Two things the script already handles, both of which
cost real time to discover: Chrome needs a distinct `--user-data-dir` per
invocation or the second call silently attaches to the first and writes nothing,
and the `--screenshot` path must use forward slashes even on Windows.

Look at the output before and after any visual change. Several defects fixed in
this pass — a broken corner icon, six identical tile icons, a claw cable that
never rendered, gallery frames invisible against the wall — were completely
undetectable from the DOM.
