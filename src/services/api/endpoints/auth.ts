import { unwrap, type ApiClient } from "../client";
import type { components } from "../generated/schema";

/** Identity of the signed-in, active member. Shape comes from the pinned contract (`Me`). */
export type Me = components["schemas"]["Me"];

/**
 * `GET /api/auth/me`: the membership gate. Resolves for an active IUTverse member; rejects with an `ApiError`
 * (`unauthorized` when the token is missing or expired, `forbidden` with `isMembershipRequired` for non-members).
 */
export async function getCurrentMember(api: ApiClient, init?: { signal?: AbortSignal }): Promise<Me> {
  const body = await unwrap(api.GET("/api/auth/me", init));
  return body.data;
}
