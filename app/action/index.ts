"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const MAX_AGE = 7 * 24 * 60 * 60;

export async function loginUser(email: string, password: string) {
  try {
    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return { error: "Invalid credentials" };
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: MAX_AGE,
      path: "/",
    });
  } catch (error: any) {
    return { error: error.message };
  }

  // refresh the root layout so Header re-renders with the new cookie
  revalidatePath("/", "layout");

  // must be outside try/catch - redirect() throws a control-flow exception
  redirect("/");
}

export async function logoutUser() {
  (await cookies()).delete("token");
  revalidatePath("/", "layout");
  redirect("/login");
}
