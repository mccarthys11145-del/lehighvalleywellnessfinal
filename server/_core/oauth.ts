import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

type OAuthStatePayload = {
  redirectUri?: string;
  returnTo?: string;
};

function base64Decode(input: string): string {
  try {
    return typeof globalThis.atob === "function"
      ? globalThis.atob(input)
      : Buffer.from(input, "base64").toString("utf8");
  } catch {
    try {
      return Buffer.from(input, "base64").toString("utf8");
    } catch {
      return "";
    }
  }
}

function decodeOAuthState(state: string): OAuthStatePayload {
  const decoded = base64Decode(state);
  if (!decoded) return {};

  // New format: base64(JSON.stringify({ redirectUri, returnTo }))
  try {
    const parsed = JSON.parse(decoded) as unknown;
    if (parsed && typeof parsed === "object") {
      const redirectUri =
        "redirectUri" in parsed && typeof (parsed as any).redirectUri === "string"
          ? (parsed as any).redirectUri
          : undefined;
      const returnTo =
        "returnTo" in parsed && typeof (parsed as any).returnTo === "string"
          ? (parsed as any).returnTo
          : undefined;
      return { redirectUri, returnTo };
    }
  } catch {
    // Legacy format: decoded string is the redirectUri.
  }

  return { redirectUri: decoded };
}

function sanitizeReturnTo(returnTo: string | undefined): string | null {
  if (!returnTo) return null;
  // Only allow same-origin relative paths.
  if (!returnTo.startsWith("/")) return null;
  // Disallow protocol-relative URLs (e.g., //evil.com).
  if (returnTo.startsWith("//")) return null;
  // Avoid redirecting back to API endpoints.
  if (returnTo.startsWith("/api/")) return null;
  return returnTo;
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const { returnTo } = decodeOAuthState(state);
      const safeReturnTo = sanitizeReturnTo(returnTo) ?? "/";
      res.redirect(302, safeReturnTo);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
