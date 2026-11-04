import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/security";
import { startOwnerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { allow, clientIp } from "@/lib/rateLimit";

export async function POST(request) {
  // at most 8 attempts per 15 minutes from one network
  if (!(await allow(db(), "owner-login:" + clientIp(request), 8, 900))) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {}
  const expected = process.env.OWNER_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "OWNER_PASSWORD is not set on the server" }, { status: 500 });
  }
  if (!safeEqual(body.password || "", expected)) {
    await new Promise((r) => setTimeout(r, 700)); // slows down guessing
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  await startOwnerSession();
  return NextResponse.json({ ok: true });
}