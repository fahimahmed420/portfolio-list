/**
 * Interaction prober. Drives a design with real clicks and keystrokes, taking a
 * screenshot after each step, so interactive states get reviewed the same way
 * static layout does.
 *
 *   node scripts/probe.mjs <slug> [width] [height]
 *
 * Steps live in STEPS below, keyed by slug. Each step is
 * { name, do: async (page) => void }. Shots land in .shots/<slug>/NN-name.png.
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Click the first element whose text matches, or throw with context. */
async function clickText(page, selector, re) {
  const handle = await page.evaluateHandle(
    (sel, src) => {
      const rx = new RegExp(src, "i");
      return [...document.querySelectorAll(sel)].find((el) =>
        rx.test(el.textContent || el.getAttribute("aria-label") || ""),
      );
    },
    selector,
    re.source ?? re,
  );
  const el = handle.asElement();
  if (!el) throw new Error(`no ${selector} matching ${re}`);
  await el.click();
}

const STEPS = {
  claw: [
    { name: "initial", do: async () => {} },
    {
      name: "steered-left",
      do: async (p) => {
        for (let i = 0; i < 6; i++) {
          await p.click('[aria-label="Move claw left"]');
          await wait(120);
        }
      },
    },
    {
      name: "mid-drop",
      do: async (p) => {
        await p.click('button ::-p-text(DROP)').catch(async () => {
          await clickText(p, "button", /^DROP$/);
        });
        await wait(900);
      },
    },
    { name: "lifting", do: async () => wait(900) },
    { name: "delivered", do: async () => wait(1600) },
  ],
  desktop: [
    { name: "initial", do: async () => {} },
    { name: "projects-open", do: async (p) => clickText(p, "button", /Projects/) },
    { name: "about-open", do: async (p) => clickText(p, "button", /About Me/) },
    {
      name: "minimized",
      do: async (p) => {
        await p.click('[aria-label^="Minimise"]').catch(() => {});
        await wait(300);
      },
    },
    {
      name: "maximized",
      do: async (p) => {
        await p.click('[aria-label^="Maximise"]').catch(() => {});
        await wait(300);
      },
    },
    {
      name: "closed",
      do: async (p) => {
        await p.click('[aria-label^="Close"]').catch(() => {});
        await wait(300);
      },
    },
  ],
  skilltree: [
    { name: "initial", do: async () => {} },
    {
      name: "node-selected",
      do: async (p) => {
        const n = await p.$('g[role="button"]');
        await n?.click();
        await wait(300);
      },
    },
  ],
  fieldguide: [
    { name: "initial", do: async () => {} },
    { name: "next", do: async (p) => p.click('[aria-label="Next specimen"]') },
    { name: "caught", do: async (p) => clickText(p, "button", /catch it/i) },
  ],
  devopoly: [
    { name: "initial", do: async () => {} },
    {
      name: "tile-open",
      do: async (p) => {
        await p.click('[data-tile-index="3"]');
        await wait(400);
      },
    },
  ],
  inventory: [
    { name: "initial", do: async () => {} },
    {
      name: "item-open",
      do: async (p) => {
        const b = await p.$('button[aria-label^="Northwind"]');
        await b?.click();
        await wait(400);
      },
    },
    { name: "closed", do: async (p) => p.click('[aria-label="Close"]') },
  ],
  cards: [
    { name: "initial", do: async () => {} },
    {
      name: "card-open",
      // The card face, not the "add to deck" button beneath it.
      do: async (p) => {
        const h = await p.evaluateHandle(() =>
          [...document.querySelectorAll("button")].find(
            (b) =>
              /Northwind/.test(b.textContent || "") &&
              !/add to deck/i.test(b.textContent || ""),
          ),
        );
        await h.asElement()?.click();
        await wait(400);
      },
    },
    { name: "closed", do: async (p) => p.click('[role="dialog"] [aria-label="Close"]') },
    {
      name: "deck-drafted",
      do: async (p) => {
        for (const b of (await p.$$("button")).slice(0, 40)) {
          const t = await p.evaluate((e) => e.textContent, b);
          if (/add to deck/i.test(t || "")) await b.click();
        }
      },
    },
  ],
  arcade: [
    { name: "attract", do: async () => {} },
    { name: "started", do: async (p) => clickText(p, "button", /PRESS START/) },
    { name: "stage-open", do: async (p) => p.click('[data-stage="1"]') },
    { name: "closed", do: async (p) => p.click('[aria-label="Close"]') },
  ],
  casino: [
    { name: "initial", do: async () => {} },
    {
      name: "bet-placed",
      do: async (p) => {
        await p.click('button[aria-label^="Place bet"]');
        await wait(900);
      },
    },
    { name: "closed", do: async (p) => p.click('[aria-label="Close"]') },
  ],
  cartridge: [
    { name: "menu", do: async () => {} },
    { name: "load-project", do: async (p) => clickText(p, "button", /LOAD PROJECT/) },
    { name: "cartridge-open", do: async (p) => clickText(p, "button", /NORTHWIND/) },
    { name: "options", do: async (p) => {
      await clickText(p, "button", /BACK/);
      await wait(250);
      await clickText(p, "button", /BACK/);
      await wait(250);
      await clickText(p, "button", /OPTIONS/);
    } },
  ],
  museum: [
    { name: "initial", do: async () => {} },
    { name: "room-switched", do: async (p) => (await p.$$("nav button"))[1]?.click() },
    { name: "exhibit-open", do: async (p) => (await p.$$("main button"))[0]?.click() },
    { name: "closed", do: async (p) => p.click('[aria-label="Close"]') },
  ],
  departures: [
    { name: "board", do: async () => wait(2200) },
    { name: "pass-open", do: async (p) => (await p.$$("ul li button"))[1]?.click() },
    { name: "closed", do: async (p) => p.click('[aria-label="Close"]') },
  ],
  casefile: [
    { name: "initial", do: async () => {} },
    { name: "case-open", do: async (p) => clickText(p, "button", /CASE #002/) },
    { name: "closed", do: async (p) => p.click('[aria-label="Close"]') },
  ],
  mission: [
    { name: "initial", do: async () => {} },
    { name: "planet-selected", do: async (p) => (await p.$$('g[role="button"]'))[3]?.click() },
  ],
  openworld: [
    { name: "initial", do: async () => {} },
    { name: "cafe", do: async (p) => (await p.$$('svg g[role="button"]'))[8]?.click() },
    { name: "mission", do: async (p) => (await p.$$('svg g[role="button"]'))[0]?.click() },
  ],
  album: [
    { name: "initial", do: async () => {} },
    { name: "track-open", do: async (p) => (await p.$$("ul li button"))[2]?.click() },
  ],
  terminal: [
    { name: "booted", do: async () => wait(2400) },
    {
      name: "typed-help",
      do: async (p) => {
        await p.click('input[aria-label="Terminal input"]');
        await p.keyboard.type("skills");
        await p.keyboard.press("Enter");
        await wait(400);
      },
    },
    { name: "theme-toggled", do: async (p) => clickText(p, "aside button", /^theme/) },
  ],
};

const slug = process.argv[2];
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);
if (!slug || !STEPS[slug]) {
  console.error(`usage: node scripts/probe.mjs <${Object.keys(STEPS).join("|")}>`);
  process.exit(1);
}

const exe = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!exe) {
  console.error("No Chrome found");
  process.exit(1);
}

const out = path.join(process.cwd(), ".shots", slug);
fs.mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: exe,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
  defaultViewport: { width: W, height: H },
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 200));
});

await page.goto(`http://localhost:3000/d/${slug}`, { waitUntil: "networkidle2" });
await wait(600);

let i = 0;
for (const step of STEPS[slug]) {
  try {
    await step.do(page);
  } catch (e) {
    console.log(`  step "${step.name}" failed: ${e.message}`);
  }
  await wait(350);
  const file = path.join(out, `${String(++i).padStart(2, "0")}-${step.name}.png`);
  await page.screenshot({ path: file });
  console.log(`  ${file.split(".shots")[1]}`);
}

if (errors.length) {
  console.log("\nconsole/page errors:");
  [...new Set(errors)].slice(0, 6).forEach((e) => console.log("  " + e));
}

await browser.close();
