# Media, uploads and downloads (mobile)

The full contract is in the backend repo: `docs/mobile-integration/media.md` and `uploads.md`. This page is the mobile side:
what to call and what is guaranteed. All behavior described as "verified" was observed against the backend's Docker stack.

## Media URLs

```ts
import { resolveMedia } from "./src/services/api";
const source = resolveMedia(post.imageUrl, { apiBaseUrl });   // { url, requiresAuth } | null
```

| Value from the API | Result |
|---|---|
| Absolute public URL (`https://<storage>/storage/v1/object/public/...`) | unchanged, `requiresAuth: false` |
| `/api/academic/resources/3/file` | `<apiBase>/api/academic/resources/3/file`, `requiresAuth: true` |
| Signed chat URL (`...?token=...`) | unchanged, `requiresAuth: false`; never store or log it |
| `null`, empty | `null` |
| `javascript:`, `data:`, `file:`, `blob:`, `content:`, `//host/x`, `/\host/x`, credentials in the URL, bare storage paths, plain `http` outside development | `null` (refused) |

`redactUrl(url)` removes the query and fragment; use it for any log line that mentions a media URL.
The decision to resolve relative paths in the app rather than change backend response shapes keeps the web client untouched.

**Private media is never an `Image` source by itself.** A chat attachment or a resource file is fetched through
`fetchPrivateFile` (below); a URL with `requiresAuth: true` needs the bearer token in the request headers.

## Uploading a file

```ts
const uploaded = await uploadFile(api, uploader, { purpose: "post", file: { uri, name, mimeType, size }, signal, onProgress });
await api.POST("/api/posts", { body: { content, uploadPath: uploaded.path }, headers: idempotencyHeaders(key) });
```

What `uploadFile` does, in order (verified): requests a slot (`POST /api/uploads`, retried because it creates nothing); refuses a file
larger than the slot's `maxBytes` before sending any bytes; asks for a fresh slot if the first closes within 10 s; `PUT`s the raw
bytes to `signedUrl` with `Content-Type` and **no Authorization header**; retries transient failures with backoff.

* **Retry after a lost response.** If a `PUT` produced no answer and the retry gets HTTP 400 `KeyAlreadyExists`, the first one had
  arrived: the upload counts as done. The same answer on the first attempt is an error.
* **Closed slot.** `400 InvalidJWT`: one new slot, then `expired_link` (no loop). Slot lifetime varies by deployment (about 1
  minute on the Docker stack), so upload right after requesting.
* **Content is verified by the server, not the phone.** Storage accepts any bytes at the `PUT`. When the `uploadPath` is used,
  the API checks owner, size, magic bytes and declared type and deletes a non-matching object (verified). A client must
  be ready for `400 validation` at that second step.
* **Orphans.** An upload that is never used stays in Storage until a server-side sweep (a backend follow-up).
* **Cancellation** aborts the transfer; the partly or fully uploaded object becomes an orphan.

The default uploader (`createFetchUploader`) keeps the file in memory and reports progress only at start and end. For large
files and real progress use a native uploader that streams from the file URI behind the `FileUploader` interface (for example
`expo-file-system`'s upload task). That adapter is **not written yet** because the Expo project does not exist; it needs a device.

## Opening a private file

```ts
const cache = createSignedUrlCache(api);                              // in memory only
const response = await fetchPrivateFile(cache, { kind: "chatAttachment", messageId });   // unread storage Response
```

Verified: the API is asked with `?redirect=false` and answers `{ url, expiresAt }` (about 5 minutes); the file is fetched from
storage without the bearer token; bytes arrive intact; a participant succeeds, a stranger gets 403, an anonymous caller 401.
If storage rejects the link (expired or tampered: HTTP 400 `InvalidJWT`), the API is asked for a **new** link once, which
re-checks authorization: revoked access surfaces as the API's 403; a second failure is `expired_link`. Links are cached in memory
only, with a 15 s safety margin, and concurrent requests share one API call.

## Security notes

* Signed upload and download URLs are secrets while valid: never log (use `redactUrl`), never persist, never put in analytics.
* The bearer token goes to the API origin only.
* The server, not the client, decides what a file is (magic bytes). Client-side MIME checks are convenience only.
* **Known backend issue affecting the app:** an anonymous post with an image leaks its author's user id through the image URL
  (confirmed live). Do not offer images on anonymous posts until the backend fixes this (backend `docs/mobile-integration/media.md`).
