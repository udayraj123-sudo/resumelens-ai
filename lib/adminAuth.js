import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "rl_admin";
const MAX_AGE = 60 * 60 * 8; // 8 ghante

function sign(value) {
  return crypto
    .createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
    .update(value)
    .digest("hex");
}

export function passwordMatches(input) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const a = crypto.createHash("sha256").update(String(input)).digest();
  const b = crypto.createHash("sha256").update(String(real)).digest();
  return crypto.timingSafeEqual(a, b);
}

export function makeToken() {
  const expires = Date.now() + MAX_AGE * 1000;
  return expires + "." + sign(String(expires));
}

function validToken(token) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(expires));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(expires) > Date.now();
}

export async function isAdmin() {
  const store = await cookies();
  return validToken(store.get(COOKIE)?.value);
}

export const adminCookie = { name: COOKIE, maxAge: MAX_AGE };