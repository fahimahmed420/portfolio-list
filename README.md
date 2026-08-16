# Portfolio List

A collection of **21 portfolio website designs**, all driven by a single
shared content file. Browse them from one gallery, pick the one you like,
edit one file, and it's yours.

Every design in this repo renders the exact same object — a `Profile`. No
design imports content directly and no design hardcodes a name, a project,
or a link. That's what makes "picking one" a content edit instead of a
rewrite: swap `data/profile.ts` and all 21 designs update together.

**All content shown is placeholder data for a fictional person.** Nothing
in this repo belongs to anyone real.

## Live structure

```
/               the gallery — every design as a filterable card grid
/d/<slug>       one design, full page
```

## The designs

### Games and toys

| Design | Route | What it is |
| --- | --- | --- |
| **Devopoly** | `/d/devopoly` | A pixel-art board game where every property is part of the career. |
| **Character Sheet** | `/d/rpg` | You are the playable character. Skills are stats, projects are quests. |
| **Trading Cards** | `/d/cards` | Every project is a collectible card. Build a deck from the good ones. |
| **Skill Tree** | `/d/skilltree` | A talent tree where every node you light up points at the work it built. |
| **Field Guide** | `/d/fieldguide` | A creature index. Every project is a specimen you catch to read. |
| **Claw Machine** | `/d/claw` | Your projects are prizes. Drive the claw and grab one. |
| **Cartridge** | `/d/cartridge` | A 90s boot menu. Start game, load project, options, credits. |
| **Arcade** | `/d/arcade` | Insert coin. Projects are stages, skills are the high-score table. |

### Interfaces and simulations

| Design | Route | What it is |
| --- | --- | --- |
| **Desktop OS** | `/d/desktop` | A whole operating system. Projects open as windows you can drag. |
| **Terminal** | `/d/terminal` | A portfolio you explore by typing — with a real command parser. |
| **Case Files** | `/d/casefile` | Projects as cases to investigate. Evidence, notes, verdict. |
| **Star Map** | `/d/mission` | You're mission commander. Projects are worlds on the chart. |
| **Open World** | `/d/openworld` | A city map. Projects are missions, districts are the sections. |
| **Inventory** | `/d/inventory` | A block-game inventory. Projects are items, skills are tools. |
| **The Table** | `/d/casino` | Green felt and gold trim. Place a bet to open a project. |
| **Departures** | `/d/departures` | A split-flap flight board. Every project is a destination. |

### Print and curation

| Design | Route | What it is |
| --- | --- | --- |
| **Editorial** | `/d/editorial` | A print magazine that happens to be a portfolio. |
| **The Broadsheet** | `/d/newspaper` | Your career as a front page. Projects are the day's stories. |
| **The Exhibition** | `/d/museum` | Projects hung as exhibits. Walk the rooms, read the plaques. |
| **The Album** | `/d/album` | A record. Projects are tracks; case studies are the liner notes. |
| **Issue #1** | `/d/comic` | Your career as a comic. Every project gets a chapter. |

## Running it locally

Requires Node 20+.

```bash
git clone https://github.com/fahimahmed420/portfolio-list.git
cd portfolio-list
npm install
npm run dev
```

Open `http://localhost:3000` for the gallery, or jump straight to any
design at `/d/<slug>` from the table above.

```bash
npm run build   # production build
npm run start   # serve the production build
```

## How to make one your own

Every design in this repo renders the same object: a `Profile`. No design
hardcodes a name, a project, or a link, so adopting one is a content edit,
not a design edit.

### The one file you change

Open **`data/profile.ts`** and replace the values. That's the whole job —
all 21 designs update from it at once.

The person in there now, **Jordan Vale**, is invented. Every link points
at `example.com`. Replace the name, role, bio, projects, skills,
experience, education, and links with your own, and every design in the
gallery will render your real portfolio.

### What the shape expects

`data/types.ts` is the contract. A few fields that aren't obvious:

| Field | Notes |
| --- | --- |
| `initials` | Two characters. Used where there's no room for a full name. |
| `bioShort` | One sentence. Used on tiles and in page `<meta>` descriptions. |
| `bio` | Long form. Paragraphs are separated by a blank line; keep each paragraph itself on one unbroken line — several designs render this with a CSS rule that turns a stray line break into a real one mid-sentence. |
| `offbeat` | Light personal detail — a few lines of "off the clock" trivia. Powers Devopoly's REST corner and Editorial's colophon. |
| `skills[].items[].level` | 1–5. Rendered as stars, bars, or power-ups depending on the design. |
| `projects[].accent` | A hex color. Becomes the property band, stage glow, card border, or folio marker for that project. Pick colors that are visually distinct from each other. |
| `projects[].live` / `repo` | Both optional. Every design renders cleanly when a project has neither. |

