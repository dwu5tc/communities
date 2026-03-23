import Link from "next/link";
import type { Post, Comment } from "@/lib/db/schema";
import { relativeTime } from "@/lib/utils/dates";
import { PostMeta } from "./post-meta";
import { ProviderEmbed } from "./provider-embed";
import { ReactionBar } from "./reaction-bar";

interface FeedCardProps {
  post: Post;
  previewComments: Comment[];
}

export function FeedCard({ post, previewComments }: FeedCardProps) {
  const title = post.localTitle || post.sourceTitle;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-800/60 bg-gray-900/20 transition-colors hover:border-gray-700/60">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <PostMeta post={post} />
          <span className="text-xs text-gray-700">
            {relativeTime(post.createdAt)}
          </span>
        </div>
        {title && (
          <Link href={`/p/${post.id}`}>
            <h2 className="mb-1 text-sm font-medium text-gray-200 hover:text-white">
              {title}
            </h2>
          </Link>
        )}
        {post.localNote && (
          <p className="mb-3 text-sm leading-relaxed text-gray-500">
            {post.localNote}
          </p>
        )}
      </div>

      {/* Embed */}
      <div className="px-4 pb-2">
        <ProviderEmbed post={post} lazy />
      </div>

      {/* Reactions */}
      <div className="px-4 py-2">
        <ReactionBar
          targetType="post"
          targetId={post.id}
          likeCount={post.likeCount}
          dislikeCount={post.dislikeCount}
          reactionCountsJson={post.reactionCountsJson}
        />
      </div>

      {/* Comment Preview */}
      {(previewComments.length > 0 || post.commentCount > 0) && (
        <div className="border-t border-gray-800/40 px-4 py-3">
          {previewComments.map((comment) => (
            <div key={comment.id} className="mb-1.5 last:mb-0">
              <span className="text-xs font-medium text-gray-500">
                {comment.displayName}
              </span>{" "}
              <span className="text-xs text-gray-400">{comment.body}</span>
            </div>
          ))}
          <Link
            href={`/p/${post.id}`}
            className="mt-1 inline-block text-xs text-gray-600 hover:text-gray-400"
          >
            {post.commentCount > 0
              ? `View all ${post.commentCount} comments`
              : "Add a comment"}
          </Link>
        </div>
      )}

      {/* Link to detail if no comments section */}
      {previewComments.length === 0 && post.commentCount === 0 && (
        <div className="border-t border-gray-800/40 px-4 py-2.5">
          <Link
            href={`/p/${post.id}`}
            className="text-xs text-gray-600 hover:text-gray-400"
          >
            Open discussion
          </Link>
        </div>
      )}
    </article>
  );
}
