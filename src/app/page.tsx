import { db } from "@/lib/db/client";
import { posts, comments } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { FeedCard } from "@/components/feed-card";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));

  if (allPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 text-4xl">📡</div>
        <h2 className="mb-2 text-lg font-medium text-gray-300">
          Nothing here yet
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Submit a link from YouTube, TikTok, or Instagram to get started.
        </p>
        <a
          href="/submit"
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-white"
        >
          Submit a link
        </a>
      </div>
    );
  }

  // Fetch first 2 comments per post
  const postsWithComments = await Promise.all(
    allPosts.map(async (post) => {
      const previewComments = await db
        .select()
        .from(comments)
        .where(eq(comments.postId, post.id))
        .orderBy(desc(comments.createdAt))
        .limit(2);
      return { post, previewComments };
    })
  );

  return (
    <div className="space-y-4">
      {postsWithComments.map(({ post, previewComments }) => (
        <FeedCard
          key={post.id}
          post={post}
          previewComments={previewComments}
        />
      ))}
    </div>
  );
}
