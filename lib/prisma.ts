import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Prisma 7 with driver adapters requires an adapter at construction time —
  // `new PrismaClient()` with no options throws. During build (e.g. Next.js
  // "collecting page data") DATABASE_URL may be missing, so fall back to a
  // placeholder string. The pg Pool connects lazily, so this only errors if a
  // query actually runs without a real DATABASE_URL — never at construction/build.
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
