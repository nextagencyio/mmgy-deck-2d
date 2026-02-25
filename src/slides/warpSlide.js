import { Container, Graphics } from 'pixi.js';

/**
 * Warp Speed — classic hyperspace tunnel with streaking stars radiating from center.
 */
export function createWarpSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const cx = W / 2;
  const cy = H / 2;
  let elapsed = 0;

  /* ── Star pool ───────────────────────────────── */
  const STAR_COUNT = 400;
  const SPREAD = 600;  // how far off-center stars originate

  function makeStar() {
    const angle = Math.random() * Math.PI * 2;
    return {
      angle,
      z: Math.random() * 1200 + 100,
      speed: Math.random() * 8 + 6,
      prevX: 0,
      prevY: 0,
      hasPrev: false,
    };
  }

  const stars = Array.from({ length: STAR_COUNT }, makeStar);

  /* ── Radial glow rings ──────────────────────── */
  const ringGfx = new Graphics();
  container.addChild(ringGfx);

  function drawGlowRings() {
    ringGfx.clear();
    // Subtle concentric rings
    for (let r = 40; r <= 300; r += 60) {
      ringGfx.circle(cx, cy, r);
      ringGfx.stroke({ width: 0.5, color: 0xE63312, alpha: 0.03 });
    }
    // Center hot spot
    ringGfx.circle(cx, cy, 30);
    ringGfx.fill({ color: 0xE63312, alpha: 0.06 });
    ringGfx.circle(cx, cy, 8);
    ringGfx.fill({ color: 0xFFFFFF, alpha: 0.15 });
  }
  drawGlowRings();

  /* ── Star graphics ───────────────────────────── */
  const starGfx = new Graphics();
  container.addChild(starGfx);

  /* ── Colour by depth ─────────────────────────── */
  function starColor(z) {
    // Far = dim blue, mid = white, close = warm
    const t = Math.min(z / 1000, 1);
    if (t > 0.6) return 0x4488CC;
    if (t > 0.3) return 0xFFFFFF;
    return 0xFFCCAA;
  }

  /* ── Update ──────────────────────────────────── */
  function update(dt) {
    elapsed += dt;

    starGfx.clear();

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Project 3D → 2D
      const scale = 500 / s.z;
      const x = cx + Math.cos(s.angle) * SPREAD * scale;
      const y = cy + Math.sin(s.angle) * SPREAD * scale;

      // Move toward camera (accelerate as stars get closer)
      const accel = 1 + (1 - s.z / 1200) * 2;
      s.z -= s.speed * dt * accel;

      if (s.z <= 1 || x < -100 || x > W + 100 || y < -100 || y > H + 100) {
        Object.assign(s, makeStar());
        s.z = 1000 + Math.random() * 200;
        s.hasPrev = false;
        continue;
      }

      const color = starColor(s.z);
      const closeness = 1 - s.z / 1200; // 0 = far, 1 = close
      const brightness = Math.min(closeness * 1.5, 1);

      if (s.hasPrev) {
        // Streak line — gets thicker and longer as stars approach
        const lineWidth = Math.max(0.4, closeness * 3);
        starGfx.moveTo(s.prevX, s.prevY);
        starGfx.lineTo(x, y);
        starGfx.stroke({ width: lineWidth, color, alpha: brightness * 0.8 });

        // Bright head dot
        const headSize = Math.max(0.6, closeness * 2.5);
        starGfx.circle(x, y, headSize);
        starGfx.fill({ color: 0xFFFFFF, alpha: brightness });
      }

      s.prevX = x;
      s.prevY = y;
      s.hasPrev = true;
    }

    // Gentle pulse on center glow
    const pulse = 1 + Math.sin(elapsed * 0.03) * 0.15;
    ringGfx.scale.set(pulse);
  }

  function destroy() {
    container.destroy({ children: true });
  }

  return { container, update, destroy };
}
