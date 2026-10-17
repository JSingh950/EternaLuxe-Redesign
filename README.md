# Eternaluxe — the digital House

A responsive editorial storefront built around Eternaluxe's supplied photography and films. The current build contains 20 pages, five service/product pages, all 16 supplied photographs and all three supplied films, plus the composition film from the existing House page. The former 3D and composited venue experiments are preserved under `legacy/`, not served on the website. The House opens with the supplied glass-vase orchid film in an uncropped portrait presentation.

## Run the preview

Requires Node 22.13+ and Git LFS for original media.

```sh
git lfs pull
npm ci
npm run build
npm start
```

Open http://localhost:4173/ . Use the HTTP server, not `file://`: forms, consent evidence, search and media delivery need it. Preview submissions are stored only on this computer; they are not emailed and do not subscribe anyone.

```sh
npm test
npm run check
```

## Source and seasonal updates

- `scripts/build.mjs`: semantic page templates and metadata.
- `src/catalog.mjs`: service names, prices, routes and navigation.
- `src/media.mjs`: source media inventory, descriptions and assignments.
- `src/styles.css`, `src/site.js`: responsive design, search, filters, accessible drawers, film playback and consent UI.
- `src/policies/`: working legal drafts, requiring business inputs and counsel review.
- `server.mjs`: local preview and consent/form API.
- `dist/`: generated deliverable; edit source and rebuild rather than editing generated HTML.
- `assets/source-media/`: original media tracked with Git LFS.
- `image-rights-register.csv`: inventory recording the user's rights attestation. This is not independent verification of licenses.

Run `npm run media` to prepare responsive AVIF/WebP/JPEG images, silent MP4/WebM films, posters and local fonts. Existing media outputs are reused. After changing an edit, regenerate that derivative deliberately. The desktop campaign film uses seconds 6–19 of the supplied original; mobile uses the portrait orchid film. New seasons should replace curated content records, not introduce a new layout system.

## Commerce and release status

This is a working local storefront and integration package, not a deployed replacement for Squarespace. Bag and order links hand off to Eternaluxe's existing store. No simulated payment or local cart is presented as a real order. Prices and new photograph-to-service mappings require final business confirmation; photographs are explicitly described as creative references where exact SKU matching is not established.

The local implementation includes separate Terms/Privacy controls, optional unchecked marketing consent, equal-prominence cookie choices, server-side evidence, policy hashes, append-only preference changes, and an internal export command. It does not establish legal compliance by itself. Native Squarespace checkout/order consent, payment events, vendor cookies, customer cancellation flows and production retention controls must be integrated and tested on the live platform.

Read [deployment instructions](docs/DEPLOYMENT.md), [design and asset direction](docs/DESIGN.md), and the [release checklist](RELEASE-CHECKLIST.md). Policy drafts must be reviewed by New York-qualified counsel before publication. Unverified claims, testimonials, founder biographies and delivery promises are not invented.

## Evidence and security

SQLite is stored under ignored `.runtime/`, outside the served directory. Consent records contain policy versions/hashes, UTC times, checkbox states, source, a random receipt's hash and a hash-chain link. Personal form data is separate. Update/delete triggers prevent ordinary application changes to evidence; this is not certified immutable storage against a database administrator. A production archive and retention process is required.

The API validates origin, CSRF, field types/lengths and allowed values, limits request sizes/rates, and uses HttpOnly sessions. Raw IP addresses are not persisted by this application. Reverse-proxy/vendor logging must be separately configured. Production requires HTTPS, reviewed policies and an authenticated delivery webhook. Secrets, runtime submissions and consent exports must never be committed.

Authorized internal export:

```sh
node scripts/export-consent.mjs --authorized
```

The command emits JSONL to stdout. Store exported evidence only in approved restricted storage.
