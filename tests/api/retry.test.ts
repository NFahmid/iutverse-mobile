import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ApiError,
  createApiClient,
  createIdempotencyKey,
  idempotencyHeaders,
  isValidIdempotencyKey,
  type ApiClient,
  type ApiErrorKind,
} from "../../src/services/api";
import { backoffMs, classifyRequest, decideRetry } from "../../src/services/api/retry";
import { closedOrigin, json, startServer, type TestServer } from "../helpers/server";

const KEY = "mobile-send-0123456789abcdef";
const err = (kind: ApiErrorKind, status?: number, retryAfterSeconds?: number) => new ApiError({ kind, message: "x", method: "GET", path: "/api/x", status, retryAfterSeconds });

describe("classifyRequest", () => {
  const cls = (method: string, path: string, headers: Record<string, string> = {}) => classifyRequest(method, path, new Headers(headers));

  it("reads are retryable", () => {
    expect(cls("GET", "/api/feed")).toBe("read");
    expect(cls("HEAD", "/api/feed")).toBe("read");
  });

  it("creating an upload slot is safe to repeat", () => {
    expect(cls("POST", "/api/uploads")).toBe("repeat_safe");
  });

  it("a POST is retryable only with an Idempotency-Key AND only on an operation that honors it", () => {
    for (const path of ["/api/chat/messages", "/api/posts", "/api/posts/5/comments"]) {
      expect(cls("POST", path, { "Idempotency-Key": KEY }), path).toBe("keyed");
      expect(cls("POST", path), `${path} without a key`).toBe("none");
    }
    for (const path of ["/api/posts/5/react", "/api/jobs", "/api/events", "/api/chat/share", "/api/reports"]) {
      expect(cls("POST", path, { "Idempotency-Key": KEY }), `${path} does not honor the key`).toBe("none");
    }
  });

  it("PUT, PATCH and DELETE are never retried", () => {
    for (const method of ["PUT", "PATCH", "DELETE"]) expect(cls(method, "/api/posts/5", { "Idempotency-Key": KEY })).toBe("none");
  });
});

describe("decideRetry", () => {
  const sure = { random: () => 0.5, baseDelayMs: 300, maxDelayMs: 5000 };

  it("retries transient failures of reads", () => {
    for (const error of [err("network"), err("timeout"), err("server", 502), err("server", 503), err("server", 504), err("rate_limited", 429)]) {
      expect(decideRetry("read", error, 1, sure).retry, `${error.kind} ${error.status}`).toBe(true);
    }
  });

  it("does not retry a plain 500 on a read, but does for a keyed create (the key makes a repeat harmless)", () => {
    expect(decideRetry("read", err("server", 500), 1, sure).retry).toBe(false);
    expect(decideRetry("keyed", err("server", 500), 1, sure).retry).toBe(true);
    expect(decideRetry("keyed", err("server", 501), 1, sure).retry).toBe(false);
  });

  it.each<ApiErrorKind>(["cancelled", "unauthorized", "forbidden", "validation", "not_found", "conflict", "unexpected_response", "expired_link"])("never retries %s", (kind) => {
    for (const cls of ["read", "keyed", "repeat_safe"] as const) expect(decideRetry(cls, err(kind, 400), 1, sure).retry).toBe(false);
  });

  it("never retries class none", () => {
    expect(decideRetry("none", err("network"), 1, sure).retry).toBe(false);
  });

  it("stops at maxAttempts", () => {
    expect(decideRetry("read", err("network"), 2, { ...sure, maxAttempts: 3 }).retry).toBe(true);
    expect(decideRetry("read", err("network"), 3, { ...sure, maxAttempts: 3 }).retry).toBe(false);
    expect(decideRetry("read", err("network"), 1, { ...sure, maxAttempts: 1 }).retry).toBe(false);
  });

  it("honors Retry-After, and gives up when it asks for too long", () => {
    expect(decideRetry("read", err("rate_limited", 429, 2), 1, sure)).toEqual({ retry: true, delayMs: 2000 });
    expect(decideRetry("read", err("rate_limited", 429, 120), 1, sure).retry).toBe(false);
    expect(decideRetry("read", err("rate_limited", 429, 20), 1, { ...sure, maxRetryAfterMs: 30_000 })).toEqual({ retry: true, delayMs: 20_000 });
  });
});

