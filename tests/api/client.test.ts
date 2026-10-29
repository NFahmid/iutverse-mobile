import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { anonymous, ApiError, createApiClient, getCurrentMember, type ApiClient, type Me } from "../../src/services/api";
import { closedOrigin, json, startServer, type TestServer } from "../helpers/server";

const ME = { id: "00000000-0000-4000-8000-000000000001", email: "user@iut-dhaka.edu", displayName: "Rahim", role: "user", membershipStatus: "active" } as const;
const BACKEND_REQUEST_ID = /^[A-Za-z0-9._:-]{8,128}$/;

let server: TestServer;
let token: string | null;
const make = (overrides: Partial<Parameters<typeof createApiClient>[0]> = {}): ApiClient =>
  createApiClient({ baseUrl: server.url, getAccessToken: () => token, allowInsecureHttp: true, ...overrides });
const okMe = () => server.respond((_req, res) => json(res, 200, { success: true, data: ME }));
const lastHeader = (name: string) => server.seen.at(-1)?.headers[name];

beforeEach(async () => {
  server = await startServer();
  token = "token-one";
  okMe();
});
afterEach(async () => {
  await server.close();
});

describe("typed call through the generated contract", () => {
  it("reads the protected endpoint and returns the Me type", async () => {
    const me = await getCurrentMember(make());
    expect(me).toEqual(ME);
    expectTypeOf(me).toEqualTypeOf<Me>();
    expectTypeOf<Me["role"]>().toEqualTypeOf<"user" | "mod" | "admin">();
    expectTypeOf<Me["displayName"]>().toEqualTypeOf<string | null | undefined>();
    expect(server.seen[0]).toMatchObject({ method: "GET", url: "/api/auth/me" });
  });

  it("sends typed request bodies as JSON", async () => {
    server.respond((_req, res) => json(res, 201, { success: true, data: { id: 1 } }));
    const { data, response } = await make().POST("/api/posts", { body: { content: "hello", isAnonymous: false } });
    expect(response.status).toBe(201);
    expect(data).toBeDefined();
    expect(JSON.parse(server.seen[0]!.body)).toEqual({ content: "hello", isAnonymous: false });
    expect(lastHeader("content-type")).toContain("application/json");
  });
});

describe("bearer token injection", () => {
  it("reads the token at request time, so a refreshed session is used on the next call", async () => {
    const api = make();
    await getCurrentMember(api);
    expect(lastHeader("authorization")).toBe("Bearer token-one");
    token = "token-two";
    await getCurrentMember(api);
    expect(lastHeader("authorization")).toBe("Bearer token-two");
  });

  it("supports an async token provider", async () => {
    await getCurrentMember(make({ getAccessToken: async () => "async-token" }));
    expect(lastHeader("authorization")).toBe("Bearer async-token");
  });

  it("sends no Authorization header when signed out", async () => {
    token = null;
    await getCurrentMember(make());
    expect(lastHeader("authorization")).toBeUndefined();
  });

  it("leaves public calls anonymous when asked, and does not leak the internal marker", async () => {
    server.respond((_req, res) => json(res, 200, { status: "ok" }));
    await make().GET("/api/health", anonymous);
    expect(lastHeader("authorization")).toBeUndefined();
    expect(lastHeader("x-iutverse-anonymous")).toBeUndefined();
  });

  it("does not overwrite an Authorization header the caller set", async () => {
    await make().GET("/api/auth/me", { headers: { Authorization: "Bearer explicit" } });
    expect(lastHeader("authorization")).toBe("Bearer explicit");
  });

  it("reports a failing session provider as unauthorized without sending a request", async () => {
    const api = make({
      getAccessToken: () => {
        throw new Error("secure store unavailable");
      },
    });
    await expect(getCurrentMember(api)).rejects.toMatchObject({ name: "ApiError", kind: "unauthorized" });
    expect(server.seen).toHaveLength(0);
  });
});

