import { NextResponse } from "next/server";
import { endOwnerSession } from "@/lib/session";

export async function POST() {
  await endOwnerSession();
  return NextResponse.json({ ok: true });
}