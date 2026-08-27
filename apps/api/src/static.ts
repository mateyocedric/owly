import { join, normalize, relative, resolve } from "node:path";
import type { MiddlewareHandler } from "hono";

const NOINDEX_PREFIXES = [
  "/session",
  "/admin",
  "/settings",
  "/age-gate",
  "/interests",
  "/components",
  "/chat",
];

function isReservedPath(path: string): boolean {
  return (
    path === "/health" ||
    path === "/ready" ||
    path === "/ws" ||
    path.startsWith("/api")
  );
}

function hasFileExtension(rel: string): boolean {
  const base = rel.split("/").pop() ?? "";
  return base.includes(".");
}

function shouldNoindex(path: string): boolean {
  return NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function contentTypeFor(filePath: string): string | undefined {
  const ext = filePath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "xml":
      return "application/xml; charset=utf-8";
    case "txt":
      return "text/plain; charset=utf-8";
    case "html":
    case "htm":
      return "text/html; charset=utf-8";
    case "json":
      return "application/json; charset=utf-8";
    default:
      return undefined;
  }
}

function fileCandidates(rel: string): string[] {
  if (rel === "index.html" || hasFileExtension(rel)) {
    return [rel];
  }
  return [rel, `${rel}.html`, `${rel}/index.html`];
}

function isSafePath(root: string, filePath: string): boolean {
  const relToRoot = relative(root, filePath);
  return relToRoot !== "" && !relToRoot.startsWith("..");
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

    if (reqPath === "/omegle-alternative" || reqPath === "/omegle-alternative.html") {
      return c.redirect("/", 301);
    }

    const rel = reqPath === "/" ? "index.html" : reqPath.replace(/^\//, "");

    for (const candidate of fileCandidates(rel)) {
      const filePath = normalize(join(root, candidate));
      if (!isSafePath(root, filePath)) {
        continue;
      }

      const file = Bun.file(filePath);
      if (await file.exists()) {
        const headers: Record<string, string> = {};
        const type = contentTypeFor(filePath);
        if (type) headers["Content-Type"] = type;
        return new Response(file, { headers });
      }
    }

    if (hasFileExtension(rel)) {
      return next();
    }

    const index = Bun.file(join(root, "index.html"));
    if (await index.exists()) {
      const headers: Record<string, string> = {
        "Content-Type": "text/html; charset=utf-8",
      };
      if (shouldNoindex(reqPath)) {
        headers["X-Robots-Tag"] = "noindex, nofollow";
      }
      return new Response(index, { headers });
    }

    return next();
  };
}
