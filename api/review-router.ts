import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews, users } from "@db/schema";

export const reviewRouter = createRouter({
    list: publicQuery.query(async () => {
        const db = getDb();
        return db
            .select({
                id: reviews.id,
                rating: reviews.rating,
                comment: reviews.comment,
                createdAt: reviews.createdAt,
                userName: users.name,
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.userId, users.id))
            .orderBy(desc(reviews.createdAt))
            .limit(50);
    }),

    myReview: authedQuery.query(async ({ ctx }) => {
        const db = getDb();
        const rows = await db.select().from(reviews).where(eq(reviews.userId, ctx.user.id));
        return rows[0] ?? null;
    }),

    submit: authedQuery
        .input(
            z.object({
                rating: z.number().min(1).max(5),
                comment: z.string().max(1000).optional(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const db = getDb();
            const existing = await db.select().from(reviews).where(eq(reviews.userId, ctx.user.id));

            if (existing[0]) {
                await db
                    .update(reviews)
                    .set({ rating: input.rating, comment: input.comment })
                    .where(eq(reviews.userId, ctx.user.id));
            } else {
                await db.insert(reviews).values({
                    userId: ctx.user.id,
                    rating: input.rating,
                    comment: input.comment,
                });
            }
            return { success: true };
        }),
});