import "server-only";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type CurrentUser = {
  userId: string;
  username: string;
  email: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get("token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as CurrentUser;
  } catch {
    // expired or tampered token
    return null;
  }
}
