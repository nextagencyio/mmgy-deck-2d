import { Container, Graphics } from 'pixi.js';

/**
 * Kaleidoscope — symmetrical rotating patterns in MMGY brand colours.
 */
export function createKaleidoscopeSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const cx = W * 0.55;
  const cy = H * 0.5;
  let elapsed = 0;

  const SECTORS = 10;
  const COLORS = [0xE63312, 0xFF4D2E, 0xC42A0E, 0x3B82F6, 0x8B5CF6, 0x06B6D4, 0xF59E0B];

  /* Source shapes — animated each frame, then replicated across sectors */
  const shapeCount = 18;
  const shapes = Array.from({ length: shapeCount }, (_, i) => ({
    baseDist: 30 + Math.random() * 180,
    baseAngle: (Math.random() * Math.PI) / SECTORS, // within one sector
    size: Math.random() * 8 + 3,
    color: COLORS[i % COLORS.length],
    speedDist: (Math.random() - 0.5) * 0.3,
    speedAngle: (Math.random() - 0.5) * 0.008,
    pulse: Math.random() * 0.02 + 0.005,
    alpha: Math.random() * 0.3 + 0.3,
  }));

  const gfx = new Graphics();
  gfx.blendMode = 'add';
  container.addChild(gfx);

  /* Background dim ring */
  const bgRing = new Graphics();
  bgRing.circle(cx, cy, 220);
  bgRing.stroke({ width: 0.5, color: 0xFFFFFF, alpha: 0.04 });
  bgRing.circle(cx, cy, 150);
  bgRing.stroke({ width: 0.5, color: 0xFFFFFF, alpha: 0.04 });
  bgRing.circle(cx, cy, 80);
  bgRing.stroke({ width: 0.5, color: 0xFFFFFF, alpha: 0.04 });
  container.addChild(bgRing);
  // Bring gfx to front
  container.addChild(gfx);

  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016;

    gfx.clear();

    for (const shape of shapes) {
      // Animate
      const dist = shape.baseDist + Math.sin(t * shape.pulse * 60) * 25;
      const localAngle = shape.baseAngle + t * shape.speedAngle * 60;
      const size = shape.size + Math.sin(t * shape.pulse * 40) * 2;

      // Replicate across sectors (rotational + reflected)
      for (let s = 0; s < SECTORS; s++) {
        const sectorAngle = (s / SECTORS) * Math.PI * 2;

        // Normal
        const angle1 = sectorAngle + localAngle;
        const x1 = cx + Math.cos(angle1) * dist;
        const y1 = cy + Math.sin(angle1) * dist;
        gfx.circle(x1, y1, Math.max(1, size));
        gfx.fill({ color: shape.color, alpha: shape.alpha });

        // Reflected
        const angle2 = sectorAngle - localAngle;
        const x2 = cx + Math.cos(angle2) * dist;
        const y2 = cy + Math.sin(angle2) * dist;
        gfx.circle(x2, y2, Math.max(1, size));
        gfx.fill({ color: shape.color, alpha: shape.alpha * 0.7 });
      }
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
