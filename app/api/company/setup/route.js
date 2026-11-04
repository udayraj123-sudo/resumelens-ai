import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, hashPassword } from "@/lib/security";
import { startCompanySession } from "@/lib/session";

async function findInvite(supabase, token) {
  if (!token || typeof token !== "string" || token.length > 200) {
    return { error: "This link is not valid." };
  }
  const { data: invite } = await supabase
    .from("company_invites")
    .select("id,company_id,expires_at,used_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!invite) return { error: "This link is not valid." };
  if (invite.used_at) return { error: "This link has already been used." };
  if (new Date(invite.expires_at) < new Date()) {
    return { error: "This link has expired. Ask the owner for a new one." };
  }
  const { data: company } = await supabase
    .from("companies")
    .select("id,name,status")
    .eq("id", invite.company_id)
    .maybeSingle();
  if (!company) return { error: "This link is not valid." };
  if (company.status === "inactive") return { error: "This account is paused. Contact the owner." };
  return { invite, company };
}

// Is this invite link still usable? (shows the company name on the setup page)
export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");
  const r = await findInvite(db(), token);
  if (r.error) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ companyName: r.company.name });
}

// Company chooses its password. The invite can be used exactly once.
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const password = String(body.password || "");
  if (password.length < 10 || password.length > 100) {
    return NextResponse.json({ error: "Password must be 10-100 characters" }, { status: 400 });
  }

  const supabase = db();
  const r = await findInvite(supabase, body.token);
  if (r.error) return NextResponse.json({ error: r.error }, { status: 400 });

  // claim the invite first (only one request can win this)
  const { data: claimed } = await supabase
    .from("company_invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", r.invite.id)
    .is("used_at", null)
    .select("id");
  if (!claimed || claimed.length === 0) {
    return NextResponse.json({ error: "This link has already been used." }, { status: 400 });
  }

  const { error } = await supabase
    .from("companies")
    .update({ password_hash: hashPassword(password), status: "active" })
    .eq("id", r.company.id);
  if (error) {
    return NextResponse.json(
      { error: "Could not save the password. Ask the owner for a new link." },
      { status: 500 }
    );
  }

  await startCompanySession(r.company.id);
  return NextResponse.json({ ok: true });
}