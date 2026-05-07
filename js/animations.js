/* global gsap, ScrollTrigger */
(function () {
  function setupReveals() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
    const sections = document.querySelectorAll("[data-animate]");

    sections.forEach((section) => {
      const items = section.querySelectorAll("[data-reveal]");
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 20, filter: "blur(8px)" });

      gsap.to(items, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.7,
        ease,
        stagger: 0.12,
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none none",
          once: true
        }
      });
    });

    // Fade the fixed landing hero out as Section 1 arrives.
    const hero = document.querySelector(".hero");
    const hint = document.querySelector(".scroll-hint");
    const s1 = document.getElementById("section-1");
    if (hero && s1) {
      gsap.to(hero, {
        opacity: 0,
        pointerEvents: "none",
        ease,
        scrollTrigger: {
          trigger: s1,
          start: "top 80%",
          end: "top 45%",
          scrub: true
        }
      });
    }
    if (hint && s1) {
      gsap.to(hint, {
        opacity: 0,
        ease,
        scrollTrigger: {
          trigger: s1,
          start: "top 92%",
          end: "top 65%",
          scrub: true
        }
      });
    }
  }

  window.PortfolioAnimations = { setupReveals };
})();

