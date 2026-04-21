import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../infra/db/index.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // Postgres
  }),

  //  add cors origin to env for prod.
  trustedOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : [],

  // Using email and password for the auth.
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in the user after registration.
  },

  advanced: {
    cookiePrefix: "lazy",
  },
});
