import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reservations } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const reservationRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        phone: z.string().optional(),
        date: z.string(),
        time: z.string(),
        guests: z.number().min(1).max(20),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(reservations).values({
        userId: ctx.user.id,
        name: ctx.user.name || "Guest",
        email: ctx.user.email,
        phone: input.phone,
        date: new Date(input.date),
        time: input.time,
        guests: input.guests,
        notes: input.notes,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  myReservations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(reservations)
      .where(eq(reservations.userId, ctx.user.id))
      .orderBy(desc(reservations.createdAt));
  }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(reservations).orderBy(desc(reservations.createdAt));
  }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "cancelled"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(reservations)
        .set({ status: input.status })
        .where(eq(reservations.id, input.id));
      return { success: true };
    }),
});