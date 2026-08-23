import type { MiddlewareHandler } from "hono";
import { nanoid } from "nanoid";

declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
  }
}

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  const reqId = c.req.header("x-request-id") || nanoid(12);
  c.set("requestId", reqId);
  c.header("x-request-id", reqId);
  await next();
};
