import type { ProviderMatch, ProviderModule } from "./types";
import { youtube } from "./youtube";
import { tiktok } from "./tiktok";
import { instagram } from "./instagram";

const providers: ProviderModule[] = [youtube, tiktok, instagram];

export function detectProvider(url: string): ProviderMatch | null {
  for (const provider of providers) {
    const match = provider.match(url);
    if (match) return match;
  }
  return null;
}

export function getProviderModule(provider: string): ProviderModule | undefined {
  return providers.find((p) => p.provider === provider);
}
