import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";
import { normalizeUrl } from "@/lib/utils/normalize-url";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 }
    );
  }

  const normalized = normalizeUrl(rawUrl);

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.normalizedUrl, normalized));

  return NextResponse.json({ post: post || null });
}
