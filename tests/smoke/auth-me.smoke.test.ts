// Live smoke test of the vertical slice:
//   Supabase session -> transport (bearer injection) -> generated operation/types -> protected backend endpoint -> typed result
//
// It needs a running backend and a dedicated NON-PRODUCTION member account; nothing is created or changed (read-only calls).
// Configure with environment variables (never commit values):
//   SMOKE_API_BASE_URL           backend origin, for example https://staging.example.org
//   SMOKE_SUPABASE_URL           the Supabase project URL for that backend
//   SMOKE_SUPABASE_ANON_KEY      the public anon key for that project
//   SMOKE_EMAIL, SMOKE_PASSWORD  a test member of that environment
//   SMOKE_ALLOW_INSECURE_HTTP=1  only for a local Docker stack
//   SMOKE_REQUIRED=1             fail instead of skipping when anything above is missing (CI sets this)
import { beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { ApiError, createApiClient, getCurrentMember, type ApiClient, type components } from "../../src/services/api";

const env = process.env;
const missing = ["SMOKE_API_BASE_URL", "SMOKE_SUPABASE_URL", "SMOKE_SUPABASE_ANON_KEY", "SMOKE_EMAIL", "SMOKE_PASSWORD"].filter((name) => !env[name]);
const required = env.SMOKE_REQUIRED === "1";

if (missing.length && required) {
  describe("staging smoke configuration", () => {
    it("is complete (SMOKE_REQUIRED=1)", () => {
      throw new Error(`Missing smoke-test configuration: ${missing.join(", ")}`);
    });
  });
}

describe.skipIf(missing.length > 0)("live smoke: protected endpoint through the generated client", () => {
  let accessToken = "";
  let api: ApiClient;
  const baseUrl = env.SMOKE_API_BASE_URL!;
  const allowInsecureHttp = env.SMOKE_ALLOW_INSECURE_HTTP === "1";
  const clientWith = (getAccessToken: () => string | null, extra: { requestId?: () => string } = {}) =>
    createApiClient({ baseUrl, getAccessToken, allowInsecureHttp, ...extra });

  beforeAll(async () => {
    // Password sign-in through the Supabase Auth REST API, the same endpoint supabase-js uses.
    const response = await fetch(`${env.SMOKE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: env.SMOKE_SUPABASE_ANON_KEY!, "content-type": "application/json" },
      body: JSON.stringify({ email: env.SMOKE_EMAIL, password: env.SMOKE_PASSWORD }),
    });
    if (!response.ok) throw new Error(`Supabase sign-in failed with HTTP ${response.status}; check the smoke account for this environment.`);
    accessToken = ((await response.json()) as { access_token: string }).access_token;
    api = clientWith(() => accessToken);
  });

  it("reads /api/auth/me with a typed result", async () => {
    const me = await getCurrentMember(api);
    expectTypeOf(me).toEqualTypeOf<components["schemas"]["Me"]>();
    expect(me.email.toLowerCase()).toBe(env.SMOKE_EMAIL!.toLowerCase());
    expect(me.membershipStatus).toBe("active");
    expect(me.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(["user", "mod", "admin"]).toContain(me.role);
  });

  it("reads the protected feed with generated types", async () => {
    const { data } = await api.GET("/api/feed", { params: { query: { page: 1, limit: 5 } } });
    expect(data).toBeDefined();
    expect(Array.isArray(data!.data)).toBe(true);
    expect(data!.pagination.page).toBe(1);
    for (const post of data!.data) {
      expect(typeof post.id).toBe("number");
      expect(typeof post.content).toBe("string");
      expect(post.reactionSummary).toHaveProperty("like");
    }
  });

  it("rejects a request without a token as unauthorized (401, AUTH_TOKEN_REQUIRED)", async () => {
    const error = await getCurrentMember(clientWith(() => null)).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "unauthorized", status: 401, code: "AUTH_TOKEN_REQUIRED" });
  });

  it("rejects an invalid token as unauthorized (403, AUTH_TOKEN_INVALID)", async () => {
    const error = await getCurrentMember(clientWith(() => "not-a-real-token")).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "unauthorized", status: 403, code: "AUTH_TOKEN_INVALID" });
  });

  it("echoes the request id so a failure can be correlated with server logs", async () => {
    const id = `smoke-${Date.now().toString(36)}-abcdef`;
    const response = await fetch(`${baseUrl}/api/health`, { headers: { "X-Request-Id": id } });
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe(id);
  });
});
