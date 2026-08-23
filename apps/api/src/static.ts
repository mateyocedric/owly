import { join, normalize, relative, resolve } from "node:path";
import type { MiddlewareHandler } from "hono";

function isReservedPath(path: string): boolean {
  return (
    path === "/health" ||
    path === "/ready" ||
    path === "/ws" ||
    path.startsWith("/api")
  );
}

export function spaFallback(distDir: string): MiddlewareHandler {
  const root = resolve(distDir);

  return async (c, next) => {
    if (c.req.method !== "GET" && c.req.method !== "HEAD") {
      return next();
    }

    const reqPath = c.req.path;
    if (isReservedPath(reqPath)) {
      return next();
    }

    const rel = reqPath === "/" ? "index.html" : reqPath.replace(/^\//, "");
    const filePath = normalize(join(root, rel));
    const relToRoot = relative(root, filePath);
    if (relToRoot.startsWith("..") || relToRoot === "") {
      return next();
    }

    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }

    const index = Bun.file(join(root, "index.html"));
    if (await index.exists()) {
      return new Response(index, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return next();
  };
}
