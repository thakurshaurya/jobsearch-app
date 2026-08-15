import "server-only";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type CurrentUser = {
  userId: string;
  username: string;
  email: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get("token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const verified = await jwtVerify(token, secret);

    return verified.payload as CurrentUser;
  } catch {
    // expired or tampered token
    return null;
  }
}
