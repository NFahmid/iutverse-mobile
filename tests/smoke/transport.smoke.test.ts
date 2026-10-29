// Live check of the cross-platform transport against a running backend (staging, or the backend's local Docker stack):
// direct uploads, media URLs, private signed downloads, expired links, and retry-safe creates under real concurrency.
// It writes data (posts, comments, messages, files) as dedicated test members, so only point it at a NON-PRODUCTION backend.
//
//   SMOKE_API_BASE_URL, SMOKE_SUPABASE_URL, SMOKE_SUPABASE_ANON_KEY   the backend and its Supabase project
//   SMOKE_EMAIL, SMOKE_PASSWORD                                      test member A
//   SMOKE_EMAIL_2, SMOKE_PASSWORD_2                                  test member B (needed for the chat tests)
//   SMOKE_ALLOW_INSECURE_HTTP=1                                      only for a local Docker stack over http
//   SMOKE_DOCKER_JWT_SECRET                                          only for the Docker stack's public demo secret; enables the expired-link test
//   SMOKE_REQUIRED=1                                                 fail instead of skipping when configuration is missing
import crypto from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import {
  ApiError,
  createApiClient,
  createFetchUploader,
  createIdempotencyKey,
  createSignedUrlCache,
  fetchPrivateFile,
  idempotencyHeaders,
  requestSignedUrl,
  resolveMedia,
  uploadFile,
  type ApiClient,
  type FileUploader,
  type SignedUrlCache,
} from "../../src/services/api";

const env = process.env;
const base = ["SMOKE_API_BASE_URL", "SMOKE_SUPABASE_URL", "SMOKE_SUPABASE_ANON_KEY", "SMOKE_EMAIL", "SMOKE_PASSWORD"];
const missing = base.filter((name) => !env[name]);
const missingSecond = ["SMOKE_EMAIL_2", "SMOKE_PASSWORD_2"].filter((name) => !env[name]);

if (env.SMOKE_REQUIRED === "1" && (missing.length || missingSecond.length)) {
  describe("transport smoke configuration", () => {
    it("is complete (SMOKE_REQUIRED=1)", () => {
      throw new Error(`Missing smoke-test configuration: ${[...missing, ...missingSecond].join(", ")}`);
    });
  });
}

