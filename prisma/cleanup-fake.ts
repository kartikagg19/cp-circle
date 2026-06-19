/**
 * Remove all fake / bad-quality listings inserted by the old scraper
 * Run:  npx tsx prisma/cleanup-fake.ts
 */
import path from "path";
import { config } from "dotenv";
config({ path: path.join(process.cwd(), ".env.local") });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);

// Known real Mumbai localities — only keep listings whose locality matches one of these
const VALID_LOCALITIES = new Set([
  "Andheri West","Andheri East","Andheri",
  "Bandra West","Bandra East","Bandra",
  "Borivali West","Borivali East","Borivali",
  "Dadar","Dadar West","Dadar East",
  "Goregaon West","Goregaon East","Goregaon",
  "Juhu","Vile Parle","Vile Parle West","Vile Parle East",
  "Kandivali West","Kandivali East","Kandivali",
  "Khar","Kurla","Malad West","Malad East","Malad",
  "Mulund","Mulund West","Mulund East",
  "Powai","Hiranandani",
  "Santacruz West","Santacruz East","Santacruz",
  "Worli","Lower Parel","Prabhadevi","Parel",
  "Chembur","Chembur East","Chembur West",
  "Ghatkopar West","Ghatkopar East","Ghatkopar",
  "Vikhroli","Deonar",
  "Kharghar","Panvel","Airoli",
  "Belapur","CBD Belapur","Nerul",
  "Kopar Khairane","Vashi","Sanpada","Seawoods",
  "Mira Road","Virar","Vasai",
  "Dahisar","Nalasopara",
  "Thane West","Thane East","Thane",
  "Dombivli","Kalyan",
  "Colaba","Fort","BKC","Nariman Point",
  "Matunga","Wadala","Sion","Sewri",
  "Mahalaxmi","Grant Road","Mumbai Central",
  "Versova","Lokhandwala","Jogeshwari",
  "Jogeshwari West","Jogeshwari East",
  "Byculla","Mazgaon","Pydhonie",
  "Cuffe Parade","Walkeshwar","Malabar Hill",
  "Girgaon","Mahim","Mahim West",
  "Bhandup","Bhandup West","Bhandup East",
  "Balkum","LBS Marg","Wadala East","Wadala West",
  "Mulund Colony","Sonapur","Nahur",
  "Kandivali","Poisar","Eksar",
  "Malvani","Marve","Madh","Manori",
  "Oshiwara","Lokhandwala Complex",
  "Marol","Sakinaka","Chakala","MIDC",
  "Ghansoli","Mahape","Rabale",
  "Ulwe","Dronagiri","Kamothe","Khanda Colony",
  "Taloja","Kalamboli","Roadpali",
  "Badlapur","Ambernath","Bhiwandi",
  "Mira Bhayandar","Naigaon",
  "Mulund West","Mulund East",
  "Thane West","Thane East",
]);

async function main() {
  const before = await prisma.listing.count();
  console.log(`Listings before cleanup: ${before}`);

  // Step 1: Delete listings with clearly wrong/fake locality
  const badLocalityDelete = await prisma.listing.deleteMany({
    where: {
      OR: [
        { locality: "Mumbai" },           // too generic
        { locality: "More Localities" },  // scraper artifact
        { locality: "Navi Mumbai" },      // too generic
        { locality: { contains: "BHK" } },        // locality field has wrong data
        { locality: { contains: "Property" } },   // locality has property description
        { locality: { contains: "sqft" } },       // locality has area data
        { locality: { contains: "Lac" } },        // locality has price data
        { locality: { contains: "Cr," } },        // locality has price data
        { locality: { startsWith: "in " } },      // locality starts with "in "
        { locality: { contains: ", Mumbai" } },   // locality has full address
        { locality: { contains: ", Thane" } },    // locality has full address
        { locality: { contains: ", Navi Mumbai" } }, // locality has full address
      ]
    }
  });
  console.log(`Deleted ${badLocalityDelete.count} listings with bad locality`);

  // Step 2: Delete listings with price ≤ 1 lakh (clearly placeholder/fake)
  const badPriceDelete = await prisma.listing.deleteMany({
    where: { price: { lte: BigInt(100_000) } }
  });
  console.log(`Deleted ${badPriceDelete.count} listings with price ≤ ₹1 lakh (fake)`);

  // Step 3: Delete listings where title = generic old-scraper pattern AND locality is a full sentence
  const badTitleDelete = await prisma.listing.deleteMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: "Property for Sale in" } },
            { title: { contains: "Property for Rent in" } },
            { title: { contains: "Property in Mumbai" } },
          ]
        },
        // Only delete if locality is not in our known-good list
        // (we can't do NOT IN in Prisma easily, so use a broader pattern)
        {
          OR: [
            { locality: { contains: "," } },    // has comma = address not locality
            { locality: { startsWith: "BHK" } },
            { locality: { contains: "West," } },
            { locality: { contains: "East," } },
          ]
        }
      ]
    }
  });
  console.log(`Deleted ${badTitleDelete.count} listings with generic title + bad locality`);

  // Step 4: Get all remaining listings and delete those with invalid localities
  console.log("\nChecking remaining listings for invalid localities...");
  let invalidDeleted = 0;
  let offset = 0;
  const batchSize = 500;

  while (true) {
    const batch = await prisma.listing.findMany({
      select: { id: true, locality: true },
      skip: offset,
      take: batchSize,
    });
    if (batch.length === 0) break;

    const invalidIds = batch
      .filter(l => {
        const loc = l.locality.trim();
        // Valid if it matches any known locality (partial match)
        const isValid = [...VALID_LOCALITIES].some(v =>
          loc.toLowerCase() === v.toLowerCase() ||
          loc.toLowerCase().startsWith(v.toLowerCase())
        );
        // Also valid if it's a short name (< 30 chars) without commas (likely a real area name)
        const looksLike = loc.length <= 30 && !loc.includes(",") && !/\d{5,}/.test(loc);
        return !isValid && !looksLike;
      })
      .map(l => l.id);

    if (invalidIds.length > 0) {
      await prisma.listing.deleteMany({ where: { id: { in: invalidIds } } });
      invalidDeleted += invalidIds.length;
    }
    offset += batchSize;
  }
  console.log(`Deleted ${invalidDeleted} listings with unrecognised localities`);

  const after = await prisma.listing.count();
  const sale = await prisma.listing.count({ where: { type: "SALE" } });
  const rent = await prisma.listing.count({ where: { type: "RENT" } });

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Before: ${before}  →  After: ${after}`);
  console.log(`Removed: ${before - after} fake listings`);
  console.log(`Kept: ${after} real listings (Sale: ${sale}, Rent: ${rent})`);
}

main().then(() => prisma.$disconnect().then(() => pool.end())).catch(console.error);
