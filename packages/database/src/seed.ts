/**
 * Seed script — creates the initial admin moderator account.
 *
 * Usage:  bun run packages/database/src/seed.ts
 * Or:     bun run db:seed   (from root)
 */

import { connectDB, disconnectDB } from "./client.js";
import { AdminUser } from "./schema/admin-user.model.js";
import { InterestTag } from "./schema/interest-tag.model.js";

async function seed() {
  await connectDB();

  const username = process.env["ADMIN_USERNAME"] || "admin";
  const password = process.env["ADMIN_PASSWORD"] || "change-me-admin-password";

  // Hash password with Bun's built-in bcrypt
  const passwordHash = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 12,
  });

  // Upsert admin user
  const existing = await AdminUser.findOne({ username });
  if (existing) {
    console.log(`ℹ️  Admin user "${username}" already exists, skipping.`);
  } else {
    if (
      process.env["NODE_ENV"] === "production" &&
      password === "change-me-admin-password"
    ) {
      throw new Error(
        "Refusing to create the default admin password in production. Set ADMIN_PASSWORD."
      );
    }
    await AdminUser.create({
      username,
      passwordHash,
      role: "super_admin",
      isActive: true,
    });
    console.log(`✅ Admin user "${username}" created with role super_admin.`);
  }

  // Seed default interest tags
  const defaultTags = [
    { name: "Music", slug: "music", category: "entertainment" },
    { name: "Gaming", slug: "gaming", category: "entertainment" },
    { name: "Movies", slug: "movies", category: "entertainment" },
    { name: "Sports", slug: "sports", category: "lifestyle" },
    { name: "Technology", slug: "technology", category: "learning" },
    { name: "Science", slug: "science", category: "learning" },
    { name: "Art", slug: "art", category: "creative" },
    { name: "Books", slug: "books", category: "learning" },
    { name: "Travel", slug: "travel", category: "lifestyle" },
    { name: "Food", slug: "food", category: "lifestyle" },
    { name: "Photography", slug: "photography", category: "creative" },
    { name: "Fitness", slug: "fitness", category: "lifestyle" },
    { name: "Anime", slug: "anime", category: "entertainment" },
    { name: "Programming", slug: "programming", category: "learning" },
    { name: "Philosophy", slug: "philosophy", category: "learning" },
    { name: "Languages", slug: "languages", category: "learning" },
  ];

  let tagsCreated = 0;
  for (const tag of defaultTags) {
    const exists = await InterestTag.findOne({ slug: tag.slug });
    if (!exists) {
      await InterestTag.create(tag);
      tagsCreated++;
    }
  }
  console.log(
    `✅ Interest tags: ${tagsCreated} created, ${defaultTags.length - tagsCreated} already existed.`
  );

  await disconnectDB();
  console.log("🌱 Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
