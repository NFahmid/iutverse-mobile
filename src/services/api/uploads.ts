import type { ApiClient } from "./client";
import { unwrap } from "./client";
import { withDeadline } from "./deadline";
import { ApiError, kindForResponse, messageFor } from "./errors";
import type { components } from "./generated/schema";
import { abortableSleep, DEFAULT_RETRY, decideRetry, type RetryOptions } from "./retry";

/**
 * Native uploads (docs/media-and-uploads.md). The backend's signed-upload flow, verified against its Docker stack:
 *
 *   1. POST /api/uploads            the API checks purpose, type and size and returns a signed upload slot
 *                                   (`signedUrl`, `path`, `maxBytes`, `expiresAt`). The slot can be short lived
 *                                   (about 1 minute on the Docker stack, longer on hosted Supabase): read `expiresAt`.
 *   2. PUT <signedUrl>              the file's raw bytes with a Content-Type header, straight to Supabase Storage.
 *                                   No multipart body is needed, and NO Authorization header is sent (the token is in
 *                                   the URL), so the bearer token never goes to the storage host.
 *   3. send `uploadPath: <path>`    to the route that uses the file (post, profile picture, chat message, ...). The API
 *                                   then verifies the stored bytes (size, magic bytes, declared type) and deletes the
 *                                   object if they do not match. Until that call the upload is an unused orphan.
 *
 * The reading and sending of the file itself is platform specific, so it sits behind `FileUploader`. This module is
 * pure TypeScript and is tested in Node; a React Native uploader (for example based on expo-file-system's upload
 * tasks, which stream from a file URI and report progress) is a small adapter and must be verified on a device.
 */
export type UploadPurpose = components["schemas"]["UploadIntentRequest"]["purpose"];
export type UploadIntent = components["schemas"]["UploadIntent"];

export interface FileRef {
  /** Native file URI (for example `file:///...` from an image picker). */
  uri: string;
  name: string;
  mimeType: string;
  /** Size in bytes, from the picker or file info. */
  size: number;
  /** The bytes, when they are already in memory (tests, web). Native code normally leaves this out. */
  body?: Blob | ArrayBuffer | Uint8Array;
}

export interface UploadProgress {
  sentBytes: number;
  totalBytes: number;
}

export interface PutFileArgs {
  url: string;
  headers: Record<string, string>;
  file: FileRef;
  signal: AbortSignal;
  onProgress?: (progress: UploadProgress) => void;
}

export interface PutFileResult {
  status: number;
  /** Response text, used only to recognise storage error codes. */
  body: string;
}

/**
 * Sends one file with an HTTP PUT. Resolves with the status for ANY HTTP response (including 4xx and 5xx); rejects only
 * when no response was received (network failure) or the signal aborted. Must not add an Authorization header.
 */
export interface FileUploader {
  putFile(args: PutFileArgs): Promise<PutFileResult>;
}

/**
 * Uploader built on `fetch`. It sends `file.body`, or reads the file from `file.uri` into memory first. Reading a whole
 * file into memory is acceptable for images and small documents, not for large videos: use a streaming native uploader
 * there. Progress is reported only at the start and the end.
 */
export const createFetchUploader = (fetchImpl: typeof fetch = globalThis.fetch): FileUploader => ({
  async putFile({ url, headers, file, signal, onProgress }) {
    const body: BodyInit = (file.body as BodyInit | undefined) ?? (await (await fetchImpl(file.uri, { signal })).blob());
    onProgress?.({ sentBytes: 0, totalBytes: file.size });
    const response = await fetchImpl(url, { method: "PUT", headers, body, signal });
    const text = await response.text();
    onProgress?.({ sentBytes: file.size, totalBytes: file.size });
    return { status: response.status, body: text };
  },
});

export interface UploadOptions {
  purpose: UploadPurpose;
  file: FileRef;
  /** Required when purpose is `chat`. */
  conversationId?: number;
  signal?: AbortSignal;
  onProgress?: (progress: UploadProgress) => void;
  /** Time allowed for the file transfer itself. Default 120 s. */
  timeoutMs?: number;
  /** Plain http signed URLs are accepted only in development builds. */
  allowInsecureHttp?: boolean;
  retry?: RetryOptions;
  /** For tests. */
  now?: () => number;
}

export interface UploadResult {
  /** Pass as `uploadPath` to the route that uses the file. */
  path: string;
  bucket: string;
  mimeType: string;
  size: number;
}

/** If the slot closes within this many milliseconds, ask for a fresh one before sending the file. */
const MIN_SLOT_REMAINING_MS = 10_000;
const DEFAULT_UPLOAD_TIMEOUT_MS = 120_000;

const storageErrorCode = (body: string): string | undefined => {
  try {
    const parsed = JSON.parse(body) as { code?: unknown; error?: unknown };
    return typeof parsed.code === "string" ? parsed.code : typeof parsed.error === "string" ? parsed.error : undefined;
  } catch {
    return undefined;
  }
};

