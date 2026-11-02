(function () {
    'use strict';
    if (!/^\/hacker-club(?:\/|$)/.test(location.pathname)) return;
    var zone = 'Europe/Warsaw';
    var formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
        weekday: 'short', hour: '2-digit', hourCycle: 'h23'
    });
    function local(date) {
        var parts = {};
        formatter.formatToParts(date).forEach(function (part) { parts[part.type] = part.value; });
        return parts;
    }
    function timestamp(value) {
        return typeof value === 'string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
    }
    function isOpen(data, now) {
        var current = local(now);
        if (current.weekday === 'Sat' || current.weekday === 'Sun' || !data || data.open !== true) return false;
        var updated = timestamp(data.updatedAt);
        if (!Number.isFinite(updated) || updated > now.getTime()) return false;
        var start = timestamp(data.openFrom);
        var end = timestamp(data.validUntil);
        // A complete, explicitly bounded window can override the weekday night closure.
        if (data.openFrom != null) {
            return Number.isFinite(start) && Number.isFinite(end) && updated <= start && start < end &&
                now.getTime() >= start && now.getTime() < end;
        }
        var confirmed = local(new Date(updated));
        return current.year === confirmed.year && current.month === confirmed.month && current.day === confirmed.day &&
            Number(current.hour) >= 9 && Number(current.hour) < 18 &&
            (data.validUntil == null || (Number.isFinite(end) && now.getTime() < end));
    }
    var nav = document.getElementById('mainmenu');
    if (nav) {
        var item = document.createElement('li');
        item.innerHTML = '<a class="club-live-status club-live-menu" data-club-live href="/hacker-club/space/"><span class="club-live-dot" aria-hidden="true"></span><span data-club-live-label>Closed</span></a>';
        nav.appendChild(item);
    }
    var data = null;
    function render() {
        var open = isOpen(data, new Date());
        var message = open ? 'Members are here. Come in and use the space!' : 'No confirmed opening right now. Please visit when the status is green.';
        document.querySelectorAll('[data-club-live]').forEach(function (element) {
            element.classList.toggle('is-open', open);
            element.querySelector('[data-club-live-label]').textContent = open ? 'Open now' : 'Closed';
            var detail = element.querySelector('[data-club-live-detail]');
            if (detail) detail.textContent = message;
            if (element.classList.contains('club-live-menu')) {
                element.title = message;
                element.setAttribute('aria-label', (open ? 'Open now' : 'Closed') + '. ' + message);
            }
        });
    }
    async function refresh() {
        try {
            var response = await fetch('/hacker-club/status.json', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
            if (!response.ok) throw new Error('Status unavailable');
            data = await response.json();
        } catch (_) { data = null; }
        render();
    }
    render();
    refresh();
    setInterval(render, 1000);
    setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { render(); refresh(); } });
}());
