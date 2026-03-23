import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { posts, comments } from "@/lib/db/schema";
import { createCommentSchema } from "@/lib/validation/comments";
import { eq, asc, sql } from "drizzle-orm";
import { z } from "zod";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId: postIdStr } = await params;
  const postId = parseInt(postIdStr, 10);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const allComments = await db
    .select()
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

  // Build nested structure: top-level comments with replies
  const topLevel = allComments.filter((c) => !c.parentId);
  const replies = allComments.filter((c) => c.parentId);

  const nested = topLevel.map((parent) => ({
    ...parent,
    replies: replies.filter((r) => r.parentId === parent.id),
  }));

  return NextResponse.json({ comments: nested });
}

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

    // Validate parentId if provided
    if (input.parentId) {
      const [parent] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, input.parentId));

      if (!parent) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 400 }
        );
      }
      if (parent.postId !== postId) {
        return NextResponse.json(
          { error: "Parent comment belongs to a different post" },
          { status: 400 }
        );
      }
      // Max 1 level of nesting
      if (parent.parentId) {
        return NextResponse.json(
          { error: "Cannot reply to a reply (max 1 level of nesting)" },
          { status: 400 }
        );
      }
    }

    const [comment] = await db
      .insert(comments)
      .values({
        postId,
        parentId: input.parentId || null,
        displayName: input.displayName,
        body: input.body,
        anchorSelector: input.anchorSelector || null,
        anchorOffset: input.anchorOffset ?? null,
        anchorLength: input.anchorLength ?? null,
        anchorText: input.anchorText || null,
        anchorContextBefore: input.anchorContextBefore || null,
        anchorContextAfter: input.anchorContextAfter || null,
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
