/**
 * Seed listing photos with properly-licensed Unsplash images.
 * Run:  npx tsx prisma/seed-photos.ts   (or: npm run seed-photos)
 *
 * Unsplash photos are free for commercial use, no attribution required, and
 * carry no watermark — a clean, legal alternative to scraping copyrighted
 * listing photos. Only listings that currently have NO images are updated, so
 * any real broker-uploaded photos (via the ImageUploader/Cloudinary flow) are
 * never overwritten. Safe to re-run.
 */

import path from "path";
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: path.join(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// All verified to return HTTP 200 from images.unsplash.com.
const EXTERIORS = [
  "1512917774080-9991f1c4c750", "1564013799919-ab600027ffc6", "1570129477492-45c003edd2be",
  "1567496898669-ee935f5f647a", "1600596542815-ffad4c1539a9", "1600585154340-be6161a56a0c",
  "1600607687939-ce8a6c25118c", "1600566753086-00f18fb6b3ea", "1600210492486-724fe5c67fb0",
  "1600047509807-ba8f99d2cdde", "1605276374104-dee2a0ed3cd6", "1598928506311-c55ded91a20c",
  "1586023492125-27b2c045efd7", "1583608205776-bfd35f0d9f83",
];

const INTERIORS = [
  "1560448204-e02f11c3d0e2", "1502672260266-1c1ef2d93688", "1560185007-cde436f6a4d0",
  "1505691938895-1758d7feb511", "1554995207-c18c203602cb", "1522708323590-d24dbb6b0267",
  "1556912172-45b7abe8b7e1", "1493809842364-78817add7ffb", "1484154218962-a197022b5858",
  "1493663284031-b7e3aefcae8e", "1502005229762-cf1b2da7c5d6",
];

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// Stable hash of the listing id → consistent photo choice across re-runs.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function photosFor(id: string): string[] {
  const h = hash(id);
  const ext = EXTERIORS[h % EXTERIORS.length];
  const in1 = INTERIORS[h % INTERIORS.length];
  const in2 = INTERIORS[(h >> 5) % INTERIORS.length];
  // De-dup the two interiors if the hash collides.
  const interiors = in1 === in2 ? [in1] : [in1, in2];
  return [ext, ...interiors].map(img);
}

async function main() {
  console.log("Seeding listing photos (Unsplash, only listings with no images)...");

  const listings = await prisma.listing.findMany({
    where: { images: { isEmpty: true } },
    select: { id: true },
  });
  console.log(`Listings missing photos: ${listings.length}`);
  if (listings.length === 0) {
    console.log("Nothing to do — all listings already have images.");
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  const CHUNK = 25;
  let done = 0;
  for (let i = 0; i < listings.length; i += CHUNK) {
    const batch = listings.slice(i, i + CHUNK);
    await Promise.all(
      batch.map((l) =>
        prisma.listing.update({
          where: { id: l.id },
          data: { images: photosFor(l.id) },
        })
      )
    );
    done += batch.length;
    if (done % 250 === 0 || done === listings.length) {
      console.log(`  updated ${done}/${listings.length}`);
    }
  }

  console.log(`✓ Done — ${done} listings now have photos.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error("Fatal:", err);
  await pool.end();
  process.exit(1);
});
