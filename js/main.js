/* global Starfield, PortfolioAnimations */
(function () {
  function setScrollLocked(locked) {
    document.documentElement.classList.toggle("scroll-locked", locked);
    document.body.classList.toggle("scroll-locked", locked);
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function scrollProgress() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return clamp01(window.scrollY / max);
  }

  function setupDots() {
    const nav = document.querySelector(".dot-nav");
    if (!nav) return;

    const dots = Array.from(nav.querySelectorAll(".dot"));
    const sections = dots
      .map((d) => document.getElementById(d.dataset.target))
      .filter(Boolean);

    dots.forEach((dot) => {
      dot.addEventListener(
        "click",
        () => {
          const id = dot.dataset.target;
          const el = document.getElementById(id);
          if (!el) return;
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        { passive: true }
      );
    });

    const setActive = (id) => {
      dots.forEach((d) => d.classList.toggle("is-active", d.dataset.target === id));
    };

    // Active dot: IntersectionObserver for sections 1-5, plus section-0 as top-of-page.
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best?.target?.id) setActive(best.target.id);
      },
      { threshold: [0.35, 0.5, 0.65], rootMargin: "-20% 0px -20% 0px" }
    );

    sections.forEach((s) => io.observe(s));

    const anchor0 = document.getElementById("section-0");
    if (anchor0) {
      const topIO = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) setActive("section-0");
        },
        { threshold: [1], rootMargin: "0px 0px -85% 0px" }
      );
      topIO.observe(anchor0);
    }
  }

  function setupScrollToStarfield() {
    const onScroll = () => {
      if (window.Starfield?.setScrollProgress) {
        window.Starfield.setScrollProgress(scrollProgress());
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupLandingUnlock() {
    // Start locked on Section 0.
    setScrollLocked(true);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const cta = document.querySelector(".cta-btn");
    const s1 = document.getElementById("section-1");
    if (!cta || !s1) return;

    const unlockAndGo = (e) => {
      e?.preventDefault?.();
      setScrollLocked(false);

      // Let layout update before scrolling.
      requestAnimationFrame(() => {
        s1.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    cta.addEventListener("click", unlockAndGo);
    cta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") unlockAndGo(e);
    });
  }

  function init() {
    window.Starfield?.init?.({ canvasId: "shader-canvas" });
    window.PortfolioAnimations?.setupReveals?.();
    setupDots();
    setupScrollToStarfield();
    setupLandingUnlock();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

