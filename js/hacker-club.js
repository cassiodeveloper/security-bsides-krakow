/* Keep the shared menu toggle's accessible state in sync with its visual state. */
(function () {
    var toggle = document.getElementById('menu-btn');
    if (!toggle) return;
    function syncMenuState() {
        toggle.setAttribute('aria-expanded', String(toggle.classList.contains('clicked')));
    }
    new MutationObserver(syncMenuState).observe(toggle, { attributes: true, attributeFilter: ['class'] });
    syncMenuState();
}());
/* User-controlled badge concepts: buttons, arrow keys and horizontal touch swipes. */
(function () {
    var slider = document.querySelector('.club-badge-slider');
    if (!slider) return;
    var slides = Array.from(slider.querySelectorAll('[aria-roledescription="slide"]'));
    var dots = Array.from(slider.querySelectorAll('[data-badge-index]'));
    var names = ['Classic', 'Terminal', 'Signal', 'Circuit'];
    var current = 0;
    function show(index) {
        var previous = current;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) { slide.hidden = i !== current; });
        dots.forEach(function (dot, i) {
            if (i === current) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
        slider.querySelector('.club-badge-caption').textContent =
            '0' + (current + 1) + ' / 04 — ' + names[current];
        if (previous !== current) slider.dispatchEvent(new CustomEvent('club:badge-change', { bubbles: true, detail: { concept: names[current].toLowerCase() } }));
    }
    slider.querySelector('.club-badge-controls').hidden = false;
    slider.querySelectorAll('[data-badge-step]').forEach(function (button) {
        button.addEventListener('click', function () { show(current + Number(button.dataset.badgeStep)); });
    });
    dots.forEach(function (button, i) {
        button.addEventListener('click', function () { show(i); });
    });
    slider.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        show(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    var stage = slider.querySelector('.club-badge-stage');
    var touch = null;
    stage.addEventListener('touchstart', function (event) {
        touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    stage.addEventListener('touchend', function (event) {
        if (!touch || !event.changedTouches.length) return;
        var dx = event.changedTouches[0].clientX - touch.x;
        var dy = event.changedTouches[0].clientY - touch.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
        touch = null;
    }, { passive: true });
    stage.addEventListener('touchcancel', function () { touch = null; }, { passive: true });
}());