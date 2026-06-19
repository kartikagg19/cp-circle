import path from "path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Prisma CLI only loads .env by default — load .env.local manually.
// On hosts like Vercel there is no .env.local; DATABASE_URL comes from the
// platform's environment variables instead, so this is a no-op there.
config({ path: ".env.local" });

// Note: `prisma generate` does not need DATABASE_URL — only DB-touching
// commands (migrate, db push, studio) do. So we don't throw here; we just
// pass through whatever is set. DB commands fail with a clear error if empty.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
