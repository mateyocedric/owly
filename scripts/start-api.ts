/**
 * Production API entrypoint for Railway Hobby.
 * Redis cannot use a second volume, so it runs next to the API in this container.
 */
process.env["REDIS_URL"] ||= "redis://127.0.0.1:6379";

const redis = Bun.spawn(
  [
    "redis-server",
    "--bind",
    "127.0.0.1",
    "--protected-mode",
    "no",
    "--port",
    "6379",
    "--maxmemory",
    "128mb",
    "--maxmemory-policy",
    "allkeys-lru",
    "--save",
    "",
    "--appendonly",
    "no",
  ],
  { stdout: "inherit", stderr: "inherit" }
);

await Bun.sleep(400);

const seed = Bun.spawn(["bun", "run", "db:seed"], {
  stdout: "inherit",
  stderr: "inherit",
});
const seedCode = await seed.exited;
if (seedCode !== 0) {
  redis.kill();
  process.exit(seedCode);
}

const api = Bun.spawn(["bun", "apps/api/src/index.ts"], {
  stdout: "inherit",
  stderr: "inherit",
});

const jobs = Bun.spawn(["bun", "apps/worker/src/index.ts"], {
  stdout: "inherit",
  stderr: "inherit",
});

function shutdown() {
  api.kill();
  jobs.kill();
  redis.kill();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

const apiCode = await api.exited;
jobs.kill();
redis.kill();
process.exit(apiCode);
