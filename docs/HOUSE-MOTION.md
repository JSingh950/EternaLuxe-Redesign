# The House: moving collection

Reference inspected: https://www.eternaluxe.net/about. Its second media section is a floating photographic collage on an ivory field. The recreation uses individual responsive assets rather than scaling that compressed film.

The live House section sequences all 16 owner-supplied photographs and three supplied films across three staggered bands. Original image aspect ratios are retained. Two identical groups per band move by exactly half the track width, producing a continuous loop. GSAP uses linear transform-only motion over 100, 112 and 106 seconds; there are no layout animations or per-frame DOM measurements.

The single small pause control stops both track movement and embedded films. Intersection and page-visibility observers suspend offscreen/background work. Reduced motion and data saving switch to a static gallery. No-JavaScript visitors also receive a static gallery without duplicate images. Films are muted, only loaded when visible, and retain their poster on playback failure.

The former pre-rendered house-compositions-film remains preserved on disk but is no longer displayed. The opening orchid film, homepage venue, official branding, consent code, policies, enquiries and checkout handoffs are unchanged.

Verification: npm run build; npm run check; npm test; node scripts/verify-house-motion.mjs. TEST_URL can target a deployed site. The browser check covers 375/768/1440/1920 widths, 19 original source placements, movement, pause, film pause, reduced motion, offscreen playback and no-JavaScript fallback.
