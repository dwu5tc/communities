"use client";

import { useState } from "react";

interface ReactionBarProps {
  targetType: "post" | "comment";
  targetId: number;
  likeCount: number;
  dislikeCount: number;
  reactionCountsJson: string;
}

const EMOJI_REACTIONS = [
  { key: "fire", emoji: "🔥" },
  { key: "heart", emoji: "❤️" },
  { key: "thinking", emoji: "🤔" },
  { key: "skull", emoji: "💀" },
] as const;

export function ReactionBar({
  targetType,
  targetId,
  likeCount: initialLikes,
  dislikeCount: initialDislikes,
  reactionCountsJson,
}: ReactionBarProps) {
  const initialCounts = (() => {
    try {
      return JSON.parse(reactionCountsJson) as Record<string, number>;
    } catch {
      return {};
    }
  })();

  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [emojiCounts, setEmojiCounts] = useState<Record<string, number>>(initialCounts);
  const [pending, setPending] = useState<string | null>(null);

  const react = async (reaction: string) => {
    if (pending) return;
    setPending(reaction);

    // Optimistic update
    if (reaction === "like") setLikes((c) => c + 1);
    else if (reaction === "dislike") setDislikes((c) => c + 1);
    else setEmojiCounts((c) => ({ ...c, [reaction]: (c[reaction] || 0) + 1 }));

    try {
      const url =
        targetType === "post"
          ? `/api/posts/${targetId}/react`
          : `/api/comments/${targetId}/react`;

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });
    } catch {
      // Revert on error
      if (reaction === "like") setLikes((c) => c - 1);
      else if (reaction === "dislike") setDislikes((c) => c - 1);
      else
        setEmojiCounts((c) => ({
          ...c,
          [reaction]: Math.max((c[reaction] || 0) - 1, 0),
        }));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Like / Dislike */}
      <button
        onClick={() => react("like")}
        disabled={pending !== null}
        className={`inline-flex items-center gap-1 rounded-lg border border-gray-800 px-2.5 py-1 text-xs transition-all hover:border-gray-700 hover:bg-gray-800/60 ${pending === "like" ? "opacity-50" : ""}`}
      >
        <span>👍</span>
        {likes > 0 && <span className="text-gray-400">{likes}</span>}
      </button>
      <button
        onClick={() => react("dislike")}
        disabled={pending !== null}
        className={`inline-flex items-center gap-1 rounded-lg border border-gray-800 px-2.5 py-1 text-xs transition-all hover:border-gray-700 hover:bg-gray-800/60 ${pending === "dislike" ? "opacity-50" : ""}`}
      >
        <span>👎</span>
        {dislikes > 0 && <span className="text-gray-400">{dislikes}</span>}
      </button>

      {/* Emoji Reactions */}
      {EMOJI_REACTIONS.map(({ key, emoji }) => {
        const count = emojiCounts[key] || 0;
        return (
          <button
            key={key}
            onClick={() => react(key)}
            disabled={pending !== null}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition-all hover:border-gray-700 hover:bg-gray-800/60 ${
              count > 0
                ? "border-gray-700 bg-gray-800/40"
                : "border-gray-800"
            } ${pending === key ? "opacity-50" : ""}`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-gray-400">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
