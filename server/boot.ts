// server/boot.ts
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { sql } from "drizzle-orm";
import { appRouter } from "./router";
import { createContext } from "./context";
import { handlePaymobWebhook } from "./webhooks/paymob";
import { getDb, withTimeout, resetDb } from "./queries/connection";
import { dishes } from "@db/schema";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Diagnostic route: after deploying, open
//   https://<your-app>.vercel.app/api/health
// - { ok: false, message: ... } tells you exactly why the DB isn't reachable.
// - { ok: true, db: "connected", dishCount: N } means everything is wired up.
app.get("/api/health", async (c) => {
  try {
    const db = getDb();
    // One round trip instead of two sequential ones — keeps total time
    // well under Vercel Hobby's 10s function cap even on a cold start.
    const rows = await withTimeout(
      db.select({ count: sql<number>`COUNT(*)` }).from(dishes),
      6000,
      "Database query",
    );
    return c.json({
      ok: true,
      db: "connected",
      dishCount: Number(rows[0]?.count ?? 0),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    // Discard the pool so the next request starts fresh instead of
    // retrying against the same broken connections for the lifetime of
    // this warm serverless instance.
    await resetDb();
    return c.json(
      {
        ok: false,
        db: "error",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

app.post("/api/webhooks/paymob", handlePaymobWebhook);

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;