import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { sql } from "drizzle-orm";
import { appRouter } from "./router";
import { createContext } from "./context";
import { handlePaymobWebhook } from "./webhooks/paymob";
import { getDb } from "./queries/connection";
import { dishes } from "@db/schema";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Diagnostic route: after deploying, open
//   https://<your-app>.vercel.app/api/health
// in the browser.
// - { ok: false, db: "error", message: ... } means the app couldn't even
//   connect (bad DATABASE_URL, blocked by Aiven's IP allowlist, wrong
//   credentials, etc.) — the "message" field tells you exactly why.
// - { ok: true, db: "connected", dishCount: 0 } means the connection
//   works fine but the table Vercel is reading from is actually empty —
//   which usually means your local seed/push script pointed at a
//   *different* database than the one configured here.
// - { ok: true, db: "connected", dishCount: 24 } means everything is
//   wired up correctly.
app.get("/api/health", async (c) => {
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    const rows = await db.select({ count: sql<number>`COUNT(*)` }).from(dishes);
    return c.json({
      ok: true,
      db: "connected",
      dishCount: Number(rows[0]?.count ?? 0),
    });
  } catch (error) {
    console.error("Health check failed:", error);
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