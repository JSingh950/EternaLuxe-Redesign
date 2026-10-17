# Production release checklist

Checked items describe this local implementation, not live Squarespace certification.

## Implemented

- [x] Solid editorial header outside the hero; responsive luxury-house layouts and restrained typography.
- [x] House, Ikebana, Collections, Archive, Atelier, Concierge, Floral Club, five product pages and six policy pages.
- [x] All 16 supplied images and three films assigned across the site; optimized derivatives and source inventory.
- [x] Search, collection filters, navigation/bag drawers, film play/pause, offscreen pausing and reduced-motion behavior.
- [x] Separate Terms/Privacy controls and optional unchecked marketing consent.
- [x] Equal cookie choices, editable preferences and optional measurement gated by consent.
- [x] Server-side policy hashes, append-only consent events and withdrawals, export command and separate personal-data storage.
- [x] Origin/CSRF checks, input limits, security headers and private local storage.
- [x] Semantic pages, local fonts, metadata, sitemap root, Product/LocalBusiness markup and accessibility typo redirect.
- [x] Automated API/static checks and browser layout checks at 375, 768, 1440 and 1920 pixels.

## Business and legal release gates

- [ ] Confirm legal entity, address, verified domain mailbox, data-flow/vendor inventory and retention periods.
- [ ] Obtain New York-qualified counsel approval for all six policies and actual operational practices.
- [ ] Confirm prices, exact photo-to-SKU mapping, material classifications, dimensions, vessel, longevity, care and substitutions.
- [ ] Supply four distinct accurate views per product: front, detail, context/scale and vessel. Do not substitute photos of different products.
- [ ] Confirm preparation time, delivery ZIP codes, fees, dates, building access and failed-delivery handling.
- [ ] Confirm subscription billing, automatic renewal, pause/skip/cancellation/refund rules and disclose before purchase.
- [ ] Add only approved biographies, project/client names, response-time promises, sustainability claims and testimonials.
- [ ] Retain documentary rights evidence alongside the supplied-content rights attestation; secure any necessary portrait/location permissions.
- [ ] Do not apply a Colombian withdrawal rule as a US requirement; counsel must assess any additional jurisdictions served.

## Integration and production operations

- [ ] Install scoped sections/styles/scripts in Squarespace with native commerce retained.
- [ ] Map catalogue records to live SKUs, stock, shipping, taxes and subscription plans.
- [ ] Connect checkout/order acceptance to policy-version evidence; local enquiry evidence alone is insufficient.
- [ ] Deploy the API behind HTTPS on persistent restricted storage; configure backups, encryption, least-privilege access, monitoring and retention/archive procedures.
- [ ] Configure and test the authenticated webhook, idempotent delivery, retries, newsletter preferences and verified consumer-request workflow.
- [ ] Audit every Squarespace/vendor cookie and script; block nonessential processing where required and test accept/reject/change/withdrawal.
- [ ] Configure server/proxy log minimization, CSP appropriate to Squarespace, asset URLs, canonicals/social images and permanent redirects.
- [ ] Connect real add-to-cart/checkout/subscription purchase measurements without personal information and only under applicable consent.

## Final acceptance on live staging

- [ ] Complete actual one-time and recurring purchases, delivery confirmation, cancellation, enquiry and newsletter flows.
- [ ] Confirm evidence policy versions match the text shown; verify export, withdrawal, delivery failure and backup restoration.
- [ ] Test keyboard, screen reader, zoom, touch, orientation and reduced motion on representative hardware.
- [ ] Test no JavaScript, slow network, missing media, blocked cookies/storage and API outage.
- [ ] Measure production accessibility, contrast, Lighthouse/WebPageTest and mobile media payloads.
- [ ] Validate deployed SEO/schema/sitemap and all old-to-new URL redirects.
- [ ] Obtain final business, design and counsel approval before switching the public site.
