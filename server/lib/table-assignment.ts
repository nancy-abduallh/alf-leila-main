// server/lib/table-assignment.ts
//
// Decides which physical table a reservation gets, at the moment the guest
// books. Deliberately free of database access so it can be tested directly.
//
// Priority order:
//   1. The table must seat the party (seats >= guests).
//   2. It must be free for the whole seating — no other live reservation on
//      that table starts within ReservationSlotMinutes either side.
//   3. A table in the guest's preferred area beats one that isn't.
//   4. Otherwise the smallest table that still fits wins, so an eight-top
//      isn't burned on a couple.
import { ReservationSlotMinutes } from "@contracts/constants";

export type AssignableTable = {
    id: number;
    tableNumber: string;
    seats: number | null;
    area: string | null;
};

/** A reservation already holding a table on the day being booked. */
export type BookedSlot = {
    tableId: number | null;
    tableNumber: string | null;
    time: string;
};

/** "19:00" or "19:00:00" → minutes since midnight. */
export function timeToMinutes(value: string): number {
    const [h = "0", m = "0"] = value.split(":");
    return Number(h) * 60 + Number(m);
}

/** MySQL TIME columns want HH:MM:SS; the <select> sends HH:MM. */
export function normalizeTime(value: string): string {
    const [h = "00", m = "00", s = "00"] = value.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
}

/** Two seatings on one table clash if they start less than a slot apart. */
export function slotsConflict(a: string, b: string): boolean {
    return Math.abs(timeToMinutes(a) - timeToMinutes(b)) < ReservationSlotMinutes;
}

/**
 * Tables with nobody sitting at them during `time`.
 * Legacy rows carry only a tableNumber (no tableId), so both are matched.
 */
export function freeTables(
    diningRoom: AssignableTable[],
    booked: BookedSlot[],
    time: string,
): AssignableTable[] {
    const takenIds = new Set<number>();
    const takenNumbers = new Set<string>();

    for (const slot of booked) {
        if (!slotsConflict(slot.time, time)) continue;
        if (slot.tableId !== null) takenIds.add(slot.tableId);
        if (slot.tableNumber) takenNumbers.add(slot.tableNumber);
    }

    return diningRoom.filter(
        (t) => !takenIds.has(t.id) && !takenNumbers.has(t.tableNumber),
    );
}

export function pickTable(args: {
    diningRoom: AssignableTable[];
    booked: BookedSlot[];
    time: string;
    guests: number;
    preferredArea: string | null;
}): AssignableTable | null {
    const { diningRoom, booked, time, guests, preferredArea } = args;

    const areaRank = (t: AssignableTable) =>
        preferredArea && t.area === preferredArea ? 0 : 1;

    const candidates = freeTables(diningRoom, booked, time)
        // A table with no recorded seat count can't be sized against the party,
        // so it's left for staff to assign by hand rather than guessed at.
        .filter((t) => (t.seats ?? 0) >= guests)
        .sort((a, b) => {
            if (areaRank(a) !== areaRank(b)) return areaRank(a) - areaRank(b);
            if ((a.seats ?? 0) !== (b.seats ?? 0)) return (a.seats ?? 0) - (b.seats ?? 0);
            return a.tableNumber.localeCompare(b.tableNumber, undefined, {
                numeric: true,
            });
        });

    return candidates[0] ?? null;
}