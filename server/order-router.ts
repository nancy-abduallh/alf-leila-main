// server/order-router.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, inArray } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, dishes, users, tables, tableOrderBatches } from "@db/schema";
import { TableOrdering } from "@contracts/constants";

const orderStatusEnum = z.enum([
    "pending_edit",
    "pending",
    "preparing",
    "ready",
    "served",
    "cancelled",
]);

const orderItemInput = z.object({
    dishId: z.number(),
    quantity: z.number().min(1).max(50),
});

// All orders are dine-in — every order must reference a table.
const createOrderInput = z.object({
    items: z.array(orderItemInput).min(1),
    tableId: z.number(),
    notes: z.string().max(1000).optional(),
});

async function validateItemsAndDecrementStock(input: { dishId: number; quantity: number }[]) {
    const db = getDb();
    const dishIds = input.map((i) => i.dishId);
    const dbDishes = await db.select().from(dishes).where(inArray(dishes.id, dishIds));

    if (dbDishes.length !== new Set(dishIds).size) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "One or more dishes not found" });
    }

    const dishMap = new Map(dbDishes.map((d) => [d.id, d]));

    for (const item of input) {
        const dish = dishMap.get(item.dishId)!;
        if (dish.stock !== null && dish.stock < item.quantity) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `${dish.name} only has ${dish.stock} left in stock`,
            });
        }
    }

    let totalCents = 0;
    const lineItems = input.map((item) => {
        const dish = dishMap.get(item.dishId)!;
        const unitCents = Math.round(parseFloat(dish.price) * 100);
        totalCents += unitCents * item.quantity;
        return {
            dishId: dish.id,
            dishName: dish.name,
            unitPrice: dish.price,
            quantity: item.quantity,
        };
    });

    for (const item of input) {
        const dish = dishMap.get(item.dishId)!;
        if (dish.stock !== null) {
            await db
                .update(dishes)
                .set({ stock: dish.stock - item.quantity })
                .where(eq(dishes.id, dish.id));
        }
    }

    return { totalCents, lineItems };
}

