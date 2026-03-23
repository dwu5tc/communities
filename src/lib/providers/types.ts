export type Provider = "youtube" | "tiktok" | "instagram" | "generic";

export type ContentType = "video" | "short" | "reel" | "post" | "article";

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
  description?: string;
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
  fetchMetadata?(externalId: string, url?: string): Promise<MetadataResult>;
}
