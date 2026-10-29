# API compatibility policy

**Status:** Proposed defaults, to be confirmed at gate G0. The canonical copy should live in the backend repo at `docs/api/compatibility-policy.md` (see [backend-handoff.md](backend-handoff.md)); keep this file as a mirror until then.

Installed mobile apps cannot be updated on demand, so the backend must keep working for every supported app version. This policy defines what that means.

## 1. Contract versions

- The OpenAPI document's `info.version` follows semantic versioning:
  - **MAJOR**: breaking change (see section 2).
  - **MINOR**: backward-compatible addition.
  - **PATCH**: documentation or description fix, no wire change.
- Each backend release that changes the contract publishes a versioned artifact (release asset or package) and a tag `api-contract-v<version>`.
- `iutverse-mobile` pins **one exact contract version plus the backend commit SHA** it was generated from, and CI fails if the generated client does not match the pin.
- Bumping the pin is a normal mobile PR that links the backend release.

## 2. What counts as breaking

Breaking (needs a new MAJOR and the deprecation process):

- Removing or renaming a route, field, enum value or query parameter.
- Changing a field's type, format, nullability or meaning (for example UTC timestamps becoming local).
- Making an optional request field required, or tightening validation of values that were valid.
- Changing an auth requirement, status code semantics or error envelope shape.
- Changing pagination, ID format or sort order that clients rely on.

Not breaking (MINOR):

- New routes, new optional request fields, new response fields, new enum values **only if** clients are documented to tolerate unknown values. Mobile treats unknown enum values as "unknown", never as a crash.

## 3. URL versioning

- Today all routes are under `/api`. They stay functional throughout the migration.
- `/api/v1` is introduced only when a breaking change cannot be made additively. Until then the current `/api` surface **is** v1.
- When `/api/v2` is needed, `/api` or `/api/v1` keeps working for the full support window in section 4.

## 4. Minimum supported app version and support window (proposed)

- The backend supports every mobile release published in the last **90 days**, and always the **last two minor releases**, whichever set is larger.
- The minimum supported version is stored server-side per platform (config or feature flag, location decided in Phase 1.2). The app reads it at launch and shows a blocking "update required" screen only for versions below it, and a soft prompt for versions that are supported but old.
- `X-Client-Platform` and `X-Client-Version` are diagnostic: they feed dashboards and upgrade prompts. They are **never** used for authorization or access decisions, because clients can lie.

## 5. Deprecation process

1. **Announce:** mark the field or route deprecated in OpenAPI and add `Deprecation` and `Sunset` response headers. Record it in the backend changelog and open a `needs-mobile` issue linked to the replacement.
2. **Replace:** the replacement ships first, and at least **two mobile releases** contain the migration.
3. **Wait:** at least **90 days** after the first mobile release that stops using the old shape.
4. **Verify:** request logs (grouped by `X-Client-Version`) show supported versions no longer call it, or the usage is below the agreed threshold (proposed: under 2 percent of API calls).
5. **Remove:** the removal PR links the evidence from step 4 and the contract MAJOR bump.

Security fixes may shorten the window. Use the incident process in [ownership-matrix.md](ownership-matrix.md), notify the mobile owner immediately, and force-update through the minimum supported version if needed.

## 6. Database changes

Schema changes follow expand, then contract:

1. Add the new column, table or policy while the old one still works.
2. Deploy code that writes both and reads the new one.
3. Remove the old shape only after the support window for any API that exposed it has passed.

RLS policy changes must be checked against the Realtime subscriptions the mobile app uses.

## 7. Verification

- Backend CI validates the OpenAPI document and diffs it against the contract versions still inside the support window (Phase 1.1 / 8.1).
- Mobile CI checks generated-client drift.
- After each backend deploy, staging smoke tests run with the **oldest supported** mobile contract, not only the newest.
- Evidence (workflow run links) is attached to the release PRs of both repositories.
