import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dishes } from "@db/schema";
import { eq } from "drizzle-orm";

const categoryEnum = z.enum(["appetizer", "main", "dessert", "beverage", "breakfast"]);

export const dishRouter = createRouter({
  list: publicQuery
    .input(z.object({ category: categoryEnum.optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.category) {
        return db.select().from(dishes).where(eq(dishes.category, input.category));
      }
      return db.select().from(dishes);
    }),

  featured: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(dishes).where(eq(dishes.featured, true));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(dishes).where(eq(dishes.id, input.id));
      return result[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        price: z.string(),
        category: categoryEnum,
        imageUrl: z.string().optional(),
        featured: z.boolean().optional(),
        stock: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(dishes).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        category: categoryEnum.optional(),
        imageUrl: z.string().optional(),
        featured: z.boolean().optional(),
        stock: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const db = getDb();
      await db.update(dishes).set(updates).where(eq(dishes.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(dishes).where(eq(dishes.id, input.id));
      return { success: true };
    }),
});