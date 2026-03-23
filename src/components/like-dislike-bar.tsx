"use client";

interface LikeDislikeBarProps {
  likes: number;
  dislikes: number;
}

export function LikeDislikeBar({ likes, dislikes }: LikeDislikeBarProps) {
  const total = likes + dislikes;
  if (total === 0) return null;

  const likePercent = Math.round((likes / total) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${likePercent}%` }}
        />
      </div>
      <span className="flex-shrink-0 text-[10px] tabular-nums text-gray-500">
        {likePercent}%
      </span>
    </div>
  );
}
