import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Shared-password access control for the cost-bearing API routes.
 *
 * The dashboard is single-tenant, so full user accounts would be overkill. A
 * single shared password gates the routes that spend Anthropic credits; on
 * success the server issues an HMAC-signed, httpOnly cookie. The password is
 * also the HMAC key, so rotating it invalidates every outstanding session.
 *
 * Safe by default: if AXOM_ACCESS_PASSWORD is unset in production the gated
 * routes refuse to serve rather than falling open — an unauthenticated
 * deployment would let anyone spend the account's credits. Local development
 * (NODE_ENV !== "production") stays open so the app runs with no setup.
 */

const COOKIE_NAME = "axom_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const VERSION = "v1";

export { COOKIE_NAME };

export type AuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

function secret(): string | undefined {
  return process.env.AXOM_ACCESS_PASSWORD;
}

/** True when auth is deliberately disabled for local development. */
function devOpen(): boolean {
  return !secret() && process.env.NODE_ENV !== "production";
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("hex");
}

/** Constant-time compare; hashing first keeps it safe for unequal lengths. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifyPassword(candidate: string): boolean {
  const key = secret();
  if (!key || typeof candidate !== "string") return false;
  return safeEqual(candidate, key);
}

/** `<expiry>.<hmac>` — opaque to the client, verified server-side. */
export function createSessionToken(): string | null {
  const key = secret();
  if (!key) return null;
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${sign(`${VERSION}.${exp}`, key)}`;
}

export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

function isValidToken(token: string | undefined): boolean {
  const key = secret();
  if (!key || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(`${VERSION}.${exp}`, key));
}

/**
 * Gate a request. Reads the session cookie directly off the Request so this
 * works in any route handler without extra plumbing.
 */
export function checkAuth(req: Request): AuthResult {
  if (devOpen()) return { ok: true };

  if (!secret()) {
    // Production with no password configured — refuse rather than fall open.
    return {
      ok: false,
      status: 503,
      error: "Access is not configured — set AXOM_ACCESS_PASSWORD.",
    };
  }

  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!isValidToken(token)) {
    return { ok: false, status: 401, error: "Unlock required." };
  }
  return { ok: true };
}

/** Whether a password is required at all — lets the UI skip the prompt in dev. */
export function authRequired(): boolean {
  return !devOpen();
}
