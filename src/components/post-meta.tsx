import type { Post } from "@/lib/db/schema";

const PROVIDER_BADGE: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  youtube: {
    label: "YouTube",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "▶",
  },
  tiktok: {
    label: "TikTok",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    icon: "♪",
  },
  instagram: {
    label: "Instagram",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/20",
    icon: "◆",
  },
};

export function PostMeta({ post }: { post: Post }) {
  const badge = PROVIDER_BADGE[post.provider] || {
    label: post.provider,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    icon: "●",
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`inline-flex items-center gap-1 rounded-md border ${badge.border} ${badge.bg} px-2 py-0.5 font-medium ${badge.color}`}
      >
        <span className="text-[10px]">{badge.icon}</span>
        {badge.label}
      </span>
      <span className="text-gray-600">{post.contentType}</span>
      {post.sourceAuthor && (
        <>
          <span className="text-gray-700">·</span>
          <span className="text-gray-500">{post.sourceAuthor}</span>
        </>
      )}
    </div>
  );
}
