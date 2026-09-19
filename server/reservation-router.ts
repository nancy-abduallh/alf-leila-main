import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reservations, tables } from "@db/schema";
import { RESERVATION_AREA_IDS } from "@contracts/constants";
import {
  freeTables,
  normalizeTime,
  pickTable,
  slotsConflict,
  toDayString,
  type AssignableTable,
  type BookedSlot,
} from "./lib/table-assignment";

/** What the <input type="date"> sends: "2026-09-30". */
const dayInput = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, "Date must be in YYYY-MM-DD format");

const bookingInput = z.object({
  phone: z.string().optional(),
  date: dayInput,
  time: z.string(),
  guests: z.number().min(1).max(20),
  notes: z.string().optional(),
  preferredArea: z.enum(RESERVATION_AREA_IDS).optional(),
});

/**
 * Rows that already hold a table on `day` ("YYYY-MM-DD"), cancelled ones excluded.
 *
 * The day is compared as a plain string cast to DATE — NOT as a JS Date.
 * Passing a Date makes mysql2 send '2026-09-30 03:00:00.000' (server-local
 * time), which never equals a DATE column, so every existing booking was
 * invisible and all tables always looked free.
 */
const liveOnDay = (day: string) =>
  and(
    sql`${reservations.date} = CAST(${day} AS DATE)`,
    ne(reservations.status, "cancelled"),
  );

export const reservationRouter = createRouter({
  /**
   * Creates the booking AND allocates the table in one shot — the guest walks
   * away knowing their table number instead of waiting on staff.
   *
   * Wrapped in a transaction with SELECT ... FOR UPDATE so two people booking
   * the last table at the same second can't both win it.
   */
  create: authedQuery.input(bookingInput).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const day = toDayString(input.date);
    const time = normalizeTime(input.time);

    return db.transaction(async (tx) => {
      const diningRoom: AssignableTable[] = await tx
        .select({
          id: tables.id,
          tableNumber: tables.tableNumber,
          seats: tables.seats,
          area: tables.area,
        })
        .from(tables);

      if (diningRoom.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "No tables are configured yet. Run `npm run db:seed:tables` first.",
        });
      }

      const booked: BookedSlot[] = await tx
        .select({
          tableId: reservations.tableId,
          tableNumber: reservations.tableNumber,
          time: reservations.time,
        })
        .from(reservations)
        .where(liveOnDay(day))
        .for("update");

      const table = pickTable({
        diningRoom,
        booked,
        time,
        guests: input.guests,
        preferredArea: input.preferredArea ?? null,
      });

      if (!table) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "We have no table for that party size at that time. Please try another time or date.",
        });
      }

      let result;
      try {
        result = await tx.insert(reservations).values({
          userId: ctx.user.id,
          name: ctx.user.name || "Guest",
          email: ctx.user.email,
          phone: input.phone,
          // Plain string → no timezone shifting on the way into the DATE column.
          date: sql`CAST(${day} AS DATE)`,
          time,
          guests: input.guests,
          notes: input.notes,
          preferredArea: input.preferredArea,
          tableId: table.id,
          tableNumber: table.tableNumber,
          // Staff still gives the final nod in the admin panel; the table is
          // held either way. Swap to status: "confirmed" to skip that step.
        });
      } catch (err) {
        // Two guests racing for the last table for the same slot can both
        // pass the in-memory availability check above before either commits.
        // The DB's unique constraint (tableId, date, time) is the real
        // tie-breaker — whoever loses gets a clean retry prompt instead of a
        // 500 and a silently double-booked table.
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code?: string }).code === "ER_DUP_ENTRY"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "That table was just booked by someone else for this time. Please try again.",
          });
        }
        throw err;
      }

      return {
        success: true,
        id: Number(result[0].insertId),
        tableId: table.id,
        tableNumber: table.tableNumber,
        area: table.area,
        // true when the guest asked for an area and didn't get it
        areaMatched: !input.preferredArea || table.area === input.preferredArea,
      };
    });
  }),

  /**
   * How many tables are still free for a date/time/party — lets the form warn
   * before the guest fills everything in and hits a wall.
   */
  availability: authedQuery
    .input(
      z.object({
        date: dayInput,
        time: z.string(),
        guests: z.number().min(1).max(20),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const day = toDayString(input.date);
      const time = normalizeTime(input.time);

      const diningRoom: AssignableTable[] = await db
        .select({
          id: tables.id,
          tableNumber: tables.tableNumber,
          seats: tables.seats,
          area: tables.area,
        })
        .from(tables);

      const booked: BookedSlot[] = await db
        .select({
          tableId: reservations.tableId,
          tableNumber: reservations.tableNumber,
          time: reservations.time,
        })
        .from(reservations)
        .where(liveOnDay(day));

      const fitting = freeTables(diningRoom, booked, time).filter(
        (t) => (t.seats ?? 0) >= input.guests,
      );

      const byArea: Record<string, number> = {};
      for (const t of fitting) {
        const key = t.area ?? "unassigned";
        byArea[key] = (byArea[key] ?? 0) + 1;
      }

      return { total: fitting.length, byArea };
    }),

  myReservations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(reservations)
      .where(eq(reservations.userId, ctx.user.id))
      .orderBy(desc(reservations.createdAt));
  }),

  /** A guest cancelling releases the table back into the pool immediately. */
  cancel: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [existing] = await db
        .select()
        .from(reservations)
        .where(eq(reservations.id, input.id));

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reservation not found" });
      }
      if (existing.status === "cancelled") return { success: true };

      await db
        .update(reservations)
        .set({ status: "cancelled", tableId: null, tableNumber: null })
        .where(eq(reservations.id, input.id));

      return { success: true };
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
      // Cancelling frees the table for someone else in that slot.
      const patch =
        input.status === "cancelled"
          ? { status: input.status, tableId: null, tableNumber: null }
          : { status: input.status };

      await db.update(reservations).set(patch).where(eq(reservations.id, input.id));
      return { success: true };
    }),

  /**
   * Staff override of the automatic pick — moving a party to a different
   * table, or clearing the assignment with null. Refuses a table that's
   * already taken in that slot so the floor plan stays honest.
   */
  assignTable: adminQuery
    .input(
      z.object({
        id: z.number(),
        tableNumber: z.string().max(20).nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      if (input.tableNumber === null) {
        await db
          .update(reservations)
          .set({ tableId: null, tableNumber: null })
          .where(eq(reservations.id, input.id));
        return { success: true };
      }

      const [target] = await db
        .select()
        .from(reservations)
        .where(eq(reservations.id, input.id));
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reservation not found" });
      }

      const [table] = await db
        .select()
        .from(tables)
        .where(eq(tables.tableNumber, input.tableNumber));
      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such table" });
      }

      const sameDay = await db
        .select({
          id: reservations.id,
          tableId: reservations.tableId,
          tableNumber: reservations.tableNumber,
          time: reservations.time,
        })
        .from(reservations)
        .where(liveOnDay(toDayString(target.date)));

      const clash = sameDay.some(
        (r) =>
          r.id !== target.id &&
          (r.tableId === table.id || r.tableNumber === table.tableNumber) &&
          slotsConflict(r.time, target.time),
      );
      if (clash) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Table ${table.tableNumber} is already booked around that time.`,
        });
      }

      await db
        .update(reservations)
        .set({ tableId: table.id, tableNumber: table.tableNumber })
        .where(eq(reservations.id, input.id));

      return { success: true };
    }),
});