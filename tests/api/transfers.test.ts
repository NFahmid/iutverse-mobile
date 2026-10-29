import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  createApiClient,
  createFetchUploader,
  createSignedUrlCache,
  fetchPrivateFile,
  uploadFile,
  type ApiClient,
  type FileRef,
  type FileUploader,
  type PutFileArgs,
} from "../../src/services/api";
import { json, startServer, type TestServer } from "../helpers/server";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
const file = (over: Partial<FileRef> = {}): FileRef => ({ uri: "file:///tmp/a.png", name: "a.png", mimeType: "image/png", size: PNG.byteLength, body: PNG, ...over });
const SECRET = "SECRET-SIGNED-TOKEN";
const fast = { sleep: async () => {}, random: () => 0 };
const hours = (n: number) => new Date(Date.now() + n * 3_600_000).toISOString();

let apiServer: TestServer;
let storage: TestServer;
let api: ApiClient;
let intents: number;
let intentBodies: any[];
let slotExpiresAt: () => string;

const intentResponse = () => ({
  success: true,
  data: {
    purpose: "post",
    bucket: "post-media",
    path: `user/post-${intents}.png`,
    token: "t",
    signedUrl: `${storage.url}/storage/v1/object/upload/sign/post-media/user/post-${intents}.png?token=${SECRET}-${intents}`,
    mimeType: "image/png",
    maxBytes: 5 * 1024 * 1024,
    expiresAt: slotExpiresAt(),
  },
});

beforeEach(async () => {
  apiServer = await startServer();
  storage = await startServer();
  intents = 0;
  intentBodies = [];
  slotExpiresAt = () => hours(2);
  api = createApiClient({ baseUrl: apiServer.url, allowInsecureHttp: true, getAccessToken: () => "bearer-token-123", retry: fast });
  apiServer.respond((req, res, seen) => {
    if (req.method === "POST" && req.url === "/api/uploads") {
      intents += 1;
      intentBodies.push(JSON.parse(seen.body));
      return json(res, 201, intentResponse());
    }
    return json(res, 404, { success: false, message: "no route" });
  });
  storage.respond((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end('{"Key":"post-media/user/post-1.png"}');
  });
});
afterEach(async () => {
  await Promise.all([apiServer.close(), storage.close()]);
});

const upload = (over: Partial<Parameters<typeof uploadFile>[2]> = {}, uploader: FileUploader = createFetchUploader()) =>
  uploadFile(api, uploader, { purpose: "post", file: file(), allowInsecureHttp: true, retry: fast, ...over });

