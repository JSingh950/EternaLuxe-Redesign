# Interior campaign scenes

The House, Collections, Atelier and Floral Club extend the approved homepage composition system: intact owner arrangements, pastel architectural fields, a stone surface and a contact shadow. They use the existing once-only campaign reveal and inherit reduced-motion and data-saving behavior.

| Page | Owner asset | Story |
| --- | --- | --- |
| The House | Arrangement 1 | Intention, line and Ikebana |
| Collections | Arrangement 2 | Proportion and space |
| Atelier | Arrangement 4 | Palette, placement and commissions |
| Floral Club | Arrangement 6 | A recurring change of mood |

These are supplied design references, not newly fabricated stock products. The existing owner asset provenance remains in `assets/brand/owner-arrangements-provenance.md`. No new third-party or generated image is introduced. The preparation script exports trimmed WebP copies at up to 640 and 1040 pixels without upscaling. Both responsive versions show the full arrangement with `object-fit: contain`; the surface and background remain CSS decoration.

Archive captions have an independent grid row and the photographs use their own aspect-ratio slot. The card and picture must not be set to `height: 100%`: doing so consumes the caption's space and lets the following row cover it. The caption-overlap regression is checked by `scripts/verify-editorial.mjs`.
