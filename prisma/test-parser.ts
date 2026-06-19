/**
 * Test the scraper parser against the saved debug-page.html (no API call needed)
 * Run:  npx tsx prisma/test-parser.ts
 */
import fs from "fs";
import * as cheerio from "cheerio";

const html = fs.readFileSync("prisma/debug-page.html", "utf8");

function parsePrice(raw: string): number | null {
  const m = raw.match(/([\d.]+)\s*(Lac|Lakh|L|Cr|Crore)/i);
  if (!m) return null;
  const num = parseFloat(m[1]);
  if (isNaN(num) || num <= 0) return null;
  const unit = m[2].toLowerCase();
  if (unit.startsWith("c")) return Math.round(num * 10_000_000);
  if (unit.startsWith("l")) return Math.round(num * 100_000);
  return Math.round(num);
}
function parseBHK(text: string): number | null { const m = text.match(/(\d+)\s*BHK/i); return m ? parseInt(m[1]) : null; }
function parseSqft(text: string): number | null { const m = text.replace(/,/g,"").match(/([\d.]+)\s*sqft/i); return m ? Math.round(parseFloat(m[1])) : null; }
function cleanLocality(raw: string): string {
  return raw.replace(/^in\s+/i,"").replace(/,?\s*(?:Navi\s+)?Mumbai\b/gi,"").replace(/,?\s*Thane\b/gi,"").replace(/\s+/g," ").trim();
}

const $ = cheerio.load(html);
const results: any[] = [];
const seen = new Set<string>();

// FSL_TUPLE cards
$("[data-label]").each((_, el) => {
  const dl = $(el).attr("data-label") || "";
  if (!/^FSL_TUPLE\.\d+$/.test(dl)) return;

  const card = $(el);
  const title = card.find('[class*="locationName"]').first().text().trim() || "Unknown";
  const localityRaw = card.find('[class*="propType"]').first().text().trim();
  const locality = cleanLocality(localityRaw) || "Mumbai";
  const bhkText = card.find('[class*="bOld"]').first().text().trim();
  const bhk = parseBHK(bhkText);
  const cardText = card.text();
  const priceMatch = cardText.match(/₹\s*([\d.,]+\s*(?:Lac|Lakh|Cr|Crore))/i);
  const price = priceMatch ? parsePrice(priceMatch[1]) : null;
  const area_sqft = parseSqft(cardText);

  const key = `${price}|${locality}|${bhk}`;
  if (!price || seen.has(key)) return;
  seen.add(key);

  results.push({ type: "FSL", dl, title, bhk, price, area_sqft, locality });
});

// GROUPED_PROJECT_TUPLE cards
$("[data-label]").each((_, el) => {
  const dl = $(el).attr("data-label") || "";
  if (!/^GROUPED_PROJECT_TUPLE\.\d+$/.test(dl)) return;

  const card = $(el);
  const projectName = card.find("a.ellipsis").first().text().trim() || "Project";

  let locality = "Mumbai";
  const fullText = card.text().replace(/\s+/g, " ");
  const locRegex = /\bin\s+([A-Za-z][A-Za-z\s]+?)(?:,\s*(?:Navi\s+)?Mumbai|,\s*Thane|\s*$)/i;
  const locMatch = fullText.match(locRegex);
  if (locMatch) {
    const candidate = locMatch[1].trim();
    if (candidate.length >= 3 && candidate.length <= 40 && !/\b(BHK|sqft|Cr|Lac|Apartment)\b/i.test(candidate)) {
      locality = candidate;
    }
  }

  const ccl1s = card.find('[class*="ccl1"]');
  const ccl2s = card.find('[class*="ccl2"]');

  ccl1s.each((i, e) => {
    const bhkText = $(e).text().trim();
    const priceText = ccl2s.eq(i).text().trim();
    const bhk = parseBHK(bhkText);
    const price = parsePrice(priceText);
    if (!price) return;

    const key = `${price}|${locality}|${bhk}`;
    if (seen.has(key)) return;
    seen.add(key);

    results.push({ type: "GPT", dl, title: `${bhkText} at ${projectName}`, bhk, price, area_sqft: null, locality });
  });
});

console.log(`\nTotal parsed: ${results.length} listings\n`);
results.forEach((r, i) => {
  const price = r.price >= 10_000_000
    ? `₹${(r.price/10_000_000).toFixed(2)} Cr`
    : `₹${(r.price/100_000).toFixed(2)} Lac`;
  console.log(`${i+1}. [${r.type}] ${r.bhk ? r.bhk + "BHK " : ""}${price} | ${r.locality} | ${r.title.slice(0,50)}`);
});
