import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dishes } from "@db/schema";
import { and, eq } from "drizzle-orm";

const categoryEnum = z.enum(["appetizer", "main", "dessert", "beverage", "breakfast"]);
const subcategoryEnum = z.enum(["coffee", "tea", "others"]);

export const dishRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          category: categoryEnum.optional(),
          // Only relevant when category === "beverage"; ignored otherwise.
          subcategory: subcategoryEnum.optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.category) conditions.push(eq(dishes.category, input.category));
      if (input?.subcategory) conditions.push(eq(dishes.subcategory, input.subcategory));

      if (conditions.length > 0) {
        return db.select().from(dishes).where(and(...conditions));
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
        nameAr: z.string().max(100).optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        price: z.string(),
        category: categoryEnum,
        subcategory: subcategoryEnum.nullable().optional(),
        imageUrl: z.string().optional(),
        featured: z.boolean().optional(),
        stock: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { subcategory, ...rest } = input;
      // Subcategory only ever applies to beverages — guard against stale
      // data if a client sends one alongside a non-beverage category.
      const result = await db.insert(dishes).values({
        ...rest,
        subcategory: rest.category === "beverage" ? (subcategory ?? null) : null,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        nameAr: z.string().max(100).optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        price: z.string().optional(),
        category: categoryEnum.optional(),
        subcategory: subcategoryEnum.nullable().optional(),
        imageUrl: z.string().optional(),
        featured: z.boolean().optional(),
        stock: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, category, subcategory, ...updates } = input;
      const db = getDb();

      const touchesSubcategory = category !== undefined || subcategory !== undefined;
      const nextCategory = category; // undefined = "leave as-is" for the guard below

      await db
        .update(dishes)
        .set({
          ...updates,
          ...(category !== undefined ? { category } : {}),
          ...(touchesSubcategory
            ? {
              subcategory:
                nextCategory === "beverage" || (nextCategory === undefined && subcategory !== undefined)
                  ? (subcategory ?? null)
                  : nextCategory !== undefined
                    ? null
                    : (subcategory ?? null),
            }
            : {}),
        })
        .where(eq(dishes.id, id));
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