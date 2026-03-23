import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
  return NextResponse.json({ posts: allPosts });
}
