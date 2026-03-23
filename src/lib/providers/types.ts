export type Provider = "youtube" | "tiktok" | "instagram";

export type ContentType = "video" | "short" | "reel" | "post";

export type EmbedKind = "iframe_url" | "html" | "unsupported";

export interface EmbedResult {
  kind: EmbedKind;
  url?: string;
  html?: string;
}

export interface MetadataResult {
  title?: string;
  author?: string;
  thumbnailUrl?: string;
}

export interface ProviderMatch {
  provider: Provider;
  contentType: ContentType;
  externalId: string;
  canonicalUrl: string;
  embed: EmbedResult;
}

export interface ProviderModule {
  provider: Provider;
  match(url: string): ProviderMatch | null;
  fetchMetadata?(externalId: string): Promise<MetadataResult>;
}
