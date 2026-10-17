# Verification record — 16 October 2026

## House motion and media clarity update — 17 October 2026

The former 43-second overlapping collage in “Moving compositions” was replaced with a clean 30-second, 1440×1080 film generated from five owner-supplied high-resolution Eternaluxe photographs. The new sequence uses restrained optical movement, 1.2-second dissolves and a matching first/final frame for a calmer loop. H.264 is offered first for hardware-friendly playback; visible films preload, off-screen films still pause, and all House video surfaces use compositor-backed rendering. Browser inspection confirmed continuous playback at full 1440×1080 dimensions, ready state 4 and no console warnings or errors.

All photographs were regenerated from their originals with Lanczos resampling, restrained output sharpening, higher AVIF/WebP quality, a 1,920-pixel JPEG fallback and responsive sources up to 2,400 or 2,560 pixels where the original supports them. All supplied videos were re-encoded from their originals at higher quality without inventing detail or upscaling low-resolution footage. Build, all 11 tests, the 23-route/1,115-reference static check and the high-severity dependency audit passed.

## Enquiry routing update — 17 October 2026

Production enquiry events now carry the designated recipient `nicky.vanessaus@gmail.com`, the visitor address as `replyTo`, and an Eternaluxe project/name subject. An automated production-mode test verifies the authenticated webhook payload and delivered database state. All 11 tests, the 20-page build, the 23-route/1,115-reference static check and a high-severity dependency audit passed. The local preview deliberately continues to store submissions locally and send no email. A real staging submission remains required after the webhook email receiver—or the native Squarespace Form Block Email storage—is configured.

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
