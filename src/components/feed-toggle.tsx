"use client";

import { useState, useEffect } from "react";
import type { Post, Comment } from "@/lib/db/schema";
import { FeedCard } from "./feed-card";
import { FeedTile } from "./feed-tile";

interface FeedToggleProps {
  postsWithComments: { post: Post; previewComments: Comment[] }[];
}

export function FeedToggle({ postsWithComments }: FeedToggleProps) {
  const [view, setView] = useState<"list" | "grid">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("feed-view") as "list" | "grid") || "list";
    }
    return "list";
  });

  useEffect(() => {
    localStorage.setItem("feed-view", view);
  }, [view]);

  return (
    <div>
      {/* Toggle */}
      <div className={`mx-auto mb-4 flex items-center justify-end ${view === "list" ? "max-w-2xl" : "max-w-6xl"}`}>
        <div className="inline-flex rounded-lg border border-gray-800 bg-gray-900/50 p-0.5">
          <button
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              view === "list"
                ? "bg-gray-800 text-gray-200"
                : "text-gray-500 hover:text-gray-300"
            }`}
            aria-label="List view"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline-block">
              <rect x="1" y="2" width="14" height="3" rx="0.5" fill="currentColor" opacity="0.9" />
              <rect x="1" y="7" width="14" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
              <rect x="1" y="12" width="14" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
            </svg>
          </button>
          <button
            onClick={() => setView("grid")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              view === "grid"
                ? "bg-gray-800 text-gray-200"
                : "text-gray-500 hover:text-gray-300"
            }`}
            aria-label="Grid view"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline-block">
              <rect x="1" y="1" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.9" />
              <rect x="9" y="1" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.7" />
              <rect x="1" y="9" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.5" />
              <rect x="9" y="9" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.3" />
            </svg>
          </button>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="mx-auto max-w-2xl space-y-4">
          {postsWithComments.map(({ post, previewComments }) => (
            <FeedCard
              key={post.id}
              post={post}
              previewComments={previewComments}
            />
          ))}
        </div>
      )}

      {/* Grid View */}
      {view === "grid" && (
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {postsWithComments.map(({ post, previewComments }) => (
            <FeedTile key={post.id} post={post} previewComments={previewComments} />
          ))}
        </div>
      )}
    </div>
  );
}
