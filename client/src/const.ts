export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = (options?: { returnTo?: string }) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  // Preserve the current location so the OAuth callback can route the user
  // back to the page that initiated login (e.g., /admin/leads).
  const currentPath =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : "/";

  const returnToRaw = options?.returnTo ?? currentPath;
  const returnTo =
    typeof returnToRaw === "string" && returnToRaw.startsWith("/")
      ? returnToRaw
      : "/";

  // NOTE:
  // - The server uses `state` to recover the redirectUri for the token exchange.
  // - We also embed `returnTo` so the server can redirect the user back to the
  //   page that initiated the login.
  const state = btoa(JSON.stringify({ redirectUri, returnTo }));

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
