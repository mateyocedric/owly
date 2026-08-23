import { defineRailway, group, mongo, project, service } from "railway/iac";

/**
 * Railway Hobby constraints this file is written around:
 * - One volume per project (used by MongoDB)
 * - Redis therefore runs inside the API container (see scripts/start-api.ts)
 * - Existing project/service names: terrific-fascination / owly + worker
 */
export default defineRailway(() => {
  const mongoDb = mongo("MongoDB");

  const api = service("owly", {
    healthcheck: "/health",
    healthcheckTimeout: 120,
    env: {
      NODE_ENV: "production",
      MONGODB_URI: mongoDb.env.MONGO_URL,
      REDIS_URL: "redis://127.0.0.1:6379",
    },
  });

  const worker = service("worker", {
    env: {
      NODE_ENV: "production",
      MONGODB_URI: mongoDb.env.MONGO_URL,
      RAILWAY_DOCKERFILE_PATH: "Dockerfile.worker",
    },
  });

  return project("terrific-fascination", {
    resources: [group("Owly", [mongoDb, api, worker])],
  });
});
