/**
 * Debug helper — dumps pagination HTML and screenshot from 99acres
 * Run:  npx tsx prisma/debug99acres.ts
 */
import path from "path";
import { config } from "dotenv";
config({ path: path.join(process.cwd(), ".env.local") });

import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
(chromium as any).use(StealthPlugin());
const URL = "https://www.99acres.com/search/property/buy/mumbai?city=12&preference=S&res_com=R";

async function main() {
  const browser = await (chromium as any).launch({
    headless: false,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--window-size=1440,900"],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
  });
  const page = await ctx.newPage();

  console.log("Loading page...");
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 40000 });
  await page.waitForTimeout(6000);

  // Screenshot
  await page.screenshot({ path: "prisma/debug-screenshot.png", fullPage: false });
  console.log("Screenshot saved → prisma/debug-screenshot.png");

  // Pagination HTML
  const paginationHtml: string = await page.evaluate(() => {
    // Find pagination area
    const selectors = [
      '[class*="pagination"]',
      '[class*="Pagination"]',
      '[class*="pageNav"]',
      '[class*="page-nav"]',
      'nav[aria-label*="page"]',
      '[class*="pager"]',
    ];
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) return `SELECTOR: ${s}\n` + el.outerHTML;
    }
    // fallback: look for links with page numbers
    const links = Array.from(document.querySelectorAll("a")).filter(
      (a) => /next|›|»|page/i.test(a.textContent || "") || /next|page/i.test(a.getAttribute("aria-label") || "")
    );
    return "NO PAGINATION FOUND\nLinks with 'next/page':\n" + links.map((l) => l.outerHTML).join("\n");
  });
  console.log("\n=== PAGINATION HTML ===\n", paginationHtml.slice(0, 3000));

  // Total listings count shown
  const count: string = await page.evaluate(() => {
    const el = document.querySelector('[class*="count"], [class*="result"], h1, [class*="heading"]');
    return el?.textContent?.trim() || "not found";
  });
  console.log("\nResult count text:", count);

  // How many cards found
  const cardCount: number = await page.evaluate(() => {
    const sels = ['[data-label="srp-tuple"]', '.srpTuple__container', '[class*="srpTuple"]', '[class*="SrpCard"]'];
    for (const s of sels) {
      const n = document.querySelectorAll(s).length;
      if (n > 0) { console.log("Matched:", s); return n; }
    }
    return 0;
  });
  console.log("Card count:", cardCount);

  // Find actual card HTML
  const cardHtml: string = await page.evaluate(() => {
    const result: string[] = [];
    // Find elements containing BHK + price
    Array.from(document.querySelectorAll("*")).forEach((el: Element) => {
      const t = el.textContent || "";
      if (
        t.includes("BHK") &&
        (t.includes("Lac") || t.includes("Cr") || t.includes("₹")) &&
        (el as HTMLElement).children.length >= 2 &&
        (el as HTMLElement).children.length <= 20 &&
        (el as HTMLElement).clientHeight > 60
      ) {
        if (result.length < 3) {
          result.push(`TAG:${el.tagName} CLASS:${el.className.slice(0, 150)}\nHTML:${el.outerHTML.slice(0, 600)}\n---`);
        }
      }
    });
    return result.length ? result.join("\n") : "NONE FOUND";
  });
  console.log("\n=== CARD HTML SAMPLE ===\n", cardHtml.slice(0, 2000));

  await browser.close();
}

main().catch(console.error);
