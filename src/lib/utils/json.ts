export function safeParseJson<T = Record<string, number>>(
  json: string,
  fallback: T = {} as T
): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
