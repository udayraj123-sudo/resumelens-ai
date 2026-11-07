import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/security";
import { allow, clientIp } from "@/lib/rateLimit";
import { consumeAuthToken } from "@/lib/authTokens";

function bad(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  try {
    const supabase = db();
    if (!(await allow(supabase, "reset:" + clientIp(request), 10, 3600))) {
      return bad("Too many attempts. Please try again later.", 429);
    }

    let body = {};
    try {
      body = await request.json();
    } catch {}
    const password = String(body.password || "");
    if (password.length < 8 || password.length > 72) return bad("Password must be 8 to 72 characters.");

    const companyId = await consumeAuthToken(supabase, body.token, "reset");
    if (!companyId) return bad("This link is invalid or has expired. Please ask for a new reset link.");

    const { data: company } = await supabase
      .from("companies")
      .select("email_verified_at")
      .eq("id", companyId)
      .maybeSingle();

    const { error } = await supabase
      .from("companies")
      .update({
        password_hash: hashPassword(password),
        // they proved they own the email, so it counts as verified
        email_verified_at: company?.email_verified_at || new Date().toISOString(),
      })
      .eq("id", companyId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/company/reset failed:", err.message);
    return bad("Something went wrong. Please try again.", 500);
  }
}