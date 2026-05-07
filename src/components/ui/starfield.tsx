"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

type StarfieldProps = {
  /** 0..1, used to fade the starfield in/out */
  opacity?: number
  className?: string
}

// Vertex shader: applies per-star twinkle via a phase attribute
const vertexShader = /* glsl */ `
  attribute float phase;
  attribute float twinkleSpeed;
  attribute float baseSize;
  uniform float uTime;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vColor = color;

    // Twinkle: smooth sine-based brightness flicker per star
    float twinkle = 0.55 + 0.45 * sin(uTime * twinkleSpeed + phase);
    vAlpha = twinkle;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Size attenuation: closer = bigger (matches real perspective)
    gl_PointSize = baseSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

// Fragment shader: soft gaussian disk so each star has a natural glow falloff
const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // Distance from center of point sprite
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);

    // Gaussian falloff — sharp bright core, soft halo
    float core   = exp(-dist * dist * 60.0);
    float corona = exp(-dist * dist * 12.0) * 0.35;
    float alpha  = (core + corona) * vAlpha;

    if (alpha < 0.005) discard;
    gl_FragColor = vec4(vColor * (1.0 + core * 0.6), alpha);
  }
`

export function Starfield({ opacity = 1, className }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef    = useRef<number | null>(null)
  const scrollRef = useRef(0)
  const camTiltRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 500)
    camera.position.set(0, 0, 0)

    const rand  = (lo: number, hi: number) => lo + Math.random() * (hi - lo)
    const rand1 = () => Math.random()

    // ── Layer definition ───────────────────────────────────────────────────
    type LayerCfg = {
      count:  number
      zMin:   number
      zMax:   number
      spread: number
      size:   number       // base point size
      colorA: string
      colorB: string
      driftZ: number       // how fast layer drifts toward camera per second
    }

    const LAYERS: LayerCfg[] = [
      // Far layer — many tiny dim stars, slow drift
      { count: 2200, zMin: -400, zMax: -150, spread: 220, size: 1.8, colorA: "#ffffff", colorB: "#c8b8ff", driftZ: 0.6 },
      // Mid layer — medium brightness, moderate drift
      { count: 1100, zMin: -150, zMax:  -60, spread: 130, size: 2.4, colorA: "#ffffff", colorB: "#a8c4ff", driftZ: 1.4 },
      // Near layer — few large bright stars, faster drift, warm tint
      { count:  420, zMin:  -60, zMax:  -20, spread:  65, size: 3.2, colorA: "#ffffff", colorB: "#ffe8c0", driftZ: 2.6 },
    ]

    type LayerObj = {
      points:   THREE.Points
      geometry: THREE.BufferGeometry
      material: THREE.ShaderMaterial
      posArr:   Float32Array
      origZ:    Float32Array
      driftZ:   number
      zMin:     number
      zMax:     number
    }

    const layerObjs: LayerObj[] = LAYERS.map((cfg) => {
      const { count, zMin, zMax, spread, size, colorA, colorB, driftZ } = cfg
      const geo = new THREE.BufferGeometry()

      const positions    = new Float32Array(count * 3)
      const colors       = new Float32Array(count * 3)
      const phases       = new Float32Array(count)
      const twinkleSpeeds = new Float32Array(count)
      const baseSizes    = new Float32Array(count)
      const origZ        = new Float32Array(count)

      const ca = new THREE.Color(colorA)
      const cb = new THREE.Color(colorB)

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const x  = rand(-spread, spread)
        const y  = rand(-spread * 0.6, spread * 0.6)
        const z  = rand(zMin, zMax)
        positions[i3]     = x
        positions[i3 + 1] = y
        positions[i3 + 2] = z
        origZ[i]          = z

        const t  = rand1()
        const c  = ca.clone().lerp(cb, t)
        colors[i3]     = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b

        phases[i]        = rand(0, Math.PI * 2)
        twinkleSpeeds[i] = rand(0.4, 2.2)          // Hz-ish, varied
        baseSizes[i]     = rand(size * 0.5, size * 1.6)
      }

      geo.setAttribute("position",     new THREE.BufferAttribute(positions, 3))
      geo.setAttribute("color",        new THREE.BufferAttribute(colors, 3))
      geo.setAttribute("phase",        new THREE.BufferAttribute(phases, 1))
      geo.setAttribute("twinkleSpeed", new THREE.BufferAttribute(twinkleSpeeds, 1))
      geo.setAttribute("baseSize",     new THREE.BufferAttribute(baseSizes, 1))

      const mat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: { value: 0 } },
        transparent:    true,
        depthWrite:     false,
        blending:       THREE.AdditiveBlending,
        vertexColors:   true,
      })

      const points = new THREE.Points(geo, mat)
      points.frustumCulled = false
      scene.add(points)

      return { points, geometry: geo, material: mat, posArr: positions, origZ, driftZ, zMin, zMax }
    })

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    onResize()
    window.addEventListener("resize", onResize, { passive: true })

    // ── Scroll ─────────────────────────────────────────────────────────────
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      scrollRef.current = Math.max(0, Math.min(1, window.scrollY / max))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    // ── Animate ────────────────────────────────────────────────────────────
    let lastTime = performance.now()

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)

      const now   = performance.now()
      const dt    = Math.min((now - lastTime) / 1000, 0.05)   // cap at 50ms
      lastTime    = now
      const t     = now * 0.001

      // Smooth camera tilt based on scroll
      const targetTilt  = (scrollRef.current - 0.5) * 0.18
      camTiltRef.current += (targetTilt - camTiltRef.current) * 0.04
      camera.rotation.x  = camTiltRef.current

      // Per-layer drift + twinkle time
      for (const layer of layerObjs) {
        // Update shader time for twinkle
        layer.material.uniforms.uTime.value = t

        // Drift stars forward (increasing Z) and wrap when past camera
        const posArr = layer.posArr
        const origZ  = layer.origZ
        const range  = layer.zMax - layer.zMin

        for (let i = 0; i < posArr.length / 3; i++) {
          const i3 = i * 3
          posArr[i3 + 2] += layer.driftZ * dt
          // Wrap: if star passes z=0 (behind camera), teleport it back
          if (posArr[i3 + 2] > -5) {
            const newZ = origZ[i] - (posArr[i3 + 2] - layer.zMin) % range
            posArr[i3 + 2] = newZ < layer.zMin ? layer.zMin : newZ
          }
        }
        ;(layer.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      for (const l of layerObjs) {
        l.geometry.dispose()
        l.material.dispose()
        scene.remove(l.points)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ opacity }}
    />
  )
}
