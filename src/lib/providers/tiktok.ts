import type { ProviderModule, ProviderMatch, MetadataResult } from "./types";

const PATTERNS = [
  // tiktok.com/@user/video/ID
  /(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
  // vm.tiktok.com/ID (short URL)
  /vm\.tiktok\.com\/([\w]+)/,
];

function extractVideoId(url: string): { id: string; isShortUrl: boolean } | null {
  for (let i = 0; i < PATTERNS.length; i++) {
    const match = url.match(PATTERNS[i]);
    if (match) {
      return { id: match[1], isShortUrl: i === 1 };
    }
  }
  return null;
}

export const tiktok: ProviderModule = {
  provider: "tiktok",

  match(url: string): ProviderMatch | null {
    const result = extractVideoId(url);
    if (!result) return null;

    const canonicalUrl = result.isShortUrl
      ? `https://vm.tiktok.com/${result.id}`
      : url.split("?")[0];

    const embedHtml = `<blockquote class="tiktok-embed" cite="${canonicalUrl}" data-video-id="${result.id}" style="max-width:605px;min-width:325px;"><section></section></blockquote>`;

    return {
      provider: "tiktok",
      contentType: "video",
      externalId: result.id,
      canonicalUrl,
      embed: {
        kind: "html",
        html: embedHtml,
      },
    };
  },

  async fetchMetadata(externalId: string): Promise<MetadataResult> {
    try {
      const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
        `https://www.tiktok.com/video/${externalId}`
      )}`;
      const res = await fetch(url);
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
