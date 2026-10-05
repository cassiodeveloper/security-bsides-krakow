// Keep the complete totals available without JavaScript and to assistive technology.
(() => {
    const totals = document.querySelector('.sponsor-stats-totals');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!totals || motion.matches || !('IntersectionObserver' in window)) return;

    const numbers = Array.from(totals.querySelectorAll('dt'), element => {
        const text = element.textContent.trim();
        const accessible = document.createElement('span');
        accessible.className = 'sponsor-number-accessible';
        accessible.textContent = text;
        const visual = document.createElement('span');
        visual.setAttribute('aria-hidden', 'true');
        visual.textContent = text;
        element.replaceChildren(accessible, visual);
        return { visual, text, value: Number(text.replace(/[^0-9]/g, '')), suffix: text.endsWith('+') ? '+' : '' };
    });
    const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        if (motion.matches) return;
        const start = performance.now();
        function frame(now) {
            const progress = motion.matches ? 1 : Math.min((now - start) / 1200, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            numbers.forEach(({ visual, text, value, suffix }) => {
                visual.textContent = progress === 1 ? text : Math.floor(value * eased).toLocaleString('en-GB') + suffix;
            });
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }, { threshold: 0.2 });
    observer.observe(totals);
})();
