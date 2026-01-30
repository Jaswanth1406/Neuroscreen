import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signOut, signUp, useSession } = authClient;

// Type exports for session data
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
