// db/seed-tables.ts
// Creates the dining room: physical tables plus the printed QR codes that
// sit on them. A table gets one QR per seat area, and every one of those
// codes resolves to the same table — that's what lets four people scan four
// different stickers and still land on one kitchen ticket.
//
// Run with:  npx tsx db/seed-tables.ts
import "dotenv/config";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { getDb } from "../server/queries/connection";
import { tables, tableQrCodes } from "./schema";

const DINING_ROOM: { tableNumber: string; seats: number; qrCount: number }[] = [
    { tableNumber: "1", seats: 2, qrCount: 2 },
    { tableNumber: "2", seats: 2, qrCount: 2 },
    { tableNumber: "3", seats: 4, qrCount: 4 },
    { tableNumber: "4", seats: 4, qrCount: 4 },
    { tableNumber: "5", seats: 4, qrCount: 4 },
    { tableNumber: "6", seats: 6, qrCount: 6 },
    { tableNumber: "7", seats: 6, qrCount: 6 },
    { tableNumber: "8", seats: 8, qrCount: 4 },
    { tableNumber: "T1", seats: 4, qrCount: 4 }, // terrace
    { tableNumber: "T2", seats: 4, qrCount: 4 },
];

const BASE_URL = process.env.PUBLIC_APP_URL ?? "http://localhost:5173";

async function seedTables() {
    const db = getDb();
    const printSheet: string[] = [];

    for (const spec of DINING_ROOM) {
        const existing = await db
            .select()
            .from(tables)
            .where(eq(tables.tableNumber, spec.tableNumber));

        let tableId: number;

        if (existing[0]) {
            tableId = existing[0].id;
            console.log(`Table ${spec.tableNumber} already exists — reusing it.`);
        } else {
            const result = await db.insert(tables).values({
                tableNumber: spec.tableNumber,
                seats: spec.seats,
            });
            tableId = Number(result[0].insertId);
            console.log(`Created table ${spec.tableNumber} (${spec.seats} seats).`);
        }

        const existingQr = await db
            .select()
            .from(tableQrCodes)
            .where(eq(tableQrCodes.tableId, tableId));

        const missing = spec.qrCount - existingQr.length;

        for (let i = 0; i < missing; i++) {
            const code = nanoid(12);
            const label = `Seat ${existingQr.length + i + 1}`;
            await db.insert(tableQrCodes).values({ tableId, code, label });
            printSheet.push(`Table ${spec.tableNumber} · ${label} → ${BASE_URL}/table/${code}`);
        }

        for (const qr of existingQr) {
            printSheet.push(
                `Table ${spec.tableNumber} · ${qr.label ?? "QR"} → ${BASE_URL}/table/${qr.code}`,
            );
        }
    }

    console.log("\n--- QR print sheet ---");
    for (const line of printSheet) console.log(line);
}

seedTables()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });