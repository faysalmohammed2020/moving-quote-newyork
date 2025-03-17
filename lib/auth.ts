import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  admin: {
    modelName: "admin",
  },
  user: {
    modelName: "users",
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    admin({
      defaultRole: "user",
      adminRole: ["admin", "moderator"],
    }),
  ],
});
