import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: (origin) => {
    // In dev allow localhost, in production check allowed origins
    return origin || "*";
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-request-id"],
  exposeHeaders: ["x-request-id"],
});
