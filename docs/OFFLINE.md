# Offline viewing

Use **Save website offline** in the footer while connected. Keep the page open
until the completion message appears. The download includes all public pages,
local fonts, scripts, photos and films (approximately 94 MB). It is optional to
avoid silently using a visitor's mobile data or storage.

The saved copy belongs to that browser and device. First-time visits require a
connection. Private browsing, clearing site data, browser storage eviction and
insufficient storage can prevent or remove offline availability. Persistent
storage is requested but the browser decides whether to grant it.

Bag selections stay local. Sending enquiries, newsletter/consent requests and
opening external links require a connection. No private API responses are cached,
and offline form submissions are not queued or represented as delivered.

Downloads are versioned and completion-marked. Partial downloads are not served
as complete copies; a previous complete copy is retained until refresh succeeds.
Click Save/Refresh while online to download the latest version. Byte-range
responses are supported for offline film playback and seeking.

Verification: `node scripts/verify-offline.mjs` starts an isolated origin, saves
the complete site, stops the origin, then checks all 31 routes, image decoding,
film metadata/ranges, Bag persistence and offline messaging with no origin
available. `npm run check:layout` covers responsive layout separately.
