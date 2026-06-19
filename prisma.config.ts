import path from "path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Prisma CLI only loads .env by default — load .env.local manually
config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: databaseUrl,
  },
});
