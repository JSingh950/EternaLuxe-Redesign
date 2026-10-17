# Verification record — 16 October 2026

## House update — 17 October 2026

The opening now uses the supplied glass-vase orchid film, not the dark film on the old site. Its native 9:16 framing is retained; no landscape stretching or invented resolution enhancement is applied. A second film from the existing House page appears in the philosophy section. Browser checks confirmed correct playback, manual pause, lazy loading of the second film and off-screen pausing. The updated House page had no horizontal overflow and one H1 at actual viewports of 375, 768, 1440 and 1920 CSS pixels. Desktop/mobile screenshots were visually inspected; no browser errors were observed. Build, all 10 reported tests, the Squarespace package generator and dependency audit passed. The expanded static check verified 1,115 references and all 20 active media records, including video posters and exclusion of the rejected opening.

## Automated

- `npm run build`: 20 pages plus three legacy-route redirects generated.
- `npm test`: nine API/static subtests plus parent test passed (10 reported by Node). Tests cover origin/CORS, CSRF including malformed tokens, input validation, separate policy acceptance, idempotency, policy snapshots, append-only evidence, consent-gated analytics, withdrawals, security headers, media ranges and production configuration gates.
- `npm run check`: 23 routes, 1,110 local references, one H1 per content page, unique IDs, image alternatives and use of all 19 supplied assets passed.
- `npm audit --audit-level=high`: zero known dependency vulnerabilities after updating Sharp to 0.35.5. This is a dependency check, not a penetration test.
- Media pipeline rerun successfully with the updated dependency.
- Squarespace generator produced 20 blocks and scoped CSS/JS in a temporary directory using an explicitly nonproduction example asset host. No live Squarespace installation was attempted.

## Browser

- Layout checks on ten representative routes at 375, 768, 1440 and 1920 CSS pixels: no horizontal overflow and one H1 in all 40 combinations.
- Desktop/mobile homepage and collection composition inspected visually.
- Responsive film sources loaded and played; preserved still posters cover loading/failure states.
- Collection scale/experience filters narrowed to the Large Floral Club arrangement.
- Local enquiry submitted with fictional QA data; response explicitly confirmed local-only storage and no email/subscription delivery.
- Mobile menu → search returned relevant service results. Escape closes the search drawer and restores focus to its opener.
- Bag drawer links to the existing Eternaluxe store cart; no purchase was made.
- Cookie preferences reopened with optional categories off; Reject Nonessential saved and closed the dialog.
- No browser console errors observed in the final pass.

## Not established by these tests

Live payment/subscription/order evidence, vendor newsletter delivery, cancellation operations, actual Squarespace cookie behavior, screen-reader conformance, production Lighthouse/mobile-hardware performance and legal compliance remain release gates. See RELEASE-CHECKLIST.md. Local functional tests must not be represented as successful live commerce transactions.
