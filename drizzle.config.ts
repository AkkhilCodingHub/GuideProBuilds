import { defineConfig } from "drizzle-kit";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mongodb",
  dbCredentials: {
    url: process.env.MONGODB_URI,
  },
  verbose: true,
  strict: true,
});
