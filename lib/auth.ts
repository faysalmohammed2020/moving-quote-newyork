// lib/auth.ts — v4
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: { email: {}, password: {} },
      async authorize(c) {
        if (!c?.email || !c?.password) return null;
        const user = await db.user.findUnique({ where: { email: c.email.toLowerCase().trim() } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(c.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined, role: user.role };
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in", // ✅ তোমার কাস্টম সাইন-ইন রুট
    // error: "/auth/sign-in", // চাইলে error পেজও একই রাখো
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = (user as any).id; token.role = (user as any).role ?? "USER"; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).id = token.id; (session.user as any).role = token.role; }
      return session;
    },
  },
};
