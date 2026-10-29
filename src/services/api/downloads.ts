import type { ApiClient } from "./client";
import { unwrap } from "./client";
import { withDeadline } from "./deadline";
import { ApiError, kindForResponse, messageFor } from "./errors";
import { abortableSleep, decideRetry, type RetryOptions } from "./retry";

/**
 * Private files (chat attachments, academic resources) are opened through short-lived signed URLs. The flow, verified
 * against the backend's Docker stack (docs/media-and-uploads.md):
 *
 *   1. GET /api/chat/attachments/{id}?redirect=false  (or /api/academic/resources/{id}/file?redirect=false)
 *      The API re-checks that the signed-in member may open the file and answers `{ url, expiresAt }` (about 5 minutes).
 *      Without `redirect=false` it answers a 302, which a native client should not depend on.
 *   2. GET <url>   no Authorization header: the token is in the URL, and our bearer token must not go to the storage host.
 *   3. An expired or invalid link is answered 400 `InvalidJWT` by Storage. The client asks the API for a NEW URL exactly
 *      once, which re-authorizes: if access was revoked the API answers 403 and that error is returned; if the new link
 *      also fails the error is `expired_link`. Links are never refreshed in a loop.
 *
 * Signed URLs are secrets while valid. They are kept in memory only, never persisted, and never logged (see redactUrl).
 */
export type PrivateFile = { kind: "chatAttachment"; messageId: number } | { kind: "academicResource"; resourceId: number };

export interface SignedUrl {
  url: string;
  expiresAt: Date;
}

const keyOf = (file: PrivateFile) => (file.kind === "chatAttachment" ? `chat:${file.messageId}` : `academic:${file.resourceId}`);

/** Asks the API for a fresh signed URL. Re-checks authorization every time. */
export async function requestSignedUrl(api: ApiClient, file: PrivateFile, signal?: AbortSignal): Promise<SignedUrl> {
  const envelope =
    file.kind === "chatAttachment"
      ? await unwrap(api.GET("/api/chat/attachments/{messageId}", { params: { path: { messageId: file.messageId }, query: { redirect: "false" } }, signal }))
      : await unwrap(api.GET("/api/academic/resources/{id}/file", { params: { path: { id: file.resourceId }, query: { redirect: "false" } }, signal }));
  return { url: envelope.data.url, expiresAt: new Date(envelope.data.expiresAt) };
}

export interface SignedUrlCache {
  /** A URL that is valid for at least `skewMs` more, from memory or from the API. Concurrent calls share one request. */
  get(file: PrivateFile, signal?: AbortSignal): Promise<SignedUrl>;
  /** Forget a URL, for example after storage rejected it. */
  invalidate(file: PrivateFile): void;
  clear(): void;
}

export const createSignedUrlCache = (api: ApiClient, options: { skewMs?: number; now?: () => number } = {}): SignedUrlCache => {
  const skewMs = options.skewMs ?? 15_000;
  const now = options.now ?? Date.now;
  const urls = new Map<string, SignedUrl>();
  const inFlight = new Map<string, Promise<SignedUrl>>();
  return {
    async get(file, signal) {
      const key = keyOf(file);
      const cached = urls.get(key);
      if (cached && cached.expiresAt.getTime() - now() > skewMs) return cached;
      const pending = inFlight.get(key) ?? requestSignedUrl(api, file, signal).finally(() => inFlight.delete(key));
      inFlight.set(key, pending);
      const fresh = await pending;
      urls.set(key, fresh);
      return fresh;
    },
    invalidate: (file) => void urls.delete(keyOf(file)),
    clear: () => urls.clear(),
  };
};

export interface FetchFileOptions {
  signal?: AbortSignal;
  /** Time allowed to receive the response headers. Default 30 s. */
  timeoutMs?: number;
  fetch?: typeof fetch;
  retry?: RetryOptions;
}

/** Storage's answer for an expired, tampered or otherwise unusable signed link. */
const isLinkRejected = (status: number) => status === 400 || status === 401 || status === 403;

/**
 * Opens a private file and returns the storage `Response` WITHOUT reading its body, so the caller can stream it to disk
 * or read it once. Refreshes the signed URL once if storage rejects it.
 */
export async function fetchPrivateFile(cache: SignedUrlCache, file: PrivateFile, options: FetchFileOptions = {}): Promise<Response> {
  const doFetch = options.fetch ?? globalThis.fetch;
  const retry = options.retry ?? {};
  const sleep = retry.sleep ?? abortableSleep;
  const callerSignal = options.signal ?? new AbortController().signal;

  const attemptOnce = async (signed: SignedUrl) => {
    const path = new URL(signed.url).pathname; // never the query: it holds the signed token
    return withDeadline({ signal: options.signal, timeoutMs: options.timeoutMs ?? 30_000, method: "GET", path }, (signal) => doFetch(signed.url, { method: "GET", signal }));
  };

  for (let refresh = 0; refresh <= 1; refresh += 1) {
    const signed = await cache.get(file, options.signal);
    const path = new URL(signed.url).pathname;
    let response: Response | undefined;
    for (let attempt = 1; ; attempt += 1) {
      try {
        response = await attemptOnce(signed);
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;
        const decision = decideRetry("read", error, attempt, retry);
        if (!decision.retry) throw error;
        try {
          await sleep(decision.delayMs, callerSignal);
        } catch {
          throw new ApiError({ kind: "cancelled", message: messageFor("cancelled", undefined), method: "GET", path });
        }
        continue;
      }
      if (response.ok) return response;
      if (isLinkRejected(response.status)) break;
      const kind = kindForResponse(response.status, undefined);
      const failure = new ApiError({ kind, message: messageFor(kind, undefined), method: "GET", path, status: response.status });
      await response.body?.cancel().catch(() => {});
      const decision = decideRetry("read", failure, attempt, retry);
      if (!decision.retry) throw failure;
      try {
        await sleep(decision.delayMs, callerSignal);
      } catch {
        throw new ApiError({ kind: "cancelled", message: messageFor("cancelled", undefined), method: "GET", path });
      }
    }
    await response.body?.cancel().catch(() => {});
    if (refresh === 1) throw new ApiError({ kind: "expired_link", message: messageFor("expired_link", undefined), method: "GET", path, status: response.status });
    cache.invalidate(file); // the next loop asks the API again, which re-checks authorization
  }
  throw new ApiError({ kind: "expired_link", message: messageFor("expired_link", undefined), method: "GET", path: "" });
}
