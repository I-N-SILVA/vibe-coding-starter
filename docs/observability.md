# Observability — error monitoring

The central logger (`lib/logger.ts`) exposes a runtime hook so error reporting
can be wired to any provider **without a build-time dependency**. Every
`log.error(...)` call forwards to a reporter registered on
`globalThis.__plyazErrorReporter` (a no-op until one is registered).

## Wiring Sentry (recommended)

1. Install the SDK:

    ```bash
    npm install @sentry/nextjs
    ```

2. Add the DSN to the environment (Vercel project settings + `.env.local`):

    ```
    SENTRY_DSN=https://...ingest.sentry.io/...
    NEXT_PUBLIC_SENTRY_DSN=https://...ingest.sentry.io/...
    ```

3. Create `instrumentation.ts` at the project root (Next.js runs it on server
   startup) and register the reporter:

    ```ts
    import * as Sentry from '@sentry/nextjs';

    export async function register() {
        if (process.env.SENTRY_DSN) {
            Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
            globalThis.__plyazErrorReporter = (message, meta) => {
                Sentry.captureException(new Error(message), { extra: meta });
            };
        }
    }
    ```

4. (Optional) For client-side and full Next.js integration, run
   `npx @sentry/wizard@latest -i nextjs`, which also wraps `next.config.js`.

Until step 1–3 are done, `log.error` simply logs as before — the hook is inert
and safe in production. This means the **player-stats-style 500s and the now-fixed
unauthenticated-mutation attempts would surface in Sentry the moment the DSN is set**,
with zero further code changes.
