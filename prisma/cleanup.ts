import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Clear fake Unsplash images from all listings
  const imagesCleared = await prisma.listing.updateMany({
    data: { images: [] },
  });
  console.log(`✓ Cleared images from ${imagesCleared.count} listings`);

  // Clear fake whatsapp numbers from all brokers
  const whatsappCleared = await prisma.user.updateMany({
    data: { whatsapp: null },
  });
  console.log(`✓ Cleared whatsapp from ${whatsappCleared.count} brokers`);

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
