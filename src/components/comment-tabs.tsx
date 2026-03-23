"use client";

import { useState } from "react";
import type { Comment } from "@/lib/db/schema";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";

interface CommentTabsProps {
  postId: number;
  pageComments: Comment[];
  discussionComments: Comment[];
}

export function CommentTabs({
  postId,
  pageComments,
  discussionComments,
}: CommentTabsProps) {
  const [tab, setTab] = useState<"discussion" | "page">(
    pageComments.length > 0 ? "page" : "discussion"
  );

  return (
    <>
      <div className="flex gap-1 border-b border-gray-800">
        <button
          onClick={() => setTab("discussion")}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            tab === "discussion"
              ? "border-b-2 border-gray-300 text-gray-200"
              : "text-gray-600 hover:text-gray-400"
          }`}
        >
          Discussion
          {discussionComments.length > 0 && (
            <span className="ml-1.5 rounded-full bg-gray-800 px-1.5 py-0.5 text-xs text-gray-500">
              {discussionComments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("page")}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            tab === "page"
              ? "border-b-2 border-gray-300 text-gray-200"
              : "text-gray-600 hover:text-gray-400"
          }`}
        >
          Page Comments
          {pageComments.length > 0 && (
            <span className="ml-1.5 rounded-full bg-gray-800 px-1.5 py-0.5 text-xs text-gray-500">
              {pageComments.length}
            </span>
          )}
        </button>
      </div>

      {tab === "discussion" && (
        <div className="space-y-4">
          <CommentForm postId={postId} />
          <CommentList
            comments={discussionComments}
            postId={postId}
          />
        </div>
      )}

      {tab === "page" && (
        <div className="space-y-4">
          <CommentList
            comments={pageComments}
            postId={postId}
          />
          {pageComments.length === 0 && (
            <p className="text-center text-xs text-gray-600">
              Page comments are added via the browser extension
            </p>
          )}
        </div>
      )}
    </>
  );
}
