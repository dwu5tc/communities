"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onCancel?: () => void;
}

export function CommentForm({ postId, parentId, onCancel }: CommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReply = !!parentId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        body: body.trim(),
        displayName: displayName.trim() || undefined,
      };
      if (parentId) payload.parentId = parentId;

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post comment");
      } else {
        setBody("");
        if (onCancel) onCancel();
        router.refresh();
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        {!isReply && (
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="anon"
            maxLength={50}
            className="w-24 flex-shrink-0 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-all focus:border-gray-600 focus:ring-1 focus:ring-gray-700"
          />
        )}
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={isReply ? "Write a reply..." : "Add a comment..."}
          maxLength={2000}
          className="min-w-0 flex-1 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all focus:border-gray-600 focus:ring-1 focus:ring-gray-700"
        />
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="flex-shrink-0 rounded-lg bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-900 transition-all hover:bg-white disabled:opacity-30"
        >
          {submitting ? "..." : isReply ? "Reply" : "Post"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-shrink-0 rounded-lg border border-gray-800 px-3 py-2.5 text-xs text-gray-500 transition-all hover:text-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
