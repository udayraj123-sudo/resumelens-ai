import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/security";
import { startOwnerSession } from "@/lib/session";

export async function POST(request) {
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