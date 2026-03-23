"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  postId: number;
}

export function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          displayName: displayName.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post comment");
      } else {
        setBody("");
        router.refresh();
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="anon"
          maxLength={50}
          className="w-24 flex-shrink-0 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-all focus:border-gray-600 focus:ring-1 focus:ring-gray-700"
        />
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          maxLength={2000}
          className="min-w-0 flex-1 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all focus:border-gray-600 focus:ring-1 focus:ring-gray-700"
        />
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="flex-shrink-0 rounded-lg bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-900 transition-all hover:bg-white disabled:opacity-30"
        >
          {submitting ? "..." : "Post"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </form>
  );
}
