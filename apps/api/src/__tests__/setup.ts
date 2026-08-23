process.env["MONGODB_URI"] = "mongodb://localhost:27017/owly_test";
process.env["REDIS_URL"] = "redis://localhost:6379";
process.env["SESSION_SECRET"] = "test-session-secret-at-least-32-characters-long";
process.env["ADMIN_JWT_SECRET"] = "test-admin-jwt-secret-at-least-32-characters-long";
process.env["NODE_ENV"] = "test";
