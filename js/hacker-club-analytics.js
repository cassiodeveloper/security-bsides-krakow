/* GA4 interaction events. No form contents, query strings or personal identifiers. */
(function () {
    if (window.clubAnalyticsInstalled) return;
    window.clubAnalyticsInstalled = true;
    function send(name, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', name, Object.assign({
            send_to: 'G-0YXMKT406M',
            club_page: window.location.pathname,
            transport_type: 'beacon'
        }, params));
    }
    function context(element) {
        var section = element.closest('section');
        var placement = section ? section.getAttribute('aria-labelledby') : null;
        if (!placement) placement = element.closest('header') ? 'header' : element.closest('footer') ? 'footer' : 'other';
        var plan = element.closest('.club-plan, #access .club-card');
        var heading = plan && plan.querySelector('h3');
        var label = heading ? heading.textContent.toLowerCase() : '';
        var audience = label.includes('fanatic') ? 'fanatic' : label.includes('supporter') ? 'supporter' : label.includes('fan') ? 'fan' : placement === 'club-contributor' ? 'contributor' : placement === 'club-companies' ? 'company' : 'regular';
        return { placement: placement, access_interest: audience };
    }
    function click(event) {
        if (event.type === 'auxclick' && event.button !== 1) return;
        var anchor = event.target.closest && event.target.closest('a[href]');
        if (!anchor) return;
        var url = new URL(anchor.href, window.location.href);
        var ctx = context(anchor);
        if (url.origin === 'https://buy.stripe.com') {
            var options = {
                '/4gM4gsaNkaw99rI0md0Jq03': 'full',
                '/9B67sE7B833H1Zgb0R0Jq04': 'installments'
            };
            if (!options[url.pathname]) return;
            send('hc_payment_click', {
                placement: ctx.placement,
                payment_option: options[url.pathname],
                commitment_total: 5000,
                currency: 'PLN'
            });
        } else if (url.origin === 'https://forms.gle' && url.pathname === '/1b3iLm9ZiCn9LVPj9') {
            send('hc_waitlist_click', ctx);
        } else if (url.origin === window.location.origin &&
            (url.pathname.startsWith('/hacker-club/') || url.pathname === '/hacker-club')) {
            send('hc_navigation_click', {
                placement: ctx.placement,
                destination: url.pathname,
                destination_section: url.hash.slice(1)
            });
        }
    }
    // Capture avoids interference from the shared navigation's event handlers.
    document.addEventListener('click', click, true);
    document.addEventListener('auxclick', click, true);
    document.querySelectorAll('.club-faq details').forEach(function (details, index) {
        details.addEventListener('toggle', function () {
            if (!details.open) return;
            send('hc_faq_open', {
                question_id: 'faq_' + (index + 1),
                question: details.querySelector('summary').textContent.trim().slice(0, 100)
            });
        });
    });
    document.addEventListener('club:badge-change', function (event) {
        var concept = event.detail && event.detail.concept;
        if (['classic', 'terminal', 'signal', 'circuit'].includes(concept)) {
            send('hc_badge_view', { badge_concept: concept, placement: 'club-founding' });
        }
    });
}());