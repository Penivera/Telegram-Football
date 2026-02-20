import { defineConfig } from "drizzle-kit";

// Use a local database file by default if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || "file:./local.db";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
