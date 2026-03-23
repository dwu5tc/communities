import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/client";
import { posts, comments } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { PostMeta } from "@/components/post-meta";
import { ProviderEmbed } from "@/components/provider-embed";
import { ReactionBar } from "@/components/reaction-bar";
import { CommentList } from "@/components/comment-list";
import { CommentForm } from "@/components/comment-form";
import { relativeTime } from "@/lib/utils/dates";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId: postIdStr } = await params;
  const postId = parseInt(postIdStr, 10);
  if (isNaN(postId)) notFound();

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) notFound();

  const allComments = await db
    .select()
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

  const title = post.localTitle || post.sourceTitle;

  return (
    <div className="space-y-6 py-4">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400"
      >
        ← Back to feed
      </Link>

      {/* Post header */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <PostMeta post={post} />
          <span className="text-xs text-gray-700">
            {relativeTime(post.createdAt)}
          </span>
        </div>
        {title && (
          <h1 className="text-lg font-semibold text-gray-100">{title}</h1>
        )}
        {post.localNote && (
          <p className="mt-1 text-sm leading-relaxed text-gray-400">
            {post.localNote}
          </p>
        )}
        {post.submittedByAlias && (
          <p className="mt-1 text-xs text-gray-600">
            submitted by {post.submittedByAlias}
          </p>
        )}
      </div>

      {/* Embed */}
      <ProviderEmbed post={post} lazy={false} />

      {/* Original link */}
      <a
        href={post.canonicalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400"
      >
        Open original ↗
      </a>

      {/* Reactions */}
      <ReactionBar
        targetType="post"
        targetId={post.id}
        likeCount={post.likeCount}
        dislikeCount={post.dislikeCount}
        reactionCountsJson={post.reactionCountsJson}
      />

      {/* Comments section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-300">Comments</h2>
          {post.commentCount > 0 && (
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-500">
              {post.commentCount}
            </span>
          )}
        </div>

        <CommentForm postId={post.id} />

        <CommentList comments={allComments} />
      </div>
    </div>
  );
}
