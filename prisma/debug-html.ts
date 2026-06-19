/**
 * Debug: dump ScraperAPI response to file and print class names found
 * Run:  npx tsx prisma/debug-html.ts
 */
import path from "path";
import { config } from "dotenv";
import fs from "fs";
config({ path: path.join(process.cwd(), ".env.local") });
import * as cheerio from "cheerio";

const KEY = process.env.SCRAPERAPI_KEY!;
const URL = "https://www.99acres.com/search/property/buy/mumbai?city=12&preference=S&res_com=R";

async function main() {
  console.log("Fetching via ScraperAPI (render=true)...");
  const apiUrl = `http://api.scraperapi.com?api_key=${KEY}&url=${encodeURIComponent(URL)}&render=true&country_code=in`;
  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(90_000) });
  const html = await res.text();

  // Save full HTML
  fs.writeFileSync("prisma/debug-page.html", html);
  console.log(`Saved HTML (${html.length} bytes) → prisma/debug-page.html`);

  const $ = cheerio.load(html);

  // Print all unique class names that appear on elements with "Lac" or "Cr" text
  console.log("\n=== Classes on price-containing elements ===");
  const priceSel = new Set<string>();
  $("*").each((_, el) => {
    const text = $(el).text();
    if (/([\d.]+)\s*(Lac|Cr)/i.test(text) && text.length < 500) {
      const cls = $(el).attr("class") || "";
      cls.split(/\s+/).filter(Boolean).forEach(c => priceSel.add(c));
    }
  });
  console.log([...priceSel].slice(0, 50).join("\n"));

  // Print all unique class names on elements with BHK text
  console.log("\n=== Classes on BHK-containing elements ===");
  const bhkSel = new Set<string>();
  $("*").each((_, el) => {
    const text = $(el).text();
    if (/\d\s*BHK/i.test(text) && text.length < 500) {
      const cls = $(el).attr("class") || "";
      cls.split(/\s+/).filter(Boolean).forEach(c => bhkSel.add(c));
    }
  });
  console.log([...bhkSel].slice(0, 50).join("\n"));

  // Print all data-label attributes
  console.log("\n=== data-label attributes found ===");
  $("[data-label]").each((_, el) => {
    console.log(`  ${$(el).prop("tagName")} data-label="${$(el).attr("data-label")}" class="${($(el).attr("class") || "").slice(0, 80)}"`);
  });

  // Print first 3 elements that have BOTH BHK and Lac/Cr
  console.log("\n=== First 3 elements with BHK + Price (text sample) ===");
  let count = 0;
  $("*").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (/([\d.]+)\s*(Lac|Cr)/i.test(text) && /\d\s*BHK/i.test(text) && text.length > 30 && text.length < 600 && count < 3) {
      console.log(`\nTAG: ${$(el).prop("tagName")}  CLASS: ${($(el).attr("class") || "").slice(0, 100)}`);
      console.log(`TEXT: ${text.slice(0, 300)}`);
      count++;
    }
  });

  console.log("\nDone.");
}

main().catch(console.error);
