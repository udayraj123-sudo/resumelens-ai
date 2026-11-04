import { NextResponse } from "next/server";
import { endCompanySession } from "@/lib/session";

export async function POST() {
  await endCompanySession();
  return NextResponse.json({ ok: true });
}