import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../infra/db/index.js";
import { sendEmail } from "../mailer/mailer.service.js";
import { admin } from "better-auth/plugins";

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

    // uncomment the below to enable more emailing features. Make sure to have a mailer provider configured and working.

    // onExistingUserSignUp: async ({ user }, request) => {
    //   void sendEmail({
    //     to: user.email,
    //     subject: "Sign-up attempt with your email",
    //     text: "Someone tried to create an account using your email address. If this was you, try signing in instead. If not, you can safely ignore this email.",
    //   });
    // },

    // sendResetPassword: async ({user, url, token}, request) => {
    //   void sendEmail({
    //     to: user.email,
    //     subject: "Reset your password",
    //     text: `Click the link to reset your password: ${url}`,
    //   });
    // },

    // onPasswordReset: async ({ user }, request) => {
    //   // your logic here
    //   console.log(`Password for user ${user.email} has been reset.`);
    // },
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

  // Uncomment to enable email verification. Make sure to set REQUIRE_EMAIL_VER env variable to true.
  // emailVerification: {
  //   sendVerificationEmail: async ({ user, url, token }, request) => {
  //     void sendEmail({
  //       to: user.email,
  //       subject: "Verify your email",
  //       text: `Please verify your email by clicking the following link: ${url}`,
  //     });
  //   },
  // },

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  advanced: {
    cookiePrefix: "lazy",
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  plugins: [
    /**
     * Admin plugin adds role-based access control to your application. It provides a simple way to manage user roles and permissions.
     * The plugin unlocks the following endpoints:
     * POST  /api/auth/admin/set-role          → assign role to a user
     * POST  /api/auth/admin/ban-user          → ban with reason + expiry
      POST  /api/auth/admin/unban-user        → lift a ban
      POST  /api/auth/admin/impersonate-user  → sign in as another user
      POST  /api/auth/admin/stop-impersonating
      POST  /api/auth/admin/remove-user
      GET   /api/auth/admin/list-users        → paginated user list
     */

    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
