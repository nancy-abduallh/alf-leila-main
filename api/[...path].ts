import { Hono } from "hono";
import { handle } from "hono/vercel";

// Use the Node.js runtime (not "edge") because the app talks to MySQL
// over TLS via `mysql2`, which needs Node APIs not available on Edge.
export const config = {
    runtime: "nodejs",
};

// server/boot.ts reads DATABASE_URL/JWT_SECRET at import time. If one is
// missing, importing it throws. We catch that *inside* the request
// handler (not at module top-level) so a bad/missing env var turns into
// a clear 500 with the real error message instead of a silent 404.
let appPromise: Promise<Hono<any>> | null = null;

function loadApp(): Promise<Hono<any>> {
    if (!appPromise) {
        appPromise = import("../server/boot")
            .then((mod) => mod.default as unknown as Hono<any>)
            .catch((error) => {
                console.error("Failed to initialize the API app:", error);
                const fallback = new Hono();
                fallback.all("*", (c) =>
                    c.json(
                        {
                            error: "Internal Server Error",
                            message:
                                error instanceof Error ? error.message : String(error),
                        },
                        500,
                    ),
                );
                // Don't cache a failed load — retry fresh on the next request
                // (e.g. right after fixing an env var).
                appPromise = null;
                return fallback;
            });
    }
    return appPromise;
}

// `hono/vercel`'s `handle()` correctly adapts both the classic
// (req, res) Node.js invocation style and the newer single-argument
// Web-standard Request/Response style Vercel can use — which our old
// hand-rolled `(request: Request) => app.fetch(request)` handler did
// not reliably do. That mismatch is the most likely reason every
// /api/trpc/* call was coming back as a bare 404 instead of reaching
// our Hono routes at all.
const bridge = new Hono();
    bridge.all("*", async (c) => {
    const app = await loadApp();
    // Vercel's `c.req.raw` is already a Web Standard Request object.
    // Hono's `app.fetch` expects a Request object and returns a Response.
    return app.fetch(c.req.raw);
});

export default handle(bridge);