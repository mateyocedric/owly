import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { validateSessionToken } from "../services/session.js";
import type { IAnonymousSession } from "@owly/database";

declare module "hono" {
  interface ContextVariableMap {
    session?: IAnonymousSession;
  }
}

export const sessionMiddleware: MiddlewareHandler = async (c, next) => {
  const token =
    getCookie(c, "owly_session") ||
    c.req.header("authorization")?.replace("Bearer ", "");

  if (token) {
    const session = await validateSessionToken(token);
    if (session) {
      c.set("session", session);
    }
  }

  await next();
};
