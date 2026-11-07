import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { allow, clientIp } from "@/lib/rateLimit";
import { consumeAuthToken } from "@/lib/authTokens";
import { startCompanySession } from "@/lib/session";

function bad(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  try {
    const supabase = db();
    if (!(await allow(supabase, "verify:" + clientIp(request), 20, 3600))) {
      return bad("Too many attempts. Please try again later.", 429);
    }

    let body = {};
    try {
      body = await request.json();
    } catch {}

    const companyId = await consumeAuthToken(supabase, body.token, "verify");
    if (!companyId) return bad("This link is invalid or has expired. Please request a new one on the login page.");

    const { error } = await supabase
      .from("companies")
      .update({ email_verified_at: new Date().toISOString() })
      .eq("id", companyId);
    if (error) throw error;

    const { data: company } = await supabase.from("companies").select("status").eq("id", companyId).maybeSingle();
    const active = company?.status === "active";
    if (active) await startCompanySession(companyId);

    return NextResponse.json({ ok: true, active });
  } catch (err) {
    console.error("POST /api/company/verify failed:", err.message);
    return bad("Something went wrong. Please try again.", 500);
  }
}