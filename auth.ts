import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { connectDB } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!account || (account.provider !== "google" && account.provider !== "github")) {
          return true;
        }

        const email = user.email?.trim().toLowerCase();
        if (!email) {
          console.warn(`[OAuth signIn] No email provided by ${account.provider}`);
          return false;
        }

        await connectDB();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
          // If already linked to a different OAuth provider, protect against account collision
          if (
            existingUser.provider &&
            existingUser.provider !== account.provider &&
            existingUser.provider !== "credentials"
          ) {
            console.warn(
              `[OAuth signIn] Account conflict: ${email} already uses ${existingUser.provider}`
            );
            return `/login?error=OAuthAccountNotLinked`;
          }

          // Link provider info to existing account if not yet recorded
          let shouldSave = false;
          if (!existingUser.providerId) {
            existingUser.provider = account.provider;
            existingUser.providerId = account.providerAccountId;
            shouldSave = true;
          }
          if (user.image && existingUser.image !== user.image) {
            existingUser.image = user.image;
            shouldSave = true;
          }
          if (!existingUser.isVerified) {
            existingUser.isVerified = true;
            shouldSave = true;
          }
          if (shouldSave) {
            await existingUser.save();
          }

          user.id = existingUser._id.toString();
          (user as any).username = existingUser.username;
          user.image = existingUser.image || user.image;
          return true;
        }

        // New user: generate unique username
        let baseUsername =
          (profile as any)?.login ||
          user.name?.replace(/\s+/g, "").toLowerCase() ||
          email.split("@")[0].toLowerCase();

        // Ensure valid alphanumeric and underscore characters
        baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, "");
        if (!baseUsername) {
          baseUsername = `user_${Date.now().toString().slice(-6)}`;
        }

        let candidateUsername = baseUsername;
        let counter = 1;
        while (await User.findOne({ username: candidateUsername })) {
          candidateUsername = `${baseUsername}${counter}`;
          counter++;
        }

        const newUser = new User({
          username: candidateUsername,
          email,
          provider: account.provider,
          providerId: account.providerAccountId,
          image: user.image || undefined,
          isVerified: true,
        });

        const savedUser = await newUser.save();
        user.id = savedUser._id.toString();
        (user as any).username = savedUser.username;
        user.image = savedUser.image;
        return true;
      } catch (error) {
        console.error("[OAuth signIn error]:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.username = (user as any).username;
        token.image = user.image || undefined;
      }

      if ((!token.userId || !token.image) && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email.toLowerCase() });
          if (dbUser) {
            token.userId = dbUser._id.toString();
            token.username = dbUser.username;
            if (dbUser.image) {
              token.image = dbUser.image;
            }
          }
        } catch (dbErr) {
          console.error("[OAuth jwt callback error]:", dbErr);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        (session.user as any).username = token.username as string;
        session.user.image = (token.image as string) || (token.picture as string) || session.user.image;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