describe("uploadFile", () => {
  it("requests a slot, PUTs the raw bytes to storage without the bearer token, and returns the path to use as uploadPath", async () => {
    const progress: number[] = [];
    const result = await upload({ onProgress: (p) => progress.push(p.sentBytes) });
    expect(result).toEqual({ path: "user/post-1.png", bucket: "post-media", mimeType: "image/png", size: PNG.byteLength });

    expect(intentBodies).toEqual([{ purpose: "post", mimeType: "image/png", size: PNG.byteLength }]);
    expect(apiServer.seen[0]!.headers.authorization).toBe("Bearer bearer-token-123");

    const put = storage.seen[0]!;
    expect(put.method).toBe("PUT");
    expect(put.headers.authorization).toBeUndefined();
    expect(put.headers["content-type"]).toBe("image/png");
    expect(put.headers["x-request-id"]).toBeUndefined();
    expect(put.rawBody).toEqual(Buffer.from(PNG));
    expect(progress).toEqual([0, PNG.byteLength]);
  });

  it("sends the conversation id for chat uploads", async () => {
    await upload({ purpose: "chat", conversationId: 42 });
    expect(intentBodies[0]).toMatchObject({ purpose: "chat", conversationId: 42 });
  });

  it("refuses a file that is larger than the slot allows, before sending any bytes", async () => {
    await expect(upload({ file: file({ size: 6 * 1024 * 1024, body: PNG }) })).rejects.toMatchObject({ kind: "validation", message: expect.stringContaining("5 MB") });
    expect(storage.seen).toHaveLength(0);
  });

  it("refuses empty or unnamed files without any network call", async () => {
    await expect(upload({ file: file({ size: 0 }) })).rejects.toMatchObject({ kind: "validation" });
    await expect(upload({ file: file({ name: "" }) })).rejects.toMatchObject({ kind: "validation" });
    expect(apiServer.seen).toHaveLength(0);
  });

  it("refuses a signed URL that is not https unless development explicitly allows it", async () => {
    await expect(upload({ allowInsecureHttp: false })).rejects.toMatchObject({ kind: "unexpected_response" });
    expect(storage.seen).toHaveLength(0);
  });

  it("retries a transient storage failure and uploads once it recovers", async () => {
    let call = 0;
    storage.respond((_req, res) => {
      call += 1;
      if (call === 1) return json(res, 503, { message: "busy" });
      return json(res, 200, { Key: "ok" });
    });
    const delays: number[] = [];
    await upload({ retry: { ...fast, sleep: async (ms) => void delays.push(ms) } });
    expect(storage.seen).toHaveLength(2);
    expect(intents).toBe(1);
    expect(delays).toHaveLength(1);
  });

  it("treats 'already exists' on a RETRY as uploaded: the first PUT had actually arrived", async () => {
    let call = 0;
    storage.respond((req, res) => {
      call += 1;
      if (call === 1) return void req.socket.destroy(); // stored, but the answer never reached the phone
      return json(res, 400, { statusCode: "409", error: "Duplicate", message: "The resource already exists", code: "KeyAlreadyExists" });
    });
    await expect(upload()).resolves.toMatchObject({ path: "user/post-1.png" });
    expect(storage.seen).toHaveLength(2);
    expect(intents).toBe(1);
  });

  it("does NOT accept 'already exists' on the first attempt", async () => {
    storage.respond((_req, res) => json(res, 400, { statusCode: "409", error: "Duplicate", code: "KeyAlreadyExists" }));
    await expect(upload()).rejects.toBeInstanceOf(ApiError);
    expect(storage.seen).toHaveLength(1);
  });

  it("asks for a new slot once when storage reports the slot closed, then succeeds", async () => {
    let call = 0;
    storage.respond((_req, res) => {
      call += 1;
      if (call === 1) return json(res, 400, { statusCode: "400", error: "InvalidJWT", message: '"exp" claim timestamp check failed', code: "InvalidJWT" });
      return json(res, 200, { Key: "ok" });
    });
    const result = await upload();
    expect(intents).toBe(2);
    expect(result.path).toBe("user/post-2.png");
    expect(storage.seen.map((s) => s.url.split("?")[0])).toEqual([
      "/storage/v1/object/upload/sign/post-media/user/post-1.png",
      "/storage/v1/object/upload/sign/post-media/user/post-2.png",
    ]);
  });

  it("gives up with expired_link when the replacement slot also closes (no loop)", async () => {
    storage.respond((_req, res) => json(res, 400, { statusCode: "400", error: "InvalidJWT", code: "InvalidJWT" }));
    await expect(upload()).rejects.toMatchObject({ kind: "expired_link" });
    expect(intents).toBe(2);
    expect(storage.seen).toHaveLength(2);
  });

  it("asks for a fresh slot before sending when the first one is about to close", async () => {
    let first = true;
    slotExpiresAt = () => {
      const closing = first ? new Date(Date.now() + 2_000).toISOString() : hours(2);
      first = false;
      return closing;
    };
    const result = await upload();
    expect(intents).toBe(2);
    expect(result.path).toBe("user/post-2.png");
    expect(storage.seen).toHaveLength(1);
  });

  it("does not retry a rejected upload that retrying cannot fix", async () => {
    for (const status of [413, 403, 401]) {
      storage.seen.length = 0;
      storage.respond((_req, res) => json(res, status, { message: "no" }));
      await expect(upload()).rejects.toBeInstanceOf(ApiError);
      expect(storage.seen, `status ${status}`).toHaveLength(1);
    }
    storage.respond((_req, res) => json(res, 413, { message: "no" }));
    await expect(upload()).rejects.toMatchObject({ kind: "validation", status: 413 });
  });

  it("stops after the attempt limit", async () => {
    storage.respond((_req, res) => json(res, 503, { message: "busy" }));
    await expect(upload()).rejects.toMatchObject({ kind: "server", status: 503 });
    expect(storage.seen).toHaveLength(3);
  });

  it("can be cancelled during the transfer", async () => {
    storage.respond((_req, res) => void setTimeout(() => json(res, 200, {}), 500).unref());
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 40);
    await expect(upload({ signal: controller.signal })).rejects.toMatchObject({ kind: "cancelled" });
    expect(storage.seen).toHaveLength(1);
  });

  it("times out a stalled transfer", async () => {
    storage.respond((_req, res) => void setTimeout(() => json(res, 200, {}), 500).unref());
    await expect(upload({ timeoutMs: 40, retry: { ...fast, maxAttempts: 1 } })).rejects.toMatchObject({ kind: "timeout" });
  });

  it("never puts the signed token in an error", async () => {
    storage.respond((_req, res) => json(res, 500, { message: SECRET }));
    const error = await upload({ retry: { ...fast, maxAttempts: 1 } }).catch((e) => e);
    expect(JSON.stringify(error)).not.toContain(SECRET);
    expect(error.message).not.toContain(SECRET);
    expect(error.path).not.toContain("token");
  });

  it("works with a custom native uploader and passes it what it needs", async () => {
    const putFile = vi.fn(async (_args: PutFileArgs) => ({ status: 200, body: "{}" }));
    await upload({}, { putFile });
    expect(putFile).toHaveBeenCalledTimes(1);
    const args = putFile.mock.calls[0]![0];
    expect(args.url).toContain(SECRET);
    expect(args.headers).toEqual({ "Content-Type": "image/png" });
    expect(args.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("private downloads", () => {
  let apiCalls: string[];
  let linkNumber: number;
  let apiAnswer: (res: import("node:http").ServerResponse) => void;
  const BYTES = Uint8Array.from({ length: 256 }, (_, i) => i);

  const link = () => ({ success: true, data: { url: `${storage.url}/storage/v1/object/sign/chat-attachments/u/m.png?token=${SECRET}-${linkNumber}`, expiresAt: new Date(Date.now() + 300_000).toISOString() } });

  beforeEach(() => {
    apiCalls = [];
    linkNumber = 0;
    apiAnswer = (res) => {
      linkNumber += 1;
      json(res, 200, link());
    };
    apiServer.respond((req, res) => {
      apiCalls.push(req.url ?? "");
      apiAnswer(res);
    });
    storage.respond((_req, res) => {
      res.writeHead(200, { "content-type": "image/png" });
      res.end(Buffer.from(BYTES));
    });
  });

  const cache = () => createSignedUrlCache(api);
  const chat = { kind: "chatAttachment", messageId: 7 } as const;

  it("asks the API with redirect=false, then fetches the file from storage with no bearer token and without touching the body", async () => {
    const response = await fetchPrivateFile(cache(), chat, { retry: fast });
    expect(apiCalls).toEqual(["/api/chat/attachments/7?redirect=false"]);
    expect(apiServer.seen[0]!.headers.authorization).toBe("Bearer bearer-token-123");
    expect(storage.seen[0]!.headers.authorization).toBeUndefined();
    expect(response.bodyUsed).toBe(false);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(BYTES); // binary bytes arrive intact
  });

  it("uses the academic resource endpoint for resources", async () => {
    await fetchPrivateFile(cache(), { kind: "academicResource", resourceId: 3 }, { retry: fast });
    expect(apiCalls).toEqual(["/api/academic/resources/3/file?redirect=false"]);
  });

  it("reuses a valid link and asks again once it is about to expire", async () => {
    let clock = Date.now();
    const c = createSignedUrlCache(api, { now: () => clock });
    await c.get(chat);
    await c.get(chat);
    expect(apiCalls).toHaveLength(1);
    clock += 290_000; // inside the 15 s safety margin of the 300 s link
    await c.get(chat);
    expect(apiCalls).toHaveLength(2);
  });

  it("shares one API request between simultaneous callers", async () => {
    const c = cache();
    await Promise.all([c.get(chat), c.get(chat), c.get(chat)]);
    expect(apiCalls).toHaveLength(1);
  });

  it("refreshes an expired link exactly once and succeeds with the new one", async () => {
    storage.respond((req, res) => {
      if ((req.url ?? "").includes(`${SECRET}-1`)) return json(res, 400, { statusCode: "400", error: "InvalidJWT", message: '"exp" claim timestamp check failed', code: "InvalidJWT" });
      res.writeHead(200, { "content-type": "image/png" });
      res.end(Buffer.from(BYTES));
    });
    const response = await fetchPrivateFile(cache(), chat, { retry: fast });
    expect(response.status).toBe(200);
    expect(apiCalls).toHaveLength(2);
    expect(storage.seen).toHaveLength(2);
  });

  it("returns the API's refusal when access was revoked, and does not try storage again", async () => {
    storage.respond((_req, res) => json(res, 400, { statusCode: "400", error: "InvalidJWT", code: "InvalidJWT" }));
    apiAnswer = (res) => {
      linkNumber += 1;
      if (linkNumber === 1) return json(res, 200, link());
      return json(res, 403, { success: false, message: "Conversation not found or access denied" });
    };
    await expect(fetchPrivateFile(cache(), chat, { retry: fast })).rejects.toMatchObject({ kind: "forbidden", status: 403 });
    expect(storage.seen).toHaveLength(1);
  });

  it("stops with expired_link when the refreshed link is rejected too (no refresh loop)", async () => {
    storage.respond((_req, res) => json(res, 400, { statusCode: "400", error: "InvalidJWT", code: "InvalidJWT" }));
    await expect(fetchPrivateFile(cache(), chat, { retry: fast })).rejects.toMatchObject({ kind: "expired_link" });
    expect(apiCalls).toHaveLength(2);
    expect(storage.seen).toHaveLength(2);
  });

  it("maps a missing object to not_found without refreshing", async () => {
    storage.respond((_req, res) => json(res, 404, { message: "Object not found" }));
    await expect(fetchPrivateFile(cache(), chat, { retry: fast })).rejects.toMatchObject({ kind: "not_found" });
    expect(apiCalls).toHaveLength(1);
  });

  it("retries a transient storage failure a bounded number of times", async () => {
    let call = 0;
    storage.respond((_req, res) => {
      call += 1;
      if (call < 3) return json(res, 503, { message: "busy" });
      res.writeHead(200, { "content-type": "image/png" });
      res.end("ok");
    });
    const response = await fetchPrivateFile(cache(), chat, { retry: fast });
    expect(await response.text()).toBe("ok");
    expect(storage.seen).toHaveLength(3);

    storage.seen.length = 0;
    storage.respond((_req, res) => json(res, 503, { message: "busy" }));
    await expect(fetchPrivateFile(cache(), chat, { retry: fast })).rejects.toMatchObject({ kind: "server" });
    expect(storage.seen).toHaveLength(3);
  });

  it("can be cancelled and never leaks the signed token", async () => {
    storage.respond((_req, res) => void setTimeout(() => json(res, 200, {}), 500).unref());
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 40);
    const error = await fetchPrivateFile(cache(), chat, { signal: controller.signal, retry: fast }).catch((e) => e);
    expect(error).toMatchObject({ kind: "cancelled" });
    expect(JSON.stringify(error)).not.toContain(SECRET);
  });

  it("an error from storage never contains the signed token", async () => {
    storage.respond((_req, res) => json(res, 400, { code: "InvalidJWT" }));
    const error = await fetchPrivateFile(cache(), chat, { retry: fast }).catch((e) => e);
    expect(JSON.stringify(error)).not.toContain(SECRET);
    expect(error.path).not.toContain("token");
  });
});
