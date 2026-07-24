import {
  COOKIE_NAME,
  authRequired,
  checkAuth,
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

// A single shared password is the only credential, so unlock attempts get a
// much tighter budget than ordinary traffic to make guessing impractical.
const ATTEMPT_LIMIT = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

/** Lets the UI decide whether to show the unlock prompt at all. */
export async function GET(req: Request) {
  return NextResponse.json({
    required: authRequired(),
    authenticated: checkAuth(req).ok,
  });
}

export async function POST(req: Request) {
  const limit = rateLimit(`auth:${clientKey(req)}`, ATTEMPT_LIMIT, ATTEMPT_WINDOW_MS);
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Too many attempts — try again later.");
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!process.env.AXOM_ACCESS_PASSWORD) {
    return NextResponse.json(
      { error: "Access is not configured — set AXOM_ACCESS_PASSWORD." },
      { status: 503 },
    );
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Access is not configured." }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...sessionCookieOptions(), value: token });
  return res;
}

/** Sign out — clears the session cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...sessionCookieOptions(), name: COOKIE_NAME, value: "", maxAge: 0 });
  return res;
}
