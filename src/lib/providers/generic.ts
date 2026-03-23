import type { ProviderModule, ProviderMatch, MetadataResult } from "./types";

function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

export const generic: ProviderModule = {
  provider: "generic",

  match(url: string): ProviderMatch | null {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) return null;

      return {
        provider: "generic",
        contentType: "article",
        externalId: hashUrl(url),
        canonicalUrl: url.split("?")[0],
        embed: {
          kind: "unsupported",
        },
      };
    } catch {
      return null;
    }
  },

  async fetchMetadata(_externalId: string, url?: string): Promise<MetadataResult> {
    if (!url) return {};
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ContentLayer/1.0)",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return {};

      const html = await res.text();
      // Only parse the head to avoid processing huge pages
      const head = html.slice(0, 50000);

      const title = extractMeta(head, "og:title") || extractMeta(head, "twitter:title") || extractTitle(head);
      const description = extractMeta(head, "og:description") || extractMeta(head, "twitter:description") || extractMeta(head, "description");
      const thumbnailUrl = extractMeta(head, "og:image") || extractMeta(head, "twitter:image");
      const author = extractMeta(head, "og:site_name") || extractMeta(head, "author");

      return {
        title: title || undefined,
        author: author || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        description: description || undefined,
      };
    } catch {
      return {};
    }
  },
};

function extractMeta(html: string, property: string): string | null {
  // Match both property="..." and name="..." attributes
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRegex(property)}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapeRegex(property)}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
