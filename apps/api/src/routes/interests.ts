import { Hono } from "hono";
import { InterestTag } from "@owly/database";

export const interestsRouter = new Hono();

interestsRouter.get("/interests", async (c) => {
  const tags = await InterestTag.find({ isActive: true })
    .sort({ usageCount: -1 })
    .limit(50);

  return c.json(
    tags.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      slug: t.slug,
      category: t.category,
    }))
  );
});
