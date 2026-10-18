# Eternaluxe design direction

## Editorial, not ornamental

Reference principles: Gucci's campaign-led storytelling, Hermès' clear product hierarchy and craft narrative, and the restraint of luxury fashion editorial. These inform spacing, hierarchy and pacing; no third-party imagery, logos or site code are copied.

The official white Eternaluxe image logo sits in a dedicated charcoal masthead, above the media. Manrope 500 is used for headings; Nunito Sans 400/600 carries body copy and interface controls. Fonts and both official logo variants are self-hosted. The base palette is warm ivory/charcoal with muted olive and champagne accents. Colour comes predominantly from the flowers. Layouts alternate generous landscape spreads, narrow portrait studies and asymmetric pairs instead of uniform shopping-card rows.

## Asset assignments — all supplied content

| Source | Normalized asset | Primary placement |
| --- | --- | --- |
| 1000105402.MOV | house-film | Archive campaign, seconds 6–19 |
| Floral_arrangement_in_glass_vase_202609071650.MOV | orchid-film | House opening and Floral Club |
| Firefly Animate…MOV | ikebana-film | The House / Influence of Ikebana film study |
| IMG_7276.JPG | scarlet-sculpture | Archive campaign |
| IMG_3414.PNG | botanical-wall | Atelier botanical environments |
| IMG_3413.PNG | green-study | Classic service/design study |
| IMG_3412.PNG | branch-composition | Grand Privé/design study |
| IMG_3411.PNG | orchid-console | Editorial/archive composition |
| IMG_3410.PNG | ivory-salon | Elevated service/design study |
| IMG_3409.PNG | ceramic-study | Ikebana/detail study |
| IMG_3407.PNG | white-composition | Royal service/design study |
| IMG_2517.PNG | garden-light | House/installation detail |
| IMG_2516.PNG | window-garden | Atelier installation |
| IMG_2515.JPEG | signature-orchids | Signature/Floral Club creative reference |
| IMG_2514.PNG | amber-composition | Collection and brand imagery |
| IMG_2513.PNG | plum-study | Homepage/Ikebana spread |
| IMG_2512.PNG | branch-study | Ikebana/Archive |
| copy_C493CAED-AD4C-4B56-B24B-ABB9E79DE0D5.JPEG | night-garden | Archive/night study |
| copy_B717BED7-9531-4410-9E76-D1E6A7076DF4.JPEG | house-portrait | House/editorial portrait |

Preserve the original room, surface contact, vessel and shadows in every photograph. No floating flower cutouts, mismatched tables or simulated 360-degree geometry. Portraits retain portrait framing; landscape art has dedicated landscape placements. Existing embedded branding is retained, not fabricated. New images are not represented as exact commerce SKUs until verified.

## Movement

Films are silent, inline and manually pausable. Only visible media plays; inactive tabs pause. Reduced-motion/data-saving visitors see posters until they choose play. The desktop loop fades into its poster at the seam. One-time section entrances use opacity and a small vertical offset. Content remains semantic and visible without GSAP or JavaScript; forms clearly require the server/JavaScript.

## Seasonal operation

### House film refinement — 17 October 2026

The House now opens with the supplied glass-vase orchid film (`orchid-film`), displayed in its native 9:16 proportions beside the title on desktop and above it on mobile. It is not stretched into a landscape background or artificially upscaled. The darker opening film from the old site was rejected after review and retained only as reference material. The site's existing `Images Motion ETERNALUXE Video.mp4` is preserved as `house-compositions-film` in the philosophy section, framed at its original 1442:1080 aspect ratio. Both films retain pause controls, posters, reduced-motion/data-saving behavior and off-screen pausing. Only the opening film loads initially.

Update catalogue/media data and approved copy, regenerate assets and rebuild. Keep stable page routes and layout components. Archive previous campaigns deliberately. Each release must preserve consent behavior, policy versions, accessibility and live commerce tests; the visual refresh never exempts these checks.

## Brand and room refinement — 17 October 2026
The original approved New York venue is reused unchanged as a base. Transparent AI-assisted additions are registered to its 1774 × 887 coordinates. The table layer is translated into contact with the central tabletop; the moss layer stays within the left wall panel. Both mobile and desktop use the same registered layers, with a dedicated 1560 × 820 mobile crop that keeps both interventions visible.
The 11.4-second opacity-only GSAP timeline holds empty for 1.2 seconds, fades table for 1.4, holds 2.2, fades moss for 1.6, holds 3.5, then fades both out for 1.5. User pause, offscreen and hidden-tab states suspend playback. Reduced motion/data saving shows the final scene with manual state controls. Without JavaScript all layers remain visible. Failed layer loading falls back to the empty room.
Ikebana now lives within The House at house.html#ikebana; both old URLs permanently redirect there. Existing films remain in The House, Club and Archive. Legal drafts, server delivery configuration, policy hashes and cookie mechanisms are unchanged.
Asset provenance and production limitations are recorded in BRAND-REFINEMENT.md.
