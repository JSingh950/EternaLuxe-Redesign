# Deployment and Squarespace handoff

## Local preview

Use Node 22.13+ and `npm ci && npm run build && npm start`. The application listens on 127.0.0.1:4173. The preview API writes only to `.runtime/`; it never sends emails or activates subscriptions. The generated `dist/` directory is public; source media and runtime evidence are not.

## Production API

Deploy the Node server on a persistent host with a durable filesystem, not an ephemeral serverless filesystem. Load process environment variables from the deployment secret manager (the server does not automatically load `.env`). Required values:

| Variable | Purpose |
| --- | --- |
| NODE_ENV=production | Enables release gates, Secure cookies and HSTS |
| SITE_ORIGIN | Exact approved HTTPS storefront origin |
| HOST / PORT | Private/reverse-proxy listener configuration |
| DATA_DIR | Restricted persistent database directory outside public assets |
| LEGAL_APPROVED=true | Only after actual counsel/business approval |
| ENQUIRY_WEBHOOK_URL | HTTPS endpoint for enquiries and email preference changes |
| ENQUIRY_WEBHOOK_SECRET | Secret bearer credential from the deployment secret manager |
| ENQUIRY_RECIPIENT | Enquiry inbox. Set to `info@eternaluxenet.com` |

### Vercel deployment

The repository also includes small Web-standard functions under `api/` for the connected Vercel project. They preserve same-origin checks, an HttpOnly CSRF cookie, field validation, separate Terms and Privacy states, policy hashes, UTC timestamps, privacy-preserving receipt hashes and idempotency keys. They do not write to Vercel's ephemeral filesystem. Instead, an authenticated HTTPS receiver must durably store the event before returning a successful response.

Configure `LEGAL_APPROVED=true`, `ENQUIRY_WEBHOOK_URL`, and `ENQUIRY_WEBHOOK_SECRET` for the Production environment in Vercel, then redeploy. The webhook secret must be at least 16 characters. Enquiry delivery is fail-closed: if legal approval or the authenticated receiver is missing, the form returns an unavailable message and never claims that an enquiry was received. The receiver must email enquiry events to the `recipient` in the signed payload, which is fixed by the application to `info@eternaluxenet.com`.

Use a reverse proxy with TLS, bounded request timeouts, appropriate distributed rate limits and minimal logs. The current rate limiter and sessions are per-process. Multi-instance operation requires a shared session/rate-limit store and a supported shared database strategy. Do not serve SQLite files, consent exports, environment files or originals publicly. Restrict host/database access and configure encrypted disks/backups, recovery tests, retention, incident response and operational alerts before launch.

For Squarespace, host the API on a **same-site** HTTPS subdomain (for example api.eternaluxe.net) and set SITE_ORIGIN to the actual storefront origin. Exact-origin credentialed CORS is implemented; cross-site requests remain rejected and the session cookie is SameSite=Strict. Add `<meta name="eternaluxe-api" content="https://YOUR-ACTUAL-SAME-SITE-API-HOST">` in page/global head injection. Do not use the example host without configuring it. Browser fetches include credentials and a session-bound CSRF token.

### Delivery contract

The server POSTs `{id, kind, values, createdAt}` with `Authorization: Bearer …` and `Idempotency-Key: id`. Enquiry events additionally include `recipient`, `replyTo` and `subject`; the configured receiver must email the complete enquiry to `info@eternaluxenet.com`, using `replyTo` for the visitor's address. The receiver must authenticate, deduplicate and durably accept the event before returning 2xx. Current public form kinds are enquiry and withdrawal. Process withdrawals and preference changes as new events, not overwritten history. Provider-side unsubscribe links and a verified identity workflow for access/deletion requests are still required if marketing is enabled elsewhere.

If the live enquiries page remains a native Squarespace Form Block instead of this API, open the block's **Storage** settings, add **Email**, set the recipient to `info@eternaluxenet.com`, remove any obsolete recipient, save, and complete a real staging submission. Keep the address server-side or in Squarespace storage settings rather than exposing it in page markup.

Failed delivery is marked retry and retried every minute in batches of ten. Monitor pending/retry records and alert on aging failures; the user response confirms receipt by this service, not successful delivery to a human. Verify provider operations and recovery with the chosen vendor before launch. Do not expose an unauthenticated admin interface.

### Evidence

Consent events record immutable policy snapshots/hashes, UTC time, states, source and a submission ID when applicable. Random receipt hashes connect preference events without storing raw IPs in evidence. The separate submissions table contains necessary contact/project data. SQLite triggers and a hash chain provide application-level append-only behavior, not protection against a privileged administrator rewriting the database. Export/back up to a separately controlled archive if counsel requires stronger evidence guarantees. Define a documented retention/archive procedure; never disable the triggers casually.

Export locally under approved access: `node scripts/export-consent.mjs --authorized`. This emits JSONL to stdout; no public export endpoint exists. Policies are rebuilt as content-addressed snapshots; verify the displayed copy matches the deployment's policy manifest and preserve old snapshots with old evidence.

## Squarespace asset and page package

After choosing the actual controlled HTTPS asset host:

```sh
ASSET_BASE=https://YOUR-ASSET-HOST/path-to-assets node scripts/squarespace.mjs
```

The generator creates scoped CSS, runtime JavaScript and page blocks under `integration/squarespace/`. Upload `dist/assets` to that host. Install the generated CSS and JS with the pinned local GSAP bundle; insert each page block into a suitable blank/template page. Remove duplicate native header/footer only through supported Squarespace configuration. Inspect generated blocks on staging: platform wrappers, code-injection permissions and template styles vary. The generator is a handoff aid, not a verified live installation.

Configure native routes to match `/house` (including `#ikebana`), `/collections`, `/archive`, `/atelier`, `/floral-club`, `/enquiries`, `/preferences` and the policy/product routes. Replace integration product blocks' order handoffs with **native Squarespace commerce blocks** mapped to approved SKUs, inventory, taxes, shipping and subscription plans. Keep custom animation outside native checkout. Configure policy disclosures and server-side order evidence through supported checkout/order integrations. Do not assume enquiry-form evidence covers purchases.

The standalone bag stores product IDs and quantities locally under `eternaluxe-bag-v1`, with add, quantity and removal controls. It hands the selected pieces to this site's Contact Us form; it never redirects to the original store. This is a quote/enquiry bag, not a card checkout. If the enquiry delivery service is unconfigured, Contact Us opens a prepared email to `info@eternaluxenet.com`; the visitor must send that message in their email app. Automatic sending requires the authenticated delivery receiver above. Do not fire purchase or checkout-success events for an enquiry.

Set per-page SEO fields, canonical URLs and social images to actual published asset URLs; install schema only where supported and accurate. The static build's `/assets/` social image URLs must be adapted if using an external asset host. Add permanent redirects from legacy URLs, particularly `/accesibility` to `/accessibility`. The local server implements that redirect; a static HTML redirect is only a fallback.

## Cookie and legal review

The custom preview loads no advertising vendors. Optional first-party measurement is consent-gated in browser and API. Squarespace, payment, analytics, fonts, social embeds and installed extensions have their own behavior: audit the actual production site and configure one coordinated consent mechanism. Do not run competing banners. Native scripts must be blocked before applicable consent, not merely hidden behind a preference UI.

All legal pages are working drafts. Replace unconfirmed data practices, contact details, retention periods and refund/subscription terms with approved facts, then obtain counsel review. The production environment gate is operational protection, not a legal certification. Complete RELEASE-CHECKLIST.md before public rollout.
