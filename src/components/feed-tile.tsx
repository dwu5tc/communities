import Link from "next/link";
import type { Post, Comment } from "@/lib/db/schema";
import { ProviderEmbed } from "./provider-embed";
import { ReactionBar } from "./reaction-bar";
import { LikeDislikeBar } from "./like-dislike-bar";

const PROVIDER_BADGE: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  youtube: { label: "YouTube", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: "▶" },
  tiktok: { label: "TikTok", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "♪" },
  instagram: { label: "Instagram", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", icon: "◆" },
  generic: { label: "Link", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "◎" },
};

interface FeedTileProps {
  post: Post;
  previewComments: Comment[];
}

export function FeedTile({ post, previewComments }: FeedTileProps) {
  const title = post.localTitle || post.sourceTitle;
  const badge = PROVIDER_BADGE[post.provider] || PROVIDER_BADGE.generic;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/20 transition-colors hover:border-gray-700/60">
      {/* Provider badge + meta */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className={`inline-flex items-center gap-1 rounded-md border ${badge.border} ${badge.bg} px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
          <span className="text-[8px]">{badge.icon}</span>
          {badge.label}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
          {post.sourceAuthor && (
            <span className="truncate max-w-[80px]">{post.sourceAuthor}</span>
          )}
          {post.submittedByAlias && post.sourceAuthor && (
            <span className="text-gray-800">·</span>
          )}
          {post.submittedByAlias && (
            <span className="text-gray-500">via {post.submittedByAlias}</span>
          )}
        </div>
      </div>

      {/* Embed player */}
      <div className="px-2">
        <ProviderEmbed post={post} lazy />
      </div>

      {/* Title + info */}
      <div className="flex flex-1 flex-col p-3">
        {title && (
          <Link href={`/p/${post.id}`}>
            <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-300 group-hover:text-gray-100">
              {title}
            </p>
          </Link>
        )}

        {/* Attribution row */}
        {(!title) && (
          <Link href={`/p/${post.id}`} className="text-xs text-gray-600 hover:text-gray-400">
            Open discussion
          </Link>
        )}

        {/* Like/Dislike ratio bar */}
        {(post.likeCount > 0 || post.dislikeCount > 0) && (
          <div className="mt-2">
            <LikeDislikeBar likes={post.likeCount} dislikes={post.dislikeCount} />
          </div>
        )}

        {/* Reactions — show all */}
        <div className="mt-2">
          <ReactionBar
            targetType="post"
            targetId={post.id}
            likeCount={post.likeCount}
            dislikeCount={post.dislikeCount}
            reactionCountsJson={post.reactionCountsJson}
            compact
          />
        </div>

        {/* Comment preview */}
        {previewComments.length > 0 && (
          <div className="mt-2 border-t border-gray-800/40 pt-2">
            {previewComments.slice(0, 1).map((comment) => (
              <p key={comment.id} className="line-clamp-2 text-[11px] leading-snug text-gray-500">
                <span className="font-medium text-gray-400">{comment.displayName}</span>{" "}
                {comment.body}
              </p>
            ))}
            {post.commentCount > 1 && (
              <Link href={`/p/${post.id}`} className="mt-0.5 block text-[10px] text-gray-600 hover:text-gray-400">
                +{post.commentCount - 1} more
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
