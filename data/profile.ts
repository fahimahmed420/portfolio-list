import type { Profile } from "./types";

/**
 * PLACEHOLDER CONTENT — every value here is invented.
 *
 * Jordan Vale is a fictional person (they/them). All links point at example.com.
 * This file is the only thing you edit to adopt one of these designs; see
 * PLACEHOLDER.md at the repo root.
 *
 * Keep the shape full. Designs are built against a profile with ~6 projects and
 * ~5 skill groups; they degrade gracefully with fewer, but they look their best
 * when the content is complete.
 */
export const profile: Profile = {
  name: "Jordan Vale",
  initials: "JV",
  role: "Full-Stack Engineer",
  tagline: "I build software that survives contact with real users.",
  location: "Lisbon, Portugal",
  availability: "Open to new work",
  bioShort:
    "Full-stack engineer who takes products from empty repo to production traffic.",
  /**
   * Paragraphs are separated by a blank line and are otherwise UNBROKEN.
   * Designs render this with `white-space: pre-line`, so a newline added here
   * for source tidiness becomes a real line break mid-sentence on the page.
   */
  bio: `I build web products end to end — data model, API, interface, and the boring deployment glue that keeps them alive at 3am. Most of my work sits where a clean schema meets an interface that feels effortless, and I care about that seam more than about any particular framework.

I like problems with real constraints: a courier API that returns nonsense on Tuesdays, a table that outgrew its index, a design that has to work on a five-year-old Android phone. Ship it, watch it, fix what actually broke.`,
  offbeat: [
    "Rewrites the same shell prompt every six months",
    "Learns a city by finding its best cheap noodles",
    "Owns more mechanical keyboards than is defensible",
    "Reads changelogs for fun, which is a personality flaw",
  ],

  stats: [
    { label: "Years shipping", value: "6" },
    { label: "Projects in production", value: "14" },
    { label: "Open-source repos", value: "37" },
    { label: "Largest table migrated", value: "40M rows" },
    { label: "Uptime, last 12mo", value: "99.9%" },
  ],

  skills: [
    {
      category: "Frontend",
      summary: "Interfaces that stay fast and legible as they grow.",
      items: [
        { name: "React", level: 5 },
        { name: "Next.js", level: 5 },
        { name: "TypeScript", level: 5 },
        { name: "Tailwind CSS", level: 4 },
        { name: "Framer Motion", level: 4 },
        { name: "Accessibility", level: 4 },
      ],
    },
    {
      category: "Backend",
      summary: "APIs with clear contracts and honest error states.",
      items: [
        { name: "Node.js", level: 5 },
        { name: "PostgreSQL", level: 4 },
        { name: "Prisma", level: 4 },
        { name: "REST & tRPC", level: 4 },
        { name: "Go", level: 3 },
        { name: "Redis", level: 3 },
      ],
    },
    {
      category: "Data & Infra",
      summary: "Pipelines, migrations, and the pager that stays quiet.",
      items: [
        { name: "Docker", level: 4 },
        { name: "CI/CD", level: 4 },
        { name: "Observability", level: 4 },
        { name: "Terraform", level: 3 },
        { name: "Kubernetes", level: 3 },
        { name: "Query tuning", level: 4 },
      ],
    },
    {
      category: "AI & ML",
      summary: "LLM features that fail safely and cost what you expect.",
      items: [
        { name: "LLM integration", level: 4 },
        { name: "RAG pipelines", level: 4 },
        { name: "Prompt design", level: 4 },
        { name: "Vector search", level: 3 },
        { name: "Eval harnesses", level: 3 },
      ],
    },
    {
      category: "Craft",
      summary: "The habits that make the other four groups worth anything.",
      items: [
        { name: "Testing", level: 4 },
        { name: "Code review", level: 5 },
        { name: "Technical writing", level: 4 },
        { name: "Mentoring", level: 4 },
        { name: "Product sense", level: 4 },
      ],
    },
  ],

  projects: [
    {
      slug: "northwind",
      name: "Northwind",
      blurb: "Headless commerce platform running a real storefront.",
      description: `A full import-to-doorstep commerce platform: customer storefront, private admin console, inventory, and automated courier booking in one codebase. Built for a merchant moving physical goods across borders, so the unglamorous parts — customs fields, partial shipments, refunds — got as much attention as the product grid.`,
      tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Stripe", "Redis"],
      year: "2025",
      role: "Lead engineer",
      live: "https://example.com/northwind",
      repo: "https://github.com/example/northwind",
      highlights: [
        "Cut checkout abandonment 23% by rebuilding the address step",
        "Courier booking automated end to end — no manual entry",
        "Admin console ships order labels in a single click",
      ],
      accent: "#C2382E",
    },
    {
      slug: "halcyon",
      name: "Halcyon",
      blurb: "Real-time collaborative editor with offline-first sync.",
      description: `A document editor where several people type at once and nobody loses work. CRDT-backed sync over WebSockets with a local-first cache, so the editor keeps working on a train and reconciles cleanly when the connection returns.`,
      tech: ["React", "WebSockets", "CRDT", "IndexedDB", "Node.js"],
      year: "2024",
      role: "Full-stack",
      live: "https://example.com/halcyon",
      repo: "https://github.com/example/halcyon",
      highlights: [
        "Sub-80ms median keystroke propagation across regions",
        "Offline edits merge without a conflict UI",
        "Presence and cursors for up to 40 concurrent editors",
      ],
      accent: "#2E7FC2",
    },
    {
      slug: "tinderbox",
      name: "Tinderbox",
      blurb: "Support agent that answers from your own docs.",
      description: `A retrieval-augmented support assistant wired into a live help desk. It answers from indexed product documentation, cites the page it used, and hands off to a human the moment confidence drops — which turned out to matter more than raw accuracy.`,
      tech: ["Python", "FastAPI", "pgvector", "LLM APIs", "Redis"],
      year: "2024",
      role: "Backend & ML",
      repo: "https://github.com/example/tinderbox",
      highlights: [
        "Deflects 41% of tickets with a cited answer",
        "Hard cost ceiling per conversation, enforced server-side",
        "Eval suite gates every prompt change in CI",
      ],
      accent: "#7B4FA8",
    },
    {
      slug: "lumen",
      name: "Lumen",
      blurb: "Design system and component library for six product teams.",
      description: `A themeable component library that replaced four diverging in-house kits. Tokens flow from design tools straight into the build, so a colour change lands everywhere at once instead of becoming six tickets.`,
      tech: ["React", "TypeScript", "Radix", "Storybook", "Style Dictionary"],
      year: "2023",
      role: "Maintainer",
      live: "https://example.com/lumen",
      repo: "https://github.com/example/lumen",
      highlights: [
        "68 components, every one keyboard and screen-reader tested",
        "Adopted by six teams in under two quarters",
        "Visual regression tests on every pull request",
      ],
      accent: "#E0A02E",
    },
    {
      slug: "waypoint",
      name: "Waypoint",
      blurb: "Observability dashboard that points at the actual broken thing.",
      description: `An internal dashboard that correlates deploys, error spikes and latency in one timeline. Built after one too many incidents spent flipping between four tabs to answer "what changed?" — now that question takes about ten seconds.`,
      tech: ["Next.js", "ClickHouse", "Grafana", "Go", "Docker"],
      year: "2023",
      role: "Full-stack",
      live: "https://example.com/waypoint",
      highlights: [
        "Median incident triage down from 18 minutes to 4",
        "Deploy markers overlaid on every metric series",
        "Handles 40M events/day on modest hardware",
      ],
      accent: "#2E9E6B",
    },
    {
      slug: "foundry",
      name: "Foundry",
      blurb: "CLI that scaffolds a production-ready service in one command.",
      description: `An opinionated generator for new services: tests, CI, linting, logging, health checks and a Dockerfile, all wired together on the first commit. It exists because the first day of a new repo was quietly costing every team a week.`,
      tech: ["Go", "Cobra", "Docker", "GitHub Actions"],
      year: "2022",
      role: "Author",
      repo: "https://github.com/example/foundry",
      highlights: [
        "New service from zero to deployed in under ten minutes",
        "Generated projects pass the org's compliance checks by default",
        "Plugin system for per-team conventions",
      ],
      accent: "#B5651D",
    },
  ],

  experience: [
    {
      role: "Senior Full-Stack Engineer",
      org: "Meridian Labs",
      period: "2023 — Present",
      summary:
        "Leads the commerce platform team. Owns the checkout rewrite, the design system rollout, and the on-call rotation nobody wants but everybody needs.",
    },
    {
      role: "Full-Stack Engineer",
      org: "Cobalt & Finch",
      period: "2021 — 2023",
      summary:
        "Built customer-facing product for a B2B SaaS. Took the reporting module from a nightly batch job to real-time without changing the pricing model.",
    },
    {
      role: "Frontend Engineer",
      org: "Studio Harbour",
      period: "2019 — 2021",
      summary:
        "Agency work across a dozen client sites. Learned to ship on someone else's deadline and to write CSS other people could read.",
    },
  ],

  education: [
    {
      degree: "BSc, Computer Science",
      org: "University of Example",
      period: "2015 — 2019",
    },
  ],

  links: [
    {
      kind: "github",
      label: "GitHub",
      handle: "@jordanvale",
      href: "https://github.com/example",
    },
    {
      kind: "linkedin",
      label: "LinkedIn",
      handle: "in/jordanvale",
      href: "https://linkedin.com/in/example",
    },
    {
      kind: "email",
      label: "Email",
      handle: "hey@example.com",
      href: "mailto:hey@example.com",
    },
    {
      kind: "site",
      label: "Website",
      handle: "jordanvale.example.com",
      href: "https://example.com",
    },
    {
      kind: "x",
      label: "X",
      handle: "@jordanvale",
      href: "https://x.com/example",
    },
  ],
};

export default profile;
