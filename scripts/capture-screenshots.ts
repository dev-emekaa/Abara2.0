/**
 * Capture README screenshots by driving the local Edge browser with a demo
 * session cookie. Run the dev server first, then: `pnpm tsx scripts/capture-screenshots.ts`
 */
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { prisma } from "@/lib/prisma";
import { signSession } from "@/lib/auth/jwt";

const BASE = process.env.SHOT_BASE || "http://localhost:3001";
const OUT = join(process.cwd(), "docs", "screenshots");

const EDGE_PATHS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

function edgePath(): string {
  const p = EDGE_PATHS.find((e) => existsSync(e));
  if (!p) throw new Error("Edge not found");
  return p;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const user = await prisma.user.findUniqueOrThrow({
    where: { email: "demo@abara.health" },
  });
  const token = await signSession({ sub: user.id, email: user.email });
  const nudge = await prisma.nudge.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const browser = await puppeteer.launch({
    executablePath: edgePath(),
    headless: true,
    args: ["--hide-scrollbars", "--force-color-profile=srgb"],
  });

  const cookie = {
    name: "abara_session",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
  };

  async function shot(
    path: string,
    file: string,
    opts: { w: number; h: number; scale: number; auth: boolean; settle?: number },
  ) {
    const page = await browser.newPage();
    await page.setViewport({
      width: opts.w,
      height: opts.h,
      deviceScaleFactor: opts.scale,
    });
    if (opts.auth) await page.setCookie(cookie);
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2" });
    await wait(opts.settle ?? 1400);
    await page.screenshot({ path: join(OUT, file) });
    await page.close();
    console.log("captured", file);
  }

  const D = { w: 1440, h: 900, scale: 1, auth: true } as const;

  // Public
  await shot("/", "01-landing.png", { ...D, auth: false, settle: 1600 });

  // Authenticated desktop
  await shot("/app", "02-dashboard.png", D);
  await shot("/app/timeline", "03-timeline.png", D);
  await shot("/app/nudges", "04-nudges.png", D);
  if (nudge) await shot(`/app/nudges/${nudge.id}`, "05-nudge-detail.png", D);
  await shot("/app/consult", "06-consult.png", D);
  await shot("/app/profile", "07-profile.png", D);

  // Companion — try to show a live exchange, fall back to the opener.
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.setCookie(cookie);
    await page.goto(`${BASE}/app/companion`, { waitUntil: "networkidle2" });
    await wait(1200);
    try {
      await page.click('button:has-text("I\'m feeling a bit better")');
    } catch {
      // puppeteer has no :has-text; click by evaluating
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const b = btns.find((x) => /feeling a bit better/i.test(x.textContent || ""));
        b?.click();
      });
    }
    await wait(6000); // let the reply stream in
    await page.screenshot({ path: join(OUT, "08-companion.png") });
    await page.close();
    console.log("captured", "08-companion.png");
  }

  // Mobile
  const M = { w: 390, h: 844, scale: 2, auth: true } as const;
  await shot("/app", "m1-dashboard.png", M);
  await shot("/app/companion", "m2-companion.png", { ...M, settle: 1600 });

  await browser.close();
  await prisma.$disconnect();
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
