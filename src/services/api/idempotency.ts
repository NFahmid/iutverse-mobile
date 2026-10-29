import { ApiConfigError } from "./config";
import { createRequestId } from "./requestId";

/**
 * Idempotency keys make a retried create safe (docs/api-transport.md). The rule that matters:
 *
 *   ONE KEY PER USER ACTION, REUSED FOR EVERY RETRY OF THAT ACTION.
 *
 * Create the key when the user taps "send" (and keep it with the pending message), not inside the code that sends the
 * request. A new key for each attempt would defeat the protection and produce duplicates.
 *
 * The backend honors the header on exactly three operations (POST /api/chat/messages, POST /api/posts,
 * POST /api/posts/{id}/comments). The transport retries a mutation only for those.
 */
export const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
const KEY = /^[A-Za-z0-9_-]{16,64}$/;

export const createIdempotencyKey = (): string => createRequestId();

export const isValidIdempotencyKey = (key: string): boolean => KEY.test(key);

/** Header init for a call: `api.POST(path, { body, headers: idempotencyHeaders(key) })`. */
export const idempotencyHeaders = (key: string): Record<string, string> => {
  if (!isValidIdempotencyKey(key)) throw new ApiConfigError("Idempotency key must be 16 to 64 characters of letters, digits, underscore or hyphen.");
  return { [IDEMPOTENCY_KEY_HEADER]: key };
};

/** Mutations that honor Idempotency-Key. Keep in sync with the backend contract (docs/api/idempotency.md). */
const KEYED_ENDPOINTS: readonly RegExp[] = [/^\/api\/chat\/messages$/, /^\/api\/posts$/, /^\/api\/posts\/\d+\/comments$/];
export const honorsIdempotencyKey = (method: string, pathname: string): boolean => method === "POST" && KEYED_ENDPOINTS.some((pattern) => pattern.test(pathname));
