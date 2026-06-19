import path from "path"; import { config } from "dotenv";
config({ path: path.join(process.cwd(), ".env.local") });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);
  const del = await prisma.listing.deleteMany({
    where: { OR: [
      { title: { contains: "Property for Sale" } },
      { title: { contains: "Property for Rent" } },
      { title: { contains: "Property in " } },
    ]}
  });
  const total = await prisma.listing.count();
  const sale  = await prisma.listing.count({ where: { type: "SALE" } });
  const rent  = await prisma.listing.count({ where: { type: "RENT" } });
  console.log(`Deleted generic: ${del.count}`);
  console.log(`Final DB: ${total} total (Sale: ${sale}, Rent: ${rent})`);
  await prisma.$disconnect(); await pool.end();
}
main().catch(console.error);
