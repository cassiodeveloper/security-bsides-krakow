# Hacker Club analytics

The three Hacker Club pages use the existing GA4 property G-0YXMKT406M.
Each initializes it once; configuration generates the standard page view.
The shared js/hacker-club-analytics.js records interactions without changing link behavior.

| Event | Meaning | Parameters |
| --- | --- | --- |
| hc_payment_click | Click to Stripe, not a completed purchase | payment_option (full/installments), commitment_total (5000), currency (PLN), placement |
| hc_waitlist_click | Click to Google Forms, not a submitted registration | access_interest (supporter/fan/fanatic/contributor/company/regular), placement |
| hc_navigation_click | Internal Club navigation, including Founder section and profiles | destination, destination_section, placement |
| hc_faq_open | A question opens, including keyboard activation | question_id, question |
| hc_badge_view | User changes badge concept via arrows, dots, keyboard or swipe | badge_concept, placement |

All custom events include club_page (pathname only). No form values, arbitrary
link queries, payment details or user-entered text are added. The question
parameter contains the static FAQ heading. The existing Google tag can collect
its standard page/browser context independently.

## Reporting after deployment

1. Check the three pages using Tag Assistant / DebugView and GA4 Realtime.
2. Register event-scoped custom dimensions as needed: club_page, placement,
   payment_option, access_interest, destination, destination_section,
   question_id and badge_concept.
3. Register commitment_total as a custom metric if useful. This is the total
   commitment for either payment choice, not revenue.
4. Key-event configuration belongs in GA4. Clicks indicate intent; they must
   not be labeled completed purchases or leads.
5. Payment completion requires Stripe confirmation/integration; completed
   registrations require form-submission integration. Neither is inferred here.

Ad blockers and visitor consent settings can prevent delivery. The UI continues
to work without Analytics. The availability counter remains editorial and must
not be updated from click counts.

Validation: all 38 main-content links across the three pages emitted the expected
event once. Tests also covered single GA configuration, FAQ keyboard activation,
badge changes, duplicate script initialization and absence of gtag. Google
requests were intercepted to keep test traffic out of the production property.
This verifies event generation, not receipt by Google or GA4 account settings.

References:
- https://developers.google.com/analytics/devguides/collection/ga4/events
- https://developers.google.com/tag-platform/gtagjs/reference