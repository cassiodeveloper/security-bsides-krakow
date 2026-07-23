(function () {
    'use strict';

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-blog-filter]'));
    var posts = Array.prototype.slice.call(document.querySelectorAll('.blog-post-item'));
    var status = document.getElementById('blog-filter-status');

    if (!filterButtons.length || !posts.length) {
        return;
    }

    var allowedFilters = filterButtons.map(function (button) {
        return button.getAttribute('data-blog-filter');
    });

    function applyFilter(filter, updateUrl) {
        if (allowedFilters.indexOf(filter) === -1) {
            filter = 'all';
        }

        var visibleCount = 0;

        posts.forEach(function (post) {
            var isVisible = filter === 'all' || post.getAttribute('data-category') === filter;
            var displayNode = post.closest('.col-lg-6') || post;
            displayNode.hidden = !isVisible;
            if (isVisible) {
                visibleCount += 1;
            }
        });

        filterButtons.forEach(function (button) {
            var isActive = button.getAttribute('data-blog-filter') === filter;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (status) {
            status.textContent = visibleCount + (visibleCount === 1 ? ' post shown.' : ' posts shown.');
        }

        if (updateUrl && window.history && window.history.replaceState) {
            var url = new URL(window.location.href);
            if (filter === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', filter);
            }
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            applyFilter(button.getAttribute('data-blog-filter'), true);
        });
    });

    var initialFilter = new URLSearchParams(window.location.search).get('category') || 'all';
    applyFilter(initialFilter, false);
})();