describe("request ids", () => {
  it("sends a backend-compatible id on every request", async () => {
    const api = make();
    await getCurrentMember(api);
    await getCurrentMember(api);
    const ids = server.seen.map((entry) => String(entry.headers["x-request-id"]));
    for (const id of ids) expect(id).toMatch(BACKEND_REQUEST_ID);
    expect(new Set(ids).size).toBe(2);
  });

  it("keeps an id the caller supplied", async () => {
    await make().GET("/api/auth/me", { headers: { "X-Request-Id": "caller-supplied-id-0001" } });
    expect(lastHeader("x-request-id")).toBe("caller-supplied-id-0001");
  });

  it("uses the injected id factory", async () => {
    await getCurrentMember(make({ requestId: () => "factory-id-0000001" }));
    expect(lastHeader("x-request-id")).toBe("factory-id-0000001");
  });

  it("reports the server's id on errors when it echoes one, and its own otherwise", async () => {
    server.respond((_req, res) => json(res, 500, { success: false, message: "boom" }, { "x-request-id": "server-echo-0000001" }));
    await expect(getCurrentMember(make())).rejects.toMatchObject({ requestId: "server-echo-0000001" });

    server.respond((_req, res) => json(res, 500, { success: false, message: "boom" }));
    const error = await getCurrentMember(make({ requestId: () => "client-sent-id-000001" })).catch((e) => e);
    expect(error.requestId).toBe("client-sent-id-000001");
  });
});

describe("error normalization", () => {
  const respondWith = (status: number, body: unknown, headers: Record<string, string> = {}) =>
    server.respond((_req, res) => json(res, status, body, headers));

  const cases: [string, number, unknown, Record<string, unknown>][] = [
    ["401 without a token", 401, { success: false, message: "Access token required", code: "AUTH_TOKEN_REQUIRED" }, { kind: "unauthorized", code: "AUTH_TOKEN_REQUIRED", isTokenRejected: true }],
    ["403 expired token", 403, { success: false, message: "Invalid Supabase token", code: "AUTH_TOKEN_INVALID" }, { kind: "unauthorized", code: "AUTH_TOKEN_INVALID", isTokenRejected: true }],
    ["403 not a member", 403, { success: false, message: "Active IUTverse membership required", code: "MEMBERSHIP_REQUIRED" }, { kind: "forbidden", code: "MEMBERSHIP_REQUIRED", isMembershipRequired: true, isTokenRejected: false }],
    ["403 role or ownership", 403, { success: false, message: "You are not authorized to update this post" }, { kind: "forbidden", message: "You are not authorized to update this post" }],
    ["400 validation", 400, { success: false, message: "Post content or image is required" }, { kind: "validation", message: "Post content or image is required" }],
    ["400 with a body that has no success flag", 400, { message: "Search query is required" }, { kind: "validation", message: "Search query is required" }],
    ["404", 404, { success: false, message: "Post not found" }, { kind: "not_found" }],
    ["409", 409, { message: "This student ID is already taken by another user" }, { kind: "conflict" }],
    ["500 never shows server text", 500, { success: false, message: "relation \"posts\" does not exist" }, { kind: "server" }],
    ["502", 502, { success: false, message: "Weather unavailable" }, { kind: "server" }],
  ];
  it.each(cases)("%s", async (_name, status, body, expected) => {
    respondWith(status, body);
    const error = await getCurrentMember(make()).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status, method: "GET", path: "/api/auth/me", ...expected });
  });

  it("does not surface internal server text for 5xx", async () => {
    respondWith(500, { success: false, message: "relation \"posts\" does not exist" });
    const error = await getCurrentMember(make()).catch((e) => e);
    expect(error.message).not.toContain("relation");
  });

  it("reads Retry-After on 429", async () => {
    respondWith(429, { success: false, message: "Too many API requests. Please try again later." }, { "retry-after": "42" });
    await expect(getCurrentMember(make())).rejects.toMatchObject({ kind: "rate_limited", status: 429, retryAfterSeconds: 42 });
  });

  it("handles a non-JSON error body by status alone", async () => {
    server.respond((_req, res) => {
      res.writeHead(503, { "content-type": "text/html" });
      res.end("<html>Bad gateway</html>");
    });
    await expect(getCurrentMember(make())).rejects.toMatchObject({ kind: "server", status: 503 });
  });

  it("rejects a 200 HTML page (captive portal) as an unexpected response", async () => {
    server.respond((_req, res) => {
      res.writeHead(200, { "content-type": "text/html" });
      res.end("<html>Sign in to the Wi-Fi</html>");
    });
    await expect(getCurrentMember(make())).rejects.toMatchObject({ kind: "unexpected_response", status: 200 });
  });

  it("rejects a 200 with malformed JSON as an unexpected response", async () => {
    server.respond((_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end("{not json");
    });
    await expect(getCurrentMember(make())).rejects.toMatchObject({ kind: "unexpected_response" });
  });

  it("rejects a 200 JSON envelope whose data is missing as an unexpected response", async () => {
    server.respond((_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end("");
    });
    await expect(getCurrentMember(make())).rejects.toMatchObject({ kind: "unexpected_response" });
  });

  it("reports a refused connection as a network error", async () => {
    const api = make({ baseUrl: await closedOrigin() });
    await expect(getCurrentMember(api)).rejects.toMatchObject({ kind: "network", status: undefined });
  });

  it("never puts the access token in an error, its message or its JSON", async () => {
    token = "super-secret-token-value";
    respondWith(403, { success: false, message: "Invalid Supabase token", code: "AUTH_TOKEN_INVALID" });
    const error: ApiError = await getCurrentMember(make()).catch((e) => e);
    expect(JSON.stringify(error)).not.toContain("super-secret-token-value");
    expect(error.message).not.toContain("super-secret-token-value");
    expect(error.path).toBe("/api/auth/me");
  });
});

