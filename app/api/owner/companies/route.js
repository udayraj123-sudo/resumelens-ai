import { NextResponse } from "next/server";
import { isOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { slugify } from "@/lib/security";
import { createInvite, originFrom } from "@/lib/invites";

function monthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

// List companies + how many applications each got this month (counts only, no candidate data).
export async function GET() {
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = db();
  const { data: companies, error } = await supabase
    .from("companies")
    .select("id,name,slug,email,status,monthly_limit,created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const since = monthStart();
  const withUsage = await Promise.all(
    companies.map(async (c) => {
      const { count } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("company_id", c.id)
        .gte("created_at", since);
      return { ...c, used: count || 0 };
    })
  );
  return NextResponse.json({ companies: withUsage });
}

// Create a company and its first invite link.
export async function POST(request) {
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body = {};
  try {
    body = await request.json();
  } catch {}
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const limit = Number.isInteger(Number(body.monthly_limit)) ? Number(body.monthly_limit) : 100;

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Company name must be 2-80 characters" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (limit < 1 || limit > 100000) {
    return NextResponse.json({ error: "Monthly limit must be between 1 and 100000" }, { status: 400 });
  }

  const supabase = db();

  // slug: acme, acme-2, acme-3 ...
  const base = slugify(name);
  let slug = base;
  for (let i = 2; i < 200; i++) {
    const { data } = await supabase.from("companies").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${i}`;
  }

  const { data: company, error } = await supabase
    .from("companies")
    .insert({ name, slug, email, monthly_limit: limit })
    .select("id,name,slug,email,status,monthly_limit,created_at")
    .single();
  if (error) {
    const msg = error.code === "23505" ? "A company with this email already exists" : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const token = await createInvite(supabase, company.id);
  const inviteUrl = `${originFrom(request)}/setup/${token}`;
  return NextResponse.json({ company: { ...company, used: 0 }, inviteUrl }, { status: 201 });
}