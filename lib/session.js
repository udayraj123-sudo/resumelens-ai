import { cookies } from "next/headers";
import { sign, verify } from "./security";

const OWNER = "rl_owner";
const COMPANY = "rl_company";

function opts(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

// ---- owner ----
export async function startOwnerSession() {
  const ttl = 12 * 3600;
  (await cookies()).set(OWNER, sign({ t: "owner" }, ttl), opts(ttl));
}
export async function isOwner() {
  const v = (await cookies()).get(OWNER)?.value;
  const p = v ? verify(v) : null;
  return p?.t === "owner";
}
export async function endOwnerSession() {
  (await cookies()).delete(OWNER);
}

// ---- company ----
export async function startCompanySession(companyId) {
  const ttl = 7 * 24 * 3600;
  (await cookies()).set(COMPANY, sign({ t: "company", cid: companyId }, ttl), opts(ttl));
}
export async function getCompanyId() {
  const v = (await cookies()).get(COMPANY)?.value;
  const p = v ? verify(v) : null;
  return p?.t === "company" ? p.cid : null;
}
export async function endCompanySession() {
  (await cookies()).delete(COMPANY);
}