const PNG = new Uint8Array(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
const signIn = async (email: string, password: string) => {
  const response = await fetch(`${env.SMOKE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: env.SMOKE_SUPABASE_ANON_KEY!, "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Supabase sign-in failed with HTTP ${response.status}`);
  const body = (await response.json()) as { access_token: string; user: { id: string } };
  return { token: body.access_token, id: body.user.id };
};

describe.skipIf(missing.length > 0 || missingSecond.length > 0)("live transport", () => {
  const baseUrl = env.SMOKE_API_BASE_URL!;
  const allowInsecureHttp = env.SMOKE_ALLOW_INSECURE_HTTP === "1";
  const run = Date.now().toString(36);
  const media = { apiBaseUrl: baseUrl, allowInsecureHttp };
  let a: { token: string; id: string };
  let b: { token: string; id: string };
  let apiA: ApiClient;
  let apiB: ApiClient;
  let conversationId: number;

  const clientFor = (getToken: () => string | null, fetchImpl?: typeof fetch) =>
    createApiClient({ baseUrl, allowInsecureHttp, getAccessToken: getToken, clientInfo: { platform: "android", version: "1.0.0", build: 1 }, retry: { baseDelayMs: 50, maxDelayMs: 200 }, ...(fetchImpl ? { fetch: fetchImpl } : {}) });
  const file = (over: object = {}) => ({ uri: "file:///smoke/a.png", name: "a.png", mimeType: "image/png", size: PNG.byteLength, body: PNG, ...over });

  beforeAll(async () => {
    a = await signIn(env.SMOKE_EMAIL!, env.SMOKE_PASSWORD!);
    b = await signIn(env.SMOKE_EMAIL_2!, env.SMOKE_PASSWORD_2!);
    apiA = clientFor(() => a.token);
    apiB = clientFor(() => b.token);
    const response = await fetch(`${baseUrl}/api/chat/conversations`, { method: "POST", headers: { authorization: `Bearer ${a.token}`, "content-type": "application/json" }, body: JSON.stringify({ otherUserId: b.id }) });
    const body = (await response.json()) as { data?: { id: number }; conversation?: { id: number }; id?: number };
    conversationId = (body.data?.id ?? body.conversation?.id ?? body.id)!;
  });

  describe("uploads and media", () => {
    it("uploads an image straight to storage; a post that uses it gets a public absolute URL the app can resolve and fetch", async () => {
      const uploaded = await uploadFile(apiA, createFetchUploader(), { purpose: "post", file: file(), allowInsecureHttp });
      const created = await apiA.POST("/api/posts", { body: { content: `smoke image ${run}`, uploadPath: uploaded.path }, headers: idempotencyHeaders(createIdempotencyKey()) });
      expect(created.response.status).toBe(201);
      const imageUrl = (created.data as { data: { imageUrl: string | null } }).data.imageUrl;
      const source = resolveMedia(imageUrl, media);
      expect(source, "imageUrl should resolve").not.toBeNull();
      expect(source!.requiresAuth).toBe(false);
      const image = await fetch(source!.url);
      expect(image.status).toBe(200);
      expect(image.headers.get("content-type")).toBe("image/png");
      expect(new Uint8Array(await image.arrayBuffer())).toEqual(PNG);
    });

    it("the server rejects bytes that are not the declared image type, and removes the object", async () => {
      const fake = new Uint8Array(Buffer.from("this is not an image at all"));
      const uploaded = await uploadFile(apiA, createFetchUploader(), { purpose: "post", file: file({ body: fake, size: fake.byteLength }), allowInsecureHttp });
      await expect(apiA.POST("/api/posts", { body: { content: "bad", uploadPath: uploaded.path } })).rejects.toMatchObject({ kind: "validation", status: 400 });
      await expect(apiA.POST("/api/posts", { body: { content: "bad", uploadPath: uploaded.path } })).rejects.toMatchObject({ kind: "validation", status: 400 });
    });

    it("a lost upload response is recovered: the retry sees 'already exists' and the upload counts as done", async () => {
      const real = createFetchUploader();
      let lost = false;
      const lossy: FileUploader = {
        async putFile(args) {
          const result = await real.putFile(args);
          if (!lost) {
            lost = true;
            throw new TypeError("connection reset after the server stored the file");
          }
          return result;
        },
      };
      const uploaded = await uploadFile(apiA, lossy, { purpose: "post", file: file(), allowInsecureHttp, retry: { baseDelayMs: 10, maxDelayMs: 20 } });
      expect(lost).toBe(true);
      const created = await apiA.POST("/api/posts", { body: { content: `recovered upload ${run}`, uploadPath: uploaded.path } });
      expect(created.response.status).toBe(201);
    });
  });

  describe("retry-safe creates", () => {
    it("eight simultaneous sends with one key create exactly one message", async () => {
      const key = createIdempotencyKey();
      const sends = await Promise.all(
        Array.from({ length: 8 }, () => apiA.POST("/api/chat/messages", { body: { conversationId, content: `once ${run}` }, headers: idempotencyHeaders(key) }))
      );
      const ids = new Set(sends.map((s) => (s.data as { data: { id: number } }).data.id));
      expect(ids.size).toBe(1);
      expect(sends.filter((s) => s.response.headers.get("idempotent-replayed") === "true")).toHaveLength(7);
      const listed = await apiA.GET("/api/chat/conversations/{conversationId}/messages", { params: { path: { conversationId } } });
      const messages = ((listed.data as any).data?.messages ?? (listed.data as any).data ?? []) as { content: string }[];
      expect(messages.filter((m) => m.content === `once ${run}`)).toHaveLength(1);
    });

    it("a response lost on the way back is retried by the transport with the same key and returns the original message", async () => {
      let dropped = false;
      const lossy = (async (input: Request) => {
        const response = await fetch(input);
        if (!dropped && input.method === "POST" && input.url.endsWith("/api/chat/messages")) {
          dropped = true;
          await response.arrayBuffer();
          throw new TypeError("response lost");
        }
        return response;
      }) as typeof fetch;
      const flaky = clientFor(() => a.token, lossy);
      const key = createIdempotencyKey();
      const sent = await flaky.POST("/api/chat/messages", { body: { conversationId, content: `retried ${run}` }, headers: idempotencyHeaders(key) });
      expect(dropped).toBe(true);
      expect(sent.response.status).toBe(201);
      expect(sent.response.headers.get("idempotent-replayed")).toBe("true"); // the server had already created it
      const listed = await apiA.GET("/api/chat/conversations/{conversationId}/messages", { params: { path: { conversationId } } });
      const messages = ((listed.data as any).data?.messages ?? (listed.data as any).data ?? []) as { content: string }[];
      expect(messages.filter((m) => m.content === `retried ${run}`)).toHaveLength(1);
    });

    it("the same key with different content is refused with a conflict", async () => {
      const key = createIdempotencyKey();
      await apiA.POST("/api/chat/messages", { body: { conversationId, content: `first ${run}` }, headers: idempotencyHeaders(key) });
      const error = await apiA.POST("/api/chat/messages", { body: { conversationId, content: `second ${run}` }, headers: idempotencyHeaders(key) }).catch((e) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ kind: "conflict", status: 409, code: "IDEMPOTENCY_KEY_REUSED" });
    });

    it("keys are per member, and keyed posts and comments are protected too", async () => {
      const key = createIdempotencyKey();
      const mine = await apiA.POST("/api/chat/messages", { body: { conversationId, content: `shared key ${run}` }, headers: idempotencyHeaders(key) });
      const theirs = await apiB.POST("/api/chat/messages", { body: { conversationId, content: `shared key ${run}` }, headers: idempotencyHeaders(key) });
      expect((theirs.data as any).data.id).not.toBe((mine.data as any).data.id);

      const postKey = createIdempotencyKey();
      const posts = await Promise.all(Array.from({ length: 6 }, () => apiA.POST("/api/posts", { body: { content: `once post ${run}` }, headers: idempotencyHeaders(postKey) })));
      const postIds = new Set(posts.map((p) => (p.data as any).data.id as number));
      expect(postIds.size).toBe(1);

      const commentKey = createIdempotencyKey();
      const [postId] = [...postIds];
      const comments = await Promise.all(Array.from({ length: 6 }, () => apiA.POST("/api/posts/{id}/comments", { params: { path: { id: postId! } }, body: { content: "once comment" }, headers: idempotencyHeaders(commentKey) })));
      expect(new Set(comments.map((c) => (c.data as any).data.id)).size).toBe(1);
    });
  });

  describe("private files and signed downloads", () => {
    let messageId: number;

    it("uploads a chat attachment, sends it with a key, and a participant downloads the exact bytes through a signed URL", async () => {
      const uploaded = await uploadFile(apiA, createFetchUploader(), { purpose: "chat", conversationId, file: file({ name: "chat.png" }), allowInsecureHttp });
      const sent = await apiA.POST("/api/chat/messages", { body: { conversationId, content: "", uploadPath: uploaded.path, attachmentName: "chat.png" }, headers: idempotencyHeaders(createIdempotencyKey()) });
      expect(sent.response.status).toBe(201);
      messageId = (sent.data as any).data.id;

      for (const api of [apiA, apiB]) {
        const cache = createSignedUrlCache(api);
        const signed = await requestSignedUrl(api, { kind: "chatAttachment", messageId });
        expect(signed.expiresAt.getTime()).toBeGreaterThan(Date.now());
        const response = await fetchPrivateFile(cache, { kind: "chatAttachment", messageId }, { fetch: globalThis.fetch });
        expect(new Uint8Array(await response.arrayBuffer())).toEqual(PNG);
      }
    });

    it("refuses someone who is not signed in", async () => {
      const nobody = clientFor(() => null);
      await expect(requestSignedUrl(nobody, { kind: "chatAttachment", messageId })).rejects.toMatchObject({ kind: "unauthorized", status: 401 });
    });

    it.skipIf(!env.SMOKE_DOCKER_JWT_SECRET)("an expired signed link is refreshed once through the API and the file is delivered", async () => {
      const fresh = await requestSignedUrl(apiA, { kind: "chatAttachment", messageId });
      const url = new URL(fresh.url);
      const objectUrl = (JSON.parse(Buffer.from(url.searchParams.get("token")!.split(".")[1]!, "base64url").toString()) as { url: string }).url;
      const part = (v: object) => Buffer.from(JSON.stringify(v)).toString("base64url");
      const head = part({ alg: "HS256", typ: "JWT" });
      const body = part({ url: objectUrl, iat: Math.floor(Date.now() / 1000) - 600, exp: Math.floor(Date.now() / 1000) - 300 });
      const sig = crypto.createHmac("sha256", env.SMOKE_DOCKER_JWT_SECRET!).update(`${head}.${body}`).digest("base64url");
      const expired = new URL(url);
      expired.searchParams.set("token", `${head}.${body}.${sig}`);

      // Storage itself says what an expired link looks like.
      const direct = await fetch(expired);
      expect(direct.status).toBe(400);
      expect(await direct.text()).toContain("InvalidJWT");

      const real = createSignedUrlCache(apiA);
      let invalidated = 0;
      let first = true;
      const cache: SignedUrlCache = {
        get: async (f, signal) => (first ? ((first = false), { url: expired.toString(), expiresAt: new Date(Date.now() + 300_000) }) : real.get(f, signal)),
        invalidate: (f) => {
          invalidated += 1;
          real.invalidate(f);
        },
        clear: () => real.clear(),
      };
      const response = await fetchPrivateFile(cache, { kind: "chatAttachment", messageId });
      expect(invalidated).toBe(1);
      expect(new Uint8Array(await response.arrayBuffer())).toEqual(PNG);
    });
  });

  describe("web and mobile perform equivalent authorized operations", () => {
    it("a web-style multipart create and a mobile JSON create give the same result shape, readable and protected the same way", async () => {
      const form = new FormData();
      form.append("content", `web style ${run}`);
      const web = await fetch(`${baseUrl}/api/posts`, { method: "POST", headers: { authorization: `Bearer ${a.token}` }, body: form });
      expect(web.status).toBe(201);
      const webPost = ((await web.json()) as { data: Record<string, unknown> }).data;
      const mobile = await apiA.POST("/api/posts", { body: { content: `mobile style ${run}` } });
      expect(mobile.response.status).toBe(201);
      const mobilePost = (mobile.data as { data: Record<string, unknown> }).data;
      expect(Object.keys(mobilePost).sort()).toEqual(Object.keys(webPost).sort());

      for (const id of [webPost.id as number, mobilePost.id as number]) {
        const read = await apiB.GET("/api/posts/{id}", { params: { path: { id } } });
        expect(read.response.status).toBe(200);
        // owner-only changes are refused for another member, whichever client created the post
        await expect(apiB.PUT("/api/posts/{id}", { params: { path: { id } }, body: { content: "hijack" } })).rejects.toMatchObject({ kind: "forbidden", status: 403 });
        await expect(apiB.DELETE("/api/posts/{id}", { params: { path: { id } } })).rejects.toMatchObject({ kind: "forbidden", status: 403 });
      }
    });
  });
});
