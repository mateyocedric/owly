import type { MiddlewareHandler } from "hono";
import { env } from "../env.js";

export const canonicalHostMiddleware: MiddlewareHandler = async (c, next) => {
  if (env.NODE_ENV !== "production") {
    return next();
  }

  const hostHeader = c.req.header("host") || "";
  const hostname = hostHeader.split(":")[0] ?? "";
  if (!hostname.startsWith("www.")) {
    return next();
  }

  const apex = hostname.slice(4);
  const proto = c.req.header("x-forwarded-proto") || "https";
  const path = c.req.path || "/";
  let search = "";
  try {
    search = new URL(c.req.url).search;
  } catch {
    const q = c.req.url.indexOf("?");
    if (q >= 0) search = c.req.url.slice(q);
  }
  return c.redirect(`${proto}://${apex}${path}${search}`, 301);
};
