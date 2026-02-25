import { Application } from 'pixi.js';
import { createHeroSlide } from './slides/heroSlide.js';
import { createNebulaSlide } from './slides/nebulaSlide.js';
import { createStatsSlide } from './slides/statsSlide.js';
import { createOrbitsSlide } from './slides/orbitsSlide.js';
import { createWarpSlide } from './slides/warpSlide.js';
import { createFireworksSlide } from './slides/fireworksSlide.js';
import { createMagneticSlide } from './slides/magneticSlide.js';
import { createMetaballSlide } from './slides/metaballSlide.js';
import { createTextMorphSlide } from './slides/textMorphSlide.js';
import { createKineticSlide } from './slides/kineticSlide.js';
import { createGlitchSlide } from './slides/glitchSlide.js';
import { createNetworkSlide } from './slides/networkSlide.js';
import { createRadarSlide } from './slides/radarSlide.js';
import { createTimelineSlide } from './slides/timelineSlide.js';
import { createDisplacementSlide } from './slides/displacementSlide.js';
import { createParallaxSlide } from './slides/parallaxSlide.js';
import { createKaleidoscopeSlide } from './slides/kaleidoscopeSlide.js';
import { createWipeSlide } from './slides/wipeSlide.js';
import { createRobotSlide } from './slides/robotSlide.js';

/* ── Slide registry (closing slide is HTML-only) ── */
const slideFactories = [
  createHeroSlide,           // 0  — Hero
  createNebulaSlide,         // 1  — Particle Nebula
  createStatsSlide,          // 2  — Stats Dashboard
  createOrbitsSlide,         // 3  — Platform Orbits
  createWarpSlide,           // 4  — Warp Speed
  createFireworksSlide,      // 5  — Fireworks & Confetti
  createMagneticSlide,       // 6  — Magnetic Field
  createMetaballSlide,       // 7  — Liquid Blobs
  createTextMorphSlide,      // 8  — Text Particle Morph
  createKineticSlide,        // 9  — Kinetic Typography
  createGlitchSlide,         // 10 — Glitch Text
  createNetworkSlide,        // 11 — Network Graph
  createRadarSlide,          // 12 — Radar Chart
  createTimelineSlide,       // 13 — Timeline
  createDisplacementSlide,   // 14 — Displacement Ripple
  createParallaxSlide,       // 15 — Parallax Layers
  createKaleidoscopeSlide,   // 16 — Kaleidoscope
  createWipeSlide,           // 17 — Before/After Wipe
  createRobotSlide,          // 18 — Robot Mascot
  null,                      // 19 — Closing (HTML only)
];

const TOTAL = slideFactories.length;

/* ── State ─────────────────────────────────────── */
let app;
let current = 0;
let activeScene = null;   // { container, update?, destroy? }
let transitioning = false;

/* ── DOM refs ──────────────────────────────────── */
const overlays    = () => document.querySelectorAll('.slide-overlay');
const progressEl  = () => document.querySelector('.progress-fill');
const counterEl   = () => document.querySelector('.slide-counter');
const hintEl      = () => document.querySelector('.nav-hint');

/* ── Bootstrap ─────────────────────────────────── */
async function init() {
  app = new Application();
  await app.init({
    resizeTo: window,
    background: 0x1A1A1A,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  document.getElementById('pixi-canvas-container').appendChild(app.canvas);

  // Ticker drives active scene updates
  app.ticker.add(tick);

  // Read initial slide from URL hash
  const hash = window.location.hash.match(/slide=(\d+)/);
  if (hash) current = Math.min(parseInt(hash[1], 10), TOTAL - 1);

  await showSlide(current);

  // Navigation
  window.addEventListener('keydown', onKey);
  setupSwipe();

  // Hide hint after 5s
  setTimeout(() => hintEl()?.classList.add('hidden'), 5000);
}

/* ── Tick ───────────────────────────────────────── */
function tick(ticker) {
  if (activeScene?.update) activeScene.update(ticker.deltaTime);
}

/* ── Transition ────────────────────────────────── */
async function showSlide(index) {
  if (transitioning || index < 0 || index >= TOTAL) return;
  transitioning = true;

  // Tear down old scene
  if (activeScene) {
    await fadeOut(activeScene.container, 12);
    app.stage.removeChild(activeScene.container);
    if (activeScene.destroy) activeScene.destroy();
    activeScene = null;
  }

  // HTML overlays
  overlays().forEach((el, i) => el.classList.toggle('active', i === index));

  // Create new PixiJS scene
  const factory = slideFactories[index];
  if (factory) {
    activeScene = factory(app);
    activeScene.container.alpha = 0;
    app.stage.addChild(activeScene.container);
    await fadeIn(activeScene.container, 15);
  }

  current = index;
  updateUI();
  window.location.hash = `slide=${index}`;
  transitioning = false;
}

/* ── Simple alpha tweens (promise-based) ───────── */
function fadeIn(container, frames) {
  return new Promise((resolve) => {
    let f = 0;
    const fn = (ticker) => {
      f += ticker.deltaTime;
      container.alpha = Math.min(f / frames, 1);
      if (f >= frames) { container.alpha = 1; app.ticker.remove(fn); resolve(); }
    };
    app.ticker.add(fn);
  });
}

function fadeOut(container, frames) {
  return new Promise((resolve) => {
    let f = 0;
    const fn = (ticker) => {
      f += ticker.deltaTime;
      container.alpha = Math.max(1 - f / frames, 0);
      if (f >= frames) { container.alpha = 0; app.ticker.remove(fn); resolve(); }
    };
    app.ticker.add(fn);
  });
}

/* ── UI helpers ────────────────────────────────── */
function updateUI() {
  const pct = (current / (TOTAL - 1)) * 100;
  progressEl().style.width = `${pct}%`;
  counterEl().textContent = `${current + 1} / ${TOTAL}`;
}

/* ── Keyboard ──────────────────────────────────── */
function onKey(e) {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    showSlide(current + 1);
  } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
    e.preventDefault();
    showSlide(current - 1);
  } else if (e.key === 'Home') {
    showSlide(0);
  } else if (e.key === 'End') {
    showSlide(TOTAL - 1);
  }
}

/* ── Touch swipe ───────────────────────────────── */
function setupSwipe() {
  let startX = 0;
  window.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 60) {
      dx < 0 ? showSlide(current + 1) : showSlide(current - 1);
    }
  }, { passive: true });
}

/* ── Go ────────────────────────────────────────── */
init();
