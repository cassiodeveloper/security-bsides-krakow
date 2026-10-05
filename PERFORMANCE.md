# Static-site loading optimization

## Root cause

`css/style.css` hid the body with `display: none`. The jPreLoader plugin in
`js/plugins.js`, initialized by `js/designesia.js`, revealed it only after
scanning image elements and CSS backgrounds and loading their resources.
Completion added a 500 ms progress animation and an 800 ms fade. This defeated
lazy loading and made unrelated assets part of the critical rendering path.
A separate window-load callback delayed navigation, tabs and layout setup.

## Changes

- Removed the loader implementation, initialization and overlay CSS; body is visible by default.
- Run interactive setup at DOM ready; defer dependent scripts in document order.
- Keep Google Analytics asynchronous and independent of page setup.
- Serve existing font families locally with font-display: swap and their licenses.
- Replace nested font/icon imports with explicit stylesheets; remove duplicate Bootstrap grid/reboot CSS.
- Use smaller WebP logo and hero assets, preload hero backgrounds, and expose backgrounds in HTML before JavaScript.
- Add intrinsic image dimensions, responsive automatic height, async decoding and below-fold native lazy loading.
- Reflow image-dependent galleries when their lazy images arrive, without gating page visibility.
- Avoid repeated header-scroll registration, repeated navigation-exit registration and an unused background timer.
- Initialize decorative particles after rendering and idle time; pause their animation outside the viewport or in a hidden tab.

## Validation

Local Edge/Playwright, localhost, 390 x 844 viewport. External HTTPS resources
were delayed eight seconds and then failed deliberately. This is a synthetic
resilience test, not a production Lighthouse score or field Core Web Vitals.

| Observation | Before | After |
| --- | --- | --- |
| First contentful paint | 8,388 ms | 332 ms |
| Observed LCP | 8,388 ms | 332 ms |
| Loader at 15 seconds | Still present | Removed |
| Observed layout shift score | 0 | 0 |

The measurements above are individual local runs; they do not establish real-user
LCP, CLS or INP. Main content was also verified visible with JavaScript disabled.
Root HTML pages were checked for visible body and absence of the loader, with no
JavaScript exceptions. Mobile navigation, gallery lightbox, local font/assets and
Hacker Club pages were checked. No added framework or build dependency.

Deployment and production field measurements are outside this local validation.
