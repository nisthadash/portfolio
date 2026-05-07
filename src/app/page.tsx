/* eslint-disable react/no-unescaped-entities */
"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { Starfield } from "@/components/ui/starfield"

export default function Home() {
  const [locked, setLocked] = useState(true)
  const section1Ref = useRef<HTMLElement>(null)
  const minScrollRef = useRef<number | null>(null)
  const clampEnabledRef = useRef(false)
  const glassCard =
    "rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-[12px] shadow-[0_12px_50px_rgba(0,0,0,0.25)]"
  const glassHover =
    "transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_18px_70px_rgba(0,0,0,0.35)]"
  const tagPill = "rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[0.78rem] text-white/80"
  const pillBtn =
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/15"

  useEffect(() => {
    document.documentElement.style.overflowY = locked ? "hidden" : "auto"
    document.body.style.overflowY = locked ? "hidden" : "auto"
    return () => {
      document.documentElement.style.overflowY = "auto"
      document.body.style.overflowY = "auto"
    }
  }, [locked])

  useEffect(() => {
    if (locked) {
      clampEnabledRef.current = false
      minScrollRef.current = null
      return
    }

    const updateMinScroll = () => {
      const top = section1Ref.current?.offsetTop ?? null
      minScrollRef.current = typeof top === "number" ? top : null
    }

    updateMinScroll()
    window.addEventListener("resize", updateMinScroll, { passive: true })

    const clamp = () => {
      const min = minScrollRef.current
      if (!clampEnabledRef.current || typeof min !== "number") return
      if (window.scrollY < min) window.scrollTo({ top: min, left: 0, behavior: "auto" })
    }

    window.addEventListener("scroll", clamp, { passive: true })

    return () => {
      window.removeEventListener("resize", updateMinScroll)
      window.removeEventListener("scroll", clamp)
    }
  }, [locked])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ease = "cubic-bezier(0.16, 1, 0.3, 1)"
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-animate]"))

    sections.forEach((section) => {
      const items = Array.from(section.querySelectorAll<HTMLElement>("[data-reveal]"))
      if (!items.length) return

      // Start hidden
      gsap.set(items, { opacity: 0, y: 24, filter: "blur(10px)" })

      // ── Fade IN when section enters viewport from below ──
      ScrollTrigger.create({
        trigger: section,
        start: "top 72%",
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.75,
            ease,
            stagger: 0.11,
            overwrite: "auto",
          })
        },
        // When scrolling back DOWN into section from above, re-reveal it
        onEnterBack: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.6,
            ease,
            stagger: 0.08,
            overwrite: "auto",
          })
        },
        // ── Fade OUT when section leaves viewport at the top (scroll up) ──
        onLeaveBack: () => {
          gsap.to(items, {
            opacity: 0,
            y: -18,
            filter: "blur(8px)",
            duration: 0.45,
            ease: "power2.in",
            stagger: 0.06,
            overwrite: "auto",
          })
        },
        // ── Fade OUT when section scrolls out at the bottom (scroll down past) ──
        onLeave: () => {
          gsap.to(items, {
            opacity: 0,
            y: -24,
            filter: "blur(8px)",
            duration: 0.5,
            ease: "power2.in",
            stagger: 0.07,
            overwrite: "auto",
          })
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  const goNext = () => {
    setLocked(false)
    requestAnimationFrame(() => {
      section1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
    // After the transition into Section 1 begins, prevent returning to Section 0.
    // (Delay to avoid fighting the initial smooth scroll.)
    window.setTimeout(() => {
      clampEnabledRef.current = true
      const min = section1Ref.current?.offsetTop
      if (typeof min === "number" && window.scrollY < min) window.scrollTo({ top: min, left: 0, behavior: "auto" })
    }, 700)
  }

  return (
    <main className="relative min-h-screen w-full bg-black text-white">
      {/* Starfield background (behind Sections 1–5) */}
      <Starfield
        opacity={locked ? 0 : 1}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      />

      {/* Section 0 (locked / not scrollable) */}
      <section className="relative z-10 h-screen w-full overflow-hidden">
        <ShaderAnimation className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.72)_100%)]" />

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <p className="mb-6 font-sans text-[clamp(0.65rem,1.4vw,0.8rem)] font-normal uppercase tracking-[0.22em] text-white/40">
            Computer Engineering · SJCEM
          </p>

          <h1
            className="text-center text-[clamp(3.2rem,9vw,7.8rem)] font-normal leading-[1.02] tracking-[-0.02em] text-white drop-shadow-[0_2px_48px_rgba(0,0,0,0.55)]"
            style={{ fontFamily: "var(--font-instrument)" }}
          >
            Hello,&nbsp;<em className="italic">Welcome!</em>
          </h1>

          <p className="mt-6 font-sans text-[clamp(0.9rem,1.8vw,1.05rem)] font-light tracking-[0.01em] text-white/40">
            Builder · Designer · Researcher
          </p>

          <div className="mt-10">
            <button
              type="button"
              onClick={goNext}
              className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-8 py-3 font-sans text-sm font-normal tracking-[0.015em] text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/15 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)] active:translate-y-0"
            >
              Get to know me more{" "}
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-y-1">
                ↓
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 1 (scroll starts here) */}
      <section
        ref={section1Ref}
        data-animate
        className="relative z-10 grid min-h-screen place-items-center px-6 py-24"
      >
        <div className="mx-auto w-full max-w-3xl text-center">
          <p data-reveal className="mb-6 font-sans text-sm font-light uppercase tracking-[0.25em] text-[#d2aaff]/55">
            Hi, I'm
          </p>
          <h2
            data-reveal
            className="text-[clamp(5.5rem,16vw,12rem)] font-bold leading-[0.94] tracking-[-0.03em] text-white"
            style={{ fontFamily: "var(--font-plus)" }}
          >
            Nistha
            <br />
            Dash
          </h2>
          <div data-reveal className="mx-auto my-6 h-px w-[min(640px,86%)] bg-[#b478ff]/40" />
          <p
            data-reveal
            className="mx-auto max-w-3xl font-sans text-[clamp(1rem,1.8vw,1.2rem)] font-light leading-relaxed text-[#c8afe6]/65"
          >
            Building things at the intersection of code, AI/ML, and visual design
          </p>
        </div>
      </section>

      {/* Section 2 — ABOUT */}
      <section data-animate className="relative z-10 grid min-h-screen place-items-center px-6 py-24">
        <div className="mx-auto w-full max-w-[760px] text-center">
          <h2
            data-reveal
            className="text-[clamp(3rem,8vw,7rem)] font-bold tracking-[-0.02em] text-white drop-shadow-[0_18px_70px_rgba(0,0,0,0.35)]"
            style={{ fontFamily: "var(--font-plus)" }}
          >
            Who I Am
          </h2>
          <p
            data-reveal
            className="mx-auto mt-6 max-w-[620px] font-sans text-[clamp(1rem,1.6vw,1.15rem)] font-light leading-[1.65] text-[#c8afe6]/75"
          >
            I'm a Computer Engineering student bridging front-end development and full-stack engineering, with a growing
            focus on AI/ML applications. I have published research on Hybrid CNN-LSTM Architectures and thrive in
            hackathon environments where technical logic meets UI/UX and visual design. I'm actively seeking
            opportunities to build impactful, well-designed digital products at the intersection of engineering and
            creativity.
          </p>
          <p data-reveal className="mt-6 font-sans text-sm font-light text-[#c8afe6]/55">
            B.Tech '29 · SJCEM, Palghar
          </p>
        </div>
      </section>

      {/* Section 3 — TECH STACK */}
      <section data-animate className="relative z-10 grid min-h-screen place-items-center px-6 py-24">
        <div className="mx-auto w-full max-w-[1100px] text-center">
          <h2
            data-reveal
            className="text-[clamp(3rem,8vw,7rem)] font-bold tracking-[-0.02em] text-white drop-shadow-[0_18px_70px_rgba(0,0,0,0.35)]"
            style={{ fontFamily: "var(--font-plus)" }}
          >
            My Stack
          </h2>

          <div data-reveal className="mx-auto mt-14 w-full space-y-12">
            {[
              {
                label: "Frontend",
                items: [
                  { name: "React",        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
                  { name: "Next.js",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" },
                  { name: "TypeScript",   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
                  { name: "JavaScript",   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
                  { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
                  { name: "HTML5",        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" },
                  { name: "CSS3",         icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" },
                ],
              },
              {
                label: "Languages",
                items: [
                  { name: "Python",  icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
                  { name: "C++",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" },
                  { name: "C",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" },
                ],
              },
              {
                label: "Backend & DevOps",
                items: [
                  { name: "Node.js",  icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
                  { name: "FastAPI",  icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg" },
                  { name: "Docker",   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
                  { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg" },
                  { name: "Git",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
                  { name: "GitHub",   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" },
                ],
              },
              {
                label: "Design & Tools",
                items: [
                  { name: "Blender",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/blender/blender-original.svg" },
                  { name: "Photoshop",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-original.svg" },
                  { name: "After Effects", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/aftereffects/aftereffects-original.svg" },
                  { name: "Figma",         icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg" },
                ],
              },
            ].map((group) => (
              <div key={group.label}>
                {/* Category divider */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <span className="font-sans text-[0.7rem] uppercase tracking-[0.28em] text-[#d2aaff]/50">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </div>

                {/* Icon grid */}
                <div className="flex flex-wrap justify-center gap-3">
                  {group.items.map((skill) => (
                    <div
                      key={skill.name}
                      className="group flex w-[88px] flex-col items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#b478ff]/35 hover:bg-[#b478ff]/[0.08] hover:shadow-[0_8px_32px_rgba(180,120,255,0.15)]"
                    >
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(180,120,255,0.35)]"
                        loading="lazy"
                      />
                      <span className="w-full text-center font-sans text-[0.68rem] leading-tight text-white/60 transition-colors duration-300 group-hover:text-white/90">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — PROJECTS */}
      <section data-animate className="relative z-10 grid min-h-screen place-items-center px-6 py-24">
        <div className="mx-auto w-full max-w-[1100px] text-center">
          <h2
            data-reveal
            className="text-[clamp(3rem,8vw,7rem)] font-bold tracking-[-0.02em] text-white drop-shadow-[0_18px_70px_rgba(0,0,0,0.35)]"
            style={{ fontFamily: "var(--font-plus)" }}
          >
            My Work
          </h2>

          <div data-reveal className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {[
              {
                title: "ExplainMyCode",
                desc: "AI coding IDE",
                tags: ["FastAPI", "Groq", "Gemini", "Firebase", "Monaco Editor"],
                badge: "MegaHack 6.0 Special Mention",
                href: "#",
              },
              {
                title: "FingerPaint",
                desc: "Gesture-controlled drawing app",
                tags: ["MediaPipe", "HTML/JS", "Canvas API"],
                badge: "Personal Project",
                href: "https://finger-paint-eta.vercel.app/",
              },
              {
                title: "Evzones Protocol",
                desc: "Cinematic media protection app",
                tags: ["React", "Three.js", "GLSL"],
                badge: "In Progress",
                href: "https://evzones-protocol-git-security-changes-m-d-aftabs-projects.vercel.app/",
              },
              {
                title: "CNN-LSTM Research",
                desc: "Heart disease prediction, 91.2% accuracy",
                tags: ["Python", "CNN-LSTM"],
                badge: "MAT Journals Vol 3, 2026",
                href: "https://drive.google.com/file/d/1tr4oJWHtBjCh2Fa5VQPHbHvNJ0CsHJUj/view?usp=drivesdk",
              },
            ].map((p) => (
              <article
                key={p.title}
                className={`${glassCard} ${glassHover} p-5 text-left`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3
                    className="text-lg font-bold tracking-[-0.01em] text-white"
                    style={{ fontFamily: "var(--font-plus)" }}
                  >
                    {p.title}
                  </h3>
                  <span className="shrink-0 w-fit rounded-full border border-[#b478ff]/25 bg-[#b478ff]/10 px-2.5 py-1 text-[0.78rem] text-[#d2aaff]/80">
                    {p.badge}
                  </span>
                </div>
                <p className="mt-3 font-sans text-sm font-light text-[#c8afe6]/70">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className={tagPill}>
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href={p.href}
                  target={p.href === "#" ? undefined : "_blank"}
                  rel={p.href === "#" ? undefined : "noreferrer"}
                  className={`mt-5 ${pillBtn}`}
                >
                  View
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — CONTACT */}
      <section data-animate className="relative z-10 grid min-h-screen place-items-center px-6 py-24">
        <div className="mx-auto w-full max-w-[1100px] text-center">
          <h2
            data-reveal
            className="text-[clamp(3rem,8vw,7rem)] font-bold tracking-[-0.02em] text-white drop-shadow-[0_18px_70px_rgba(0,0,0,0.35)]"
            style={{ fontFamily: "var(--font-plus)" }}
          >
            Let's build something together
          </h2>

          <div data-reveal className="mx-auto mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
            <a
              className={`${glassCard} ${glassHover} px-5 py-4 text-white/90`}
              href="mailto:nisthapradeepdash@gmail.com"
            >
              📧 Email
            </a>
            <a
              className={`${glassCard} ${glassHover} px-5 py-4 text-white/90`}
              href="https://www.linkedin.com/in/nistha-dash-b6a123311"
              target="_blank"
              rel="noreferrer"
            >
              💼 LinkedIn
            </a>
            <a
              className={`${glassCard} ${glassHover} px-5 py-4 text-white/90`}
              href="https://github.com/nisthadash"
              target="_blank"
              rel="noreferrer"
            >
              🐙 GitHub
            </a>
            <div className={`${glassCard} px-5 py-4 text-white/85`}>
              📍 Boisar, Maharashtra
            </div>
          </div>

          <p data-reveal className="mt-12 font-sans text-sm font-light text-[#c8afe6]/55">
            © 2026 Nistha Dash · Built with love
          </p>
        </div>
      </section>
    </main>
  )
}
