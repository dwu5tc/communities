import type { Comment } from "@/lib/db/schema";
import { relativeTime } from "@/lib/utils/dates";
import { ReactionBar } from "./reaction-bar";

interface CommentListProps {
  comments: Comment[];
  showReactions?: boolean;
}

export function CommentList({
  comments,
  showReactions = true,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-gray-600">
        No comments yet — be the first
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-lg border border-gray-800/60 bg-gray-900/30 px-3.5 py-3"
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">
              {comment.displayName}
            </span>
            <span className="text-xs text-gray-700">
              {relativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-300">
            {comment.body}
          </p>
          {showReactions && (
            <div className="mt-2">
              <ReactionBar
                targetType="comment"
                targetId={comment.id}
                likeCount={comment.likeCount}
                dislikeCount={comment.dislikeCount}
                reactionCountsJson={comment.reactionCountsJson}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
