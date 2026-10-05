// Shared navigation from the approved homepage menu.
(() => {
        const nav = document.querySelector('.index-navigation');
        if (!nav) return;
        const mobile = document.querySelector('.site-menu-toggle');
        const header = nav.closest('header');
        const narrow = window.matchMedia('(max-width: 992px)');
        function closeMobile() {
            mobile.setAttribute('aria-expanded', 'false');
            header.classList.remove('site-menu-open');
        }
        mobile.addEventListener('click', () => {
            const open = mobile.getAttribute('aria-expanded') !== 'true';
            mobile.setAttribute('aria-expanded', String(open));
            header.classList.toggle('site-menu-open', open);
        });
        narrow.addEventListener('change', closeMobile);
        nav.addEventListener('click', event => { if (event.target.closest('a')) closeMobile(); });
        header.addEventListener('keydown', event => {
            if (event.key === 'Escape' && mobile.getAttribute('aria-expanded') === 'true') {
                closeMobile(); mobile.focus();
            }
        });
        const buttons = [...nav.querySelectorAll('.nav-toggle')];
        function closeAll() {
            buttons.forEach(button => {
                button.setAttribute('aria-expanded', 'false');
                document.getElementById(button.getAttribute('aria-controls')).hidden = true;
            });
        }
        const desktopHover = window.matchMedia('(min-width: 993px) and (hover: hover)');
        buttons.forEach(button => {
            const group = button.closest('.nav-group');
            group.addEventListener('mouseenter', () => {
                if (!desktopHover.matches) return;
                closeAll();
                button.setAttribute('aria-expanded', 'true');
                document.getElementById(button.getAttribute('aria-controls')).hidden = false;
            });
            group.addEventListener('mouseleave', () => {
                if (desktopHover.matches) closeAll();
            });
        });
        buttons.forEach(button => button.addEventListener('click', event => {
            const open = (desktopHover.matches && event.detail > 0) || button.getAttribute('aria-expanded') !== 'true';
            closeAll();
            button.setAttribute('aria-expanded', String(open));
            document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
        }));
        document.addEventListener('click', event => { if (!nav.contains(event.target)) closeAll(); });
        nav.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                const active = buttons.find(button => button.getAttribute('aria-expanded') === 'true');
                closeAll();
                if (active) active.focus();
            }
        });
        nav.addEventListener('focusout', event => { if (!nav.contains(event.relatedTarget)) closeAll(); });
        nav.addEventListener('click', event => { if (event.target.closest('a')) closeAll(); });
    })();
