# Cross-repository workflow

How work is tracked, reviewed and released across `iutverse` ([A-Piyas-04/IUTverse](https://github.com/A-Piyas-04/IUTverse)) and `iutverse-mobile` (this repo).

## 1. Issues

- Reference the other repository with its **full** form: `A-Piyas-04/IUTverse#123` or `NFahmid/iutverse-mobile#45`. Bare `#123` only works inside one repo.
- Use the backlog IDs from the plan in titles: `WEB-API-001`, `MOB-004`, `INT-001`.
- A change that needs both repos gets:
  1. a **tracking issue** in the repo that owns the contract (usually `iutverse`), with a task list linking each repo's issue;
  2. one implementation issue per repo.
- Labels (create them in both repos):

  | Label | Meaning |
  |---|---|
  | `needs-backend` | Mobile work waiting on an API/DB change |
  | `needs-mobile` | Backend change that needs a mobile follow-up |
  | `contract-change` | Touches the OpenAPI contract |
  | `blocked` | Waiting on a linked item |
  | `parity` | Closes a gap between web and mobile behavior |

## 2. Branches and commits (mobile)

- `main` is the trunk: always buildable, protected, PR-only, squash merge.
- Branch names: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`, `docs/<short-name>`.
- Commit messages: Conventional Commits (`feat(auth): ...`, `fix(chat): ...`). Include the issue ID when there is one.
- The backend keeps its existing flow (`development` -> `production`). Open backend PRs against `development` unless the backend owner says otherwise.

## 3. Pull request dependencies

When a PR depends on another repo's change, add this line to the PR description:

```text
Depends on: A-Piyas-04/IUTverse#456
```

Rules:

1. **Backend first.** A backend PR merges and is deployed to staging before the dependent mobile PR merges.
2. Mark the dependent PR as draft or add `blocked` until then.
3. The mobile PR that bumps the pinned contract links the backend release or tag.
4. Breaking contract changes need a linked deprecation plan ([api-compatibility-policy.md](api-compatibility-policy.md)).
5. Neither side merges a cross-repo change without the other owner's approval on the linked PR.

## 4. Review

- Mobile PRs: reviewed by `@NFahmid` (see `.github/CODEOWNERS`).
- Any mobile PR that changes `src/services/api/**`, the pinned contract or auth: also ask the backend owner for a look.
- Backend PRs that change routes, DTOs, auth or Supabase policies: tag the mobile owner so compatibility is checked.

## 5. Branch protection (target configuration)

Apply on GitHub as described in [manual-setup.md](manual-setup.md).

**`iutverse-mobile` / `main`:**

- Require a pull request before merging.
- Require status checks to pass once CI exists (lint, typecheck, tests, contract drift).
- Require branches to be up to date before merging.
- Block force pushes and deletions; require linear history.
- Approvals: 0 while there is a single maintainer (GitHub does not let authors approve their own PRs), 1 as soon as there are two. Enable "require review from Code Owners" at that point.

**`iutverse`:** the backend owner decides; recommended for `production` and `development`: PR-only, security workflow required.

## 6. Release tagging

| What | Tag | Created by |
|---|---|---|
| Mobile app release | `v<major>.<minor>.<patch>`, plus optional `-rc.N` for candidates | `iutverse-mobile` on `main` |
| API contract | `api-contract-v<major>.<minor>.<patch>` | `iutverse` when `info.version` changes |
| Backend production deploy | existing process (`production` branch) | `iutverse` |

The app version in `app.config.ts` matches the tag. Store build numbers are managed by EAS and are not tags.

## 7. Release sequence

Mirrors section G of the plan.

1. Deploy backward-compatible backend and schema changes from `iutverse`.
2. Run production smoke tests and the compatibility run against currently released mobile versions.
3. Build signed Android and iOS releases from `iutverse-mobile` with EAS.
4. Distribute through Play Console and TestFlight / App Store Connect with a staged rollout.
5. Monitor API latency, version headers, auth failures, crashes, messaging, media and push delivery.
6. Keep deprecated fields and routes for the documented support window. For urgent incidents use feature flags or a server rollback; a store binary cannot be rolled back immediately.

Every mobile release PR lists: pinned contract version, backend commit/tag it was verified against, and links to the smoke-test and compatibility runs.

## 8. Credentials and secrets

Summarized here, detailed in [environments-and-secrets.md](environments-and-secrets.md): staging and production use separate credentials, nothing secret goes in git, and the mobile repo never holds backend secrets.
