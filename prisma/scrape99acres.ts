/**
 * 99acres Mumbai Property Scraper — ScraperAPI edition
 * Run:  npx tsx prisma/scrape99acres.ts
 *
 * Uses ScraperAPI render=true (5 credits/page) to handle CAPTCHAs.
 * Selectors verified against live 99acres HTML (June 2026).
 */

import path from "path";
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: path.join(process.cwd(), ".env.local") });

import * as cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const SCRAPERAPI_KEY = process.env.SCRAPERAPI_KEY!;
const SYSTEM_BROKER_PHONE = "0000000000";
const MAX_PAGES = 10;
const DELAY_MS  = 3000;
const PAGE_SIZE = 25;

// ── Search URLs ───────────────────────────────────────────────────────────────
const SEARCH_URLS: Array<{ url: string; type: "SALE" | "RENT" }> = [
  { url: "https://www.99acres.com/search/property/buy/mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/andheri-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/bandra-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/powai-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/borivali-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/malad-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/goregaon-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/kandivali-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/thane-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/navi-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/dahisar-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/mira-road-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/worli-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/buy/chembur-mumbai?city=12&preference=S&res_com=R", type: "SALE" },
  { url: "https://www.99acres.com/search/property/rent/mumbai?city=12&preference=S&res_com=R", type: "RENT" },
  { url: "https://www.99acres.com/search/property/rent/andheri-mumbai?city=12&preference=S&res_com=R", type: "RENT" },
  { url: "https://www.99acres.com/search/property/rent/bandra-mumbai?city=12&preference=S&res_com=R", type: "RENT" },
  { url: "https://www.99acres.com/search/property/rent/goregaon-mumbai?city=12&preference=S&res_com=R", type: "RENT" },
  { url: "https://www.99acres.com/search/property/rent/thane-mumbai?city=12&preference=S&res_com=R", type: "RENT" },
  { url: "https://www.99acres.com/search/property/rent/navi-mumbai?city=12&preference=S&res_com=R", type: "RENT" },
  { url: "https://www.99acres.com/search/property/rent/kandivali-mumbai?city=12&preference=S&res_com=R", type: "RENT" },
  { url: "https://www.99acres.com/search/property/rent/borivali-mumbai?city=12&preference=S&res_com=R", type: "RENT" },
  { url: "https://www.99acres.com/search/property/rent/powai-mumbai?city=12&preference=S&res_com=R", type: "RENT" },
  { url: "https://www.99acres.com/search/property/rent/worli-mumbai?city=12&preference=S&res_com=R", type: "RENT" },
];

// ── Pincode map ───────────────────────────────────────────────────────────────
const PINCODE_MAP: Record<string, string> = {
  "Andheri West": "400058", "Andheri East": "400069", "Andheri": "400053",
  "Bandra West": "400050", "Bandra East": "400051", "Bandra": "400050",
  "Borivali West": "400092", "Borivali East": "400066", "Borivali": "400066",
  "Dadar": "400014", "Dadar West": "400028", "Dadar East": "400014",
  "Goregaon West": "400104", "Goregaon East": "400063", "Goregaon": "400063",
  "Juhu": "400049", "Vile Parle": "400057", "Vile Parle West": "400056",
  "Kandivali West": "400067", "Kandivali East": "400101", "Kandivali": "400067",
  "Khar": "400052", "Kurla": "400070", "Malad West": "400064",
  "Malad East": "400097", "Malad": "400064", "Mulund": "400080",
  "Powai": "400076", "Hiranandani": "400076",
  "Santacruz West": "400054", "Santacruz East": "400055", "Santacruz": "400054",
  "Worli": "400018", "Lower Parel": "400013", "Prabhadevi": "400025",
  "Chembur": "400071", "Chembur East": "400071",
  "Ghatkopar West": "400086", "Ghatkopar East": "400077", "Ghatkopar": "400086",
  "Vikhroli": "400083", "Deonar": "400088",
  "Kharghar": "410210", "Panvel": "410206", "Airoli": "400708",
  "Belapur": "400614", "CBD Belapur": "400614",
  "Kopar Khairane": "400709", "Vashi": "400703", "Sanpada": "400705",
  "Mira Road": "401107", "Virar": "401303", "Vasai": "401202",
  "Dahisar": "400068", "Nalasopara": "401209",
  "Thane West": "400601", "Thane East": "400603", "Thane": "400601",
  "Dombivli": "421201", "Kalyan": "421301",
  "Colaba": "400005", "Fort": "400001", "BKC": "400051",
  "Matunga": "400019", "Wadala": "400031", "Sion": "400022",
  "Mahalaxmi": "400034", "Grant Road": "400007", "Mumbai Central": "400008",
  "Versova": "400061", "Lokhandwala": "400053", "Jogeshwari": "400060",
};

