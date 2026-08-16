# Making one of these yours

Every design in this repo renders the same object: a `Profile`. No design
hardcodes a name, a project or a link, so adopting one is a content edit, not a
design edit.

## The one file you change

Open **`data/profile.ts`** and replace the values. That is the whole job — all
four designs update at once.

The person in there now, **Jordan Vale**, is invented. Every link points at
`example.com`. Nothing in this repo belongs to a real person.

## What the shape expects

`data/types.ts` is the contract. A few notes on fields that aren't obvious:

| Field | Notes |
| --- | --- |
| `initials` | Two characters. Used where there is no room for a name. |
| `bioShort` | One sentence. Goes on tiles and in `<meta>` descriptions. |
| `bio` | Long form. Blank lines between paragraphs are preserved. |
| `offbeat` | Light personal detail. Powers Devopoly's REST corner and Editorial's colophon. |
| `skills[].items[].level` | 1–5. Rendered as stars, bars or power-ups depending on the design. |
| `projects[].accent` | Hex. Becomes the property band, stage glow and folio marker. Pick distinct colours. |
| `projects[].live` / `repo` | Both optional. Designs render cleanly when a project has neither. |

## Numbers you don't have to write

Several designs are game-shaped — attributes, levels, rarity, difficulty, card
stats, creature types, orbits, track run times. **None of that is stored in the
profile.** It is all computed in `lib/derive.ts` from fields you already filled
in, and it is deterministic, so the same profile always yields the same results.

That means two things. Editing `skills[].items[].level` moves the RPG attribute
scores, the skill-tree node fills and the arcade high scores together. And giving
a project a broader `tech` array or more `highlights` raises its rarity and
difficulty — depth is rewarded, but you can't set it directly.

## Sizing

The designs are built against roughly **6 projects** and **5 skill groups**.

They degrade rather than break outside that: Devopoly's board has six project
slots and five skill slots, and any slot with no content behind it falls back to
a practice tile. Extra projects beyond six stay reachable through the board's
centre PROJECTS deck, which always lists everything.

Fewer than three projects will make the Arcade's stage grid look sparse, and
Editorial's contents page thin. That is a content problem, not a layout bug.

## Adding a design

1. Create `designs/<slug>/meta.ts` (a `DesignMeta`) and `designs/<slug>/index.tsx`
   (a default-exported component taking `{ profile }`).
2. Add the meta to the array in `designs/registry.ts`.
3. Add one line to `DESIGNS` in `app/d/[slug]/DesignHost.tsx`.

The gallery card, the route, `generateStaticParams` and the page metadata all
follow from the registry on their own.

Two rules keep designs reusable, and they are the only ones that matter:

- **Never import `data/profile.ts` from a design.** Take the profile as a prop.
- **Never assume a count.** Loop over what you're given.
