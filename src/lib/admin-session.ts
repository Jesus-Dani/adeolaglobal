import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Password-gated admin per PRD.md §2/§4 (single owner, no staff, no 2FA) —
// a deliberate simplification from TRD.md's original Supabase-Auth-role
// design, decided with the user. See the Phase 4 plan for the full
// rationale. No real auth.uid() exists for this flow, so admin data access
// goes through the service-role client (src/lib/supabase/server.ts
// createAdminClient), gated entirely by the session cookie verified here —
// never by RLS/is_admin().

const COOKIE_NAME = "adeola_admin_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;

function sign(timestamp: string): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not configured");
  return createHmac("sha256", password).update(`admin:${timestamp}`).digest("hex");
}

function timingSafeStringsEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

/** Verifies a candidate password against ADMIN_PASSWORD in constant time. */
export function verifyPassword(candidate: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return timingSafeStringsEqual(candidate, password);
}

/** A stateless, HMAC-signed session token — `timestamp.signature`. */
export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  return `${timestamp}.${sign(timestamp)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return false;

  let expected: string;
  try {
    expected = sign(timestamp);
  } catch {
    return false;
  }

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) return false;

  const age = Date.now() - Number(timestamp);
  return age >= 0 && age <= SESSION_MAX_AGE_MS;
}

/** Checks the session cookie on the current request — Server Components, layouts, and Route Handlers alike. */
export async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Use at the top of every admin API route/Server Action — the /admin layout
 * guard protects pages, but a route hit directly needs its own check too.
 * Returns a 401 response to return immediately, or `null` when the session
 * is valid.
 */
export async function requireAdminSession(): Promise<NextResponse | null> {
  if (await hasValidAdminSession()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
