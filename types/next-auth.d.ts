import "next-auth";
import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    username?: string;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string;
    username?: string;
    picture?: string;
    image?: string;
  }
}
