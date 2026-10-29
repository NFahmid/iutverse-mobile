import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ApiConfigError, callOptions, clientInfoHeaders, createApiClient, normalizeBaseUrl, type ApiClient } from "../../src/services/api";
import { json, startServer, type TestServer } from "../helpers/server";

let server: TestServer;
const ok = () => server.respond((_req, res) => json(res, 200, { success: true, data: { id: "00000000-0000-4000-8000-000000000001", email: "a@iut-dhaka.edu", role: "user", membershipStatus: "active" } }));
const make = (overrides: Partial<Parameters<typeof createApiClient>[0]> = {}): ApiClient =>
  createApiClient({ baseUrl: server.url, allowInsecureHttp: true, getAccessToken: () => "t", retry: false, ...overrides });
const header = (name: string) => server.seen.at(-1)?.headers[name];

beforeEach(async () => {
  server = await startServer();
  ok();
});
afterEach(async () => {
  await server.close();
});

describe("X-Client-Platform and X-Client-Version", () => {
  it("are sent on every request when configured, with the build number as +BUILD", async () => {
    const api = make({ clientInfo: { platform: "android", version: "1.4.0", build: 57 } });
    await api.GET("/api/auth/me");
    expect(header("x-client-platform")).toBe("android");
    expect(header("x-client-version")).toBe("1.4.0+57");
    await api.GET("/api/health", { headers: {} });
    expect(header("x-client-platform")).toBe("android");
  });

  it("are omitted when not configured (the headers are optional)", async () => {
    await make().GET("/api/auth/me");
    expect(header("x-client-platform")).toBeUndefined();
    expect(header("x-client-version")).toBeUndefined();
  });

  it("omit +BUILD when no build is given", async () => {
    await make({ clientInfo: { platform: "ios", version: "2.0.1" } }).GET("/api/auth/me");
    expect(header("x-client-version")).toBe("2.0.1");
  });

  it("do not replace a value the caller set for one request", async () => {
    await make({ clientInfo: { platform: "ios", version: "2.0.1" } }).GET("/api/auth/me", { headers: { "X-Client-Platform": "web" } });
    expect(header("x-client-platform")).toBe("web");
  });

  it("are sent on retried attempts too", async () => {
    let call = 0;
    server.respond((_req, res) => json(res, ++call === 1 ? 503 : 200, { success: true, data: {} }));
    await make({ clientInfo: { platform: "ios", version: "2.0.1" }, retry: { sleep: async () => {}, random: () => 0 } }).GET("/api/auth/me");
    expect(server.seen.map((entry) => entry.headers["x-client-platform"])).toEqual(["ios", "ios"]);
  });

  it("reject a value the backend would not accept, at configuration time", () => {
    const bad: [object, RegExp][] = [
      [{ platform: "windows", version: "1.0.0" }, /platform/],
      [{ platform: "ios", version: "1.0" }, /version/],
      [{ platform: "ios", version: "v1.0.0" }, /version/],
      [{ platform: "ios", version: "1.0.0-beta" }, /version/],
      [{ platform: "ios", version: "1.0.0", build: "abc" }, /build/],
      [{ platform: "ios", version: "1.0.0", build: "12345678901" }, /build/],
    ];
    for (const [info, message] of bad) {
      expect(() => clientInfoHeaders(info as never), JSON.stringify(info)).toThrow(message);
      expect(() => make({ clientInfo: info as never })).toThrow(ApiConfigError);
    }
  });

  it("never carry the access token or anything else", async () => {
    expect(clientInfoHeaders({ platform: "web", version: "1.0.0" })).toEqual({ "X-Client-Platform": "web", "X-Client-Version": "1.0.0" });
  });
});

describe("per-call options", () => {
  const slow = (ms: number) => server.respond((_req, res) => void setTimeout(() => json(res, 200, { success: true, data: {} }), ms).unref());

  it("timeoutMs overrides the client default for one call, and the marker never reaches the server", async () => {
    slow(150);
    const api = make({ timeoutMs: 5_000 });
    await expect(api.GET("/api/auth/me", callOptions({ timeoutMs: 30 }))).rejects.toMatchObject({ kind: "timeout" });
    expect(server.seen[0]!.headers["x-iutverse-timeout-ms"]).toBeUndefined();
    await expect(api.GET("/api/auth/me")).resolves.toBeDefined();
  });

  it("upload: true uses the long upload timeout even if the body does not look like multipart (React Native FormData)", async () => {
    slow(100);
    const api = make({ timeoutMs: 30, uploadTimeoutMs: 2_000 });
    await expect(api.GET("/api/auth/me")).rejects.toMatchObject({ kind: "timeout" });
    await expect(api.GET("/api/auth/me", callOptions({ upload: true }))).resolves.toBeDefined();
    expect(server.seen.at(-1)!.headers["x-iutverse-upload"]).toBeUndefined();
  });

  it("anonymous leaves the token off", async () => {
    await make().GET("/api/health", callOptions({ anonymous: true }));
    expect(header("authorization")).toBeUndefined();
    expect(header("x-iutverse-anonymous")).toBeUndefined();
  });

  it("callOptions combines options and ignores unset ones", () => {
    expect(callOptions({})).toEqual({ headers: {} });
    expect(callOptions({ anonymous: true, timeoutMs: 1234.9, upload: true }).headers).toEqual({
      "x-iutverse-anonymous": "1",
      "x-iutverse-timeout-ms": "1234",
      "x-iutverse-upload": "1",
    });
  });
});

describe("base URL: credentials and other malformed values", () => {
  it.each(["https://user:pass@api.example.org", "https://user@api.example.org", "https://:secret@api.example.org"])("rejects embedded credentials: %s", (value) => {
    expect(() => normalizeBaseUrl(value)).toThrow(/username or password/);
  });

  it.each(["https://api.example.org/?x=1", "https://api.example.org/#a", "https://api.example.org/api", "javascript:alert(1)", "ws://api.example.org", "//api.example.org", "https://"])("rejects %s", (value) => {
    expect(() => normalizeBaseUrl(value)).toThrow(ApiConfigError);
  });

  it("explains that localhost on a phone is the phone", () => {
    expect(() => normalizeBaseUrl("localhost:8080")).toThrow(/phone/);
  });

  it("accepts a LAN development address only over explicit development opt-in", () => {
    expect(() => normalizeBaseUrl("http://192.168.1.20:8080")).toThrow(/https/);
    expect(normalizeBaseUrl("http://192.168.1.20:8080", { allowInsecureHttp: true, environment: "development" })).toBe("http://192.168.1.20:8080");
    expect(() => normalizeBaseUrl("http://192.168.1.20:8080", { allowInsecureHttp: true, environment: "production" })).toThrow(/https/);
  });
});