describe("backoffMs", () => {
  it("is full-jitter exponential and capped", () => {
    const at = (attempt: number, random: number) => backoffMs(attempt, { random: () => random, baseDelayMs: 300, maxDelayMs: 5000 });
    expect(at(1, 0)).toBe(0);
    expect(at(1, 0.5)).toBe(150);
    expect(at(2, 0.5)).toBe(300);
    expect(at(3, 0.5)).toBe(600);
    expect(at(10, 0.9999)).toBeLessThan(5000);
    expect(at(10, 0.9999)).toBeGreaterThan(4900);
    for (let attempt = 1; attempt < 12; attempt += 1) expect(at(attempt, 0.999999)).toBeLessThan(5000);
  });
});

describe("idempotency keys", () => {
  it("generates keys the backend accepts, and a new one each time", () => {
    const a = createIdempotencyKey();
    const b = createIdempotencyKey();
    expect(isValidIdempotencyKey(a)).toBe(true);
    expect(a).not.toBe(b);
  });

  it("validates before anything is sent", () => {
    expect(idempotencyHeaders(KEY)).toEqual({ "Idempotency-Key": KEY });
    for (const bad of ["short", "has space in it 0123456789", "x".repeat(65), "bad/char/0123456789abcd"]) expect(() => idempotencyHeaders(bad)).toThrow();
  });
});

