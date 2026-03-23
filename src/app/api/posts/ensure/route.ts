import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";
import { normalizeUrl } from "@/lib/utils/normalize-url";
import { eq } from "drizzle-orm";
import { z } from "zod";

const ensurePostSchema = z.object({
  url: z.string().url(),
  title: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = ensurePostSchema.parse(body);

    const normalized = normalizeUrl(input.url);

    // Check if post already exists
    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.normalizedUrl, normalized));

    if (existing) {
      return NextResponse.json({ post: existing, created: false });
    }

    // Create new generic post
    const [post] = await db
      .insert(posts)
      .values({
        provider: "generic",
        contentType: "article",
        originalUrl: input.url,
        canonicalUrl: input.url,
        externalId: normalized,
        normalizedUrl: normalized,
        sourceTitle: input.title || null,
        embedKind: "unsupported",
        isEmbeddable: false,
      })
      .returning();

    return NextResponse.json({ post, created: true }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Failed to ensure post:", e);
    return NextResponse.json(
      { error: "Failed to ensure post" },
      { status: 500 }
    );
  }
}