function getPincode(locality: string): string {
  for (const [area, pin] of Object.entries(PINCODE_MAP)) {
    if (locality.toLowerCase().includes(area.toLowerCase())) return pin;
  }
  return "400001";
}

// ── Parsers ───────────────────────────────────────────────────────────────────
function parsePrice(raw: string): number | null {
  // Handle range like "₹11.73 - 13.35 Cr" → take first number
  const m = raw.match(/([\d.]+)\s*(Lac|Lakh|L|Cr|Crore)/i);
  if (!m) return null;
  const num = parseFloat(m[1]);
  if (isNaN(num) || num <= 0) return null;
  const unit = m[2].toLowerCase();
  if (unit.startsWith("c")) return Math.round(num * 10_000_000);
  if (unit.startsWith("l")) return Math.round(num * 100_000);
  return Math.round(num);
}

function parseBHK(text: string): number | null {
  const m = text.match(/(\d+)\s*BHK/i);
  return m ? parseInt(m[1]) : null;
}

function parseSqft(text: string): number | null {
  const m = text.replace(/,/g, "").match(/([\d.]+)\s*sqft/i);
  return m ? Math.round(parseFloat(m[1])) : null;
}

function parseFurnishing(text: string): "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED" | null {
  const t = text.toLowerCase();
  if (t.includes("semi")) return "SEMI_FURNISHED";
  if (/\bfurnished\b/.test(t)) return "FURNISHED";
  if (t.includes("unfurnished")) return "UNFURNISHED";
  return null;
}

function cleanLocality(raw: string): string {
  return raw
    .replace(/^in\s+/i, "")
    .replace(/,?\s*(?:Navi\s+)?Mumbai\b/gi, "")
    .replace(/,?\s*Thane\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function buildPageUrl(base: string, page: number): string {
  if (page === 1) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}Start=${(page - 1) * PAGE_SIZE + 1}`;
}

// ── Fetch via ScraperAPI ──────────────────────────────────────────────────────
async function fetchPage(targetUrl: string): Promise<string | null> {
  const apiUrl =
    `http://api.scraperapi.com?api_key=${SCRAPERAPI_KEY}` +
    `&url=${encodeURIComponent(targetUrl)}&render=true&country_code=in`;
  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(90_000) });
    if (!res.ok) { console.log(`    ⚠ ScraperAPI ${res.status}`); return null; }
    return await res.text();
  } catch (err: any) {
    console.log(`    ⚠ Fetch error: ${err.message}`);
    return null;
  }
}

// ── Parsed listing type ───────────────────────────────────────────────────────
interface ParsedListing {
  title: string;
  price: number;
  bhk: number | null;
  area_sqft: number | null;
  locality: string;
  furnishing: "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED" | null;
  type: "SALE" | "RENT";
}