### Numbers you don't have to write

Several designs are game-shaped — attribute scores, character level, card
rarity, difficulty ratings, creature types, orbital distance, track run
times. **None of that lives in the profile.** It's computed in
`lib/derive.ts` from fields you already filled in, and it's deterministic,
so the same profile always produces the same numbers.

Two consequences worth knowing:

- Editing `skills[].items[].level` moves the RPG attribute scores, the
  skill-tree node fills, and the arcade high scores together — one edit,
  several designs.
- Giving a project a broader `tech` array or more `highlights` raises its
  card rarity and difficulty rating. Depth is rewarded; you can't set the
  rarity directly.

### Sizing

The designs are built against roughly **6 projects** and **5 skill
groups**. They degrade gracefully outside that range rather than
breaking:

- Devopoly's board has six project slots and five skill slots; any slot
  with nothing behind it falls back to a generic tile. Extra projects
  beyond six stay reachable through the board's own PROJECTS deck, which
  always lists everything.
- Fewer than three projects will make the Arcade's stage grid and the
  Editorial contents page look sparse. That's a content decision, not a
  layout bug — add more projects or accept the sparser layout.

### Adding a new design

1. Create `designs/<slug>/meta.ts` (a `DesignMeta` — name, pitch,
   description, tags, palette) and `designs/<slug>/index.tsx` (a
   default-exported component that takes `{ profile }`).
2. Add the meta to the array in `designs/registry.ts`.
3. Add one line to `DESIGNS` in `app/d/[slug]/DesignHost.tsx`.

The gallery card, the route, `generateStaticParams`, and the page
metadata all follow from the registry automatically.

Two rules keep every design reusable — they're the only ones that matter:

- **Never import `data/profile.ts` from inside a design.** Take the
  profile as a prop.
- **Never assume a count.** Loop over whatever you're given, however many
  projects or skills that turns out to be.

## Project layout

```
app/
  page.tsx            the gallery
  d/[slug]/            renders one design behind shared navigation chrome
  globals.css          theme tokens, print rules, reduced-motion handling
data/
  types.ts             the Profile contract — the only coupling between content and design
  profile.ts           the placeholder person — edit this to make it yours
designs/
  registry.ts           single source of truth for which designs exist
  <slug>/meta.ts        how a design describes itself (name, pitch, tags, palette)
  <slug>/index.tsx       the design itself: ({ profile }) => a full portfolio page
components/
  DesignFrame.tsx        back / prev / next navigation overlay (press H to hide it)
  Poster.tsx             hand-drawn SVG thumbnails for the gallery cards
  GalleryGrid.tsx         the filterable card grid on /
lib/
  derive.ts             turns profile fields into game-shaped numbers (see above)
  usePanZoom.ts           pinch-to-zoom / drag-to-pan for canvas-style designs
  useFocusTrap.ts         accessible modal behavior: focus trap, Escape, restore
  useSticky.ts            localStorage-backed state for designs with persistent progress
public/art/               generated illustration assets (WebP, ~2MB total)
docs/ART-PROMPTS.md       prompts used to generate the art, if you want to make your own
scripts/                  dev tooling: layout audit, interaction probe, screenshot capture
```

## Notes on the build

- **No image downloads for the base experience.** Every icon, token,
  poster, and texture that isn't in `public/art/` is inline SVG or CSS —
  crisp at any zoom, and it recolors itself from `profile.accent`.
- **Illustrated art is optional and additive.** `public/art/` holds
  generated backdrops and textures (desk scene, wood grain, felt,
  parchment, cork, starfield, cabinet art, gallery paintings, comic
  panels, an album cover, a palette-swapped creature sprite). Every design
  that uses one still has a working CSS/SVG fallback, so removing
  `public/art/` doesn't break anything — it just goes back to fully
  procedural.
- **Accessible by default.** Board tiles, stage cards, and map markers are
  real buttons in a keyboard-navigable grid. Modals trap focus, restore it
  on close, and close on Escape. Every generated SVG icon carries a title
  or `aria-hidden`. All animation respects `prefers-reduced-motion`.
- **Print-aware.** The print-styled designs (Editorial, The Broadsheet,
  The Exhibition) include actual `@media print` rules — floating chrome
  disappears, backgrounds flatten, and link destinations print alongside
  the text.
- **Responsive from 360px up.** Devopoly and Star Map use pan/zoom for
  their canvas-style boards on small screens; everything else reflows
  normally.

Built with Next.js 16, React 19, Tailwind CSS v4, and Framer Motion.

## License

No license file is included. If you plan to reuse this code beyond your
own portfolio, add a license that suits your intent.
