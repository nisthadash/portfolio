/* global THREE */
(function () {
  const state = {
    renderer: null,
    scene: null,
    camera: null,
    groups: [],
    scrollP: 0,
    targetCamX: 0,
    camX: 0,
    w: 0,
    h: 0
  };

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function createLayer({ count, z, spread, size, colorA, colorB }) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const ca = new THREE.Color(colorA);
    const cb = new THREE.Color(colorB);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = randBetween(-spread, spread);
      positions[i3 + 1] = randBetween(-spread * 0.7, spread * 0.7);
      positions[i3 + 2] = z + randBetween(-2, 2);

      const t = Math.random();
      const c = ca.clone().lerp(cb, t);
      colors[i3 + 0] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    return points;
  }

  function onResize() {
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    state.renderer.setSize(state.w, state.h, false);
    state.camera.aspect = state.w / state.h;
    state.camera.updateProjectionMatrix();
  }

  function animate() {
    requestAnimationFrame(animate);

    // Scroll drives a smooth sideways pan.
    state.targetCamX = (state.scrollP - 0.5) * 10.0;
    state.camX += (state.targetCamX - state.camX) * 0.06;
    state.camera.position.x = state.camX;

    // Subtle drift + depth parallax
    const t = performance.now() * 0.00012;
    for (let i = 0; i < state.groups.length; i++) {
      const g = state.groups[i];
      g.rotation.z = t * (0.1 + i * 0.05);
      g.rotation.y = t * (0.08 + i * 0.04);
      g.position.x = -state.camX * (0.18 + i * 0.12);
    }

    state.renderer.render(state.scene, state.camera);
  }

  function init({ canvasId = "shader-canvas" } = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    state.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    state.renderer.setClearColor(0x05020a, 1);

    state.scene = new THREE.Scene();

    state.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    state.camera.position.set(0, 0, 18);

    const layer1 = createLayer({
      count: 1200,
      z: -28,
      spread: 55,
      size: 0.06,
      colorA: "#ffffff",
      colorB: "#d7b2ff"
    });
    const layer2 = createLayer({
      count: 900,
      z: -18,
      spread: 40,
      size: 0.085,
      colorA: "#ffffff",
      colorB: "#a9c3ff"
    });
    const layer3 = createLayer({
      count: 650,
      z: -10,
      spread: 28,
      size: 0.11,
      colorA: "#ffffff",
      colorB: "#caa0ff"
    });

    state.scene.add(layer1, layer2, layer3);
    state.groups = [layer1, layer2, layer3];

    onResize();
    window.addEventListener("resize", onResize, { passive: true });

    animate();
  }

  function setScrollProgress(p) {
    state.scrollP = Math.max(0, Math.min(1, p || 0));
  }

  window.Starfield = { init, setScrollProgress };
})();

