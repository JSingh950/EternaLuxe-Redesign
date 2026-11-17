# Focused floral updates — local review

Baseline: `f8e2b3c` (its tree equals frozen Part 2 `2e36d6a`). Rollback tag: `rollback/before-focused-floral-2026-11-16`. The frozen `eternaluxe-part2` repository is not modified.

## Review boundary

The owner requires location-specific deletion review **before** sections or decorative elements are removed. The draft retains all original page content, photos, links, navigation, prices, films, slideshow modules and ribbon markup. No deployment or push to production is authorized before completing that review. Screenshots marked “proposed” hide the five removal categories in the browser only, to show the resulting spacing; this is not applied source code.

Review artifact: `output/focused-floral-review-20261116/index.html`.

Pending deletions:
1. Home, below Selected Compositions: the “Composed for your world.” moving gallery, heading, supporting gallery introduction and playback control. It displays eight owner photographs (plus repeated copies for animation).
2. The House, after the opening film: the “A world in composition.” moving gallery, heading, supporting introduction and playback control. Its 19 entries comprise 16 photographs and three films (plus repeated copies). The stand-alone opening and Ikebana films remain.
3. The black/champagne ribbons: one on Home after the gallery, two on House around the philosophy section. Filled architectural backgrounds and curved color fields are not part of this removal.
4. Home, above “The beauty of balance.” and “Your space. Your expression.”: only the two short horizontal rules; both articles, copy and links remain.
5. CTA text-link underlines throughout the 30 public pages. Link labels, destinations, focus outlines, form fields and inline policy/consent links remain. The review artifact lists every affected route and CTA label.

All media source files are retained if a slideshow occurrence is approved for removal. Anything beyond this inventory requires a new location-specific review.

## Restored scene provenance

The blue/orchid arrangement and pink arrangement with pebble-filled vessel are the owner's supplied arrangements 3 and 5. The four WebP cutouts are recovered byte-for-byte from commit `3d56066`, from `dist/assets/brand/campaign-arrangement-{3,5}-{640,1040}.webp`, and stored as source assets under `assets/brand/`.

Placement: Home, after the existing opening statement and before Selected Compositions. Blue scene links to the existing Table Arrangements filter; pink scene links to the existing Atelier route. These scenes introduce the collection and commission pathways. No other imagery is displaced.

Desktop and mobile: show complete cutouts with `object-fit:contain` above their original contact shadows and CSS stone surfaces. Do not crop the featured arrangements. The room and surfaces are presentation/context; the owner-supplied flowers remain the products. This restoration introduces no newly generated asset and grants no new rights. Owner-supplied status is inherited from the existing project provenance; artwork-specific rights continue to require the owner's authority.

## Verification

Run `npm run build`, `npm run check`, `npm test`, `node scripts/verify-focused-floral.mjs`, and `npm run check:layout`.

`verify-focused-floral.mjs` compares original links/media/page paths against the rollback tag and checks complete organic 4:5 frames, scene decoding, venue layers, the Club price and no-JavaScript visibility at 375/768/1440/1920 widths.

The review screenshot generator uses the unchanged baseline server at `BASELINE_URL` (default localhost:4181) and current draft at `DRAFT_URL` (default localhost:4173). It annotates before screenshots and applies proposal-only CSS in fresh browser pages for after screenshots. It does not delete content from repository source.

## Review-build results

- Build and route/reference checks passed (34 HTML routes including aliases; 30 public pages).
- All 14 existing tests passed.
- Focused floral verification passed at 375, 768, 1440 and 1920px, including full photographs, 4:5 frames, existing links/media, venue layers, Club pricing and no-JavaScript visibility.
- Full layout suite passed for all 30 public pages at four viewports.
- Production homepage was checked against the frozen Part 2 baseline and remains unchanged.
- Three feature commits and this review commit are saved locally on main. They are not pushed or deployed while the required deletion review is pending.
