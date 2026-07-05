import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, inArray } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, dishes, users } from "@db/schema";
import { initiatePaymobPayment } from "./lib/paymob";

const orderStatusEnum = z.enum([
    "pending",
    "paid",
    "preparing",
    "delivered",
    "failed",
    "cancelled",
]);

export const orderRouter = createRouter({
    create: authedQuery
        .input(
            z.object({
                items: z
                    .array(
                        z.object({
                            dishId: z.number(),
                            quantity: z.number().min(1).max(50),
                        }),
                    )
                    .min(1),
                phone: z.string().min(5).max(20),
                address: z.string().min(3).max(255),
                city: z.string().min(1).max(100),
                notes: z.string().max(1000).optional(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const db = getDb();
            const dishIds = input.items.map((i) => i.dishId);
            const dbDishes = await db.select().from(dishes).where(inArray(dishes.id, dishIds));

            if (dbDishes.length !== new Set(dishIds).size) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "One or more dishes not found" });
            }

            const dishMap = new Map(dbDishes.map((d) => [d.id, d]));

            for (const item of input.items) {
                const dish = dishMap.get(item.dishId)!;
                if (dish.stock !== null && dish.stock < item.quantity) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `${dish.name} only has ${dish.stock} left in stock`,
                    });
                }
            }

            let totalCents = 0;
            const lineItems = input.items.map((item) => {
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

            const orderResult = await db.insert(orders).values({
                userId: ctx.user.id,
                status: "pending",
                totalAmount: (totalCents / 100).toFixed(2),
                phone: input.phone,
                address: input.address,
                city: input.city,
                notes: input.notes,
            });
            const orderId = Number(orderResult[0].insertId);

            await db.insert(orderItems).values(lineItems.map((item) => ({ ...item, orderId })));

            // Decrement stock only for tracked dishes (stock !== null)
            for (const item of input.items) {
                const dish = dishMap.get(item.dishId)!;
                if (dish.stock !== null) {
                    await db
                        .update(dishes)
                        .set({ stock: dish.stock - item.quantity })
                        .where(eq(dishes.id, dish.id));
                }
            }

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
            } catch {
                await db.update(orders).set({ status: "failed" }).where(eq(orders.id, orderId));
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not initiate payment. Please try again.",
                });
            }

            return { orderId, iframeUrl };
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
        .input(z.object({ id: z.number(), status: orderStatusEnum }))
        .mutation(async ({ input }) => {
            const db = getDb();
            await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
            return { success: true };
        }),
});