describe("retries through the real transport", () => {
  let server: TestServer;
  let api: ApiClient;
  let delays: number[];
  let tokenCalls: number;
  const make = (overrides: Partial<Parameters<typeof createApiClient>[0]> = {}) =>
    createApiClient({
      baseUrl: server.url,
      allowInsecureHttp: true,
      getAccessToken: () => `token-${++tokenCalls}`,
      retry: { baseDelayMs: 10, maxDelayMs: 20, random: () => 0.5, sleep: async (ms) => void delays.push(ms) },
      ...overrides,
    });
  const attemptsOf = (method: string) => server.seen.filter((entry) => entry.method === method);
  const sequence = (...statuses: number[]) => {
    let call = 0;
    server.respond((_req, res) => {
      const status = statuses[Math.min(call, statuses.length - 1)]!;
      call += 1;
      if (status === 200) return json(res, 200, { success: true, data: { id: "00000000-0000-4000-8000-000000000001", email: "a@iut-dhaka.edu", role: "user", membershipStatus: "active" } });
      if (status === 201) return json(res, 201, { success: true, data: { id: 1 } });
      return json(res, status, { success: false, message: `status ${status}` });
    });
  };

  beforeEach(async () => {
    server = await startServer();
    delays = [];
    tokenCalls = 0;
    api = make();
  });
  afterEach(async () => {
    await server.close();
  });

  it("retries a GET after a 503 and succeeds, keeping the request id and reading a fresh token each attempt", async () => {
    sequence(503, 200);
    const { response } = await api.GET("/api/auth/me");
    expect(response.status).toBe(200);
    expect(server.seen).toHaveLength(2);
    expect(delays).toEqual([5]); // full jitter: floor(0.5 * min(20, 10 * 2^0))
    expect(server.seen[0]!.headers["x-request-id"]).toBe(server.seen[1]!.headers["x-request-id"]);
    expect(server.seen.map((entry) => entry.headers.authorization)).toEqual(["Bearer token-1", "Bearer token-2"]);
  });

  it("gives up after the attempt limit and reports the last error", async () => {
    sequence(503);
    await expect(api.GET("/api/auth/me")).rejects.toMatchObject({ kind: "server", status: 503 });
    expect(server.seen).toHaveLength(3);
    expect(delays).toHaveLength(2);
  });

  it.each([400, 401, 403, 404, 409])("does not retry a GET answered %i", async (status) => {
    sequence(status, 200);
    await expect(api.GET("/api/auth/me")).rejects.toBeInstanceOf(ApiError);
    expect(server.seen).toHaveLength(1);
    expect(delays).toHaveLength(0);
  });

  it("does not retry a plain 500 on a read", async () => {
    sequence(500, 200);
    await expect(api.GET("/api/auth/me")).rejects.toMatchObject({ kind: "server", status: 500 });
    expect(server.seen).toHaveLength(1);
  });

  it("waits for Retry-After on a 429, then retries", async () => {
    let call = 0;
    server.respond((_req, res) => {
      call += 1;
      if (call === 1) return json(res, 429, { success: false, message: "slow down" }, { "retry-after": "1" });
      return json(res, 200, { success: true, data: {} });
    });
    const { response } = await api.GET("/api/auth/me");
    expect(response.status).toBe(200);
    expect(delays).toEqual([1000]);
  });

  it("returns the 429 when Retry-After is longer than the cap", async () => {
    server.respond((_req, res) => json(res, 429, { success: false, message: "slow down" }, { "retry-after": "300" }));
    await expect(api.GET("/api/auth/me")).rejects.toMatchObject({ kind: "rate_limited", retryAfterSeconds: 300 });
    expect(server.seen).toHaveLength(1);
  });

  it("retries a network failure", async () => {
    let calls = 0;
    const flaky = make({
      baseUrl: await closedOrigin(),
      fetch: (async (input: Request) => {
        calls += 1;
        return fetch(input);
      }) as typeof fetch,
    });
    await expect(flaky.GET("/api/auth/me")).rejects.toMatchObject({ kind: "network" });
    expect(calls).toBe(3);
  });

  it("retries a request that timed out", async () => {
    let call = 0;
    server.respond((_req, res) => {
      call += 1;
      if (call === 1) return void setTimeout(() => json(res, 200, {}), 300).unref();
      return json(res, 200, { success: true, data: {} });
    });
    const { response } = await make({ timeoutMs: 40 }).GET("/api/auth/me");
    expect(response.status).toBe(200);
    expect(server.seen).toHaveLength(2);
  });

  it("can be turned off", async () => {
    sequence(503, 200);
    await expect(make({ retry: false }).GET("/api/auth/me")).rejects.toMatchObject({ status: 503 });
    expect(server.seen).toHaveLength(1);
  });

  describe("mutations", () => {
    it("a POST without an Idempotency-Key is attempted once, even after a 503 or a timeout", async () => {
      sequence(503, 201);
      await expect(api.POST("/api/posts", { body: { content: "hello" } })).rejects.toMatchObject({ kind: "server", status: 503 });
      expect(attemptsOf("POST")).toHaveLength(1);

      server.respond((_req, res) => void setTimeout(() => json(res, 201, {}), 300).unref());
      await expect(make({ timeoutMs: 30 }).POST("/api/posts", { body: { content: "hello" } })).rejects.toMatchObject({ kind: "timeout" });
      expect(attemptsOf("POST")).toHaveLength(2); // one new attempt for the second call, not a retry
    });

    it("a POST with an Idempotency-Key is retried with the SAME key and the same body", async () => {
      sequence(503, 503, 201);
      const { response } = await api.POST("/api/posts", { body: { content: "hello" }, headers: idempotencyHeaders(KEY) });
      expect(response.status).toBe(201);
      const posts = attemptsOf("POST");
      expect(posts).toHaveLength(3);
      expect(new Set(posts.map((entry) => entry.headers["idempotency-key"]))).toEqual(new Set([KEY]));
      expect(new Set(posts.map((entry) => entry.body)).size).toBe(1);
      expect(JSON.parse(posts[0]!.body)).toEqual({ content: "hello" });
    });

    it("a keyed POST is retried after a timeout and after a plain 500", async () => {
      sequence(500, 201);
      await api.POST("/api/chat/messages", { body: { conversationId: 1, content: "hi" }, headers: idempotencyHeaders(KEY) });
      expect(attemptsOf("POST")).toHaveLength(2);

      server.seen.length = 0;
      let call = 0;
      server.respond((_req, res) => {
        call += 1;
        if (call === 1) return void setTimeout(() => json(res, 201, {}), 300).unref();
        return json(res, 201, { message: "ok", data: { id: 1 } });
      });
      await make({ timeoutMs: 40 }).POST("/api/chat/messages", { body: { conversationId: 1, content: "hi" }, headers: idempotencyHeaders(KEY) });
      expect(attemptsOf("POST")).toHaveLength(2);
      expect(new Set(attemptsOf("POST").map((entry) => entry.headers["idempotency-key"]))).toEqual(new Set([KEY]));
    });

    it.each([400, 401, 403, 404, 409])("a keyed POST answered %i is not retried", async (status) => {
      sequence(status, 201);
      await expect(api.POST("/api/posts", { body: { content: "hello" }, headers: idempotencyHeaders(KEY) })).rejects.toBeInstanceOf(ApiError);
      expect(attemptsOf("POST")).toHaveLength(1);
    });

    it("an Idempotency-Key on an operation that does not honor it does not make it retryable", async () => {
      sequence(503, 201);
      await expect(api.POST("/api/posts/{id}/react", { params: { path: { id: 5 } }, body: { reactionType: "like" }, headers: idempotencyHeaders(KEY) })).rejects.toMatchObject({ status: 503 });
      expect(attemptsOf("POST")).toHaveLength(1);
    });

    it("DELETE and PUT are never retried", async () => {
      sequence(503);
      await expect(api.DELETE("/api/posts/{id}", { params: { path: { id: 5 } } })).rejects.toMatchObject({ status: 503 });
      await expect(api.PUT("/api/posts/{id}", { params: { path: { id: 5 } }, body: { content: "x" } })).rejects.toMatchObject({ status: 503 });
      expect(server.seen).toHaveLength(2);
    });

    it("creating an upload slot is retried (it creates nothing until bytes arrive)", async () => {
      let call = 0;
      server.respond((_req, res) => {
        call += 1;
        if (call === 1) return json(res, 503, { success: false, message: "busy" });
        return json(res, 201, { success: true, data: { purpose: "post", bucket: "post-media", path: "p", token: "t", signedUrl: "https://x/y", mimeType: "image/png", maxBytes: 5242880, expiresAt: null } });
      });
      const { response } = await api.POST("/api/uploads", { body: { purpose: "post", mimeType: "image/png", size: 100 } });
      expect(response.status).toBe(201);
      expect(attemptsOf("POST")).toHaveLength(2);
    });
  });

  describe("cancellation", () => {
    it("stops waiting between attempts and reports cancelled, with no further attempt", async () => {
      sequence(503, 200);
      const patient = createApiClient({ baseUrl: server.url, allowInsecureHttp: true, getAccessToken: () => null, retry: { baseDelayMs: 2000, maxDelayMs: 2000, random: () => 0.99 } });
      const controller = new AbortController();
      const started = Date.now();
      const pending = patient.GET("/api/auth/me", { signal: controller.signal });
      setTimeout(() => controller.abort(), 60);
      await expect(pending).rejects.toMatchObject({ kind: "cancelled" });
      expect(Date.now() - started).toBeLessThan(1000);
      expect(server.seen).toHaveLength(1);
    });

    it("does not leave timers behind after a retried request", async () => {
      sequence(503, 200);
      const timers = () => process.getActiveResourcesInfo().filter((name) => name === "Timeout").length;
      await api.GET("/api/auth/me");
      await new Promise((resolve) => setTimeout(resolve, 20));
      const before = timers();
      sequence(503, 503, 200);
      await api.GET("/api/auth/me");
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(timers()).toBeLessThanOrEqual(before);
    });
  });
});