const isSlotClosed = (status: number, code: string | undefined) => (status === 400 || status === 401 || status === 403) && /jwt|expired/i.test(code ?? "");
const isAlreadyUploaded = (status: number, body: string) => (status === 400 || status === 409) && /KeyAlreadyExists|"409"|Duplicate/i.test(body);

export async function uploadFile(api: ApiClient, uploader: FileUploader, options: UploadOptions): Promise<UploadResult> {
  const { purpose, file } = options;
  const now = options.now ?? Date.now;
  const retry = options.retry ?? {};
  const maxAttempts = retry.maxAttempts ?? DEFAULT_RETRY.maxAttempts;
  const sleep = retry.sleep ?? abortableSleep;
  const callerSignal = options.signal ?? new AbortController().signal;
  const localError = (message: string) => new ApiError({ kind: "validation", message, method: "PUT", path: "/upload" });

  if (!file.name || !file.mimeType) throw localError("The file needs a name and a type.");
  if (!Number.isInteger(file.size) || file.size <= 0) throw localError("The file is empty.");

  const requestIntent = async (): Promise<UploadIntent> => {
    const envelope = await unwrap(
      api.POST("/api/uploads", {
        body: { purpose, mimeType: file.mimeType, size: file.size, ...(options.conversationId !== undefined ? { conversationId: options.conversationId } : {}) },
        signal: options.signal,
      })
    );
    const intent = envelope.data;
    const signed = new URL(intent.signedUrl);
    if (signed.protocol !== "https:" && !(signed.protocol === "http:" && options.allowInsecureHttp)) {
      throw new ApiError({ kind: "unexpected_response", message: "The server returned an upload address that is not https.", method: "POST", path: "/api/uploads" });
    }
    if (file.size > intent.maxBytes) throw localError(`File is too large. Maximum size is ${Math.floor(intent.maxBytes / (1024 * 1024))} MB.`);
    return intent;
  };

  // At most two slots: the first, and one replacement if it closed before or during the transfer.
  let intent = await requestIntent();
  for (let slot = 1; slot <= 2; slot += 1) {
    const closesIn = intent.expiresAt ? Date.parse(intent.expiresAt) - now() : Infinity;
    if (closesIn < MIN_SLOT_REMAINING_MS && slot === 1) {
      intent = await requestIntent();
      continue;
    }

    const objectPath = new URL(intent.signedUrl).pathname; // path only: the query holds the signed token
    let closed = false;
    for (let attempt = 1; ; attempt += 1) {
      let result: PutFileResult;
      try {
        result = await withDeadline({ signal: options.signal, timeoutMs: options.timeoutMs ?? DEFAULT_UPLOAD_TIMEOUT_MS, method: "PUT", path: objectPath }, (signal) =>
          uploader.putFile({ url: intent.signedUrl, headers: { "Content-Type": file.mimeType }, file, signal, onProgress: options.onProgress })
        );
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;
        // No response: the object may or may not have arrived. A repeat of the same PUT is safe (see KeyAlreadyExists below).
        const decision = decideRetry("repeat_safe", error, attempt, { ...retry, maxAttempts });
        if (!decision.retry) throw error;
        await sleepOrCancel(sleep, decision.delayMs, callerSignal, error);
        continue;
      }

      const code = storageErrorCode(result.body);
      if (result.status >= 200 && result.status < 300) return { path: intent.path, bucket: intent.bucket, mimeType: intent.mimeType, size: file.size };
      // A repeat of a PUT that already succeeded: Storage answers "already exists". The first PUT therefore arrived in full,
      // and the API verifies the bytes when the object is used, so this counts as uploaded.
      if (attempt > 1 && isAlreadyUploaded(result.status, result.body)) return { path: intent.path, bucket: intent.bucket, mimeType: intent.mimeType, size: file.size };
      if (isSlotClosed(result.status, code)) {
        closed = true;
        break;
      }

      const kind = result.status === 413 ? "validation" : kindForResponse(result.status, undefined);
      const failure = new ApiError({ kind, message: messageFor(kind, undefined), method: "PUT", path: objectPath, status: result.status });
      const decision = decideRetry("repeat_safe", failure, attempt, { ...retry, maxAttempts });
      if (!decision.retry) throw failure;
      await sleepOrCancel(sleep, decision.delayMs, callerSignal, failure);
    }

    if (closed && slot === 1) {
      intent = await requestIntent();
      continue;
    }
    throw new ApiError({ kind: "expired_link", message: messageFor("expired_link", undefined), method: "PUT", path: objectPath });
  }
  throw new ApiError({ kind: "expired_link", message: messageFor("expired_link", undefined), method: "PUT", path: "/upload" });
}

async function sleepOrCancel(sleep: (ms: number, signal: AbortSignal) => Promise<void>, ms: number, signal: AbortSignal, last: ApiError): Promise<void> {
  try {
    await sleep(ms, signal);
  } catch {
    throw new ApiError({ kind: "cancelled", message: messageFor("cancelled", undefined), method: last.method, path: last.path, requestId: last.requestId });
  }
}
