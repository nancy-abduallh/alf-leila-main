import { authRouter } from "./auth-router";
import { dishRouter } from "./dish-router";
import { reservationRouter } from "./reservation-router";
import { orderRouter } from "./order-router";
import { reviewRouter } from "./review-router";
import { analyticsRouter } from "./analytics-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dish: dishRouter,
  reservation: reservationRouter,
  order: orderRouter,
  review: reviewRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;