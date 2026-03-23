import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { posts, comments } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const ALIASES = [
  "fitcheck99",
  "archivenerd",
  "selvedgeszn",
  "runwaylurker",
  "denimbrain",
  "anon",
  "vibecheck",
  "linkdumper",
  "scrollqueen",
  "deepcut",
];

const SAMPLE_COMMENTS = [
  "hard agree",
  "this styling is crazy good",
  "been looking for this exact video",
  "underrated content fr",
  "the fit goes hard ngl",
  "saving this for later",
  "insane find",
  "how is this not more viral",
  "the algorithm brought me here",
  "core memory unlocked",
  "ok this changed my mind",
  "need more of this energy",
  "certified banger",
  "wait this is actually so good",
  "this is the content i signed up for",
  "W post",
  "taste level immaculate",
  "obsessed with this",
  "adding to the rotation",
  "the culture needs this",
];

const schema = z.object({
  postId: z.number(),
  commentCount: z.number().min(1).max(20).default(5),
  boostReactions: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, commentCount, boostReactions } = schema.parse(body);

    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Seed comments
    const seededComments = [];
    for (let i = 0; i < commentCount; i++) {
      const alias = ALIASES[Math.floor(Math.random() * ALIASES.length)];
      const comment =
        SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)];
      const createdAt = new Date(
        Date.now() - Math.floor(Math.random() * 86400000 * 3)
      ).toISOString();

      const [c] = await db
        .insert(comments)
        .values({
          postId,
          displayName: alias,
          body: comment,
          likeCount: Math.floor(Math.random() * 12),
          createdAt,
          updatedAt: createdAt,
        })
        .returning();
      seededComments.push(c);
    }

    // Update comment count
    await db
      .update(posts)
      .set({
        commentCount: sql`${posts.commentCount} + ${commentCount}`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, postId));

    // Boost reactions
    if (boostReactions) {
      const reactionCounts: Record<string, number> = {
        fire: Math.floor(Math.random() * 15) + 2,
        heart: Math.floor(Math.random() * 10) + 1,
        thinking: Math.floor(Math.random() * 5),
        skull: Math.floor(Math.random() * 4),
      };
      await db
        .update(posts)
        .set({
          likeCount: sql`${posts.likeCount} + ${Math.floor(Math.random() * 20) + 5}`,
          dislikeCount: sql`${posts.dislikeCount} + ${Math.floor(Math.random() * 3)}`,
          reactionCountsJson: JSON.stringify(reactionCounts),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(posts.id, postId));
    }

    return NextResponse.json({
      seeded: seededComments.length,
      message: `Seeded ${seededComments.length} comments${boostReactions ? " and boosted reactions" : ""}`,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Failed to seed:", e);
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
