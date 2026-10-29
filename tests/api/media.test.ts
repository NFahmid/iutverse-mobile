import { describe, expect, it } from "vitest";
import { redactUrl, resolveMedia, resolveMediaUrl } from "../../src/services/api";

const API = "https://api.example.org";
const opts = { apiBaseUrl: API };

describe("resolveMedia: what the backend returns today", () => {
  it("keeps an absolute public Supabase Storage URL unchanged and does not require auth", () => {
    const url = "https://abcdefgh.supabase.co/storage/v1/object/public/post-media/00000000-0000-4000-8000-000000000001/post-1730000000-123.png";
    expect(resolveMedia(url, opts)).toEqual({ url, requiresAuth: false });
  });

  it("resolves the academic file path against the API origin and flags it as authenticated", () => {
    expect(resolveMedia("/api/academic/resources/3/file", opts)).toEqual({ url: `${API}/api/academic/resources/3/file`, requiresAuth: true });
  });

  it("resolves the profile picture redirect endpoints the same way", () => {
    expect(resolveMedia("/api/profile/picture/00000000-0000-4000-8000-000000000001", opts)?.requiresAuth).toBe(true);
  });

  it("keeps a signed chat attachment URL as is (token intact) and does not send our bearer to it", () => {
    const url = "https://abcdefgh.supabase.co/storage/v1/object/sign/chat-attachments/u/message-1-2.png?token=eyJhbGciOi.payload.sig";
    expect(resolveMedia(url, opts)).toEqual({ url, requiresAuth: false });
  });

  it("returns null for missing media", () => {
    for (const value of [null, undefined, "", "   "]) expect(resolveMedia(value, opts)).toBeNull();
  });
});

describe("resolveMedia: correctness", () => {
  it("never double-prefixes an absolute URL, even one on the API origin", () => {
    expect(resolveMediaUrl(`${API}/api/academic/resources/3/file`, opts)).toBe(`${API}/api/academic/resources/3/file`);
  });

  it("flags an absolute URL on the API origin under /api/ as authenticated, and other paths on it as public", () => {
    expect(resolveMedia(`${API}/api/chat/attachments/7`, opts)?.requiresAuth).toBe(true);
    expect(resolveMedia(`${API}/public/logo.png`, opts)?.requiresAuth).toBe(false);
    expect(resolveMedia("/files/logo.png", opts)).toEqual({ url: `${API}/files/logo.png`, requiresAuth: false });
  });

  it("trims whitespace", () => {
    expect(resolveMediaUrl("  /api/x  ", opts)).toBe(`${API}/api/x`);
  });

  it("works with a base URL that has a port", () => {
    expect(resolveMediaUrl("/api/x", { apiBaseUrl: "https://api.example.org:8443" })).toBe("https://api.example.org:8443/api/x");
  });
});

describe("resolveMedia: refuses what it must not open", () => {
  it.each([
    ["javascript scheme", "javascript:alert(1)"],
    ["data URL", "data:image/png;base64,iVBORw0KGgo="],
    ["file URL", "file:///etc/passwd"],
    ["blob URL", "blob:https://example.org/uuid"],
    ["content URI", "content://media/external/images/1"],
    ["ftp", "ftp://example.org/x.png"],
    ["protocol-relative", "//evil.example/x.png"],
    ["backslash host trick", "/\\evil.example/x.png"],
    ["backslash in scheme-relative", "\\\\evil.example\\x.png"],
    ["embedded credentials", "https://user:secret@example.org/x.png"],
    ["bare storage path", "00000000-0000-4000-8000-000000000001/post-1-2.png"],
    ["bare legacy name", "photo.png"],
    ["plain http", "http://example.org/x.png"],
    ["not a url", "https://"],
  ])("%s", (_name, value) => {
    expect(resolveMedia(value, opts)).toBeNull();
  });

  it("accepts plain http only when development explicitly allows it", () => {
    expect(resolveMedia("http://192.168.1.5:8000/storage/v1/object/public/a/b.png", { apiBaseUrl: "http://192.168.1.5:8080", allowInsecureHttp: true })?.url).toContain("192.168.1.5:8000");
    expect(resolveMedia("http://192.168.1.5:8000/x.png", { apiBaseUrl: API })).toBeNull();
  });

  it("returns null when the configured base URL itself is unusable", () => {
    expect(resolveMedia("/api/x", { apiBaseUrl: "not a url" })).toBeNull();
  });
});

describe("redactUrl", () => {
  it("drops the query and fragment, where signed tokens live", () => {
    const signed = "https://abcdefgh.supabase.co/storage/v1/object/sign/chat-attachments/u/m.png?token=SECRET.TOKEN.VALUE#frag";
    const safe = redactUrl(signed);
    expect(safe).toBe("https://abcdefgh.supabase.co/storage/v1/object/sign/chat-attachments/u/m.png?[redacted]");
    expect(safe).not.toContain("SECRET");
  });

  it("leaves a URL without a query alone and survives garbage", () => {
    expect(redactUrl("https://a.example/x.png")).toBe("https://a.example/x.png");
    expect(redactUrl("garbage")).toBe("[invalid url]");
  });
});
