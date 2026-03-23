const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "gclsrc",
  "ref",
  "ref_src",
  "ref_url",
  "s",
  "si",
  "feature",
  "context",
  "igshid",
]);

export function normalizeUrl(raw: string): string {
  let url: URL;
  try {
    // Add protocol if missing
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    url = new URL(withProto);
  } catch {
    return raw.toLowerCase().replace(/\/+$/, "");
  }

  // Lowercase hostname
  let hostname = url.hostname.toLowerCase();

  // Strip www.
  hostname = hostname.replace(/^www\./, "");

  // Handle short URL expansions
  let pathname = url.pathname;
  let searchParams = new URLSearchParams(url.searchParams);

  // youtu.be/X → youtube.com/watch?v=X
  if (hostname === "youtu.be") {
    const videoId = pathname.replace(/^\//, "").replace(/\/.*$/, "");
    if (videoId) {
      hostname = "youtube.com";
      pathname = "/watch";
      searchParams = new URLSearchParams();
      searchParams.set("v", videoId);
    }
  }

  // Strip trailing slash
  pathname = pathname.replace(/\/+$/, "") || "/";

  // Strip tracking params
  const cleanParams = new URLSearchParams();
  searchParams.sort();
  for (const [key, value] of searchParams) {
    if (!TRACKING_PARAMS.has(key.toLowerCase())) {
      cleanParams.append(key, value);
    }
  }

  // Sort remaining params
  cleanParams.sort();

  // Build normalized string (no protocol, no fragment)
  const paramStr = cleanParams.toString();
  const normalized =
    hostname +
    (pathname === "/" ? "" : pathname) +
    (paramStr ? `?${paramStr}` : "");

  return normalized;
}
