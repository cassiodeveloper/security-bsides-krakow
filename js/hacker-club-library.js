(function () {
    'use strict';
    var API_URL = window.HCL_LIBRARY_API || '';
    var CODE = /^HCL-\d{3}$/;
    var list = document.querySelector('[data-library-list]');
    if (!list) return;
    var listStatus = document.querySelector('[data-library-list-status]');
    var panel = document.querySelector('[data-library-scan]');
    var form = document.querySelector('[data-library-form]');
    var nameInput = document.getElementById('library-name');
    var pinInput = document.getElementById('library-pin');
    var checkoutButton = document.querySelector('[data-library-checkout]');
    var checkinButton = document.querySelector('[data-library-checkin]');
    var message = document.querySelector('[data-library-message]');
    var code = (new URLSearchParams(location.search).get('b') || '').trim().toUpperCase();
    var current = null;
    var busy = false;

    function remember(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* optional */ } }
    function recall(key) { try { return localStorage.getItem(key) || ''; } catch (_) { return ''; } }
    function text(selector, value) { var el = document.querySelector(selector); if (el) el.textContent = value; }

    async function api(body) {
        var options = { cache: 'no-store', signal: AbortSignal.timeout(15000) };
        if (body) {
            options.method = 'POST';
            options.body = JSON.stringify(body); // text/plain keeps this a simple CORS request
        }
        var response = await fetch(API_URL, options);
        if (!response.ok) throw new Error('Library unavailable');
        return response.json();
    }

    function since(value) {
        var date = new Date(value);
        return isNaN(date) ? '' : ' since ' + date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function renderBook(book) {
        current = book;
        text('[data-library-code]', book.code);
        text('[data-library-title]', book.title || book.code);
        text('[data-library-author]', book.author || '');
        var borrowed = book.status === 'borrowed';
        var who = book.holder ? 'With ' + book.holder + since(book.since) + '.' : 'Currently borrowed.';
        text('[data-library-status]', borrowed ? who : 'Available at the Club.');
        panel.classList.toggle('is-borrowed', borrowed);
        checkinButton.hidden = !borrowed;
        checkoutButton.textContent = borrowed ? 'Borrow it myself' : 'Borrow this book';
        var mine = borrowed && book.holder && nameInput.value.trim().toLowerCase() === book.holder.toLowerCase();
        checkoutButton.hidden = !!mine;
    }

    function renderList(books) {
        list.textContent = '';
        books.forEach(function (book) {
            var item = document.createElement('li');
            item.className = 'club-card library-book' + (book.status === 'borrowed' ? ' is-borrowed' : '');
            var link = document.createElement('a');
            link.href = '?b=' + encodeURIComponent(book.code);
            link.textContent = book.title || book.code;
            var heading = document.createElement('h3');
            heading.appendChild(link);
            var meta = document.createElement('p');
            meta.textContent = (book.author ? book.author + ' · ' : '') + book.code;
            var badge = document.createElement('span');
            badge.className = 'library-badge';
            badge.textContent = book.status === 'borrowed' ? 'Borrowed' : 'Available';
            item.append(badge, heading, meta);
            list.appendChild(item);
        });
        listStatus.textContent = books.length ? '' : 'No books listed yet.';
        listStatus.hidden = books.length > 0;
    }

    async function lookup() {
        if (!pinInput.value) return;
        try {
            var result = await api({ action: 'lookup', code: code, pin: pinInput.value });
            if (result.ok) renderBook(result.book); else message.textContent = result.error || '';
        } catch (_) { /* public status is already shown */ }
    }

    nameInput.addEventListener('input', function () { if (current) renderBook(current); });
    // Entering the PIN alone reveals who has the book, without changing its state.
    pinInput.addEventListener('change', function () { if (current && current.status === 'borrowed') lookup(); });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (busy || !current) return;
        var action = event.submitter && event.submitter.value === 'checkin' ? 'checkin' : 'checkout';
        var name = nameInput.value.trim();
        if (!name || !pinInput.value) { message.textContent = 'Enter your name and the club PIN.'; return; }
        busy = true;
        message.textContent = 'Saving…';
        try {
            var result = await api({ action: action, code: code, pin: pinInput.value, name: name });
            if (result.book) renderBook(result.book);
            if (!result.ok) { message.textContent = result.error || 'Something went wrong.'; return; }
            remember('hcl-library-name', name);
            remember('hcl-library-pin', pinInput.value);
            message.textContent = action === 'checkin' ? 'Returned. Thanks for bringing it back!' : 'It’s yours. Enjoy the read and bring it back to the Club.';
            loadList();
        } catch (_) {
            message.textContent = 'Could not reach the library. Check your connection and try again.';
        } finally { busy = false; }
    });

    async function loadList() {
        var result = await api();
        var books = (result && result.books) || [];
        renderList(books);
        return books;
    }

    async function start() {
        nameInput.value = recall('hcl-library-name');
        pinInput.value = recall('hcl-library-pin');
        if (!API_URL) { listStatus.textContent = 'The library check-in is being set up. Ask a team member at the Club.'; return; }
        var books;
        try { books = await loadList(); } catch (_) { listStatus.textContent = 'Could not load the library right now.'; return; }
        if (!code) return;
        var book = CODE.test(code) && books.filter(function (b) { return b.code === code; })[0];
        if (!book) { listStatus.hidden = false; listStatus.textContent = 'No book found with code ' + code + '.'; return; }
        panel.hidden = false;
        renderBook(book);
        document.getElementById('library-code').value = code;
        lookup();
    }

    start();
}());
