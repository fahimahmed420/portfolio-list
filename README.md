# Portfolio Designs

A collection of complete, reusable portfolio designs — twenty-one of them, all
driven by a single shared content file, browsable from one gallery.

The point is reuse: a design here is a pure function of a `Profile` object. It
never imports content directly and never hardcodes a name, a project or a link.
Adopting a design means editing one file — see [PLACEHOLDER.md](PLACEHOLDER.md).

**All content in this repo is placeholder data for a fictional person.**

## The designs

### Games and toys

| Design | What it is |
| --- | --- |
| **Devopoly** | A pixel-art board game. Projects and skill groups sit on the perimeter as title deeds — click any tile, or roll the dice and let a token tour the board. Every lap past START pays out. All art is hand-drawn SVG bitmaps. |
| **Character Sheet** | A tabletop RPG sheet on parchment. Skill groups become rolled attributes with modifiers, experience becomes an XP bar, projects become quests with objectives and loot. |
| **Trading Cards** | A holo card set. You're the character card; projects are cards with a type inferred from the stack, rarity earned by depth, and four stat bars. Cards tilt under the cursor and can be drafted into a deck. |
| **Skill Tree** | A radial talent tree. Each skill group is a branch, each skill a node lit by level — and selecting a node lists the projects that actually used it. |
| **Field Guide** | A handheld creature-index device. Projects are specimens with types, stats and abilities; catch one to open the case study. |
| **Claw Machine** | A working claw machine. Steer, drop, and pull a project out of the pit. A plain prize list sits underneath so nobody has to win to read anything. |
| **Cartridge** | A 90s console boot menu — start game, load project, options, credits. Projects live on a shelf as labelled cartridges. |
| **Arcade** | A coin-op cabinet: attract screen, marquee, stage-select grid, high-score table, and a control deck whose joystick and buttons actually drive the selection. |
| **Inventory** | A block-game inventory screen. Projects sit in the item grid with rarity-coloured tooltips that follow the cursor, skills fill the toolbar, the résumé is a written book, and contact is a crafting recipe. |
| **Open World** | A top-down city map with a HUD. Landmarks stand in for sections — office, café, safehouse, payphone — and each project is a mission marker with its own briefing. |
| **The Table** | A casino table. Projects are betting spots stacked with chips weighted by what the work carries; placing a bet deals the project as a playing card. |

### Interfaces and simulations

| Design | What it is |
| --- | --- |
| **Desktop OS** | A fake desktop with a menu bar, live clock, icons and genuinely draggable windows that focus, stack and close. |
| **Terminal** | Posts a BIOS, boots, then hands over a live prompt with a real command parser, Tab-completion, history and a `tree` of the whole profile. |
| **Case Files** | A detective's corkboard. Projects are case folders with brief, evidence log, case notes and a stamped verdict. |
| **Star Map** | Mission control. Projects orbit as planets, skills read as onboard systems at operational status, experience is the mission log. |
| **Departures** | An airport split-flap board that clatters into place on load. Projects are flights with gates, times and statuses; selecting one prints a boarding pass. |

### Print and curation

| Design | What it is |
| --- | --- |
| **Issue #1** | A comic book with a cover, chapters and panels. Each project is an illustrated chapter with caption boxes and sound effects, over ben-day dots. |
| **Editorial** | A print magazine: serif display type, asymmetric grid, drop caps, numbered spreads. |
| **The Broadsheet** | A newspaper front page — masthead, dateline, lead story with a drop cap, then Investigations, Business, Technology and Classifieds. |
| **The Exhibition** | A gallery with rooms derived from the kind of work. Each project hangs framed under a picture light with a museum plaque. |
| **The Album** | A streaming album page. Projects are tracks with derived run times, liner notes expand in place, and a now-playing bar follows along. |

## Running it

```bash
npm install
```

```bash
npm run dev
```

The gallery is at `/`; each design is at `/d/<slug>`.

## How it fits together

```
data/
  types.ts          the Profile contract — the only coupling between content and design
  profile.ts        the placeholder person (edit this one)
designs/
  registry.ts       metadata only, so the gallery stays light
  <slug>/meta.ts    how the design describes itself
  <slug>/index.tsx  the design: ({ profile }) => a whole portfolio
app/
  page.tsx          the gallery
  d/[slug]/         renders one design + shared navigation chrome
components/
  DesignFrame.tsx   back / prev / next overlay; press H to hide it
  Poster.tsx        hand-drawn SVG thumbnails for the gallery
lib/
  derive.ts         Profile → game numbers: attributes, level, rarity, type
  usePanZoom.ts     zoom by transform, pan by native scroll
  useFocusTrap.ts   Escape, Tab containment, focus restore
```

`lib/derive.ts` is what keeps the game-shaped designs honest. Attributes, levels,
rarity, difficulty, card stats and project "types" are all computed from fields
the Profile already has — nothing is stored twice, and a swapped-in profile gets
sensible numbers without anyone hand-tuning them. It is deterministic, so the
same profile always produces the same card rarities and orbits.

Adding a fifth design is a folder, one line in the registry, and one line in
`DesignHost`. Details in [PLACEHOLDER.md](PLACEHOLDER.md).

## Notes on the build

- **No image assets.** Every illustration — board icons, tokens, dice, gallery
  posters — is inline SVG or CSS. The pixel art is authored as character
  bitmaps in `designs/devopoly/PixelIcons.tsx` and rendered as merged rects.
- **Fonts** are self-hosted through `next/font`, so there are no runtime
  requests to Google.
- **Keyboard.** Board tiles and arcade stages are real buttons; arrow keys walk
  them, modals trap focus and restore it on close.
- **Reduced motion** is respected globally, and the dice roll skips its
  animation entirely rather than just speeding it up.

Built with Next.js 16, React 19, Tailwind v4 and Framer Motion.

## Reference

`docs/reference-devopoly.png` is the art-direction reference the Devopoly board
was built from.
