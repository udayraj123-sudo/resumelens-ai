import { NextResponse } from "next/server";
import { passwordMatches, makeToken, adminCookie } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const { password } = await request.json();
    if (!passwordMatches(password)) {
      await new Promise((r) => setTimeout(r, 600)); // galat password pe thoda rukna
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(adminCookie.name, makeToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: adminCookie.maxAge,
    });
    return res;
  } catch (err) {
    console.error("POST /api/admin/login failed:", err.message);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}