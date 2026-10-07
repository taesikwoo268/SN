import type { Cookie } from "elysia";

import { env } from "../../config/env.ts";

export const SESSION_COOKIE_NAME = "session";

function getSharedCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    priority: "high" as const,
  };
}

export function setSessionCookie(
  sessionCookie: Cookie<unknown>,
  token: string,
  expiresAt: Date,
): void {
  sessionCookie.set({
    value: token,
    ...getSharedCookieOptions(),
    expires: expiresAt,
    maxAge: env.SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(
  sessionCookie: Cookie<unknown>,
): void {
  sessionCookie.set({
    value: "",
    ...getSharedCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}