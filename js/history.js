(() => {
  const chapters = [...document.querySelectorAll(".chapter")];
  const links = [...document.querySelectorAll(".year-nav a")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          entry.target.classList.add("is-visible");
          reveal.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add("is-pending");
        reveal.observe(element);
      }
    });
    reducedMotion.addEventListener("change", event => {
      if (event.matches) {
        reveal.disconnect();
        document.querySelectorAll(".is-pending").forEach(el => el.classList.remove("is-pending"));
      }
    });
  }
  let queued = false;
  function updateYear() {
    const marker = window.innerHeight * 0.4;
    let active = chapters[0];
    chapters.forEach(chapter => {
      if (chapter.getBoundingClientRect().top <= marker) active = chapter;
    });
    links.forEach(link => {
      if (link.hash === "#" + active.id) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
    queued = false;
  }
  window.addEventListener("scroll", () => {
    if (!queued) { queued = true; window.requestAnimationFrame(updateYear); }
  }, { passive: true });
  window.addEventListener("resize", updateYear);
  updateYear();
})();
