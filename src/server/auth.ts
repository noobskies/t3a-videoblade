import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite", // Change to "postgresql" in production
  }),
  emailAndPassword: {
    enabled: false, // Disabled for now, enable later if needed
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      accessType: "offline", // Critical for refresh tokens
      prompt: "consent", // Always request consent for refresh token
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/youtube", // Full YouTube API access (upload, update, manage)
      ],
    },
    // Add more providers later (Vimeo, etc.)
  },
  plugins: [
    nextCookies(), // Must be last plugin
  ],
});

export type Session = typeof auth.$Infer.Session;
