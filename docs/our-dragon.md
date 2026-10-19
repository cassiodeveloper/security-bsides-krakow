# Our dragon: editorial and asset notes

The page is `/our-dragon/`. It reuses the official `images/logo-display.webp`, shared typography, Bootstrap container, navigation script and footer. No runtime dependency or page-specific JavaScript was added.

## Evidence checked 19 October 2026
- https://wawel.krakow.pl/en/exhibition-constant/dragon-s-den — cave, Kadłubek around the turn of the 13th century, later retellings and Skuba in Joachim Bielski. Its English text has an apparent first-name error (Bolesław); use Bronisław, confirmed by the institutional artist resource below.
- https://chromy.mik.krakow.pl/pomnik-smoka-wawelskiego/ — Małopolska Institute of Culture: Bronisław Chromy, bronze sculpture installed in 1972, gas flame, sulphur/sheepskin/Vistula retelling.
- https://media.krakow.travel/get/41144 — official tourism walking guide, corroborating the sculpture and fire.
- https://www.openstreetmap.org/node/278057698 — coordinates checked through the OSM API: 50.0530165, 19.9335881. The location card retains these verified coordinates. The Google Maps button uses the direct sculpture place link supplied by the site owner.

The cobbler story is explicitly folklore. Branding interpretation is based on the supplied brief and visible final artwork; it is not an assertion about undocumented designer decisions. Repository filenames and available logo history do not establish a chronological sketch process. No invented variants are displayed.

## Photograph license
- Title: Dragon (Smok) april 2014.jpg
- Photographer: Agatefilm; taken 14 April 2014.
- Source: https://commons.wikimedia.org/wiki/File:Dragon_(Smok)_april_2014.jpg
- Original: https://upload.wikimedia.org/wikipedia/commons/e/ee/Dragon_%28Smok%29_april_2014.jpg
- License: CC BY-SA 3.0 https://creativecommons.org/licenses/by-sa/3.0/
- Local derivatives: images/our-dragon/wawel-dragon-720.webp and wawel-dragon-1440.webp.
- Changes: resized proportionally and encoded as WebP, no crop or retouching. These derivatives retain CC BY-SA 3.0. Visible credit, source and license link appear beneath the photograph. Sculpture credited to Bronisław Chromy.

## Local verification
- Headless Microsoft Edge: 1440, 768, 390 and 320 px viewport widths; no horizontal overflow or missing images. Desktop and mobile full-page screenshots reviewed.
- Mobile menu and Community dropdown open, expose the new page and respond to Escape.
- All page-local asset/navigation URLs returned HTTP 200; no browser JavaScript errors or duplicate IDs.
- Keyboard skip link reaches main content; reduced-motion computes zero transition duration; main content is visible with JavaScript disabled.
- Photograph transfers: 89,336 bytes (720w), 304,350 bytes (1440w), loaded lazily. No map embed, animation library or additional runtime dependencies.
- Lighthouse was not installed; no Lighthouse score is claimed. Checks were local, not a production deployment audit.

## Logo animation
Source: Opening.mp4 supplied by the site owner (10.37 seconds, 1920×1080). The existing video was transcoded without redrawing the logo. Silent MP4: 960×540, H.264, fast-start, 918,576 bytes. Shareable looping GIF: 640×360, 12 fps, 128-color palette, 2,859,922 bytes. Poster extracted at 5 seconds. The page uses native controls, playsinline and preload="none", with no autoplay or automatic loop. Motion requires user action, including for reduced-motion users. A visible description accompanies the silent animation. The GIF is download-only and is not loaded by the page.
Validation: both encodings decoded without errors; Edge playback advances without media errors; 1440px and 390px layouts have no overflow; neither MP4 nor GIF is requested on initial page load, including with reduced motion enabled.
