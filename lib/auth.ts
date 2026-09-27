import "server-only";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { auth } from "@/auth";

export type CurrentUser = {
  userId: string;
  username: string;
  email: string;
  image?: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // 1. Check Auth.js session (Google, GitHub, NextAuth session)
  try {
    const session = await auth();
    if (session?.user?.id) {
      return {
        userId: session.user.id,
        username: (session.user as any).username || session.user.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
        image: session.user.image || null,
      };
    }
  } catch (error: any) {
    // If Next.js throws DYNAMIC_SERVER_USAGE during static optimization/prerendering, rethrow it
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    console.error("Error retrieving Auth.js session in getCurrentUser:", error);
  }

  // 2. Check existing custom JWT cookie (token) for email/password credentials
  try {
    const token = (await cookies()).get("token")?.value;
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const verified = await jwtVerify(token, secret);
      return verified.payload as unknown as CurrentUser;
    }
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    return null;
  }

  return null;
}