// ── Parse FSL_TUPLE (individual resale/rental listings) ──────────────────────
function parseFslCard($: cheerio.CheerioAPI, card: cheerio.Cheerio<cheerio.Element>, listingType: "SALE" | "RENT"): ParsedListing | null {
  // Title = building/property name
  const title = card.find('[class*="locationName"], [class*="tupleHeading"]').first().text().trim()
    || card.find("h2").first().text().trim();

  // Locality = tupleNew__propType contains "in Deonar, Chembur East"
  const localityRaw = card.find('[class*="propType"]').first().text().trim();
  const locality = cleanLocality(localityRaw) || "Mumbai";

  // BHK = tupleNew__bOld e.g. "3 BHK Flat"
  const bhkText = card.find('[class*="bOld"]').first().text().trim();
  const bhk = parseBHK(bhkText);

  // Price: first ₹ amount in the card text
  const cardText = card.text();
  const priceMatch = cardText.match(/₹\s*([\d.,]+\s*(?:Lac|Lakh|Cr|Crore))/i);
  if (!priceMatch) return null;
  const price = parsePrice(priceMatch[1]);
  if (!price || price < 50_000) return null;

  // Area = first "N sqft" match
  const area_sqft = parseSqft(cardText);

  // Furnishing
  const furnishing = parseFurnishing(cardText);

  const displayTitle = title || `${bhk ? bhk + " BHK " : ""}${listingType === "SALE" ? "for Sale" : "for Rent"} in ${locality}`;

  return { title: displayTitle, price, bhk, area_sqft, locality, furnishing, type: listingType };
}

// ── Parse GROUPED_PROJECT_TUPLE (builder project with multiple configs) ───────
function parseProjectCard($: cheerio.CheerioAPI, card: cheerio.Cheerio<cheerio.Element>, listingType: "SALE" | "RENT"): ParsedListing[] {
  // Project name
  const projectName = card.find("a.ellipsis, [class*='projectHeading'] a, [class*='FW6']").first().text().trim()
    || "Project";

  // Locality: extract from full card text using "in LOCALITY, Mumbai" pattern
  let locality = "Mumbai";
  const fullText = card.text().replace(/\s+/g, " ");
  // Try "in Worli, Mumbai" or "in Andheri West" patterns
  const locRegex = /\bin\s+([A-Za-z][A-Za-z\s]+?)(?:,\s*(?:Navi\s+)?Mumbai|,\s*Thane|\s*$)/i;
  const locMatch = fullText.match(locRegex);
  if (locMatch) {
    const candidate = locMatch[1].trim();
    // Must be a known locality or look like one (not a sentence)
    if (candidate.length >= 3 && candidate.length <= 40 && !/\b(BHK|sqft|Cr|Lac|Apartment)\b/i.test(candidate)) {
      locality = candidate;
    }
  }

  const results: ParsedListing[] = [];

  // Each config card has ccl1 (BHK type) + ccl2 (price)
  const ccl1s = card.find('[class*="ccl1"]');
  const ccl2s = card.find('[class*="ccl2"]');

  ccl1s.each((i, el) => {
    const bhkText = $(el).text().trim();          // "3 BHK Apartment"
    const priceText = ccl2s.eq(i).text().trim();  // "₹11.73 - 13.35 Cr"

    const bhk = parseBHK(bhkText);
    const price = parsePrice(priceText);
    if (!price || price < 50_000) return;

    const title = `${bhkText} at ${projectName}`;

    results.push({
      title,
      price,
      bhk,
      area_sqft: null,
      locality,
      furnishing: null,
      type: listingType,
    });
  });

  // If no configs found, try to parse from full card text
  if (results.length === 0) {
    const cardText = card.text();
    const priceMatch = cardText.match(/₹\s*([\d.,]+\s*(?:Lac|Lakh|Cr|Crore))/i);
    if (priceMatch) {
      const price = parsePrice(priceMatch[1]);
      if (price && price >= 50_000) {
        const bhk = parseBHK(cardText);
        results.push({
          title: projectName,
          price,
          bhk,
          area_sqft: parseSqft(cardText),
          locality,
          furnishing: null,
          type: listingType,
        });
      }
    }
  }

  return results;
}

