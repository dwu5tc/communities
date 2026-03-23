import type { ProviderModule, ProviderMatch, MetadataResult } from "./types";

const PATTERNS = [
  // youtube.com/watch?v=ID
  /(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  // youtu.be/ID
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  // youtube.com/shorts/ID
  /(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  // youtube.com/embed/ID
  /(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
];

function extractVideoId(url: string): { id: string; isShort: boolean } | null {
  for (const pattern of PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return {
        id: match[1],
        isShort: url.includes("/shorts/"),
      };
    }
  }
  return null;
}

export const youtube: ProviderModule = {
  provider: "youtube",

  match(url: string): ProviderMatch | null {
    const result = extractVideoId(url);
    if (!result) return null;

    return {
      provider: "youtube",
      contentType: result.isShort ? "short" : "video",
      externalId: result.id,
      canonicalUrl: result.isShort
        ? `https://www.youtube.com/shorts/${result.id}`
        : `https://www.youtube.com/watch?v=${result.id}`,
      embed: {
        kind: "iframe_url",
        url: `https://www.youtube.com/embed/${result.id}`,
      },
    };
  },

  async fetchMetadata(externalId: string): Promise<MetadataResult> {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${externalId}`
      )}&format=json`;
      const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });
      if (!res.ok) return {};
      const data = await res.json();
      return {
        title: data.title,
        author: data.author_name,
        thumbnailUrl: data.thumbnail_url,
      };
    } catch {
      return {};
    }
  },
};
