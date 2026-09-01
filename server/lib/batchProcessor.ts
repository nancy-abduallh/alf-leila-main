import { eq, and, lte } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { tableOrderBatches, orders } from "@db/schema";
import { TableOrdering } from "@contracts/constants";

/**
 * Finds every table order batch whose edit window has passed and flips it
 * (and all orders inside it) over to the kitchen at once. This is what
 * makes every diner's order at the same table land on the line together,
 * instead of trickling in one at a time.
 */
export async function processDueBatches() {
    const db = getDb();
    const now = new Date();

    const due = await db
        .select()
        .from(tableOrderBatches)
        .where(and(eq(tableOrderBatches.status, "open"), lte(tableOrderBatches.sendAt, now)));

    for (const batch of due) {
        await db
            .update(tableOrderBatches)
            .set({ status: "sent_to_kitchen", sentAt: new Date() })
            .where(eq(tableOrderBatches.id, batch.id));

        await db
            .update(orders)
            .set({ status: "preparing" })
            .where(eq(orders.batchId, batch.id));
    }

    return due.length;
}

/**
 * Starts a lightweight in-process poller. Good enough for a single
 * always-on Railway service; if this ever runs across multiple instances,
 * swap this for a real cron/queue so batches aren't processed twice.
 */
export function startBatchProcessor() {
    setInterval(() => {
        processDueBatches().catch((err) => {
            console.error("Batch processor failed:", err);
        });
    }, TableOrdering.batchPollIntervalMs);
}