import { Hono } from "hono";
import * as jose from "jose";
import { AdminUser } from "@owly/database";
import { adminLoginRequestSchema } from "@owly/shared";
import { env } from "../../env.js";

export const adminAuthRouter = new Hono();

adminAuthRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = adminLoginRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid credentials format" }, 400);
  }

  const user = await AdminUser.findOne({
    username: parsed.data.username,
    isActive: true,
  });

  if (!user) {
    return c.json({ error: "Invalid username or password" }, 401);
  }

  const isValid = await Bun.password.verify(
    parsed.data.password,
    user.passwordHash
  );

  if (!isValid) {
    return c.json({ error: "Invalid username or password" }, 401);
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Create JWT
  const secret = new TextEncoder().encode(env.ADMIN_JWT_SECRET);
  const expiresAt = new Date(Date.now() + 8 * 3600 * 1000); // 8 hours

  const token = await new jose.SignJWT({
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user._id.toString())
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  return c.json({
    token,
    expiresAt: expiresAt.toISOString(),
    user: {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    },
  });
});
