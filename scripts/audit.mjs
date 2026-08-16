/**
 * Layout audit across every design at a given viewport.
 *
 *   node scripts/audit.mjs [width] [height]
 *
 * Reports, per design: horizontal overflow, elements running past the right
 * edge, touch targets under 40px, and any console errors. Numbers rather than
 * screenshots, so a full sweep is cheap to read.
 */
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => fs.existsSync(p));

const W = Number(process.argv[2] || 375);
const H = Number(process.argv[3] || 812);

const slugs = fs
  .readFileSync("designs/registry.ts", "utf8")
  .match(/from "\.\/([a-z]+)\/meta"/g)
  .map((m) => m.match(/\.\/([a-z]+)\//)[1]);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
  defaultViewport: { width: W, height: H, isMobile: W < 768, hasTouch: W < 768 },
});

console.log(`\nAudit at ${W}x${H}\n`);
let problems = 0;

for (const slug of ["", ...slugs]) {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon/i.test(m.text()))
      errs.push(m.text().slice(0, 120));
  });

  // Without this the `pointer: coarse` rules never match and touch-only
  // sizing looks broken when it is in fact correct on a real device.
  // puppeteer's emulateMediaFeatures whitelist excludes `pointer`, so go
  // through CDP. Without it the coarse-pointer rules never match and
  // touch-only sizing reads as broken when it is correct on a real device.
  if (W < 768) {
    const cdp = await page.createCDPSession();
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "pointer", value: "coarse" },
        { name: "any-pointer", value: "coarse" },
      ],
    });
  }

  await page.goto(`http://localhost:3000${slug ? `/d/${slug}` : "/"}`, {
    waitUntil: "networkidle2",
  });
  await new Promise((r) => setTimeout(r, 900));

  const res = await page.evaluate((vw) => {
    const doc = document.documentElement;
    const over = doc.scrollWidth - vw;
    const wide = [];
    const small = [];
    document.querySelectorAll("*").forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) return;
      if (el.closest("svg")) return; // SVG interiors are clipped by their viewport
      if (b.right > vw + 2 && b.width < vw * 2) {
        const cs = getComputedStyle(el);
        // Ignore things deliberately inside a horizontal scroller.
        let p = el.parentElement;
        let scrolls = false;
        while (p) {
          const pc = getComputedStyle(p);
          if (pc.overflowX === "auto" || pc.overflowX === "scroll") scrolls = true;
          p = p.parentElement;
        }
        if (!scrolls && cs.position !== "fixed")
          wide.push(`${el.tagName}.${(el.className || "").toString().slice(0, 24)}`);
      }
    });
    document.querySelectorAll('button,a[href],[role="button"]').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.width > 0 && (b.height < 40 || b.width < 40))
        small.push(
          `${(el.textContent || el.getAttribute("aria-label") || "?").trim().slice(0, 18)} ${Math.round(b.width)}x${Math.round(b.height)}`,
        );
    });
    return { over, wide: [...new Set(wide)].slice(0, 4), wideN: wide.length, small: [...new Set(small)].slice(0, 4), smallN: small.length };
  }, W);

  const name = slug || "gallery";
  const flags = [];
  if (res.over > 2) flags.push(`overflow +${res.over}px`);
  if (res.wideN) flags.push(`${res.wideN} past right edge`);
  if (res.smallN) flags.push(`${res.smallN} targets <40px`);
  if (errs.length) flags.push(`${errs.length} errors`);

  if (flags.length) {
    problems++;
    console.log(`✗ ${name.padEnd(12)} ${flags.join(" · ")}`);
    if (res.wide.length) console.log(`    wide: ${res.wide.join(", ")}`);
    if (res.small.length) console.log(`    small: ${res.small.join(", ")}`);
    if (errs.length) console.log(`    err: ${[...new Set(errs)][0]}`);
  } else {
    console.log(`✓ ${name}`);
  }
  await page.close();
}

console.log(`\n${problems} of ${slugs.length + 1} with findings\n`);
await browser.close();
