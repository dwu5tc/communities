"use client";

import { useState, useEffect } from "react";
import type { Post } from "@/lib/db/schema";

export default function DevPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/dev/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const seedPost = async (postId: number, commentCount: number, boostReactions: boolean) => {
    setSeeding(postId);
    setMessage(null);

    try {
      const res = await fetch("/api/dev/seed-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, commentCount, boostReactions }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        fetchPosts();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSeeding(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-gray-400" />
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-100">Dev Tools</h1>
        <p className="mt-1 text-sm text-gray-500">
          Seed fake activity for demo purposes
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-300">
          {message}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-sm text-gray-600">
          No posts yet. Submit some content first.
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/30 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-300">
                  {post.localTitle || post.sourceTitle || post.canonicalUrl}
                </p>
                <p className="text-xs text-gray-600">
                  {post.provider} · {post.commentCount} comments · {post.likeCount} likes
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  onClick={() => seedPost(post.id, 5, false)}
                  disabled={seeding === post.id}
                  className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 disabled:opacity-50"
                >
                  +5 comments
                </button>
                <button
                  onClick={() => seedPost(post.id, 3, true)}
                  disabled={seeding === post.id}
                  className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 disabled:opacity-50"
                >
                  Boost all
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
