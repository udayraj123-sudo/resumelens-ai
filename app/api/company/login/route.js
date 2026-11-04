import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/security";
import { startCompanySession } from "@/lib/session";

// used so a wrong email takes as long as a wrong password
const DUMMY = hashPassword("not-a-real-password");

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const { data: company } = await db()
    .from("companies")
    .select("id,status,password_hash")
    .eq("email", email)
    .maybeSingle();

  const ok = verifyPassword(password, company?.password_hash || DUMMY) && !!company?.password_hash;
  if (!company || !ok) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }
  if (company.status !== "active") {
    return NextResponse.json({ error: "This account is paused. Contact the owner." }, { status: 403 });
  }
  await startCompanySession(company.id);
  return NextResponse.json({ ok: true });
}