export const orderRouter = createRouter({
    create: authedQuery.input(createOrderInput).mutation(async ({ input, ctx }) => {
        const db = getDb();
        const { totalCents, lineItems } = await validateItemsAndDecrementStock(input.items);

        const [table] = await db.select().from(tables).where(eq(tables.id, input.tableId));
        if (!table) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
        }

        const now = new Date();
        const openBatches = await db
            .select()
            .from(tableOrderBatches)
            .where(and(eq(tableOrderBatches.tableId, input.tableId), eq(tableOrderBatches.status, "open")));

        // Reuse an existing open batch for this table if its window hasn't
        // closed yet — that's what puts everyone's order on one ticket.
        const activeBatch = openBatches.find((b) => b.sendAt.getTime() > now.getTime());

        let batchId: number;
        let editableUntil: Date;

        if (activeBatch) {
            batchId = activeBatch.id;
            editableUntil = activeBatch.sendAt;
        } else {
            editableUntil = new Date(now.getTime() + TableOrdering.editWindowMs);
            const batchResult = await db.insert(tableOrderBatches).values({
                tableId: input.tableId,
                tableNumber: table.tableNumber,
                sendAt: editableUntil,
            });
            batchId = Number(batchResult[0].insertId);
        }

        const orderResult = await db.insert(orders).values({
            userId: ctx.user.id,
            status: "pending_edit",
            totalAmount: (totalCents / 100).toFixed(2),
            notes: input.notes,
            tableId: table.id,
            tableNumber: table.tableNumber,
            batchId,
            editableUntil,
        });
        const orderId = Number(orderResult[0].insertId);
        await db.insert(orderItems).values(lineItems.map((item) => ({ ...item, orderId })));

        return {
            orderId,
            batchId,
            tableNumber: table.tableNumber,
            editableUntil: editableUntil.toISOString(),
        };
    }),

    // Lets a diner change their own order while it's still inside the
    // 5-minute window, before the batch is sent to the kitchen. `items` is the
    // COMPLETE new list: change a quantity, remove a line, or add a dish that
    // wasn't in the order before.
    //
    // Stock is settled as a delta against what the order already holds
    // (create() took the original quantities), all inside one transaction so
    // a failure half-way never leaves stock or items half-updated.
    updateItems: authedQuery
        .input(
            z.object({
                orderId: z.number(),
                items: z.array(orderItemInput).min(1),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const db = getDb();

            return db.transaction(async (tx) => {
                const [order] = await tx
                    .select()
                    .from(orders)
                    .where(eq(orders.id, input.orderId))
                    .for("update");

                if (!order || order.userId !== ctx.user.id) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
                }

                if (
                    order.status !== "pending_edit" ||
                    !order.editableUntil ||
                    order.editableUntil.getTime() < Date.now()
                ) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "This order has already been sent to the kitchen and can't be edited.",
                    });
                }

                // Same dish sent twice → one line.
                const wanted = new Map<number, number>();
                for (const i of input.items) {
                    wanted.set(i.dishId, Math.min(50, (wanted.get(i.dishId) ?? 0) + i.quantity));
                }

                const existing = await tx
                    .select()
                    .from(orderItems)
                    .where(eq(orderItems.orderId, input.orderId));
                const before = new Map<number, number>();
                for (const line of existing) {
                    before.set(line.dishId, (before.get(line.dishId) ?? 0) + line.quantity);
                }

                const allIds = [...new Set([...wanted.keys(), ...before.keys()])];
                const dbDishes = await tx
                    .select()
                    .from(dishes)
                    .where(inArray(dishes.id, allIds))
                    .for("update");
                const dishMap = new Map(dbDishes.map((d) => [d.id, d]));

                for (const dishId of wanted.keys()) {
                    if (!dishMap.has(dishId)) {
                        throw new TRPCError({ code: "BAD_REQUEST", message: "One or more dishes not found" });
                    }
                }

                // Only the CHANGE in quantity touches stock: +2 takes two more
                // off the shelf, -1 gives one back, an unchanged line does nothing.
                for (const dishId of allIds) {
                    const dish = dishMap.get(dishId);
                    if (!dish || dish.stock === null) continue; // gone, or unlimited
                    const delta = (wanted.get(dishId) ?? 0) - (before.get(dishId) ?? 0);
                    if (delta === 0) continue;
                    if (delta > 0 && dish.stock < delta) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message:
                                dish.stock <= 0
                                    ? `${dish.name} is out of stock`
                                    : `${dish.name} only has ${dish.stock} left in stock`,
                        });
                    }
                    await tx
                        .update(dishes)
                        .set({ stock: dish.stock - delta })
                        .where(eq(dishes.id, dish.id));
                }

                // Dishes already in the order keep the price the diner saw when
                // they ordered (so the total on screen matches what's saved);
                // newly added dishes are priced at today's menu price.
                const quoted = new Map(existing.map((l) => [l.dishId, l]));
                let totalCents = 0;
                const lineItems = [...wanted].map(([dishId, quantity]) => {
                    const dish = dishMap.get(dishId)!;
                    const prior = quoted.get(dishId);
                    const unitPrice = prior ? prior.unitPrice : dish.price;
                    totalCents += Math.round(parseFloat(unitPrice) * 100) * quantity;
                    return {
                        orderId: input.orderId,
                        dishId,
                        dishName: prior ? prior.dishName : dish.name,
                        unitPrice,
                        quantity,
                    };
                });

                await tx.delete(orderItems).where(eq(orderItems.orderId, input.orderId));
                await tx.insert(orderItems).values(lineItems);
                await tx
                    .update(orders)
                    .set({ totalAmount: (totalCents / 100).toFixed(2) })
                    .where(eq(orders.id, input.orderId));

                return {
                    success: true,
                    totalAmount: (totalCents / 100).toFixed(2),
                    editableUntil: order.editableUntil,
                };
            });
        }),

    myOrders: authedQuery.query(async ({ ctx }) => {
        const db = getDb();
        const myOrders = await db
            .select()
            .from(orders)
            .where(eq(orders.userId, ctx.user.id))
            .orderBy(desc(orders.createdAt));

        if (myOrders.length === 0) return [];

        const ids = myOrders.map((o) => o.id);
        const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, ids));

        return myOrders.map((order) => ({
            ...order,
            items: items.filter((i) => i.orderId === order.id),
        }));
    }),

    getById: authedQuery
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            const db = getDb();
            const [order] = await db.select().from(orders).where(eq(orders.id, input.id));
            if (!order || (order.userId !== ctx.user.id && ctx.user.role !== "admin")) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
            }
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
            return { order, items };
        }),

    // For the customer's "waiting room" screen: everyone's orders on the
    // same table batch, so they can see it'll be prepared together.
    getBatch: authedQuery
        .input(z.object({ batchId: z.number() }))
        .query(async ({ input }) => {
            const db = getDb();
            const [batch] = await db
                .select()
                .from(tableOrderBatches)
                .where(eq(tableOrderBatches.id, input.batchId));
            if (!batch) throw new TRPCError({ code: "NOT_FOUND", message: "Batch not found" });

            const batchOrders = await db.select().from(orders).where(eq(orders.batchId, input.batchId));
            const ids = batchOrders.map((o) => o.id);
            const items = ids.length
                ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids))
                : [];

            return {
                batch,
                orders: batchOrders.map((o) => ({
                    ...o,
                    items: items.filter((i) => i.orderId === o.id),
                })),
            };
        }),

    list: adminQuery.query(async () => {
        const db = getDb();
        const allOrders = await db
            .select({
                order: orders,
                customerName: users.name,
                customerEmail: users.email,
            })
            .from(orders)
            .leftJoin(users, eq(orders.userId, users.id))
            .orderBy(desc(orders.createdAt));

        if (allOrders.length === 0) return [];

        const ids = allOrders.map((o) => o.order.id);
        const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, ids));

        return allOrders.map((row) => ({
            ...row.order,
            customerName: row.customerName,
            customerEmail: row.customerEmail,
            items: items.filter((i) => i.orderId === row.order.id),
        }));
    }),

    updateStatus: adminQuery
        .input(
            z.object({
                id: z.number(),
                status: orderStatusEnum,
            }),
        )
        .mutation(async ({ input }) => {
            const db = getDb();
            const [order] = await db.select().from(orders).where(eq(orders.id, input.id));
            if (!order) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
            }

            await db
                .update(orders)
                .set({ status: input.status })
                .where(eq(orders.id, input.id));

            return { success: true };
        }),

    // Kitchen display. Shows tables whose window is still counting down *and*
    // tables already sent, so the line can see what's coming.
    kitchenQueue: adminQuery.query(async () => {
        const db = getDb();
        const batches = await db
            .select()
            .from(tableOrderBatches)
            .where(inArray(tableOrderBatches.status, ["open", "sent_to_kitchen"]))
            .orderBy(desc(tableOrderBatches.opensAt));

        if (batches.length === 0) return [];

        const batchIds = batches.map((b) => b.id);
        const batchOrders = await db.select().from(orders).where(inArray(orders.batchId, batchIds));
        const orderIds = batchOrders.map((o) => o.id);
        const items = orderIds.length
            ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
            : [];

        return batches
            .map((b) => {
                const own = batchOrders.filter((o) => o.batchId === b.id);
                const ownItems = own.flatMap((o) => items.filter((i) => i.orderId === o.id));

                // One merged list per table — what the line actually cooks.
                const merged = new Map<string, { dishName: string; quantity: number }>();
                for (const item of ownItems) {
                    const row = merged.get(item.dishName) ?? { dishName: item.dishName, quantity: 0 };
                    row.quantity += item.quantity;
                    merged.set(item.dishName, row);
                }

                return {
                    ...b,
                    orders: own.map((o) => ({
                        ...o,
                        items: items.filter((i) => i.orderId === o.id),
                    })),
                    combinedItems: [...merged.values()],
                };
            })
            .filter(
                (b) =>
                    b.orders.length > 0 &&
                    b.orders.some((o) => o.status !== "served" && o.status !== "cancelled"),
            );
    }),

    // Staff can pull a table's ticket forward instead of waiting out the
    // timer — e.g. the diners say they're done ordering.
    sendBatchNow: adminQuery
        .input(z.object({ batchId: z.number() }))
        .mutation(async ({ input }) => {
            const db = getDb();
            const [batch] = await db
                .select()
                .from(tableOrderBatches)
                .where(eq(tableOrderBatches.id, input.batchId));

            if (!batch) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
            if (batch.status !== "open") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "This ticket has already gone to the kitchen.",
                });
            }

            const now = new Date();
            await db
                .update(tableOrderBatches)
                .set({ status: "sent_to_kitchen", sentAt: now, sendAt: now })
                .where(eq(tableOrderBatches.id, input.batchId));

            await db
                .update(orders)
                .set({ status: "preparing" })
                .where(eq(orders.batchId, input.batchId));

            return { success: true };
        }),

    // Moves a whole table at once — the point of batching. One table is
    // cooked, plated and carried out together.
    updateBatchStatus: adminQuery
        .input(
            z.object({
                batchId: z.number(),
                status: z.enum(["preparing", "ready", "served", "cancelled"]),
            }),
        )
        .mutation(async ({ input }) => {
            const db = getDb();

            await db
                .update(orders)
                .set({ status: input.status })
                .where(eq(orders.batchId, input.batchId));

            if (input.status === "cancelled") {
                await db
                    .update(tableOrderBatches)
                    .set({ status: "cancelled" })
                    .where(eq(tableOrderBatches.id, input.batchId));
            }

            return { success: true };
        }),
});