import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import * as cookie from "cookie";
import type { User } from "@db/schema";
import { Session } from "@contracts/constants";
import { verifySessionToken } from "./lib/auth";
import { findUserById } from "./queries/users";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  try {
    const cookieHeader = opts.req.headers.get("cookie") ?? "";
    const cookies = cookie.parse(cookieHeader);
    const token = cookies[Session.cookieName];

    if (token) {
      const userId = await verifySessionToken(token);
      if (userId) {
        const user = await findUserById(userId);
        if (user) ctx.user = user;
      }
    }
  } catch {
    // No valid session — request proceeds unauthenticated
  }

  return ctx;
}