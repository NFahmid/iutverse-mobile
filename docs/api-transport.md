# Cross-platform API transport (specification)

How the mobile app talks to the backend, and how that differs from the browser. Implementation: `src/services/api/`. The
backend's side of the same agreement is in the backend repo, `docs/mobile-integration/transport.md`.

Status words used here: **verified** means observed against the backend's real Docker stack or by an automated test;
**assumed** means reasoned from documentation and NOT yet observed on a React Native runtime or a device.

## 1. Web is unchanged

The browser keeps calling relative `/api` paths of its own origin. Phase D adds nothing the web client must use, relaxes no CORS
rule, and changes no route or response. Native requests send no `Origin` header, so CORS does not apply to them. (Verified: the
backend's full test suite, including its existing web and CORS tests, passes; the only response differences are additive.)

## 2. Base URL

* One **absolute origin** per build, from configuration (`EXPO_PUBLIC_API_BASE_URL`, read by `resolveApiBaseUrl`), validated by
  `normalizeBaseUrl`. Paths in the contract already start with `/api`, so the URL has no path.
* `https` is required. `http` is accepted only with `allowInsecureHttp` **and** `EXPO_PUBLIC_APP_ENV=development`.
* Rejected (all tested): empty, relative, a bare `host:port` (with an explanation that `localhost` on a phone is the phone),
  other schemes, embedded username or password, a path, a query or a fragment.
* No URL is hardcoded in source. Do not commit a developer's LAN address.

| Where the app runs | How it reaches a backend on your computer |
|---|---|
| Physical phone | The computer's LAN IP (`http://192.168.x.y:8080`, development build only), or a tunnel, or staging over https. `localhost` is the phone. |
| Android emulator | `http://10.0.2.2:8080` is the host machine. |
| iOS simulator | `http://localhost:8080` is the host machine (it shares the Mac's network). |
| Staging / production | `https://...` only. |

For a local Docker stack, `SUPABASE_PUBLIC_URL` must also be an address the phone can reach, because the Storage URLs the API
returns are built from it (verified: public image URLs and signed upload URLs use it).

## 3. Headers

| Header | Behavior |
|---|---|
| `Authorization: Bearer` | From `getAccessToken()` on every attempt (so a retry uses a refreshed token). Never sent to Storage hosts. Skipped with `callOptions({ anonymous: true })`. |
| `X-Request-Id` | UUID per logical request, the same on every retry. The server's echo is used in errors. |
| `X-Client-Platform`, `X-Client-Version` | Optional. `clientInfo: { platform: "android" \| "ios", version: "1.4.0", build: 57 }` sends `android` and `1.4.0+57`. Validated when the client is created; the backend ignores malformed values and never uses them for authorization. Verified by backend and mobile tests. Seen in server logs only at `LOG_LEVEL=info`. |
| `Idempotency-Key` | Caller supplied (section 6). |

## 4. Native runtime compatibility (JSON transport)

Verified: Node 24 (`fetch`, `Request`, `AbortController`), 202 offline tests, and a live run against the Docker backend.
**Assumed, to be checked in the Expo app (Phase 2.1) on Android and iOS:**

| Runtime feature used | Concern |
|---|---|
| `new Request(request, { headers, signal })` and `request.clone()` | React Native's `Request` comes from a fetch polyfill; cloning with a body, and combining a signal, must be checked. |
| `FormData` request bodies | RN builds multipart from `{ uri, name, type }` parts and may not expose a multipart `Content-Type` on the `Request`. The transport therefore does not rely on that header: `callOptions({ upload: true })` selects the upload timeout. |
| `response.arrayBuffer()`, `new Response(bytes, ...)` | Expected in current RN; verify. |
| `TextDecoder` | Needed to parse JSON bodies; availability in Hermes depends on the RN version. Verify; a tiny polyfill is the fallback. |
| `crypto.randomUUID` | Often missing in Hermes; `createRequestId` has a time-and-random fallback (tested) that still satisfies the backend's id format. |
| `AbortSignal.timeout` | Not used by the transport (it uses its own timer). Callers that pass it are classified as timeouts. |
| `Object.defineProperty(response, "url", ...)` | Used so `unwrap` can report a path; verify the property is configurable on RN's `Response`. |
| Redirects | The transport never depends on them: private files use `?redirect=false` JSON. Whether RN forwards an Authorization header across a redirect is therefore irrelevant for the supported flows. |

If any of these fail on a device, the fix belongs in a thin platform adapter, not in feature code.

## 5. JSON versus binary: no buffering of files

The JSON client (`createApiClient`) reads each response fully into memory, validates it is JSON, and rebuilds a `Response`.
That is correct and simple for API documents (a few KB) and bounds a stalled body with the timer. It is **wrong for files**, so
files never use it:

* Downloads: `fetchPrivateFile` returns the storage `Response` **unread**; the caller streams or reads it once.
* Uploads: `uploadFile` sends through a `FileUploader`; the default one holds the file in memory (fine for images and small
  documents). A native uploader that streams from a file URI (and reports progress) is the right choice for large files; it is
  an adapter behind the same interface and needs a device to verify.
* In React Native's default `fetch`, a response body is generally not a stream (assumed); streaming downloads to disk need a native
  download API. The interface leaves room for it; it is not implemented.

## 6. Retries (explicit, bounded, tested)

| Request | Class | Retried when | Not retried |
|---|---|---|---|
| `GET`, `HEAD` | read | network error, timeout, 502, 503, 504, 429 | 4xx other than 429, plain 500, cancellation |
| `POST /api/uploads` | repeat-safe | same as reads (it only issues a new slot) | |
| `POST /api/chat/messages`, `/api/posts`, `/api/posts/{id}/comments` **with** `Idempotency-Key` | keyed | same as reads, and also a plain 500 | 400, 401, 403, 404, 409 |
| every other `POST`, `PUT`, `PATCH`, `DELETE`; a keyed POST on any other operation | none | never | |

Defaults: 3 attempts in total, exponential backoff with full jitter (300 ms doubling, capped at 5 s), a `Retry-After` is
honored when it is at most 15 s (otherwise the 429 is returned). Cancellation stops retrying and a pending backoff immediately.
Disable with `retry: false`. 401 and 403 are never retried by the transport: an expired token (`403 AUTH_TOKEN_INVALID`) needs a
session refresh in the app, then a deliberate repeat.

**Idempotency usage rule: one key per user action, reused for every retry.**

```ts
const key = createIdempotencyKey();            // when the user taps "send"; keep it with the pending message
await api.POST("/api/chat/messages", { body, headers: idempotencyHeaders(key) });   // the transport reuses it on retries
```

Server-side semantics (replay, conflict, scope, durability): backend `docs/api/idempotency.md`. Verified live: 8 simultaneous
sends with one key created one message; a reply lost on its way back was retried by the transport and returned the original.

## 7. Timeouts and cancellation

15 s per attempt for JSON, 120 s for uploads (`uploadTimeoutMs`), per call via `callOptions({ timeoutMs })`. Pass `{ signal }` to any
call. Whichever of timeout and caller abort happens first is reported; timers and listeners are always cleaned up. File transfers
use the same rule (`withDeadline`).

## 8. Errors

One `ApiError` type with `kind`, `status`, `code`, `requestId`, `path` (never the query), `retryAfterSeconds`. Kinds are listed in
[api-client.md](api-client.md); Phase D adds `expired_link` (a signed link still fails after one refresh). Errors never contain
tokens, signed URLs or response bodies.

## 9. Not covered by automated tests

Everything in section 4 on a real React Native runtime, physical-device networking, TLS behavior on carriers, background upload,
and the offline-to-online transition. The procedure is in [device-testing.md](device-testing.md).
