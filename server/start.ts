import { serve } from "@hono/node-server";
import app from "./boot";
import { serveStaticFiles } from "./lib/vite";
import { initDatabase } from "./lib/initDb";

process.env.NODE_ENV = process.env.NODE_ENV || "production";

serveStaticFiles(app);

const port = parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "0.0.0.0";

// Ensure tables and initial seeds exist in the database asynchronously
initDatabase().catch((err) => {
    console.error("[db] initialization error:", err);
});

serve({ fetch: app.fetch, port, hostname: host }, () => {
    console.log(`Server running on http://${host}:${port}/`);
});