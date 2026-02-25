import { Container, Graphics } from 'pixi.js';

/**
 * Particle Nebula — swirling galaxy vortex with thousands of particles.
 * Demonstrates high-count particle rendering and additive colour mixing.
 */
export function createNebulaSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const cx = W * 0.6;  // offset right so text has room
  const cy = H * 0.5;
  let elapsed = 0;

  /* ── Particle pool ───────────────────────────── */
  const COUNT = 900;
  const particles = Array.from({ length: COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 280 + 30;
    return {
      angle,
      dist,
      speed: (0.15 + Math.random() * 0.35) / Math.max(dist * 0.01, 1),
      size: Math.random() * 1.8 + 0.4,
      hue: Math.random(),           // 0-1, mapped to colour later
      drift: (Math.random() - 0.5) * 0.1,
    };
  });

  /* ── Colour helpers ──────────────────────────── */
  function nebulaColor(hue, dist) {
    // Inner = blue/cyan, mid = red/magenta, outer = purple/dim
    const t = Math.min(dist / 300, 1);
    if (t < 0.35) {
      return lerpColor(0x06B6D4, 0xE63312, t / 0.35);
    } else if (t < 0.65) {
      return lerpColor(0xE63312, 0x8B5CF6, (t - 0.35) / 0.3);
    }
    return lerpColor(0x8B5CF6, 0x3B82F6, (t - 0.65) / 0.35);
  }

  function lerpColor(a, b, t) {
    const ar = (a >> 16) & 0xFF, ag = (a >> 8) & 0xFF, ab = a & 0xFF;
    const br = (b >> 16) & 0xFF, bg = (b >> 8) & 0xFF, bb = b & 0xFF;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return (r << 16) | (g << 8) | bl;
  }

  /* ── Graphics layers ─────────────────────────── */
  // Glow layer (drawn with larger, dimmer circles)
  const glowGfx = new Graphics();
  glowGfx.blendMode = 'add';
  container.addChild(glowGfx);

  // Core particle layer
  const coreGfx = new Graphics();
  coreGfx.blendMode = 'add';
  container.addChild(coreGfx);

  /* ── Central glow ────────────────────────────── */
  const center = new Graphics();
  center.circle(0, 0, 60);
  center.fill({ color: 0xE63312, alpha: 0.04 });
  center.circle(0, 0, 25);
  center.fill({ color: 0xE63312, alpha: 0.1 });
  center.circle(0, 0, 6);
  center.fill({ color: 0xFFFFFF, alpha: 0.3 });
  center.x = cx;
  center.y = cy;
  container.addChild(center);

  /* ── Update ──────────────────────────────────── */
  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016;

    coreGfx.clear();
    glowGfx.clear();

    for (const p of particles) {
      // Rotate — inner particles faster
      p.angle += p.speed * dt * 0.02;
      p.dist += p.drift * dt * 0.3;

      // Keep particles in range
      if (p.dist < 20) p.drift = Math.abs(p.drift);
      if (p.dist > 320) p.drift = -Math.abs(p.drift);

      const x = cx + Math.cos(p.angle) * p.dist;
      const y = cy + Math.sin(p.angle) * p.dist * 0.65; // squash for perspective
      const color = nebulaColor(p.hue, p.dist);
      const alpha = 0.4 + Math.sin(elapsed * 0.01 + p.angle) * 0.2;

      // Glow (bigger, dimmer)
      glowGfx.circle(x, y, p.size * 3);
      glowGfx.fill({ color, alpha: alpha * 0.15 });

      // Core dot
      coreGfx.circle(x, y, p.size);
      coreGfx.fill({ color, alpha: Math.min(alpha + 0.2, 1) });
    }

    // Pulse center
    const pulse = 1 + Math.sin(t * 2) * 0.1;
    center.scale.set(pulse);
  }

  function destroy() {
    container.destroy({ children: true });
  }

  return { container, update, destroy };
}
