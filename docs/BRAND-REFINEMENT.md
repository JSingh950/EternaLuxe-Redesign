# Brand refinement / 17 October 2026

## Sources and rights
Owner authorized commercial use of supplied Eternaluxe content in this conversation. Logo originals are preserved in assets/brand; transparent padding is trimmed for display, with proportions preserved.
- White logo: https://images.squarespace-cdn.com/content/v1/6912b9200a185e503b035590/6e723717-e4fc-41b6-85cd-38984b2b7b16/eternaluxe+white+name+logo.png
- Champagne logo: https://images.squarespace-cdn.com/content/v1/6912b9200a185e503b035590/add6ec1b-1729-48b7-8b5d-3aa5beadd220/Logo-eternaluxe-luxury-artificial-arrangements.png
- Room: approved legacy/venue-prototype/assets/images/venue-gallery-v3.webp, copied without architectural edits.
- Additions: assets/brand/venue-additions.png, generated transparent AI-assisted derivative, not a photograph of an actual installation or exact purchasable product.

Generation brief: transparent 1774x887 overlay for the approved room; sculptural ivory orchids and leafy branches in a charcoal ceramic vase on the central table, warm right-hand window light, natural contact shadow; rectangular preserved-moss artwork inside the left wall panel, slim champagne frame, wall-matched perspective. No background, text or logos. Original generated output was exec-04019b12-4af8-47ef-bf04-79e993d5ba96.png. Mechanical separation and tabletop alignment are reproducible in scripts/prepare-brand.mjs.

## Verification
Run npm run build, npm run check, npm test. For browser tests install Chromium with npx playwright install chromium, then node scripts/verify-brand.mjs against localhost:4173. Optional TEST_URL targets another deployment. Responsive screenshots are written to /tmp/eternaluxe-brand-WIDTH.png, not committed.

## Production limitations
Vercel now serves the storefront and the fail-closed Web-standard form bridge under `/api`. Cookie choices apply locally even when evidence delivery is unavailable. Durable consent receipts and enquiry delivery to `nicky.vanessaus@gmail.com` require the authenticated durable webhook and legal-approval environment gate described in DEPLOYMENT.md. Automated tests exercise the local server and mocked Vercel delivery contract; they do not prove real inbox delivery. Legal policies remain review drafts. Native store checkout remains an external handoff.
