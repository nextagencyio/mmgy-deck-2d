import { Container, Graphics } from 'pixi.js';

/**
 * Hero slide — animated starfield with orbiting planets and glowing rings.
 */
export function createHeroSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;

  /* ── Stars ───────────────────────────────────── */
  const STAR_COUNT = 250;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.4 + 0.3,
    speed: Math.random() * 0.3 + 0.05,
    baseAlpha: Math.random() * 0.6 + 0.2,
    twinkleSpeed: Math.random() * 0.03 + 0.01,
  }));

  const starGfx = new Graphics();
  container.addChild(starGfx);

  /* ── Orbit rings ─────────────────────────────── */
  const rings = [
    { rx: 220, ry: 80, rotation: -0.15 },
    { rx: 340, ry: 120, rotation: 0.1 },
    { rx: 460, ry: 160, rotation: -0.05 },
  ];

  const ringGfx = new Graphics();
  ringGfx.x = W / 2;
  ringGfx.y = H / 2;
  container.addChild(ringGfx);

  function drawRings() {
    ringGfx.clear();
    for (const ring of rings) {
      ringGfx.ellipse(0, 0, ring.rx, ring.ry);
      ringGfx.stroke({ width: 0.6, color: 0xFFFFFF, alpha: 0.07 });
      ringGfx.rotation = ring.rotation;
    }
  }
  drawRings();

  /* ── Planets ─────────────────────────────────── */
  const planetDefs = [
    { orbitRx: 220, orbitRy: 80, size: 10, color: 0x3B82F6, speed: 0.004, offset: 0 },
    { orbitRx: 340, orbitRy: 120, size: 14, color: 0xE63312, speed: 0.0025, offset: 2.1 },
    { orbitRx: 340, orbitRy: 120, size: 7, color: 0x10B981, speed: 0.0025, offset: 5.2 },
    { orbitRx: 460, orbitRy: 160, size: 9, color: 0x8B5CF6, speed: 0.0015, offset: 1.0 },
    { orbitRx: 460, orbitRy: 160, size: 6, color: 0xF59E0B, speed: 0.0015, offset: 3.8 },
  ];

  const planetContainers = planetDefs.map((p) => {
    const pc = new Container();
    pc.x = W / 2;
    pc.y = H / 2;

    // Glow
    const glow = new Graphics();
    glow.circle(0, 0, p.size * 2.5);
    glow.fill({ color: p.color, alpha: 0.08 });
    pc.addChild(glow);

    // Body
    const body = new Graphics();
    body.circle(0, 0, p.size);
    body.fill({ color: p.color, alpha: 0.9 });
    pc.addChild(body);

    container.addChild(pc);
    return { def: p, container: pc, glow, body };
  });

  /* ── Central glow ────────────────────────────── */
  const centerGlow = new Graphics();
  centerGlow.circle(0, 0, 40);
  centerGlow.fill({ color: 0xE63312, alpha: 0.06 });
  centerGlow.circle(0, 0, 18);
  centerGlow.fill({ color: 0xE63312, alpha: 0.12 });
  centerGlow.circle(0, 0, 4);
  centerGlow.fill({ color: 0xFFFFFF, alpha: 0.5 });
  centerGlow.x = W / 2;
  centerGlow.y = H / 2;
  container.addChild(centerGlow);

  /* ── Update ──────────────────────────────────── */
  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016; // ~seconds

    // Stars
    starGfx.clear();
    for (const s of stars) {
      s.y += s.speed * dt;
      if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
      const alpha = s.baseAlpha + Math.sin(elapsed * s.twinkleSpeed) * 0.2;
      starGfx.circle(s.x, s.y, s.r);
      starGfx.fill({ color: 0xFFFFFF, alpha: Math.max(0.05, alpha) });
    }

    // Planets orbit
    for (const p of planetContainers) {
      const angle = t * p.def.speed * 60 + p.def.offset;
      const px = Math.cos(angle) * p.def.orbitRx;
      const py = Math.sin(angle) * p.def.orbitRy;
      p.glow.x = px;
      p.glow.y = py;
      p.body.x = px;
      p.body.y = py;
    }

    // Center pulse
    const pulse = 1 + Math.sin(t * 1.5) * 0.15;
    centerGlow.scale.set(pulse);
  }

  function destroy() {
    container.destroy({ children: true });
  }

  return { container, update, destroy };
}
