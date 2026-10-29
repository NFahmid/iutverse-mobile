/**
 * Media references from the API, turned into URLs an Image or a downloader can use. The rules are in
 * docs/media-and-uploads.md; in short, what the backend returns today is one of:
 *
 *   - an absolute public URL (profile and post pictures; Supabase Storage public buckets)   -> used as is
 *   - a relative API path such as `/api/academic/resources/3/file` (a redirect to a signed file) -> resolved against
 *     the API origin and flagged `requiresAuth`, because only the signed-in member may open it
 *   - a signed URL inside a chat payload (absolute, expires in about an hour)                 -> used as is, never stored
 *   - null                                                                                     -> no media
 *
 * Anything else (other schemes, protocol-relative URLs, URLs with credentials, bare storage paths) is refused rather
 * than guessed, so a bad value in a response can never make the app open an unexpected origin.
 */
export interface MediaOptions {
  /** The configured API origin (the same value given to createApiClient). */
  apiBaseUrl: string;
  /** Development builds against a local Docker stack only: accept plain http URLs. */
  allowInsecureHttp?: boolean;
}

export interface MediaSource {
  url: string;
  /** True for URLs on the API origin under /api/: send the Authorization header (and do not hand them to other origins). */
  requiresAuth: boolean;
}

const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

export const resolveMedia = (value: string | null | undefined, options: MediaOptions): MediaSource | null => {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  // `//host/path` and `/\host/path` would be read as another origin by URL parsing. Never accept them.
  if (text.startsWith("//") || text.includes("\\")) return null;

  let api: URL;
  try {
    api = new URL(options.apiBaseUrl);
  } catch {
    return null;
  }

  let resolved: URL;
  if (HAS_SCHEME.test(text)) {
    try {
      resolved = new URL(text);
    } catch {
      return null;
    }
    const allowed = resolved.protocol === "https:" || (resolved.protocol === "http:" && options.allowInsecureHttp === true);
    if (!allowed) return null;
  } else if (text.startsWith("/")) {
    try {
      resolved = new URL(text, api);
    } catch {
      return null;
    }
    if (resolved.origin !== api.origin) return null;
  } else {
    return null; // a bare storage path or a legacy name: the bucket is unknown, so it cannot be resolved safely
  }

  if (resolved.username || resolved.password) return null;
  return { url: resolved.toString(), requiresAuth: resolved.origin === api.origin && resolved.pathname.startsWith("/api/") };
};

/** Convenience when the caller only needs the URL. */
export const resolveMediaUrl = (value: string | null | undefined, options: MediaOptions): string | null => resolveMedia(value, options)?.url ?? null;

/**
 * Safe to log: keeps the origin and path, drops the query and fragment, where signed tokens live.
 * Never log a media URL without passing it through this.
 */
export const redactUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}${parsed.search || parsed.hash ? "?[redacted]" : ""}`;
  } catch {
    return "[invalid url]";
  }
};
