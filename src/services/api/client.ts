import createOpenApiClient, { type Client } from "openapi-fetch";
import { clientInfoHeaders, type ClientInfo } from "./clientInfo";
import { normalizeBaseUrl, type AppEnvironment } from "./config";
import { ApiError, kindForResponse, messageFor, type ApiErrorKind, type ErrorBodyView } from "./errors";
import type { paths } from "./generated/schema";
import { createRequestId, REQUEST_ID_HEADER, type RequestIdFactory } from "./requestId";
import { abortableSleep, classifyRequest, decideRetry, type RetryOptions } from "./retry";

/**
 * Handwritten transport around the generated contract types. The generated file only describes operations; this file
 * decides how requests are sent:
 *
 *  - absolute, validated base URL;
 *  - `Authorization: Bearer <token>` read from the app's session at request time (no token is stored here);
 *  - an `X-Request-Id` on every request, and the server's echo on every error;
 *  - optional `X-Client-Platform` / `X-Client-Version` for observability;
 *  - one timeout per attempt (longer for uploads) and caller cancellation, with the cause kept distinct;
 *  - every failure thrown as an `ApiError`;
 *  - explicit, bounded retries only where repeating is safe (see retry.ts). Mutations are never replayed unless they
 *    carry an Idempotency-Key for an operation that honors it.
 *
 * JSON only: bodies are read fully and validated. Binary files (images, PDFs, uploads) go through transfer.ts and
 * uploads.ts, which never buffer a file into a JSON-shaped response.
 */

export type AccessTokenProvider = () => Promise<string | null | undefined> | string | null | undefined;

export interface ApiClientOptions {
  /** Absolute backend origin, for example `https://api.example.org`. Contract paths already start with `/api`. */
  baseUrl: string;
  /** Returns the current Supabase access token, or null when signed out. Called for every authenticated attempt. */
  getAccessToken: AccessTokenProvider;
  /** Used to refuse plain http outside development. Defaults to `development`. */
  environment?: AppEnvironment;
  /** Development builds against a local Docker stack only. */
  allowInsecureHttp?: boolean;
  /** Ordinary JSON requests. Default 15 s per attempt. */
  timeoutMs?: number;
  /** Uploads. Default 120 s per attempt. */
  uploadTimeoutMs?: number;
  /** Sent as X-Client-Platform and X-Client-Version on every request. Diagnostic only. */
  clientInfo?: ClientInfo;
  /** Retry tuning, or `false` to disable retries entirely. */
  retry?: RetryOptions | false;
  /** Override for tests or a platform fetch. Defaults to the global `fetch`. */
  fetch?: typeof fetch;
  requestId?: RequestIdFactory;
}

export type ApiClient = Client<paths>;

/** Per-call markers. They are read and removed by the transport; they never reach the network. */
export const SKIP_AUTH_HEADER = "x-iutverse-anonymous";
export const TIMEOUT_HEADER = "x-iutverse-timeout-ms";
export const UPLOAD_HEADER = "x-iutverse-upload";

export interface CallOptions {
  /** Do not attach the bearer token (public routes, optional-auth routes). */
  anonymous?: boolean;
  /** Timeout for this call in milliseconds, replacing the client default. */
  timeoutMs?: number;
  /** Use the longer upload timeout. Needed on React Native, where a FormData body does not expose its multipart header. */
  upload?: boolean;
}

/** `api.GET(path, { ...callOptions({ anonymous: true }) })` */
export const callOptions = (options: CallOptions): { headers: Record<string, string> } => {
  const headers: Record<string, string> = {};
  if (options.anonymous) headers[SKIP_AUTH_HEADER] = "1";
  if (options.timeoutMs !== undefined) headers[TIMEOUT_HEADER] = String(Math.max(1, Math.floor(options.timeoutMs)));
  if (options.upload) headers[UPLOAD_HEADER] = "1";
  return { headers };
};

