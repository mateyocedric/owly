import { envSchema, type EnvConfig } from "@owly/shared";

function loadEnv(): EnvConfig {
  const result = envSchema.safeParse({
    ...process.env,
    // Railway Mongo plugin exposes MONGO_URL; public HTTP port is PORT.
    MONGODB_URI: process.env["MONGODB_URI"] || process.env["MONGO_URL"],
    API_PORT: process.env["PORT"] || process.env["API_PORT"],
  });
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
