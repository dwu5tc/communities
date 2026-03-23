"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Provider, ContentType, EmbedKind } from "@/lib/providers/types";

interface ResolveResult {
  match: {
    provider: Provider;
    contentType: ContentType;
    externalId: string;
    canonicalUrl: string;
    embed: { kind: EmbedKind; url?: string; html?: string };
  };
  metadata: {
    title?: string;
    author?: string;
    thumbnailUrl?: string;
  };
}

const PROVIDER_CONFIG: Record<
  Provider,
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

export function SubmitForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [localTitle, setLocalTitle] = useState("");
  const [localNote, setLocalNote] = useState("");
  const [alias, setAlias] = useState("");
  const [resolved, setResolved] = useState<ResolveResult | null>(null);
  const [resolving, setResolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const resolveUrl = useCallback(async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setResolved(null);
      setError(null);
      return;
    }

    try {
      new URL(inputUrl);
    } catch {
      setResolved(null);
      setError(null);
      return;
    }

    setResolving(true);
    setError(null);

    try {
      const res = await fetch("/api/resolve-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resolve link");
        setResolved(null);
      } else {
        setResolved(data);
        setError(null);
      }
    } catch {
      setError("Network error — try again");
      setResolved(null);
    } finally {
      setResolving(false);
    }
  }, []);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => resolveUrl(value), 400);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setTimeout(() => resolveUrl(pasted), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolved) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          localTitle: localTitle || undefined,
          localNote: localNote || undefined,
          submittedByAlias: alias || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit");
      } else {
        router.push(`/p/${data.post.id}`);
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setSubmitting(false);
    }
  };

  const providerInfo = resolved
    ? PROVIDER_CONFIG[resolved.match.provider]
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* URL Input */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-gray-500">
          Link
        </label>
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste a YouTube, TikTok, or Instagram URL..."
            className="w-full rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3.5 font-mono text-sm text-gray-200 placeholder-gray-600 outline-none transition-all focus:border-gray-600 focus:bg-gray-900 focus:ring-1 focus:ring-gray-700"
            autoFocus
          />
          {resolving && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-700 border-t-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Provider Preview */}
      {resolved && providerInfo && (
        <div
          className={`animate-in fade-in slide-in-from-bottom-2 rounded-xl border ${providerInfo.border} ${providerInfo.bg} p-4`}
          style={{ animationDuration: "200ms" }}
        >
          <div className="flex items-start gap-3">
            {resolved.metadata.thumbnailUrl && (
              <img
                src={resolved.metadata.thumbnailUrl}
                alt=""
                className="h-16 w-24 flex-shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-md ${providerInfo.bg} border ${providerInfo.border} px-2 py-0.5 text-xs font-medium ${providerInfo.color}`}
                >
                  <span className="text-[10px]">{providerInfo.icon}</span>
                  {providerInfo.label}
                </span>
                <span className="text-xs text-gray-600">
                  {resolved.match.contentType}
                </span>
              </div>
              {resolved.metadata.title && (
                <p className="truncate text-sm font-medium text-gray-200">
                  {resolved.metadata.title}
                </p>
              )}
              {resolved.metadata.author && (
                <p className="text-xs text-gray-500">
                  {resolved.metadata.author}
                </p>
              )}
              {!resolved.metadata.title && (
                <p className="truncate text-xs text-gray-500">
                  {resolved.match.canonicalUrl}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Optional Fields */}
      {resolved && (
        <div className="space-y-4" style={{ animationDuration: "300ms" }}>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-gray-500">
              Title
              <span className="ml-1 normal-case tracking-normal text-gray-700">
                optional
              </span>
            </label>
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Add your own title..."
              maxLength={200}
              className="w-full rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all focus:border-gray-600 focus:bg-gray-900 focus:ring-1 focus:ring-gray-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-gray-500">
              Note
              <span className="ml-1 normal-case tracking-normal text-gray-700">
                optional
              </span>
            </label>
            <textarea
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              placeholder="Why is this worth watching?"
              maxLength={1000}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all focus:border-gray-600 focus:bg-gray-900 focus:ring-1 focus:ring-gray-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-gray-500">
              Your Name
              <span className="ml-1 normal-case tracking-normal text-gray-700">
                optional
              </span>
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="anon"
              maxLength={50}
              className="w-full rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all focus:border-gray-600 focus:bg-gray-900 focus:ring-1 focus:ring-gray-700"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      {resolved && (
        <button
          type="submit"
          disabled={submitting}
          className="relative w-full overflow-hidden rounded-xl bg-gray-100 px-6 py-3.5 text-sm font-semibold text-gray-900 transition-all hover:bg-white disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-900" />
              Submitting...
            </span>
          ) : (
            "Submit to feed"
          )}
        </button>
      )}

      {/* Supported Providers Hint */}
      {!resolved && !error && !resolving && (
        <div className="flex items-center justify-center gap-4 py-4">
          {(["youtube", "tiktok", "instagram"] as const).map((p) => {
            const info = PROVIDER_CONFIG[p];
            return (
              <span
                key={p}
                className={`inline-flex items-center gap-1.5 rounded-lg border ${info.border} ${info.bg} px-3 py-1.5 text-xs ${info.color}`}
              >
                <span className="text-[10px]">{info.icon}</span>
                {info.label}
              </span>
            );
          })}
        </div>
      )}
    </form>
  );
}
