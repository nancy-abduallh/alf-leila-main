import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { sql } from "drizzle-orm";
import { appRouter } from "./router";
import { createContext } from "./context";
import { handlePaymobWebhook } from "./webhooks/paymob";
import { getDb } from "./queries/connection";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Diagnostic route: after deploying, open
//   https://<your-app>.vercel.app/api/health
// in the browser. { ok: true } means the function AND the database
// connection both work. Anything else tells you exactly what's broken.
app.get("/api/health", async (c) => {
  try {
    await getDb().execute(sql`SELECT 1`);
    return c.json({ ok: true, db: "connected" });
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