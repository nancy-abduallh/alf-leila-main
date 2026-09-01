import { z } from "zod";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tables, tableQrCodes } from "@db/schema";

export const tableRouter = createRouter({
    // Called the moment a customer scans a QR code — no login required so
    // they can browse the menu before signing in to place an order.
    resolveQr: publicQuery
        .input(z.object({ code: z.string().min(1) }))
        .query(async ({ input }) => {
            const db = getDb();
            const [qr] = await db.select().from(tableQrCodes).where(eq(tableQrCodes.code, input.code));
            if (!qr) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "This QR code isn't recognized. Please ask a staff member for help.",
                });
            }
            const [table] = await db.select().from(tables).where(eq(tables.id, qr.tableId));
            if (!table) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Table not found for this QR code." });
            }
            return { tableId: table.id, tableNumber: table.tableNumber, qrLabel: qr.label };
        }),

    list: adminQuery.query(async () => {
        const db = getDb();
        const allTables = await db.select().from(tables);
        const allQr = await db.select().from(tableQrCodes);
        return allTables.map((t) => ({
            ...t,
            qrCodes: allQr.filter((q) => q.tableId === t.id),
        }));
    }),

    create: adminQuery
        .input(
            z.object({
                tableNumber: z.string().min(1).max(20),
                seats: z.number().min(1).max(30).optional(),
            }),
        )
        .mutation(async ({ input }) => {
            const db = getDb();
            const existing = await db.select().from(tables).where(eq(tables.tableNumber, input.tableNumber));
            if (existing[0]) {
                throw new TRPCError({ code: "CONFLICT", message: "A table with this number already exists" });
            }
            const result = await db.insert(tables).values({
                tableNumber: input.tableNumber,
                seats: input.seats,
            });
            return { success: true, id: Number(result[0].insertId) };
        }),

    delete: adminQuery
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            const db = getDb();
            await db.delete(tableQrCodes).where(eq(tableQrCodes.tableId, input.id));
            await db.delete(tables).where(eq(tables.id, input.id));
            return { success: true };
        }),

    addQrCode: adminQuery
        .input(z.object({ tableId: z.number(), label: z.string().max(50).optional() }))
        .mutation(async ({ input }) => {
            const db = getDb();
            const code = nanoid(12);
            const result = await db.insert(tableQrCodes).values({
                tableId: input.tableId,
                code,
                label: input.label,
            });
            return { success: true, id: Number(result[0].insertId), code };
        }),

    deleteQrCode: adminQuery
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            const db = getDb();
            await db.delete(tableQrCodes).where(eq(tableQrCodes.id, input.id));
            return { success: true };
        }),
});