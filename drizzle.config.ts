import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // In drizzle.config.ts
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: "admin",
    password: "password123",
    database: "engine_db",
    ssl: false,
  },
});
