// api/order-router.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, inArray } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, dishes, users, tables, tableOrderBatches } from "@db/schema";
import { initiatePaymobPayment } from "./lib/paymob";
import { TableOrdering } from "@contracts/constants";

const orderStatusEnum = z.enum([
    "pending_edit",
    "pending",
    "paid",
    "preparing",
    "delivered",
    "failed",
    "cancelled",
]);

const orderItemInput = z.object({
    dishId: z.number(),
    quantity: z.number().min(1).max(50),
});

const createOrderInput = z.discriminatedUnion("orderSource", [
    z.object({
        orderSource: z.literal("delivery"),
        items: z.array(orderItemInput).min(1),
        phone: z.string().min(5).max(20),
        address: z.string().min(3).max(255),
        city: z.string().min(1).max(100),
        notes: z.string().max(1000).optional(),
    }),
    z.object({
        orderSource: z.literal("dine_in"),
        items: z.array(orderItemInput).min(1),
        tableId: z.number(),
        notes: z.string().max(1000).optional(),
    }),
]);

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

        if (input.orderSource === "delivery") {
            const orderResult = await db.insert(orders).values({
                userId: ctx.user.id,
                status: "pending",
                orderSource: "delivery",
                totalAmount: (totalCents / 100).toFixed(2),
                phone: input.phone,
                address: input.address,
                city: input.city,
                notes: input.notes,
            });
            const orderId = Number(orderResult[0].insertId);
            await db.insert(orderItems).values(lineItems.map((item) => ({ ...item, orderId })));

            const [firstName, ...rest] = (ctx.user.name || "Guest").trim().split(" ");

            let iframeUrl: string;
            try {
                const result = await initiatePaymobPayment({
                    amountCents: totalCents,
                    merchantOrderId: String(orderId),
                    billingData: {
                        first_name: firstName || "Guest",
                        last_name: rest.join(" ") || "Customer",
                        email: ctx.user.email,
                        phone_number: input.phone,
                    },
                });
                iframeUrl = result.iframeUrl;

                await db
                    .update(orders)
                    .set({ paymobOrderId: String(result.paymobOrderId) })
                    .where(eq(orders.id, orderId));
            } catch (err) {
                console.error("Paymob payment initiation failed for order", orderId, err);
                await db.update(orders).set({ status: "failed" }).where(eq(orders.id, orderId));
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not initiate payment. Please try again.",
                });
            }

            return { orderSource: "delivery" as const, orderId, iframeUrl };
        }

        // --- Dine-in flow ---
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
            orderSource: "dine_in",
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
            orderSource: "dine_in" as const,
            orderId,
            batchId,
            tableNumber: table.tableNumber,
            editableUntil: editableUntil.toISOString(),
        };
    }),

    // Lets a diner change their own order's items while it's still inside
    // the 5-minute window, before the batch is sent to the kitchen.
    updateItems: authedQuery
        .input(
            z.object({
                orderId: z.number(),
                items: z.array(orderItemInput).min(1),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const db = getDb();
            const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId));

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

            const dishIds = input.items.map((i) => i.dishId);
            const dbDishes = await db.select().from(dishes).where(inArray(dishes.id, dishIds));
            if (dbDishes.length !== new Set(dishIds).size) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "One or more dishes not found" });
            }
            const dishMap = new Map(dbDishes.map((d) => [d.id, d]));

            let totalCents = 0;
            const lineItems = input.items.map((item) => {
                const dish = dishMap.get(item.dishId)!;
                const unitCents = Math.round(parseFloat(dish.price) * 100);
                totalCents += unitCents * item.quantity;
                return {
                    orderId: input.orderId,
                    dishId: dish.id,
                    dishName: dish.name,
                    unitPrice: dish.price,
                    quantity: item.quantity,
                };
            });

            await db.delete(orderItems).where(eq(orderItems.orderId, input.orderId));
            await db.insert(orderItems).values(lineItems);
            await db
                .update(orders)
                .set({ totalAmount: (totalCents / 100).toFixed(2) })
                .where(eq(orders.id, input.orderId));

            return {
                success: true,
                totalAmount: (totalCents / 100).toFixed(2),
                editableUntil: order.editableUntil,
            };
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

    // Kitchen display: only batches that have actually been sent, grouped
    // by table so staff prepare a whole table at once.
    kitchenQueue: adminQuery.query(async () => {
        const db = getDb();
        const batches = await db
            .select()
            .from(tableOrderBatches)
            .where(eq(tableOrderBatches.status, "sent_to_kitchen"))
            .orderBy(desc(tableOrderBatches.sentAt));

        if (batches.length === 0) return [];

        const batchIds = batches.map((b) => b.id);
        const batchOrders = await db.select().from(orders).where(inArray(orders.batchId, batchIds));
        const orderIds = batchOrders.map((o) => o.id);
        const items = orderIds.length
            ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
            : [];

        return batches.map((b) => ({
            ...b,
            orders: batchOrders
                .filter((o) => o.batchId === b.id)
                .map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) })),
        }));
    }),

    updateStatus: adminQuery
        .input(z.object({ id: z.number(), status: orderStatusEnum }))
        .mutation(async ({ input }) => {
            const db = getDb();
            await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
            return { success: true };
        }),
});