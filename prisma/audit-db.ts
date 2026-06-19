import path from "path";
import { config } from "dotenv";
config({ path: path.join(process.cwd(), ".env.local") });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);

async function main() {
  const total = await prisma.listing.count();
  const sale  = await prisma.listing.count({ where: { type: "SALE" } });
  const rent  = await prisma.listing.count({ where: { type: "RENT" } });

  console.log(`Total: ${total} | Sale: ${sale} | Rent: ${rent}`);

  // Count by locality
  const byLocality = await prisma.listing.groupBy({
    by: ["locality"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  console.log("\nTop localities:");
  byLocality.slice(0, 20).forEach(r => console.log(`  ${r.locality}: ${r._count.id}`));

  // Sample of generic/bad titles
  const badTitle = await prisma.listing.findMany({
    where: {
      OR: [
        { title: { contains: "Property for Sale" } },
        { title: { contains: "Property for Rent" } },
        { title: { contains: "for Sale in Mumbai" } },
        { title: { contains: "for Rent in Mumbai" } },
        { locality: "Mumbai" },
      ]
    },
    select: { id: true, title: true, locality: true, price: true },
    take: 5,
  });
  console.log("\nSample bad/generic entries:");
  badTitle.forEach(r => console.log(`  [${r.locality}] ${r.title.slice(0,60)} — ₹${Number(r.price).toLocaleString()}`));

  // Count bad ones
  const badCount = await prisma.listing.count({
    where: {
      OR: [
        { title: { contains: "Property for Sale" } },
        { title: { contains: "Property for Rent" } },
        { title: { contains: "for Sale in Mumbai" } },
        { title: { contains: "for Rent in Mumbai" } },
        { locality: "Mumbai" },
        { title: { contains: "Property in Mumbai" } },
      ]
    }
  });
  console.log(`\nListings with generic/fake data: ${badCount}`);
  console.log(`Good listings: ${total - badCount}`);
}

main().then(() => prisma.$disconnect().then(() => pool.end())).catch(console.error);
