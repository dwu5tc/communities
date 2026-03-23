"use client";

import { useState } from "react";
import type { Comment } from "@/lib/db/schema";
import { relativeTime } from "@/lib/utils/dates";
import { ReactionBar } from "./reaction-bar";
import { CommentForm } from "./comment-form";

type CommentWithReplies = Comment & { replies?: Comment[] };

interface CommentListProps {
  comments: Comment[];
  postId: number;
  showReactions?: boolean;
}

function buildTree(flat: Comment[]): CommentWithReplies[] {
  const topLevel = flat.filter((c) => !c.parentId);
  const replies = flat.filter((c) => c.parentId);

  return topLevel.map((parent) => ({
    ...parent,
    replies: replies.filter((r) => r.parentId === parent.id),
  }));
}

function SingleComment({
  comment,
  postId,
  showReactions,
  depth = 0,
}: {
  comment: CommentWithReplies;
  postId: number;
  showReactions: boolean;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div>
      <div
        className={`rounded-lg border border-gray-800/60 bg-gray-900/30 px-3.5 py-3 ${
          depth > 0 ? "ml-6 border-l-2 border-l-gray-800" : ""
        }`}
      >
        {/* Anchor quote */}
        {comment.anchorText && (
          <div className="mb-2 border-l-2 border-gray-600 pl-3">
            <p className="text-xs italic text-gray-500 line-clamp-2">
              &ldquo;{comment.anchorText}&rdquo;
            </p>
          </div>
        )}

        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">
            {comment.displayName}
          </span>
          <span className="text-xs text-gray-700">
            {relativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-gray-300">{comment.body}</p>

        <div className="mt-2 flex items-center gap-3">
          {showReactions && (
            <ReactionBar
              targetType="comment"
              targetId={comment.id}
              likeCount={comment.likeCount}
              dislikeCount={comment.dislikeCount}
              reactionCountsJson={comment.reactionCountsJson}
            />
          )}
          {depth === 0 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Inline reply form */}
      {showReplyForm && (
        <div className="ml-6 mt-2">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <SingleComment
              key={reply.id}
              comment={reply}
              postId={postId}
              showReactions={showReactions}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentList({
  comments,
  postId,
  showReactions = true,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-gray-600">
        No comments yet — be the first
      </p>
    );
  }

  const tree = buildTree(comments);

  return (
    <div className="space-y-3">
      {tree.map((comment) => (
        <SingleComment
          key={comment.id}
          comment={comment}
          postId={postId}
          showReactions={showReactions}
        />
      ))}
    </div>
  );
}
