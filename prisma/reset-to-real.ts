import path from "path";
import { config } from "dotenv";
config({ path: path.join(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const REAL_BROKER_PHONE = "0000000000"; // 99acres Import broker

async function main() {
  console.log("Removing fake seeded data...\n");

  const realBroker = await prisma.user.findUnique({ where: { phone: REAL_BROKER_PHONE } });
  if (!realBroker) { console.error("99acres broker not found!"); process.exit(1); }

  // Count before
  const totalBefore = await prisma.listing.count();
  const realCount = await prisma.listing.count({ where: { brokerId: realBroker.id } });
  console.log(`Total listings: ${totalBefore}`);
  console.log(`Real scraped:   ${realCount}`);
  console.log(`Fake seeded:    ${totalBefore - realCount}\n`);

  // Delete all leads (they reference seeded listings)
  const leads = await prisma.lead.deleteMany({});
  console.log(`✓ Deleted ${leads.count} leads`);

  // Delete all requirements (seeded)
  const reqs = await prisma.requirement.deleteMany({});
  console.log(`✓ Deleted ${reqs.count} requirements`);

  // Delete fake listings (all except 99acres scraped)
  const fakeDel = await prisma.listing.deleteMany({
    where: { brokerId: { not: realBroker.id } },
  });
  console.log(`✓ Deleted ${fakeDel.count} fake listings`);

  // Delete fake broker users (keep only 99acres broker)
  const fakeBrokers = await prisma.user.deleteMany({
    where: { id: { not: realBroker.id } },
  });
  console.log(`✓ Deleted ${fakeBrokers.count} fake broker accounts`);

  const remaining = await prisma.listing.count();
  console.log(`\n✓ Done. Real listings remaining: ${remaining}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
