import { z } from "zod";
import { sql, gte } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pageViews, orders, reservations } from "@db/schema";

export const analyticsRouter = createRouter({
    track: publicQuery
        .input(z.object({ path: z.string().max(255) }))
        .mutation(async ({ input }) => {
            const db = getDb();
            await db.insert(pageViews).values({ path: input.path });
            return { success: true };
        }),

    stats: adminQuery.query(async () => {
        const db = getDb();
        const since = new Date();
        since.setDate(since.getDate() - 13); // last 14 days

        const [visitsByDay, ordersByDay, reservationsByDay, totals] = await Promise.all([
            db
                .select({
                    day: sql<string>`DATE(${pageViews.createdAt})`.as("day"),
                    count: sql<number>`COUNT(*)`.as("count"),
                })
                .from(pageViews)
                .where(gte(pageViews.createdAt, since))
                .groupBy(sql`DATE(${pageViews.createdAt})`)
                .orderBy(sql`DATE(${pageViews.createdAt})`),

            db
                .select({
                    day: sql<string>`DATE(${orders.createdAt})`.as("day"),
                    count: sql<number>`COUNT(*)`.as("count"),
                })
                .from(orders)
                .where(gte(orders.createdAt, since))
                .groupBy(sql`DATE(${orders.createdAt})`)
                .orderBy(sql`DATE(${orders.createdAt})`),

            db
                .select({
                    day: sql<string>`DATE(${reservations.createdAt})`.as("day"),
                    count: sql<number>`COUNT(*)`.as("count"),
                })
                .from(reservations)
                .where(gte(reservations.createdAt, since))
                .groupBy(sql`DATE(${reservations.createdAt})`)
                .orderBy(sql`DATE(${reservations.createdAt})`),

            // Simplified: scalar subqueries against a dummy FROM to get one totals row.
            db
                .select({
                    totalVisits: sql<number>`(SELECT COUNT(*) FROM ${pageViews})`.as("totalVisits"),
                    totalOrders: sql<number>`(SELECT COUNT(*) FROM ${orders})`.as("totalOrders"),
                    totalRevenue: sql<string>`(SELECT COALESCE(SUM(${orders.totalAmount}), 0) FROM ${orders} WHERE ${orders.status} IN ('paid','preparing','delivered'))`.as(
                        "totalRevenue",
                    ),
                    totalReservations: sql<number>`(SELECT COUNT(*) FROM ${reservations})`.as(
                        "totalReservations",
                    ),
                })
                .from(orders)
                .limit(1),
        ]);

        return {
            visitsByDay,
            ordersByDay,
            reservationsByDay,
            totals: totals[0] ?? {
                totalVisits: 0,
                totalOrders: 0,
                totalRevenue: "0",
                totalReservations: 0,
            },
        };
    }),
});