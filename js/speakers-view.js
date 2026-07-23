(function () {
    'use strict';

    var section = document.getElementById('section-speakers');
    if (!section) return;

    var buttons = section.querySelectorAll('[data-speaker-view]');
    if (!buttons.length) return;

    var storageKey = 'bsides-speaker-view';
    var views = ['comfort', 'five', 'compact'];

    function applyView(view) {
        if (views.indexOf(view) === -1) {
            view = 'comfort';
        }

        views.forEach(function (name) {
            section.classList.toggle('speakers-view-' + name, name === view);
        });

        buttons.forEach(function (button) {
            var isActive = button.getAttribute('data-speaker-view') === view;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        try {
            window.localStorage.setItem(storageKey, view);
        } catch (error) {
            // Some privacy modes disable localStorage; the toggle should still work.
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            applyView(button.getAttribute('data-speaker-view'));
        });
    });

    try {
        applyView(window.localStorage.getItem(storageKey) || 'comfort');
    } catch (error) {
        applyView('comfort');
    }
}());