import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { orders } from "@db/schema";
import { verifyPaymobHmac } from "../lib/paymob";

export async function handlePaymobWebhook(c: Context) {
    const hmac = c.req.query("hmac");
    if (!hmac) {
        return c.json({ error: "Missing hmac" }, 400);
    }

    const body = await c.req.json().catch(() => null);
    const transaction = body?.obj;
    if (!transaction) {
        return c.json({ error: "Invalid payload" }, 400);
    }

    if (!verifyPaymobHmac(transaction, hmac)) {
        return c.json({ error: "Invalid signature" }, 401);
    }

    const merchantOrderId = transaction.order?.merchant_order_id;
    const orderId = merchantOrderId ? parseInt(String(merchantOrderId), 10) : NaN;

    if (Number.isNaN(orderId)) {
        return c.json({ error: "Invalid order reference" }, 400);
    }

    const status = transaction.success ? "paid" : "failed";
    const db = getDb();
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));

    return c.json({ received: true });
}