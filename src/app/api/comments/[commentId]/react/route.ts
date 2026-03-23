import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { comments } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { safeParseJson } from "@/lib/utils/json";

const schema = z.object({
  reaction: z.enum(["like", "dislike", "fire", "heart", "thinking", "skull"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId: commentIdStr } = await params;
    const commentId = parseInt(commentIdStr, 10);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

    const body = await req.json();
    const { reaction } = schema.parse(body);

    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (reaction === "like") {
      await db
        .update(comments)
        .set({
          likeCount: sql`${comments.likeCount} + 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(comments.id, commentId));
    } else if (reaction === "dislike") {
      await db
        .update(comments)
        .set({
          dislikeCount: sql`${comments.dislikeCount} + 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(comments.id, commentId));
    } else {
      const counts = safeParseJson<Record<string, number>>(
        comment.reactionCountsJson
      );
      counts[reaction] = (counts[reaction] || 0) + 1;
      await db
        .update(comments)
        .set({
          reactionCountsJson: JSON.stringify(counts),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(comments.id, commentId));
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
