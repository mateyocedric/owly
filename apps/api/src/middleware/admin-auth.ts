import type { MiddlewareHandler } from "hono";
import * as jose from "jose";
import { env } from "../env.js";

declare module "hono" {
  interface ContextVariableMap {
    adminUser?: {
      userId: string;
      username: string;
      role: string;
    };
  }
}

export const adminAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: Missing or invalid token" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const secret = new TextEncoder().encode(env.ADMIN_JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    c.set("adminUser", {
      userId: payload["sub"] as string,
      username: payload["username"] as string,
      role: payload["role"] as string,
    });

    await next();
  } catch (err) {
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }
};
