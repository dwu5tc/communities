import type { ProviderModule, ProviderMatch } from "./types";

const PATTERNS = [
  // instagram.com/p/CODE/
  /(?:www\.)?instagram\.com\/p\/([\w-]+)/,
  // instagram.com/reel/CODE/
  /(?:www\.)?instagram\.com\/reel\/([\w-]+)/,
];

function extractPostId(url: string): { id: string; isReel: boolean } | null {
  for (let i = 0; i < PATTERNS.length; i++) {
    const match = url.match(PATTERNS[i]);
    if (match) {
      return { id: match[1], isReel: i === 1 };
    }
  }
  return null;
}

export const instagram: ProviderModule = {
  provider: "instagram",

  match(url: string): ProviderMatch | null {
    const result = extractPostId(url);
    if (!result) return null;

    const type = result.isReel ? "reel" : "p";
    const canonicalUrl = `https://www.instagram.com/${type}/${result.id}/`;

    const embedHtml = `<blockquote class="instagram-media" data-instgrm-permalink="${canonicalUrl}" data-instgrm-version="14" style="max-width:540px;min-width:326px;width:calc(100% - 2px);"><div style="padding:16px;"><p style="margin:0;color:#c9c8cd;font-size:14px;">Loading...</p></div></blockquote>`;

    return {
      provider: "instagram",
      contentType: result.isReel ? "reel" : "post",
      externalId: result.id,
      canonicalUrl,
      embed: {
        kind: "html",
        html: embedHtml,
      },
    };
  },
};
