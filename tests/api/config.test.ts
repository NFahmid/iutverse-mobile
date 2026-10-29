import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiConfigError, createRequestId, normalizeBaseUrl, resolveApiBaseUrl } from "../../src/services/api";

describe("normalizeBaseUrl", () => {
  it("accepts https origins and strips a trailing slash", () => {
    expect(normalizeBaseUrl("https://api.example.org")).toBe("https://api.example.org");
    expect(normalizeBaseUrl("https://api.example.org/")).toBe("https://api.example.org");
    expect(normalizeBaseUrl("  https://api.example.org:8443  ")).toBe("https://api.example.org:8443");
  });

  it.each([undefined, null, "", "   "])("rejects a missing value (%s)", (value) => {
    expect(() => normalizeBaseUrl(value)).toThrow(ApiConfigError);
  });

  it.each(["/api", "api.example.org", "localhost:8080"])("rejects a value that is not an absolute http(s) URL: %s", (value) => {
    expect(() => normalizeBaseUrl(value)).toThrow(ApiConfigError);
  });

  it.each(["ftp://example.org", "file:///tmp/x"])("rejects other schemes: %s", (value) => {
    expect(() => normalizeBaseUrl(value)).toThrow(ApiConfigError);
  });

  it("rejects paths, queries and fragments, because contract paths already include /api", () => {
    for (const value of ["https://a.example/api", "https://a.example/?x=1", "https://a.example/#top"]) expect(() => normalizeBaseUrl(value)).toThrow(ApiConfigError);
  });

  it("allows plain http only for development with the explicit opt-in", () => {
    expect(() => normalizeBaseUrl("http://192.168.0.10:8080")).toThrow(/https/);
    expect(normalizeBaseUrl("http://192.168.0.10:8080", { allowInsecureHttp: true })).toBe("http://192.168.0.10:8080");
    expect(() => normalizeBaseUrl("http://192.168.0.10:8080", { allowInsecureHttp: true, environment: "staging" })).toThrow(/https/);
  });
});

describe("resolveApiBaseUrl", () => {
  it("reads the environment variables used by the Expo config", () => {
    expect(resolveApiBaseUrl({ EXPO_PUBLIC_API_BASE_URL: "https://staging.example.org", EXPO_PUBLIC_APP_ENV: "staging" })).toBe("https://staging.example.org");
  });

  it("fails when the variable is missing or the environment is unknown", () => {
    expect(() => resolveApiBaseUrl({})).toThrow(ApiConfigError);
    expect(() => resolveApiBaseUrl({ EXPO_PUBLIC_API_BASE_URL: "https://x.example", EXPO_PUBLIC_APP_ENV: "qa" })).toThrow(/Unknown/);
  });

  it("refuses http in staging and production even when opted in", () => {
    for (const env of ["staging", "production"]) {
      expect(() => resolveApiBaseUrl({ EXPO_PUBLIC_API_BASE_URL: "http://10.0.0.2:8080", EXPO_PUBLIC_APP_ENV: env }, { allowInsecureHttp: true })).toThrow(/https/);
    }
  });
});

describe("createRequestId", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("produces ids the backend will echo", () => {
    const pattern = /^[A-Za-z0-9._:-]{8,128}$/;
    const ids = new Set(Array.from({ length: 50 }, () => createRequestId()));
    expect(ids.size).toBe(50);
    for (const id of ids) expect(id).toMatch(pattern);
  });

  it("falls back when crypto.randomUUID is unavailable (older Hermes)", () => {
    vi.stubGlobal("crypto", undefined);
    const id = createRequestId();
    expect(id).toMatch(/^m-[a-z0-9]+-[0-9a-f]{16}$/);
    expect(id).toMatch(/^[A-Za-z0-9._:-]{8,128}$/);
  });
});
