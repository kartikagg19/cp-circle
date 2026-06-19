import path from "path"; import { config } from "dotenv";
config({ path: path.join(process.cwd(), ".env.local") });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);

  const total = await prisma.listing.count();
  const sale  = await prisma.listing.count({ where: { type: "SALE" } });
  const rent  = await prisma.listing.count({ where: { type: "RENT" } });
  const genericTitle = await prisma.listing.count({ where: { OR: [
    { title: { contains: "Property for Sale" } },
    { title: { contains: "Property for Rent" } },
    { title: { contains: "Property in " } },
  ]}});

  const samples = await prisma.listing.findMany({
    take: 8, orderBy: { createdAt: "desc" },
    select: { title: true, locality: true, price: true, type: true }
  });

  console.log(`Total: ${total} | Sale: ${sale} | Rent: ${rent}`);
  console.log(`Generic-title count: ${genericTitle}`);
  console.log("Latest 8:");
  samples.forEach(s => console.log(`  [${s.type}] ${s.locality} | ${s.title.slice(0,55)} | Rs${Number(s.price).toLocaleString()}`));

  await prisma.$disconnect(); await pool.end();
}
main().catch(console.error);
