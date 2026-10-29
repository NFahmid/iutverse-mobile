# Phase plan and status

The full amendments are in [`IUTverse_Mobile.md`](../IUTverse_Mobile.md) (separate-repository amendments to `IUTverse_Mobile_Detailed_Phased_Development_Plan.md` v1.0). That base plan is not in this repository; add it under `docs/` if you want it versioned with the code.

## Sections A and B: done in this repo

### A. Architecture decisions

| # | Decision | Where recorded | Status |
|---|---|---|---|
| 1 | Two repositories | [ADR 0001](adr/0001-separate-mobile-repository.md), [ownership-matrix.md](ownership-matrix.md) | Documented |
| 2 | One logical backend | ADR 0001, [architecture.md](architecture.md) | Documented |
| 3 | API-first, pinned OpenAPI, generated client | ADR 0001, [api-compatibility-policy.md](api-compatibility-policy.md) | Documented; generator choice deferred to the Phase 1.1 spike |
| 4 | No cross-repo source imports | ADR 0001 (Compliance) | Documented |
| 5 | Platform-specific auth | [architecture.md](architecture.md) | Documented |
| 6 | Independent releases | [cross-repo-workflow.md](cross-repo-workflow.md) | Documented |
| 7 | Security rules | ADR 0001, [environments-and-secrets.md](environments-and-secrets.md) | Documented |
| 8 | Notifications | ADR 0001 | Documented; backend outbox does not exist yet |

### B. Phase 0.3 checklist

| Item | Status | Evidence / next step |
|---|---|---|
| ADR: repository ownership, shared backend, rationale | Done (Proposed) | [ADR 0001](adr/0001-separate-mobile-repository.md); accept at G0 (M5) |
| API contract ownership and generated-client ownership | Done | [ownership-matrix.md](ownership-matrix.md) |
| API versioning, minimum app version, deprecation policy | Drafted | [api-compatibility-policy.md](api-compatibility-policy.md); numbers need agreement (M5) |
| Cross-repo issue linking and PR dependency conventions | Done | [cross-repo-workflow.md](cross-repo-workflow.md); labels are manual (M4) |
| Staging/production credentials and secrets management | Documented | [environments-and-secrets.md](environments-and-secrets.md); actual setup is manual (M7, M13) |
| Release tagging, branch protections, CI/CD ownership, incident contacts | Documented | Protections (M2) and contact names (M5) are manual |
| Staging backend reachable from devices, test accounts | **Manual** | M7 |

**Deliverables:** architecture ADR, ownership matrix, API compatibility policy, cross-repo contribution guide: all present.

**Exit gate G0:** pending your approval and the manual items M2, M5, M7.

## Not started (by design)

| Phase | Item | Blocked by |
|---|---|---|
| 1.1 | OpenAPI spec and client generation | Backend issues (M6) |
| 1.2 | Cross-platform API transport | Phase 1.1, staging (M7) |
| 2.1 | Expo bootstrap, identifiers, EAS, CI | M9, M11, G0 |
| 2.2 | Service/API integration layer | Phase 1.1, 2.1 |
| 2.3 | Native UI kit and navigation | 2.1 |
| 8.1 / 9.2 | CI additions / release sequence | 2.1 (process already in [cross-repo-workflow.md](cross-repo-workflow.md)) |

`docs/feature-parity-matrix.md` and `docs/release-runbook.md` from the planned tree will be written with Phases 3+ and 9.
