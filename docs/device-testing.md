# Device testing procedure (Phase D)

**Status: NOT EXECUTED. BLOCKED.** There is no Expo application, no staging backend and no physical device connected to this work.
Nothing in this document has been run on a phone. Results from Node tests or the Docker stack are real evidence for the
transport code, but they are **not** device evidence and must never be recorded as such.

This is the procedure to follow once the prerequisites exist, with a place to record evidence.

## Environments are not interchangeable

| Environment | What it can prove | What it cannot prove |
|---|---|---|
| Node test (`npm test`, `npm run test:smoke`) | Transport logic, retry rules, URL rules, backend contract, server behavior | Anything about React Native, a phone's network stack, TLS, or OS permissions |
| Android emulator | RN runtime behavior (`fetch`, `Request`, `FormData`, `AbortSignal`) on Android; `10.0.2.2` host access | Real radio networks, carrier NAT, battery/background limits, real file pickers and cameras |
| iOS simulator (needs a Mac) | RN runtime behavior on iOS; `localhost` host access | Same as above, plus App Transport Security on real devices |
| **Physical Android phone** | Everything this phase claims for Android | |
| **Physical iPhone** | Everything this phase claims for iOS | |

Exit gate D1 requires the two physical rows.

## Prerequisites (all currently missing)

1. The Expo project (Phase 2.1) with `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_SUPABASE_URL`,
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and a development build installed on each phone (Expo Go is not used).
2. A staging backend over **https** that includes this phase's backend changes **and** the database migration
   `202610290001_client_request_ids.sql`, with its own Supabase project.
3. Two staging test members (A and B) and a third (C) for the "stranger" checks; credentials in a password manager.
4. A real `FileUploader` for the platform (file picker plus streaming upload) and the session adapter from Phase 2.2.
5. `LOG_LEVEL=info` on staging, so request ids and client headers appear in server logs.
6. For a local backend: the computer's LAN IP, a phone on the same Wi-Fi, `SUPABASE_PUBLIC_URL` set to that address, and
   `allowInsecureHttp` in a development build only.

## Test cases

Run each on: Android emulator, iOS simulator, **physical Android**, **physical iPhone**. Record PASS, FAIL or BLOCKED, the app
version and build, the OS version, the network, and the request ids (`ApiError.requestId` / server log) for failures.

| # | Case | Steps | Expected |
|---|---|---|---|
| 1 | HTTPS connectivity | Open the app on mobile data and on Wi-Fi; load the feed. | Works on both; the request carries `Authorization`; no cleartext traffic. |
| 2 | `localhost` pitfall | Configure `http://localhost:8080` for a physical phone. | The app refuses to start with the explanatory configuration error (it must not silently fail at runtime). |
| 3 | Auth and session persistence | Sign in, kill the app, reopen. | Session restored; `GET /api/auth/me` returns the member. |
| 4 | Expired token | Make the access token expire (wait, or revoke the session). | `403 AUTH_TOKEN_INVALID` maps to `unauthorized`; the app refreshes once and repeats; no repeat loop. |
| 5 | Client headers | Make any request; read the staging log. | `clientPlatform` and `clientVersion` appear and match the build (for example `1.0.0+1`). |
| 6 | Image upload | Pick a photo from the library and post it. | Upload succeeds; the post shows the image; the object name starts with the member's id. |
| 7 | File upload | Upload a PDF as a resource and a document in chat. | Succeeds within the size limit; larger than `maxBytes` is refused before sending. |
| 8 | Upload cancel | Start a large upload and cancel. | `cancelled`; no error shown; the next upload works. |
| 9 | Upload over a bad network | Toggle airplane mode mid-upload, then restore. | The transfer retries within its bounds or fails with `network`; if the first PUT had landed, the retry completes via `KeyAlreadyExists` handling; no duplicate post. |
| 10 | Private media | Open a chat image and a resource file. | Bytes match; no bearer token reaches the storage host (check a proxy log). |
| 11 | Signed URL expiry | Open an attachment, wait until the link expires (5 min), open it again. | One transparent refresh through the API; the file opens. |
| 12 | Revoked access | While viewing a link, remove the member from the conversation or block them; wait for expiry; reopen. | The API answers 403; `forbidden` is shown; no loop. |
| 13 | Redirects | Open the resource file via `fileDownloadUrl` and a profile picture endpoint. | Resolved against the API origin; opens; behavior is the same on both platforms. |
| 14 | Timeout | Throttle the network (very slow). | JSON calls fail with `timeout` after about 15 s; uploads allow about 120 s; the UI recovers. |
| 15 | Offline to online | Send a chat message in airplane mode, restore the network. | The queued send retries with the same `Idempotency-Key`; exactly one message appears for the recipient. |
| 16 | Idempotent retry | Send a message while the connection drops after the request is sent. | After recovery there is exactly one message; the response has `Idempotent-Replayed: true`. |
| 17 | Rate limiting | Trigger a 429 (rapid actions on a shared Wi-Fi). | `rate_limited` with `Retry-After`; the app waits at most 15 s, otherwise shows the message. Note the shared-IP limit (see risks). |
| 18 | Foreground and background | Start a request, background the app, return. | No crash; the request either completes or fails cleanly (`network`/`timeout`); timers are not leaked. |

## Runtime questions to answer on the first device run

These are the assumptions in [api-transport.md](api-transport.md) section 4. For each, record yes or no and the RN/Expo version:
`Request.clone()` with a body works; `FormData` multipart exposes no `Content-Type` (so `callOptions({ upload: true })` is
required); `TextDecoder` exists; `crypto.randomUUID` exists; `response.arrayBuffer()` works on large JSON; `Object.defineProperty`
on `Response.url` works; `response.body` is not a stream on the default fetch.

## Evidence template

```text
Case: <number and name>        Result: PASS | FAIL | BLOCKED
Device: <model>, <OS version>  Build: <app version>+<build>  Network: <wifi | mobile | throttled>
Backend: <staging url>, contract <version>, backend commit <sha>
Request ids: <ids from ApiError.requestId or the server log>
Notes / screenshots: <where stored>
```

## Reproducible local setup for a phone on the same Wi-Fi (development builds only)

1. In the backend repo run the Docker stack with `SUPABASE_PORT` and `WEB_PORT` unchanged and `SUPABASE_PUBLIC_URL=http://<LAN IP>:8000`
   (rebuild the web image after changing it; the address is baked in at build time).
2. Allow the ports through the computer's firewall for the private network only.
3. Set `EXPO_PUBLIC_API_BASE_URL=http://<LAN IP>:8080`, `EXPO_PUBLIC_APP_ENV=development`, and build the development client with
   cleartext HTTP allowed for development only (Android `usesCleartextTraffic`, iOS ATS exception), never in staging or production.
4. Never use production credentials against this stack.
