import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
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
    tiktok: {
      clientKey: process.env.TIKTOK_CLIENT_KEY!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
      scope: ["user.info.basic", "video.upload", "video.publish"],
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      scope: ["openid", "profile", "email", "w_member_social"],
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "vimeo",
          clientId: process.env.VIMEO_CLIENT_ID!,
          clientSecret: process.env.VIMEO_CLIENT_SECRET!,
          authorizationUrl: "https://api.vimeo.com/oauth/authorize",
          tokenUrl: "https://api.vimeo.com/oauth/access_token",
          userInfoUrl: "https://api.vimeo.com/me",
          scopes: ["public", "private", "upload", "edit", "delete", "stats"],
          getUserInfo: async (token) => {
            const response = await fetch("https://api.vimeo.com/me", {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
                Accept: "application/vnd.vimeo.*+json;version=3.4",
              },
            });
            const user = (await response.json()) as {
              uri: string;
              name: string;
              pictures?: { sizes?: { link: string }[] };
            };
            return {
              id: user.uri.split("/").pop() ?? "",
              name: user.name,
              email: "", // Vimeo API doesn't strictly guarantee email in /me response without specific permissions/fields, and we might not need it for "connection" only. Better Auth might require it though.
              // If email is missing, Better Auth might generate a placeholder or fail sign in if email is required.
              // Since we are using this for "Linking", it's okay.
              // Actually, let's try to fetch email if possible, or generate a fake one for platform connections if Better Auth allows.
              // Better Auth usually uses email for identification.
              emailVerified: true,
              image: user.pictures?.sizes?.[0]?.link,
            };
          },
        },
      ],
    }),
    nextCookies(), // Must be last plugin
  ],
});

export type Session = typeof auth.$Infer.Session;
