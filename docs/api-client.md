# API client (transport layer)

Handwritten code in `src/services/api/` wraps the generated types. Feature code imports from `src/services/api` only and never writes its own
endpoint request/response interfaces.

```ts
import { createApiClient, getCurrentMember, isApiError } from "../services/api";

const api = createApiClient({
  baseUrl: resolveApiBaseUrl(process.env),           // https://... origin from configuration
  getAccessToken: async () => session?.access_token, // from the app's Supabase session
});

const me = await getCurrentMember(api);               // typed as Me
const { data } = await api.GET("/api/feed", { params: { query: { page: 1 } } }); // typed from the contract
```

## Generated vs handwritten

| Generated (do not edit) | Handwritten |
|---|---|
| `generated/schema.d.ts`: `paths`, `components`, `operations` | `client.ts` transport, `errors.ts`, `config.ts`, `requestId.ts`, `endpoints/*.ts` |

## Behavior

| Concern | Behavior |
|---|---|
| Base URL | Absolute origin; `https` required. `http` only with `allowInsecureHttp` **and** `environment: "development"` (a local Docker stack). Paths in the contract already start with `/api`, so the URL must not contain a path. `localhost` on a phone is the phone: use the computer's LAN IP, a tunnel, or staging. `resolveApiBaseUrl(env)` reads `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_APP_ENV` (wired in Phase 2.1). No URL is hardcoded. |
| Authentication | `getAccessToken()` is called for each request, so a refreshed Supabase session is picked up immediately. The client stores no token and does not refresh sessions; session lifecycle stays with the Supabase client (Phase 2.2). An `Authorization` header set by the caller is respected. Pass `anonymous` (`api.GET("/api/health", anonymous)`) to skip the token for public calls or optional-auth routes, because an expired token on an optional-auth route is rejected. If the provider throws, the call fails with `unauthorized` and no request is sent. |
| Request ids | Every request carries `X-Request-Id` (UUID, or `m-...` fallback when `crypto.randomUUID` is missing). A caller-supplied id is kept. Errors carry `requestId`: the server's echo when present, else the id sent. The backend echoes ids from contract 1.0.0; against an older backend only the client-sent id is available. |
| Timeouts | 15 s for JSON requests, 120 s for multipart (uploads), configurable (`timeoutMs`, `uploadTimeoutMs`). The timer covers connect, headers and reading the body, and is always cleared. |
| Cancellation | Pass `{ signal }` to any call. A caller abort yields `kind: "cancelled"`; a signal from `AbortSignal.timeout()` yields `timeout`. If a client timeout and a caller abort both happen, the first one is reported. A signal that is already aborted sends nothing. |
| Response checks | A 2xx whose body is not valid JSON (for example a captive-portal HTML page) is reported as `unexpected_response`, not passed to feature code. |
| Retries | **None.** The transport never retries or replays anything. Reads can be retried by the caller (TanStack Query); mutations need idempotency keys, which the backend does not offer yet (Phase 1.2). |
| Logging | The transport logs nothing. `ApiError.toJSON()` contains no token, header or body. |

## Errors

Every failure is an `ApiError` with `kind`, `status`, `code`, `requestId`, `method`, `path` and (for 429) `retryAfterSeconds`.

| `kind` | When | Typical handling |
|---|---|---|
| `unauthorized` | 401, or 403 with `AUTH_TOKEN_INVALID`/`AUTH_TOKEN_REQUIRED` | Refresh the session once and retry; if it fails again, sign out. (`error.isTokenRejected`) |
| `forbidden` | 403 otherwise. `code: MEMBERSHIP_REQUIRED` means signed in but not an active member (`error.isMembershipRequired`). | Do not retry. Show the message. |
| `validation` | 400 | Show `error.message` (written for users). |
| `not_found` / `conflict` | 404 / 409 | Screen-specific. |
| `rate_limited` | 429 | Wait `retryAfterSeconds`. |
| `server` | 5xx | Generic message; offer retry. Server detail is never shown. |
| `network` | No response (offline, DNS, TLS, refused) | Offline UI / retry. |
| `timeout` | Client timeout or `AbortSignal.timeout` | Retry for reads. |
| `cancelled` | Caller aborted | Ignore. |
| `unexpected_response` | Non-JSON 2xx, empty body where data was required | Treat as a transport problem. |

Note that the backend reports an **expired access token as 403**, so classification uses the `code` field, which exists from contract 1.0.0
(backend commits that add it must be deployed before a mobile build that depends on it).

## Verified by tests

`tests/api/*.test.ts` (offline, real local HTTP server, no mocks of the transport): token injection and refresh, anonymous calls, request ids,
every error kind, `Retry-After`, malformed and HTML success bodies, refused connections, timeouts, upload timeout, cancellation (already aborted,
mid-flight, after completion, reuse), first-cause-wins races, timer cleanup, no retries for reads or mutations, base URL rules. Live checks are in
[staging-smoke-tests.md](staging-smoke-tests.md).

## Not done here (later phases)

Supabase session adapter and SecureStore persistence (2.2), multipart/signed upload helpers and idempotency (1.2), TanStack Query conventions (2.2),
React Native on-device verification of `Request`/`AbortSignal` behavior (2.1).
