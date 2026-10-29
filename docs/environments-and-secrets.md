# Environments, credentials and secrets

Staging and production are fully separate: different Supabase projects, different backend deployments, different credentials. One Supabase project per environment is shared by web and mobile.

## Environments

| Env | Backend API | Supabase | Used for | Mobile variant |
|---|---|---|---|---|
| local | Docker stack: app `http://<LAN-IP>:8080`, Supabase `http://<LAN-IP>:8000` | local stack | Backend development, early mobile work | `development` |
| staging | **TODO** staging deployment of `iutverse` (HTTPS) | **TODO** staging project | Device testing, CI smoke tests, internal builds | `staging` |
| production | production deployment of `iutverse` on Vercel | production project | Store releases | `production` |

Rules:

- A phone cannot reach `localhost` on the dev machine. Use the machine's LAN IP, or a tunnel, or staging. For the Docker stack set `SUPABASE_PUBLIC_URL` (backend `.env.example`) to the address the phone can reach, then rebuild, because the URL is baked into the web build.
- Android 9+ and iOS block plain HTTP by default. Local HTTP needs an explicit, development-only exception in the dev build (configured in Phase 2.1); staging and production are HTTPS only.
- Preview and staging backends must not use production Supabase keys. The backend's own deployment guide says previews need their own Supabase project; staging should be built that way.

## What may be in the app bundle

Everything in a mobile binary is public. The app config may contain only:

| Name (planned, finalized in Phase 2.1) | Value | Secret? |
|---|---|---|
| `EXPO_PUBLIC_APP_ENV` | `development` / `staging` / `production` | No |
| `EXPO_PUBLIC_API_BASE_URL` | Absolute HTTPS backend URL | No |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | No |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase `anon` key (public by design; RLS protects data) | No |

**Never** in the app, the repo or mobile CI: `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `EMAIL_PASS`, `OPENWEATHER_API_KEY`, `KLIPY_API_KEY`, Google OAuth client secret, bootstrap admin lists. These stay with the backend.

## Where each credential lives

| Credential | Lives in | Owner |
|---|---|---|
| Backend env vars (service role, Redis, API keys) | Vercel project env vars (Production and Preview scoped separately) | Backend owner |
| Supabase dashboard access, DB passwords | Supabase org, password manager | Backend owner |
| Google OAuth client ID and secret | Google Cloud Console + Supabase Auth provider settings | Backend owner |
| `EXPO_TOKEN` (CI access to EAS) | GitHub Actions secret on `iutverse-mobile` | Mobile owner |
| iOS signing certificates, provisioning profiles, App Store Connect API key | EAS credentials store (managed), backed up per EAS guidance | Mobile owner |
| Android upload keystore | EAS credentials store; download a backup to the password manager | Mobile owner |
| Google Play service-account JSON (for submit) | EAS secret or GitHub secret, never in git | Mobile owner |
| Staging test-account passwords | Password manager, plus GitHub Actions secrets for smoke tests | Both |
| Push credentials (FCM, APNs key) | EAS credentials | Mobile owner |

## Smoke-test configuration (CI)

The live smoke tests read `SMOKE_API_BASE_URL`, `SMOKE_SUPABASE_URL`, `SMOKE_SUPABASE_ANON_KEY` (public values, stored as GitHub Actions *variables*) and `SMOKE_EMAIL`, `SMOKE_PASSWORD` (a dedicated non-production member, stored as *secrets*). They are never needed for ordinary pull requests. See [staging-smoke-tests.md](staging-smoke-tests.md).

## Test accounts (staging)

Sign-up is limited to `@iut-dhaka.edu` by a database hook, so test accounts must use that domain or be created by an admin through the Supabase dashboard. Prepare at least:

| Role | Purpose |
|---|---|
| member A and member B | Chat, feed, reactions, follow-up flows |
| blocked member | Block behavior in chat |
| moderator | Report handling, moderation views |
| admin | Role-gated screens |
| non-member / suspended | Verify `/api/auth/me` rejection |

Credentials go in the password manager and CI secrets only. Do not commit them or put them in issues.

## Rotation and leaks

- Mobile repo: secret scanning and push protection are enabled (see [manual-setup.md](manual-setup.md)); a leaked token is revoked first.
- Backend keys: follow `docs/security-credential-rotation.md` in `iutverse`.
- The Supabase anon key and URL are public, so rotating them is only needed if the project is compromised.
