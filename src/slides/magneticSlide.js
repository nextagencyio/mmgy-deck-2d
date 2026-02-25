import { Container, Graphics } from 'pixi.js';

/**
 * Magnetic Field — particles flow toward attractor points along curved field lines.
 */
export function createMagneticSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;

  /* Attractors */
  const attractors = [
    { x: W * 0.65, y: H * 0.35, strength: 600, color: 0xE63312 },
    { x: W * 0.45, y: H * 0.65, strength: 500, color: 0x3B82F6 },
    { x: W * 0.8, y: H * 0.6, strength: 450, color: 0x8B5CF6 },
  ];

  /* Attractor visuals */
  const attractorGfx = new Graphics();
  for (const a of attractors) {
    attractorGfx.circle(a.x, a.y, 30);
    attractorGfx.fill({ color: a.color, alpha: 0.06 });
    attractorGfx.circle(a.x, a.y, 12);
    attractorGfx.fill({ color: a.color, alpha: 0.2 });
    attractorGfx.circle(a.x, a.y, 4);
    attractorGfx.fill({ color: 0xFFFFFF, alpha: 0.6 });
  }
  container.addChild(attractorGfx);

  /* Particles */
  const COUNT = 600;
  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 1.4 + 0.4,
    color: attractors[Math.floor(Math.random() * attractors.length)].color,
  }));

  const particleGfx = new Graphics();
  particleGfx.blendMode = 'add';
  container.addChild(particleGfx);

  const trailGfx = new Graphics();
  trailGfx.blendMode = 'add';
  container.addChild(trailGfx);

  function update(dt) {
    elapsed += dt;
    particleGfx.clear();
    trailGfx.clear();

    for (const p of particles) {
      let fx = 0, fy = 0;

      for (const a of attractors) {
        const dx = a.x - p.x;
        const dy = a.y - p.y;
        const dist = Math.max(Math.hypot(dx, dy), 20);
        const force = a.strength / (dist * dist);
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }

      // Perpendicular drift for swirling motion
      p.vx += (fx + fy * 0.3) * dt * 0.5;
      p.vy += (fy - fx * 0.3) * dt * 0.5;
      p.vx *= 0.97; p.vy *= 0.97;
      const prevX = p.x, prevY = p.y;
      p.x += p.vx * dt; p.y += p.vy * dt;

      // Respawn if too close to attractor or off-screen
      const nearAny = attractors.some(a => Math.hypot(a.x - p.x, a.y - p.y) < 15);
      if (nearAny || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
        p.x = Math.random() * W; p.y = Math.random() * H;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = (Math.random() - 0.5) * 0.5;
        continue;
      }

      // Trail
      trailGfx.moveTo(prevX, prevY);
      trailGfx.lineTo(p.x, p.y);
      trailGfx.stroke({ width: 0.4, color: p.color, alpha: 0.15 });

      // Dot
      particleGfx.circle(p.x, p.y, p.size);
      particleGfx.fill({ color: p.color, alpha: 0.6 });
    }

    // Pulse attractors
    const pulse = 1 + Math.sin(elapsed * 0.04) * 0.1;
    attractorGfx.scale.set(pulse);
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
