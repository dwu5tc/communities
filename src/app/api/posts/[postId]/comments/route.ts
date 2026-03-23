import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { posts, comments } from "@/lib/db/schema";
import { createCommentSchema } from "@/lib/validation/comments";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

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

    // Check post exists
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await req.json();
    const input = createCommentSchema.parse(body);

    const [comment] = await db
      .insert(comments)
      .values({
        postId,
        displayName: input.displayName,
        body: input.body,
      })
      .returning();

    // Increment comment count
    await db
      .update(posts)
      .set({
        commentCount: sql`${posts.commentCount} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, postId));

    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Failed to create comment:", e);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
