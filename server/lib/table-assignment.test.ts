import { describe, expect, it } from "vitest";
import {
    freeTables,
    pickTable,
    slotsConflict,
    toDayString,
    type AssignableTable,
} from "./table-assignment";

const room: AssignableTable[] = [
    { id: 1, tableNumber: "1", seats: 2, area: "main" },
    { id: 2, tableNumber: "2", seats: 2, area: "main" },
    { id: 3, tableNumber: "3", seats: 4, area: "terrace" },
];

describe("toDayString", () => {
    it("keeps a plain YYYY-MM-DD untouched", () => {
        expect(toDayString("2026-09-30")).toBe("2026-09-30");
    });
    it("trims an ISO timestamp down to its day", () => {
        expect(toDayString("2026-09-30T00:00:00.000Z")).toBe("2026-09-30");
    });
    it("reads a DATE value drizzle returned (UTC midnight) back to the stored day", () => {
        expect(toDayString(new Date("2026-09-30"))).toBe("2026-09-30");
    });
    it("rejects garbage", () => {
        expect(() => toDayString("30/09/2026")).toThrow();
    });
});

describe("availability with an existing booking", () => {
    const booked = [{ tableId: 3, tableNumber: "3", time: "14:00:00" }];

    it("hides the booked table at the same time", () => {
        const free = freeTables(room, booked, "14:00:00").map((t) => t.tableNumber);
        expect(free).toEqual(["1", "2"]);
    });
    it("still blocks it inside the seating window, frees it outside", () => {
        expect(slotsConflict("14:00:00", "15:30:00")).toBe(true);
        expect(slotsConflict("14:00:00", "18:00:00")).toBe(false);
    });
    it("never hands the booked table to a new guest", () => {
        const t = pickTable({
            diningRoom: room,
            booked,
            time: "14:00:00",
            guests: 3,
            preferredArea: null,
        });
        expect(t).toBeNull(); // only table 3 seats 3+, and it's taken
    });
});