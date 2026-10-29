# Smoke tests against a live backend

`tests/smoke/auth-me.smoke.test.ts` exercises the whole vertical slice against a running backend:

```text
Supabase password sign-in -> access token -> transport (bearer injection) -> generated /api/auth/me and /api/feed -> typed result
```

plus the failure paths (no token: 401 `AUTH_TOKEN_REQUIRED`; garbage token: 403 `AUTH_TOKEN_INVALID`) and request-id echo. It is read-only: it creates and changes nothing.

It is separate from the offline suite (`npm test`), which never needs a backend.

## Configuration

All values come from environment variables. Never commit them.

| Variable | Meaning |
|---|---|
| `SMOKE_API_BASE_URL` | Backend origin, for example the staging deployment. |
| `SMOKE_SUPABASE_URL` | Supabase project URL of **that** backend. |
| `SMOKE_SUPABASE_ANON_KEY` | Its public anon key. |
| `SMOKE_EMAIL`, `SMOKE_PASSWORD` | A dedicated **non-production** member account (see `environments-and-secrets.md`). |
| `SMOKE_ALLOW_INSECURE_HTTP=1` | Only for a local Docker stack over plain http. |
| `SMOKE_REQUIRED=1` | Fail instead of skip when anything is missing. CI sets it. |

## Run locally

```bash
SMOKE_API_BASE_URL=https://<staging> SMOKE_SUPABASE_URL=https://<project>.supabase.co SMOKE_SUPABASE_ANON_KEY=<anon> \
SMOKE_EMAIL=<test member> SMOKE_PASSWORD=<password> npm run test:smoke
```

Without the variables the tests are **skipped** and Vitest reports them as skipped (they are not counted as passed).

## Against the backend's local Docker stack

From the backend repo run `docker-compose up` (see its README). It serves the app on `http://localhost:8080` and Supabase on `http://localhost:8000`,
signs up any `@iut-dhaka.edu` address without email confirmation, and its demo anon key is in the backend's `docker-compose.yml` (it only works against that local stack).
Use `SMOKE_ALLOW_INSECURE_HTTP=1` and a throwaway account. Run the tests from the same computer, because `localhost` on a phone is not this computer.

## CI

`.github/workflows/ci.yml`:

* `verify` (required) runs offline checks on every PR and push.
* `staging-smoke` runs on pushes to `main`/`development`, nightly and manually **only when** the repository variable `SMOKE_API_BASE_URL` is set; it sets
  `SMOKE_REQUIRED=1`, so a half-configured repo fails loudly. It never runs on pull requests.
* `staging-smoke-not-configured` prints a notice when the variable is absent, so the gap is visible in the run.

Repository settings to add when staging exists (Settings -> Secrets and variables -> Actions):

| Kind | Name |
|---|---|
| Variable | `SMOKE_API_BASE_URL`, `SMOKE_SUPABASE_URL`, `SMOKE_SUPABASE_ANON_KEY` |
| Secret | `SMOKE_EMAIL`, `SMOKE_PASSWORD` |

## Status

Run once, on 2026-10-29, against the backend's local Docker stack: 5 of 5 passed (see [phase-c-progress.md](phase-c-progress.md)). Not yet run against staging, which does not exist (manual step M7).
