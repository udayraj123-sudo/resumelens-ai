import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/companyAuth";
import { getUsage } from "@/lib/usage";

export async function GET() {
  const company = await requireCompany();
  if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const used = await getUsage(db(), company.id);
  return NextResponse.json({ company: { ...company, used } });
}