# Architecture

This is the working summary of the architecture decisions in [ADR 0001](adr/0001-separate-mobile-repository.md). If the two disagree, the ADR wins.

## System overview

```text
  Android / iOS app                Web browser
  (iutverse-mobile)                (iutverse, Next.js pages)
        |                               |
        |   HTTPS, Bearer token         |   same-origin /api, Bearer token
        v                               v
  +------------------------------------------------+
  |  iutverse: Next.js Route Handlers  (/api/*)    |  Vercel
  |  controllers -> services -> Supabase           |
  +------------------------------------------------+
        |                    ^
        v                    | authorized Realtime (RLS)
  +------------------------------------------------+
  |  Supabase: Auth, PostgreSQL + RLS, Storage,    |
  |  Realtime                                      |
  +------------------------------------------------+
```

Mobile also talks to Supabase directly for exactly two things, as the web client does: sign-in/session refresh (Auth) and Realtime subscriptions that RLS authorizes. Everything else goes through the API.

## Repository boundaries

| Concern | `iutverse` | `iutverse-mobile` |
|---|---|---|
| Web UI, API routes, controllers, services | Yes | Never |
| DB migrations, RLS, Supabase config, seed data | Yes | Never |
| OpenAPI spec (source of truth) | Yes | Pinned copy / generated client only |
| Expo app, native UI, navigation | No | Yes |
| EAS builds, store metadata, push credentials | No | Yes |
| Backend deploys (Vercel) | Yes | No |
| Notification outbox + worker (Phase 6) | Yes | Client registration/handling only |

The full matrix, with people and CI ownership, is in [ownership-matrix.md](ownership-matrix.md).

## Rules that follow from the decision

1. **Generated client only.** All API calls go through the client generated from the pinned OpenAPI version, wrapped in `src/services/api/client.ts` (token injection, absolute base URL, request IDs, timeouts, cancellation, typed errors).
2. **Authorization lives on the server.** The app hides UI by role for convenience, but every permission is enforced by the API and RLS.
3. **No service-role key, no database URLs, no `DIRECT_URL` in the app or its CI.** Only the public Supabase URL and anon key ship in the binary (anything in a mobile bundle is public).
4. **Absolute URLs.** The app uses an absolute HTTPS API base URL per environment. `localhost` on a phone is the phone, not the dev machine.
5. **Idempotent retries.** Retry-prone mutations (message send, uploads) need an idempotency key; this is backend work (Phase 1.2).
6. **Diagnostics headers.** The client sends `X-Client-Platform` and `X-Client-Version` for observability and upgrade prompts only.

## Authentication on mobile

- Sign-in uses Supabase Auth. Sessions persist in secure storage (Expo SecureStore). Supabase sessions can exceed SecureStore's value size limit (about 2 KB), so the adapter will likely store an encryption key in SecureStore and the encrypted session elsewhere. Settle this in Phase 2.2.
- Google sign-in uses the Supabase OAuth flow with **PKCE** and a deep-link redirect back into the app, opened with `expo-web-browser`. The existing Google OAuth client (type "Web application", redirect URI = Supabase callback) is reused; no native Google client is needed.
- The web client intentionally uses the implicit flow so password-reset emails work on any device. Mobile does not share that constraint for OAuth; password-reset links need a deep-link or universal-link plan (Phase 3).
- After sign-in the app calls `GET /api/auth/me`. Only active IUTverse members pass `authenticateToken`; a Supabase session alone is not membership.
- Sign-up is restricted to `@iut-dhaka.edu` by the `hook_restrict_iut_signup` database hook, so test accounts must use that domain.

## Known backend facts that affect mobile

These were observed in backend commit `32685e3` and should be re-checked when the contract is pinned.

| Fact | Impact |
|---|---|
| No OpenAPI spec or `/api/v1` | Phase 1.1 must create it before any client can be generated. |
| Response envelope is `{ success, data?, message? }` for most routes, but some controllers return custom shapes via `json(status, body)` | Contract standardization is required; typed errors in the client depend on it. |
| Some links in payloads are relative `/api/...` paths | Resolve against the API base or ask the backend to return absolute URLs. |
| Chat attachment and academic file endpoints answer with signed redirects; chat payloads carry one-hour signed URLs | Mobile download/preview code must handle redirects and expiry. |
| Rate limits are per client IP (`X-Forwarded-For`) with fixed windows | Mobile carriers often NAT many users behind one IP, so limits may need to be per user for authenticated routes. Raise with the backend owner before launch. |
| CORS blocks unknown browser origins | Native requests send no `Origin` and are unaffected. Running the app as an Expo web target would be blocked; web is not a supported mobile target. |
| Chat uses Supabase Realtime with polling fallback | Mobile must handle app backgrounding, reconnects and token refresh on the Realtime socket. |
| Local Docker stack serves on `localhost:8080` (app) and `localhost:8000` (Supabase) | A phone must use the dev machine's LAN IP or a tunnel; the backend needs `SUPABASE_PUBLIC_URL` set to a reachable address. See [environments-and-secrets.md](environments-and-secrets.md). |
