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

## 17 November revisions — supersedes the first draft for Collections and Club

The owner rejected added mats as a substitute for matching image sizes, approved slight background cropping, and approved adding two existing pieces as companions on Home while retaining Amber and Scarlet.

- Collections now groups the original 20 cards by compatible native proportions. Actual images fill equal-size slots within each group: 4:5 editorial, 4:3 landscape and 2:3 portrait. All padding/mats are removed for those photographs. The grouped layout preserves filters, Show More and all piece URLs; no cards are deleted.
- Home has two approved pairs: Amber + Plum Study (landscape), Scarlet Sculpture + Orchid Salon (portrait). The two original pieces remain. These are existing collection photographs, not new generated assets.
- The homepage Club photograph has 12px rounding on the media itself with no oval backing or mat. The existing Floral Club page video has the same light rounding. Neither photograph nor film is replaced; all Club text, pricing and CTA destinations remain.
- Restored scene backgrounds use ivory/champagne/stone neutrals (#e5dccb, #eee5d7 and related highlights), while the flowers retain their original colors.
- Other pages' prior organic-card draft is unchanged by this revision.

The five numbered removals are **still unapproved**: the owner selected “Approve selected items — I’ll list the numbers,” but has not supplied numbers. All five remain in actual draft source. Proposed screenshots only hide them for review.

Latest review: `output/focused-floral-review-20261117/index.html`. The 16 November artifact remains a historical before state.

Revised verification passed for actual matching image dimensions at 375/768/1440/1920px, original media and links, full-width no-mat images, transparent Club backing, warm scene colors, hero layers, Club price and no-JavaScript visibility. Grouped Show More and filtering were also verified. The full layout suite passed for all 30 public pages at four viewports, and all 14 existing tests passed.

The revised photograph verifier also checks every revealed Collections photograph (using Show More), confirms the actual image rectangle equals its matching slot with zero mat padding, and limits the calculated cover crop to under 7.5% of source area. The original flower colors and image files remain unchanged. Companion pairs and crops are shown at full resolution in the latest review.

## Feature publication — 17 November 2026

The owner explicitly requested pushing the reviewed changes to the live website. That request authorizes publication of the matched-photo groups and approved companion pairs, rounded Club media without the added oval, restored floral scenes, and warm neutral backgrounds. It supersedes the earlier draft-only publication hold for these additions.

The five numbered removals remain unselected and have not been applied. Slideshows, ribbons, short rules and CTA underlines therefore remain in actual source and production. The local review artifacts are historical previews; their “proposed” screenshots still illustrate those unapproved removals and should not be mistaken for the complete live state.

- Published source: `7bbb7a1` (feature commits remain separately revertible).
- Staged production deployment: `dpl_FQAjVvQafATLAjULsDeXuR2GDgDN`, promoted after the deployed focused verification passed at four viewport widths.
- Live site: https://eternaluxe-redesign.vercel.app/
- Frozen Part 2 repository remains untouched; the `rollback/before-focused-floral-2026-11-16` tag preserves the pre-feature baseline.

## Approved Home removals — 17 November 2026

The owner explicitly requested removal of the Home Collection section, Home slideshow/animated line, and the lines in the screenshot of the two Home discovery articles.

Applied scope:
- Home only: removed the Collection heading, View All link and four preview cards. The dedicated Collections page and all products/media remain.
- Home only: removed “Composed for your world.” and its moving gallery/control, plus the following black/champagne ribbon.
- Home discovery articles: removed the two short rules above the copy and the two CTA underlines. Both articles and destinations remain.

House gallery and House ribbons remain pending, as do CTA underlines outside this pictured Home section. Filled architectural curves, films, venue rotation, restored neutral floral scenes and the rounded Club feature are preserved. No original media files were deleted. Rollback tag: `rollback/before-home-removals-2026-11-17`.

These Home-only removals were published on 17 November via deployment `dpl_AAj7p2DP469yaMytqXiTMt6SDzDy` after desktop/mobile staged verification. The dedicated Collections page retains all 20 cards; House retains its own gallery and two ribbons pending separate selection. The two restored floral scenes and both Home discovery articles/links were verified present.
