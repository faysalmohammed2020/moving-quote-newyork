// lib/auth-client.ts
// Client-side helpers
export { signIn, signOut, useSession } from "next-auth/react";
// Server-side session (App Router / RSC safe):
export { auth } from "@/lib/auth";

// Utility: admin checker (BetterAuth admin plugin-এর সমমান)
export function isAdmin(role?: string) {
  return role === "ADMIN" || role === "MODERATOR";
}
