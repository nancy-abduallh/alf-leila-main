import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createUser(data: InsertUser) {
  const values = { ...data };

  if (values.role === undefined && env.ownerEmail && values.email === env.ownerEmail) {
    values.role = "admin";
  }

  const result = await getDb().insert(schema.users).values(values);
  return findUserById(Number(result[0].insertId));
}

export async function touchLastSignIn(id: number) {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, id));
}