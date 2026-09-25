export function mergePublishedContent<T>(content: unknown, fallback: T): T {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return fallback;
  return { ...fallback, ...content };
}
export function readContentField<T>(content: Record<string, unknown> | undefined, key: string, fallback: T): T {
  let value = content?.[key];
  if (typeof value === 'string' && (Array.isArray(fallback) || (fallback && typeof fallback === 'object'))) {
    try { value = JSON.parse(value); } catch { return fallback; }
  }
  if (value == null || Array.isArray(value) !== Array.isArray(fallback) || typeof value !== typeof fallback) return fallback;
  if (value && typeof value === 'object' && !Array.isArray(value)) return { ...fallback, ...value };
  return value as T;
}
