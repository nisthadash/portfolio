"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ShaderAnimation } from "@/components/ui/shader-animation"

export default function Page() {
  const [locked, setLocked] = useState(true)
  const section1Ref = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.style.overflowY = locked ? "hidden" : "auto"
    document.body.style.overflowY = locked ? "hidden" : "auto"
    return () => {
      document.documentElement.style.overflowY = "auto"
      document.body.style.overflowY = "auto"
    }
  }, [locked])

  const headline = useMemo(() => {
    return (
      <h1 className="text-center font-[var(--font-instrument)] text-[clamp(3.2rem,9vw,7.8rem)] font-normal leading-[1.02] tracking-[-0.02em] text-white drop-shadow-[0_2px_48px_rgba(0,0,0,0.55)]">
        Hello,&nbsp;<em className="italic">Welcome!</em>
      </h1>
    )
  }, [])

  const goNext = () => {
    setLocked(false)
    requestAnimationFrame(() => {
      section1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Section 0 (locked) */}
      <section className="relative h-screen w-full overflow-hidden">
        <ShaderAnimation className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.72)_100%)]" />

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <p className="mb-6 font-sans text-[clamp(0.65rem,1.4vw,0.8rem)] font-normal uppercase tracking-[0.22em] text-white/40">
            Computer Engineering · SJCEM
          </p>

          {headline}

          <p className="mt-6 font-sans text-[clamp(0.9rem,1.8vw,1.05rem)] font-light tracking-[0.01em] text-white/40">
            Builder · Designer · Researcher
          </p>

          <div className="pointer-events-auto mt-10">
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3 font-sans text-sm font-normal tracking-[0.015em] text-white backdrop-blur-xl transition hover:border-white/45 hover:bg-white/15"
            >
              Get to know me more <span aria-hidden>↓</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 1 (scroll starts here) */}
      <section ref={section1Ref} className="relative grid min-h-screen place-items-center px-6 py-24">
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className="mb-6 font-sans text-sm font-light uppercase tracking-[0.25em] text-[#d2aaff]/55">
            Hi, I&apos;m
          </p>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[clamp(5.5rem,16vw,12rem)] font-bold leading-[0.94] tracking-[-0.03em] text-white">
            Nistha
            <br />
            Dash
          </h2>
          <div className="mx-auto my-6 h-px w-[min(640px,86%)] bg-[#b478ff]/40" />
          <p className="mx-auto max-w-3xl font-sans text-[clamp(1rem,1.8vw,1.2rem)] font-light leading-relaxed text-[#c8afe6]/65">
            Building things at the intersection of code, AI/ML, and visual design
          </p>
        </div>
      </section>
    </main>
  )
}

