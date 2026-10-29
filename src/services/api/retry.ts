import type { ApiError } from "./errors";
import { honorsIdempotencyKey, IDEMPOTENCY_KEY_HEADER } from "./idempotency";

/**
 * Retry policy. Retrying is explicit and classified by what is safe to repeat, never "retry everything":
 *
 *  - `read`        GET and HEAD. Nothing changes on the server, so a bounded retry is safe.
 *  - `keyed`       POST to an operation that honors Idempotency-Key, sent WITH that header. The server returns the
 *                  original result for a repeated key, so a retry cannot create a duplicate.
 *  - `repeat_safe` POST /api/uploads. It only hands out a fresh signed upload slot; repeating it creates nothing.
 *  - `none`        Everything else (other POST, PUT, PATCH, DELETE, or a keyed POST without its key): attempted once.
 *
 * Never retried whatever the class: cancellation, 401/403 (an expired token needs a session refresh, not a repeat),
 * validation errors, 404, 409, and unexpected responses. See docs/api-transport.md.
 */
export type RetryClass = "none" | "read" | "keyed" | "repeat_safe";

export interface RetryOptions {
  /** Total attempts including the first. Default 3. `1` disables retries. */
  maxAttempts?: number;
  /** First backoff ceiling. Default 300 ms, doubling per attempt. */
  baseDelayMs?: number;
  /** Backoff ceiling. Default 5 s. */
  maxDelayMs?: number;
  /** A Retry-After longer than this is not waited for; the 429 is returned to the caller. Default 15 s. */
  maxRetryAfterMs?: number;
  /** For tests: replaces the abortable timer. */
  sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
  /** For tests: replaces Math.random (jitter). */
  random?: () => number;
}

export const DEFAULT_RETRY = { maxAttempts: 3, baseDelayMs: 300, maxDelayMs: 5_000, maxRetryAfterMs: 15_000 } as const;

export const classifyRequest = (method: string, pathname: string, headers: Headers): RetryClass => {
  const verb = method.toUpperCase();
  if (verb === "GET" || verb === "HEAD") return "read";
  if (verb === "POST" && pathname === "/api/uploads") return "repeat_safe";
  if (headers.has(IDEMPOTENCY_KEY_HEADER) && honorsIdempotencyKey(verb, pathname)) return "keyed";
  return "none";
};

export interface RetryDecision {
  retry: boolean;
  delayMs: number;
}

/** Full-jitter exponential backoff: a random delay between 0 and min(max, base * 2^(attempt-1)). */
export const backoffMs = (attempt: number, options: RetryOptions = {}): number => {
  const base = options.baseDelayMs ?? DEFAULT_RETRY.baseDelayMs;
  const max = options.maxDelayMs ?? DEFAULT_RETRY.maxDelayMs;
  const random = options.random ?? Math.random;
  return Math.floor(random() * Math.min(max, base * 2 ** (attempt - 1)));
};

/** Decides whether to try again after `attempt` (1-based) failed with `error`. */
export const decideRetry = (cls: RetryClass, error: ApiError, attempt: number, options: RetryOptions = {}): RetryDecision => {
  const no: RetryDecision = { retry: false, delayMs: 0 };
  const maxAttempts = options.maxAttempts ?? DEFAULT_RETRY.maxAttempts;
  if (cls === "none" || attempt >= maxAttempts) return no;

  let retryable = false;
  switch (error.kind) {
    case "network":
    case "timeout":
      retryable = true;
      break;
    case "rate_limited":
      retryable = true;
      break;
    case "server":
      // 502/503/504 are transient gateway/availability errors. A plain 500 may be a bug that repeats, but with an
      // Idempotency-Key a repeat cannot do harm and may succeed.
      retryable = error.status === 502 || error.status === 503 || error.status === 504 || (cls === "keyed" && error.status === 500);
      break;
    default:
      retryable = false; // cancelled, unauthorized, forbidden, validation, not_found, conflict, unexpected_response, expired_link
  }
  if (!retryable) return no;

  if (error.kind === "rate_limited" && error.retryAfterSeconds !== undefined) {
    const wait = error.retryAfterSeconds * 1000;
    return wait > (options.maxRetryAfterMs ?? DEFAULT_RETRY.maxRetryAfterMs) ? no : { retry: true, delayMs: wait };
  }
  return { retry: true, delayMs: backoffMs(attempt, options) };
};

/** A timer that stops as soon as the caller's signal aborts, and never leaves a timer or listener behind. */
export const abortableSleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