export const anonymous = { headers: { [SKIP_AUTH_HEADER]: "1" } } as const;

export const DEFAULT_TIMEOUT_MS = 15_000;
export const DEFAULT_UPLOAD_TIMEOUT_MS = 120_000;

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);
const isJson = (contentType: string | null) => /\bapplication\/(?:[\w.+-]+\+)?json\b/i.test(contentType ?? "");

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value || !/^\d+$/.test(value.trim())) return undefined;
  return Number(value.trim());
};

export function createApiClient(options: ApiClientOptions): ApiClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl, { environment: options.environment, allowInsecureHttp: options.allowInsecureHttp });
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const uploadTimeoutMs = options.uploadTimeoutMs ?? DEFAULT_UPLOAD_TIMEOUT_MS;
  const makeRequestId = options.requestId ?? createRequestId;
  const clientHeaders = options.clientInfo ? clientInfoHeaders(options.clientInfo) : {};
  const retryOptions: RetryOptions | false = options.retry ?? {};
  // Resolved at call time so a test or platform can swap the global after the client is created.
  const baseFetch = (request: Request) => (options.fetch ?? globalThis.fetch)(request);

  /** One attempt: auth, headers, timeout, cancellation, body handling and error normalization. */
  const attempt = async (request: Request, requestId: string): Promise<Response> => {
    const url = new URL(request.url);
    const method = request.method;
    const path = `${url.pathname}${url.search}`;

    const headers = new Headers(request.headers);
    const skipAuth = headers.has(SKIP_AUTH_HEADER);
    headers.delete(SKIP_AUTH_HEADER);
    const timeoutOverride = Number(headers.get(TIMEOUT_HEADER));
    headers.delete(TIMEOUT_HEADER);
    const uploadMarker = headers.has(UPLOAD_HEADER);
    headers.delete(UPLOAD_HEADER);
    headers.set(REQUEST_ID_HEADER, requestId);
    for (const [name, value] of Object.entries(clientHeaders)) if (!headers.has(name)) headers.set(name, value);

    const fail = (kind: ApiErrorKind, init: Partial<ConstructorParameters<typeof ApiError>[0]> = {}) =>
      new ApiError({ kind, message: messageFor(kind, undefined), method, path, requestId, ...init });

    if (!skipAuth && !headers.has("authorization")) {
      let token: string | null | undefined;
      try {
        token = await options.getAccessToken();
      } catch (cause) {
        throw fail("unauthorized", { message: "Could not read the current session.", cause });
      }
      if (token) headers.set("authorization", `Bearer ${token}`);
    }

    // Who ended the request first decides how it is reported, so a timeout and a caller abort that land in the same
    // tick cannot be confused.
    const caller = request.signal;
    const controller = new AbortController();
    let cause: "timeout" | "cancelled" | undefined;
    const abortFromCaller = () => {
      cause ??= (caller.reason as { name?: string } | undefined)?.name === "TimeoutError" ? "timeout" : "cancelled";
      controller.abort();
    };
    if (caller.aborted) {
      abortFromCaller();
      throw fail(cause === "timeout" ? "timeout" : "cancelled");
    }
    caller.addEventListener("abort", abortFromCaller, { once: true });

    const multipart = uploadMarker || (headers.get("content-type") ?? "").toLowerCase().startsWith("multipart/");
    const limit = Number.isFinite(timeoutOverride) && timeoutOverride > 0 ? timeoutOverride : multipart ? uploadTimeoutMs : timeoutMs;
    const timer = setTimeout(() => {
      cause ??= "timeout";
      controller.abort();
    }, limit);

    try {
      const response = await baseFetch(new Request(request, { headers, signal: controller.signal }));
      // Read the body while the timer and the abort link are still active, so a stalled body is also bounded and
      // cancellable. API bodies are small JSON documents.
      const bytes = NULL_BODY_STATUSES.has(response.status) ? null : await response.arrayBuffer();
      const echoed = response.headers.get(REQUEST_ID_HEADER) ?? requestId;
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        let body: ErrorBodyView | undefined;
        if (bytes && isJson(contentType)) {
          try {
            const parsed = JSON.parse(new TextDecoder().decode(bytes));
            if (parsed && typeof parsed === "object") body = parsed as ErrorBodyView;
          } catch {
            /* a non-JSON error body is reported by status alone */
          }
        }
        const code = typeof body?.code === "string" ? body.code : undefined;
        const kind = kindForResponse(response.status, code);
        throw new ApiError({
          kind,
          message: messageFor(kind, body),
          method,
          path,
          status: response.status,
          code,
          requestId: echoed,
          retryAfterSeconds: kind === "rate_limited" ? parseRetryAfter(response.headers.get("retry-after")) : undefined,
        });
      }

      if (bytes && bytes.byteLength > 0) {
        // A success body that is not the JSON the contract promises is usually a captive portal or proxy page.
        let valid = isJson(contentType);
        if (valid) {
          try {
            JSON.parse(new TextDecoder().decode(bytes));
          } catch {
            valid = false;
          }
        }
        if (!valid) throw new ApiError({ kind: "unexpected_response", message: messageFor("unexpected_response", undefined), method, path, status: response.status, requestId: echoed });
      }

      const result = new Response(bytes, { status: response.status, statusText: response.statusText, headers: response.headers });
      Object.defineProperty(result, "url", { value: request.url });
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (cause === "timeout") throw fail("timeout", { cause });
      if (cause === "cancelled") throw fail("cancelled", { cause });
      throw fail("network", { cause: error });
    } finally {
      clearTimeout(timer);
      caller.removeEventListener("abort", abortFromCaller);
    }
  };

  const send = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    // The same id is kept across retries so server logs show one logical request.
    const requestId = request.headers.get(REQUEST_ID_HEADER) ?? makeRequestId();
    const cls = retryOptions === false ? "none" : classifyRequest(request.method, url.pathname, request.headers);
    const maxAttempts = retryOptions === false || cls === "none" ? 1 : (retryOptions.maxAttempts ?? 3);
    const sleep = retryOptions === false ? abortableSleep : (retryOptions.sleep ?? abortableSleep);

    for (let attemptNumber = 1; ; attemptNumber += 1) {
      // A request body can be read once, so every attempt that may be followed by another sends a clone.
      const toSend = attemptNumber < maxAttempts ? request.clone() : request;
      try {
        return await attempt(toSend, requestId);
      } catch (error) {
        if (!(error instanceof ApiError) || retryOptions === false) throw error;
        const decision = decideRetry(cls, error, attemptNumber, retryOptions);
        if (!decision.retry) throw error;
        try {
          await sleep(decision.delayMs, request.signal);
        } catch {
          const timedOut = (request.signal.reason as { name?: string } | undefined)?.name === "TimeoutError";
          throw new ApiError({ kind: timedOut ? "timeout" : "cancelled", message: messageFor(timedOut ? "timeout" : "cancelled", undefined), method: error.method, path: error.path, requestId: error.requestId });
        }
      }
    }
  };

  return createOpenApiClient<paths>({ baseUrl, fetch: send });
}

/**
 * Returns `data` of a successful call. Failures are already thrown as `ApiError` by the transport, so `data` is only
 * missing for an empty body, which is reported as an unexpected response instead of a silent `undefined`.
 */
export async function unwrap<T>(result: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  const { data, response } = await result;
  if (data === undefined) {
    const url = response.url ? new URL(response.url) : undefined;
    throw new ApiError({
      kind: "unexpected_response",
      message: messageFor("unexpected_response", undefined),
      method: "GET",
      path: url ? `${url.pathname}${url.search}` : "",
      status: response.status,
      requestId: response.headers.get(REQUEST_ID_HEADER) ?? undefined,
    });
  }
  return data;
}
