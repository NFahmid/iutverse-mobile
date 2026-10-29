/**
 * Application-facing error model for API calls. Everything the transport throws is an `ApiError`, so feature code
 * handles one type and branches on `kind`.
 *
 * Messages come from the server's `message` field (written for users, never a stack trace) or are generic. The
 * Authorization header and response bodies other than `message`/`code` are never copied into an error.
 */

export type ApiErrorKind =
  /** 401, or 403 with code AUTH_TOKEN_INVALID: the access token is missing, expired or invalid. Refresh the session once. */
  | "unauthorized"
  /** 403 without an authentication code: signed in but not allowed (role, ownership), or not an active member (see `code`). */
  | "forbidden"
  /** 400: the server rejected the request as malformed or invalid. */
  | "validation"
  | "not_found"
  | "conflict"
  /** 429. `retryAfterSeconds` is set when the server sent Retry-After. */
  | "rate_limited"
  /** 5xx. */
  | "server"
  /** The request never produced a response (offline, DNS, TLS, connection reset). */
  | "network"
  /** The request exceeded the client timeout, or the caller's signal was an `AbortSignal.timeout`. */
  | "timeout"
  /** The caller aborted the request. Not an error to report to users. */
  | "cancelled"
  /** A response arrived but did not have the documented shape (non-JSON success body, unmapped status). */
  | "unexpected_response"
  /** A signed download link no longer works even after it was refreshed. The file may be gone or access may have changed. */
  | "expired_link";

/** Stable codes currently sent by the backend's authentication step. */
export type ApiErrorCode = "AUTH_TOKEN_REQUIRED" | "AUTH_TOKEN_INVALID" | "MEMBERSHIP_REQUIRED";

export interface ApiErrorInit {
  kind: ApiErrorKind;
  message: string;
  method: string;
  /** Path and query only; never the origin and never a header. */
  path: string;
  status?: number;
  code?: ApiErrorCode | (string & {});
  /** The id the server echoed, else the id this client sent. */
  requestId?: string;
  retryAfterSeconds?: number;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly method: string;
  readonly path: string;
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly requestId: string | undefined;
  readonly retryAfterSeconds: number | undefined;

  constructor(init: ApiErrorInit) {
    super(init.message, init.cause === undefined ? undefined : { cause: init.cause });
    this.name = "ApiError";
    this.kind = init.kind;
    this.method = init.method;
    this.path = init.path;
    this.status = init.status;
    this.code = init.code;
    this.requestId = init.requestId;
    this.retryAfterSeconds = init.retryAfterSeconds;
  }

  /** True when refreshing the session and retrying once can help. */
  get isTokenRejected(): boolean {
    return this.kind === "unauthorized";
  }

  /** True when the account is signed in but is not an active IUTverse member. Do not retry. */
  get isMembershipRequired(): boolean {
    return this.code === "MEMBERSHIP_REQUIRED";
  }

  /** Safe to log: no tokens, no bodies. */
  toJSON() {
    return { name: this.name, kind: this.kind, message: this.message, status: this.status, code: this.code, requestId: this.requestId, method: this.method, path: this.path };
  }
}

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError;

export interface ErrorBodyView {
  message?: string;
  code?: string;
}

const GENERIC_MESSAGES: Partial<Record<ApiErrorKind, string>> = {
  unauthorized: "Your session is no longer valid. Please sign in again.",
  forbidden: "You are not allowed to do that.",
  validation: "The request was not accepted.",
  not_found: "That item could not be found.",
  conflict: "That conflicts with the current state.",
  rate_limited: "Too many requests. Please try again shortly.",
  server: "The server had a problem. Please try again.",
  network: "Could not reach the server. Check your connection.",
  timeout: "The request took too long. Please try again.",
  cancelled: "The request was cancelled.",
  unexpected_response: "The server sent an unexpected response.",
  expired_link: "This link has expired. Please try again.",
};

/** Maps an HTTP error response to an error kind (the status and the optional `code` decide; message text never does). */
export const kindForResponse = (status: number, code: string | undefined): ApiErrorKind => {
  if (status === 401) return "unauthorized";
  if (status === 403) return code === "AUTH_TOKEN_INVALID" || code === "AUTH_TOKEN_REQUIRED" ? "unauthorized" : "forbidden";
  if (status === 400 || status === 422) return "validation";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unexpected_response";
};

export const messageFor = (kind: ApiErrorKind, body: ErrorBodyView | undefined): string => {
  // The backend never sends internal detail in production 5xx bodies, but a client should not rely on that.
  if (kind === "server") return GENERIC_MESSAGES.server!;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  return message ? message.slice(0, 300) : (GENERIC_MESSAGES[kind] ?? "Request failed.");
};
