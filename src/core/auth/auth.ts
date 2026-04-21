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
    requireEmailVerification: process.env.REQUIRE_EMAIL_VER === "true",
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60 * 24,
    deferSessionRefresh: true,

    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  advanced: {
    cookiePrefix: "lazy",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
