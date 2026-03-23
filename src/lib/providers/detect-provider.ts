import type { ProviderMatch, ProviderModule } from "./types";
import { youtube } from "./youtube";
import { tiktok } from "./tiktok";
import { instagram } from "./instagram";
import { generic } from "./generic";

// Specific providers checked first, generic is the fallback
const specificProviders: ProviderModule[] = [youtube, tiktok, instagram];
const allProviders: ProviderModule[] = [...specificProviders, generic];

export function detectProvider(url: string): ProviderMatch | null {
  for (const provider of allProviders) {
    const match = provider.match(url);
    if (match) return match;
  }
  return null;
}

export function getProviderModule(provider: string): ProviderModule | undefined {
  return allProviders.find((p) => p.provider === provider);
}