describe("timeouts", () => {
  const slow = (ms: number) => server.respond((_req, res) => setTimeout(() => json(res, 200, { success: true, data: ME }), ms).unref());

  it("fails with kind timeout when the server is too slow", async () => {
    slow(400);
    const started = Date.now();
    await expect(getCurrentMember(make({ timeoutMs: 60 }))).rejects.toMatchObject({ kind: "timeout" });
    expect(Date.now() - started).toBeLessThan(350);
  });

  it("does not time out a request that finishes in time", async () => {
    slow(30);
    await expect(getCurrentMember(make({ timeoutMs: 400 }))).resolves.toEqual(ME);
  });

  it("applies the longer upload timeout to multipart requests", async () => {
    slow(150);
    const form = new FormData();
    form.set("image", new Blob(["x"], { type: "image/png" }), "a.png");
    // timeoutMs would fire first; uploadTimeoutMs must govern multipart bodies.
    const api = make({ timeoutMs: 40, uploadTimeoutMs: 1_000 });
    const { response } = await api.POST("/api/posts", { body: form as never, bodySerializer: (body) => body as never });
    expect(response.status).toBe(200);
    expect(lastHeader("content-type")).toContain("multipart/form-data");
  });

  it("does not leave timers behind after requests finish", async () => {
    const timers = () => process.getActiveResourcesInfo().filter((name) => name === "Timeout").length;
    const api = make({ timeoutMs: 60_000 });
    await getCurrentMember(api);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const before = timers();
    for (let i = 0; i < 5; i += 1) await getCurrentMember(api);
    await expect(getCurrentMember(make({ baseUrl: await closedOrigin(), timeoutMs: 60_000 }))).rejects.toMatchObject({ kind: "network" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(timers()).toBeLessThanOrEqual(before);
  });
});

describe("cancellation", () => {
  const slow = (ms = 400) => server.respond((_req, res) => setTimeout(() => json(res, 200, { success: true, data: ME }), ms).unref());

  it("reports a caller abort as cancelled, not as a network error", async () => {
    slow();
    const controller = new AbortController();
    const pending = getCurrentMember(make(), { signal: controller.signal });
    setTimeout(() => controller.abort(), 20);
    await expect(pending).rejects.toMatchObject({ kind: "cancelled" });
  });

  it("does not send a request whose signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(getCurrentMember(make(), { signal: controller.signal })).rejects.toMatchObject({ kind: "cancelled" });
    expect(server.seen).toHaveLength(0);
  });

  it("treats a caller's AbortSignal.timeout as a timeout", async () => {
    slow();
    await expect(getCurrentMember(make(), { signal: AbortSignal.timeout(40) })).rejects.toMatchObject({ kind: "timeout" });
  });

  it("reports whichever ends the request first: caller abort before the client timeout", async () => {
    slow();
    const controller = new AbortController();
    const pending = getCurrentMember(make({ timeoutMs: 300 }), { signal: controller.signal });
    setTimeout(() => controller.abort(), 20);
    await expect(pending).rejects.toMatchObject({ kind: "cancelled" });
  });

  it("reports whichever ends the request first: client timeout before the caller abort", async () => {
    slow();
    const controller = new AbortController();
    const pending = getCurrentMember(make({ timeoutMs: 30 }), { signal: controller.signal });
    setTimeout(() => controller.abort(), 250);
    await expect(pending).rejects.toMatchObject({ kind: "timeout" });
  });

  // A fetch that notices the abort late, so both the caller's abort and the client timeout have fired before it settles.
  const lateFetch = (settleAfterMs: number) =>
    (async (input: Request) =>
      new Promise<Response>((_resolve, reject) => {
        setTimeout(() => reject(new DOMException("aborted", "AbortError")), settleAfterMs);
        void input;
      })) as unknown as typeof fetch;

  it("first cause wins when both fire before fetch settles: caller abort, then timeout", async () => {
    const controller = new AbortController();
    const api = createApiClient({ baseUrl: "https://api.example.test", getAccessToken: () => null, fetch: lateFetch(120), timeoutMs: 50 });
    setTimeout(() => controller.abort(), 10);
    await expect(getCurrentMember(api, { signal: controller.signal })).rejects.toMatchObject({ kind: "cancelled" });
  });

  it("first cause wins when both fire before fetch settles: timeout, then caller abort", async () => {
    const controller = new AbortController();
    const api = createApiClient({ baseUrl: "https://api.example.test", getAccessToken: () => null, fetch: lateFetch(120), timeoutMs: 10 });
    setTimeout(() => controller.abort(), 50);
    await expect(getCurrentMember(api, { signal: controller.signal })).rejects.toMatchObject({ kind: "timeout" });
  });

  it("ignores an abort that arrives after the request completed", async () => {
    const controller = new AbortController();
    const me = await getCurrentMember(make(), { signal: controller.signal });
    controller.abort();
    expect(me).toEqual(ME);
  });

  it("is reusable after a cancelled request", async () => {
    slow(200);
    const controller = new AbortController();
    const api = make();
    const first = getCurrentMember(api, { signal: controller.signal });
    setTimeout(() => controller.abort(), 10);
    await expect(first).rejects.toMatchObject({ kind: "cancelled" });
    okMe();
    await expect(getCurrentMember(api)).resolves.toEqual(ME);
  });
});

describe("retries", () => {
  it("does not retry a failed read", async () => {
    server.respond((_req, res) => json(res, 500, { success: false, message: "x" }));
    await expect(getCurrentMember(make())).rejects.toMatchObject({ kind: "server" });
    expect(server.seen).toHaveLength(1);
  });

  it("does not replay a mutation after a server error or a timeout", async () => {
    server.respond((_req, res) => json(res, 500, { success: false, message: "x" }));
    await expect(make().POST("/api/posts", { body: { content: "once" } })).rejects.toMatchObject({ kind: "server" });
    expect(server.seen.filter((entry) => entry.method === "POST")).toHaveLength(1);

    server.respond((_req, res) => setTimeout(() => json(res, 201, {}), 300).unref());
    await expect(make({ timeoutMs: 30 }).POST("/api/posts", { body: { content: "twice" } })).rejects.toMatchObject({ kind: "timeout" });
    expect(server.seen.filter((entry) => entry.method === "POST")).toHaveLength(2);
  });
});

describe("client construction", () => {
  it("rejects plain http unless explicitly allowed for development", () => {
    expect(() => createApiClient({ baseUrl: "http://example.org", getAccessToken: () => null })).toThrow(/https/);
    expect(() => createApiClient({ baseUrl: "http://192.168.1.5:8080", getAccessToken: () => null, allowInsecureHttp: true, environment: "production" })).toThrow(/https/);
    expect(() => createApiClient({ baseUrl: "http://192.168.1.5:8080", getAccessToken: () => null, allowInsecureHttp: true })).not.toThrow();
  });

  it("joins paths onto the origin without doubling slashes", async () => {
    await getCurrentMember(make({ baseUrl: `${server.url}/` }));
    expect(server.seen[0]!.url).toBe("/api/auth/me");
  });

  it("can be created with an injected fetch and never touches the network", async () => {
    const calls: string[] = [];
    const fakeFetch = vi.fn(async (input: Request | string | URL) => {
      calls.push(input instanceof Request ? `${input.method} ${input.url}` : String(input));
      return new Response(JSON.stringify({ success: true, data: ME }), { status: 200, headers: { "content-type": "application/json" } });
    }) as unknown as typeof fetch;
    const api = createApiClient({ baseUrl: "https://api.example.test", getAccessToken: () => "t", fetch: fakeFetch });
    await expect(getCurrentMember(api)).resolves.toEqual(ME);
    expect(calls).toEqual(["GET https://api.example.test/api/auth/me"]);
  });
});