// ── Parse all listings from a page ───────────────────────────────────────────
function parseListings(html: string, listingType: "SALE" | "RENT"): ParsedListing[] {
  const $ = cheerio.load(html);
  const results: ParsedListing[] = [];
  const seen = new Set<string>();

  const addIfNew = (l: ParsedListing) => {
    const key = `${l.price}|${l.locality}|${l.bhk}|${l.type}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(l);
  };

  // Individual listings
  let fslCount = 0;
  $("[data-label]").each((_, el) => {
    const dl = $(el).attr("data-label") || "";
    if (/^FSL_TUPLE\.\d+$/.test(dl)) {
      fslCount++;
      const listing = parseFslCard($, $(el), listingType);
      if (listing) addIfNew(listing);
    }
  });

  // Project/grouped listings
  let gptCount = 0;
  $("[data-label]").each((_, el) => {
    const dl = $(el).attr("data-label") || "";
    if (/^GROUPED_PROJECT_TUPLE\.\d+$/.test(dl)) {
      gptCount++;
      parseProjectCard($, $(el), listingType).forEach(addIfNew);
    }
  });

  if (fslCount + gptCount > 0) {
    console.log(`    Cards: ${fslCount} individual + ${gptCount} projects → ${results.length} listings`);
  } else {
    console.log(`    ⚠ No FSL/GPT cards found — page may not have rendered`);
  }

  return results;
}

// ── DB insert ─────────────────────────────────────────────────────────────────
async function insertListings(listings: ParsedListing[], brokerId: string): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0, skipped = 0;
  for (const l of listings) {
    try {
      const exists = await prisma.listing.findFirst({
        where: { locality: l.locality, type: l.type, price: BigInt(l.price), bhk: l.bhk ?? undefined },
        select: { id: true },
      });
      if (exists) { skipped++; continue; }

      await prisma.listing.create({
        data: {
          title: l.title,
          price: BigInt(l.price),
          type: l.type,
          propertyType: "RESIDENTIAL",
          bhk: l.bhk ?? undefined,
          area_sqft: l.area_sqft ?? undefined,
          locality: l.locality,
          pincode: getPincode(l.locality),
          furnishing: l.furnishing ?? undefined,
          images: [],
          amenities: [],
          brokerId,
          isActive: true,
        },
      });
      inserted++;
    } catch (err: any) {
      skipped++;
    }
  }
  return { inserted, skipped };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(60));
  console.log("99acres Scraper  (ScraperAPI — CAPTCHA handled)");
  console.log("=".repeat(60));

  if (!SCRAPERAPI_KEY) { console.error("❌ SCRAPERAPI_KEY not set"); process.exit(1); }

  let broker = await prisma.user.findUnique({ where: { phone: SYSTEM_BROKER_PHONE } });
  if (!broker) {
    broker = await prisma.user.create({
      data: { phone: SYSTEM_BROKER_PHONE, name: "99acres Import", role: "BROKER" },
    });
  }

  const existingCount = await prisma.listing.count();
  console.log(`✓ Existing listings in DB: ${existingCount}`);
  console.log(`✓ System broker: ${broker.id}\n`);

  let grandTotal = 0;

  for (const { url: baseUrl, type: listingType } of SEARCH_URLS) {
    console.log(`\n${"─".repeat(55)}`);
    console.log(`[${listingType}] ${baseUrl}`);

    let consecutiveEmpty = 0;

    for (let page = 1; page <= MAX_PAGES; page++) {
      const pageUrl = buildPageUrl(baseUrl, page);
      console.log(`\n  Page ${page} → ${pageUrl}`);

      const html = await fetchPage(pageUrl);
      if (!html) { console.log("  ✗ No response — stopping"); break; }

      if (html.length < 5000 || html.includes("Access Denied") || html.includes("Just a moment")) {
        console.log(`  ⚠ Blocked/empty (${html.length} bytes) — stopping`);
        break;
      }

      const listings = parseListings(html, listingType);

      if (listings.length === 0) {
        consecutiveEmpty++;
        if (consecutiveEmpty >= 2) { console.log("  Empty 2 pages in a row — moving on"); break; }
        await sleep(DELAY_MS);
        continue;
      }
      consecutiveEmpty = 0;

      const { inserted, skipped } = await insertListings(listings, broker!.id);
      grandTotal += inserted;
      console.log(`  ✓ Inserted: ${inserted}  Dup-skipped: ${skipped}  Total new: ${grandTotal}`);

      await sleep(DELAY_MS);
    }

    await sleep(2000);
  }

  await prisma.$disconnect();
  await pool.end();

  console.log("\n" + "=".repeat(60));
  console.log(`✓ Done!  New listings inserted: ${grandTotal}`);
  console.log("=".repeat(60));
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
