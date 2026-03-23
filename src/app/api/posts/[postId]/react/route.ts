import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { safeParseJson } from "@/lib/utils/json";

const schema = z.object({
  reaction: z.enum(["like", "dislike", "fire", "heart", "thinking", "skull"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId: postIdStr } = await params;
    const postId = parseInt(postIdStr, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const body = await req.json();
    const { reaction } = schema.parse(body);

    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (reaction === "like") {
      await db
        .update(posts)
        .set({
          likeCount: sql`${posts.likeCount} + 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(posts.id, postId));
    } else if (reaction === "dislike") {
      await db
        .update(posts)
        .set({
          dislikeCount: sql`${posts.dislikeCount} + 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(posts.id, postId));
    } else {
      // Emoji reaction — update JSON
      const counts = safeParseJson<Record<string, number>>(
        post.reactionCountsJson
      );
      counts[reaction] = (counts[reaction] || 0) + 1;
      await db
        .update(posts)
        .set({
          reactionCountsJson: JSON.stringify(counts),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(posts.id, postId));
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid reaction" },
        { status: 400 }
      );
    }
    console.error("Failed to react:", e);
    return NextResponse.json({ error: "Failed to react" }, { status: 500 });
  }
}
