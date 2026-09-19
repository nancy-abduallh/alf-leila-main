/** Only ever follow same-site paths; never an attacker-supplied URL. */
export function safeRedirect(raw: string | null | undefined, fallback = "/"): string {
    if (!raw) return fallback;
    // Must be a plain absolute path: "/menu", not "//evil.com" or "https://…".
    if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
    // Bouncing back to an auth page would just loop.
    if (raw.startsWith("/login") || raw.startsWith("/register")) return fallback;
    return raw;
}

const withRedirect = (base: string, returnTo?: string) =>
    returnTo && safeRedirect(returnTo, "") ? `${base}?redirect=${encodeURIComponent(returnTo)}` : base;

export const loginPath = (returnTo?: string) => withRedirect("/login", returnTo);
export const registerPath = (returnTo?: string) => withRedirect("/register", returnTo);