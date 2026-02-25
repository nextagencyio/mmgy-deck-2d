import { Container, Graphics } from 'pixi.js';

/**
 * Fireworks & Confetti — rockets launch and explode into branded bursts.
 */
export function createFireworksSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;

  const COLORS = [0xE63312, 0x3B82F6, 0x10B981, 0x8B5CF6, 0xF59E0B, 0x06B6D4];
  const rockets = [];
  const bursts = [];
  const confetti = [];

  const trailGfx = new Graphics();
  container.addChild(trailGfx);
  const burstGfx = new Graphics();
  burstGfx.blendMode = 'add';
  container.addChild(burstGfx);
  const confettiGfx = new Graphics();
  container.addChild(confettiGfx);

  function launch() {
    rockets.push({
      x: W * 0.15 + Math.random() * W * 0.7,
      y: H + 5,
      vy: -(7 + Math.random() * 4),
      targetY: H * 0.12 + Math.random() * H * 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      trail: [],
    });
  }

  function explode(x, y, color) {
    const count = 30 + Math.floor(Math.random() * 25);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = Math.random() * 4.5 + 1;
      bursts.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, color, life: 1, decay: 0.007 + Math.random() * 0.008, size: Math.random() * 2.5 + 0.5 });
    }
    for (let i = 0; i < 12; i++) {
      confetti.push({ x: x + (Math.random() - 0.5) * 30, y, vx: (Math.random() - 0.5) * 2, vy: Math.random() - 0.5, color: COLORS[Math.floor(Math.random() * COLORS.length)], life: 1, decay: 0.003 + Math.random() * 0.003, w: 3 + Math.random() * 4, h: 2 + Math.random() * 2 });
    }
  }

  let nextLaunch = 20;

  function update(dt) {
    elapsed += dt;
    nextLaunch -= dt;
    if (nextLaunch <= 0) { launch(); nextLaunch = 35 + Math.random() * 45; }

    trailGfx.clear();
    burstGfx.clear();
    confettiGfx.clear();

    // Rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y += r.vy * dt;
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 10) r.trail.shift();
      for (let j = 0; j < r.trail.length; j++) {
        trailGfx.circle(r.trail[j].x, r.trail[j].y, 1.5);
        trailGfx.fill({ color: r.color, alpha: (j / r.trail.length) * 0.5 });
      }
      trailGfx.circle(r.x, r.y, 2.5);
      trailGfx.fill({ color: 0xFFFFFF, alpha: 0.9 });
      if (r.y <= r.targetY) { explode(r.x, r.y, r.color); rockets.splice(i, 1); }
    }

    // Bursts
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 0.03 * dt; b.life -= b.decay * dt;
      if (b.life <= 0) { bursts.splice(i, 1); continue; }
      burstGfx.circle(b.x, b.y, b.size * b.life);
      burstGfx.fill({ color: b.color, alpha: b.life * 0.8 });
    }

    // Confetti
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 0.02 * dt; c.life -= c.decay * dt;
      if (c.life <= 0) { confetti.splice(i, 1); continue; }
      confettiGfx.rect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
      confettiGfx.fill({ color: c.color, alpha: c.life * 0.7 });
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
