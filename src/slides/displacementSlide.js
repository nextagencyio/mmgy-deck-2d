import { Container, Graphics } from 'pixi.js';

/**
 * Displacement / Ripple — a grid of dots displaced by animated wave functions.
 */
export function createDisplacementSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const cx = W * 0.55;
  const cy = H * 0.5;
  let elapsed = 0;

  const SPACING = 18;
  const cols = Math.ceil(W / SPACING) + 2;
  const rows = Math.ceil(H / SPACING) + 2;
  const OFFSET_X = (W - cols * SPACING) / 2;
  const OFFSET_Y = (H - rows * SPACING) / 2;

  const dotGfx = new Graphics();
  container.addChild(dotGfx);

  /* Secondary ripple origin (animated) */
  let ripple2X = W * 0.3;
  let ripple2Y = H * 0.7;

  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016; // seconds

    // Move second ripple origin
    ripple2X = W * 0.3 + Math.sin(t * 0.5) * 100;
    ripple2Y = H * 0.7 + Math.cos(t * 0.4) * 80;

    dotGfx.clear();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const baseX = OFFSET_X + col * SPACING;
        const baseY = OFFSET_Y + row * SPACING;

        // Distance to primary ripple center
        const d1 = Math.hypot(baseX - cx, baseY - cy);
        const wave1 = Math.sin(d1 * 0.04 - t * 3) * 10;

        // Distance to secondary ripple center
        const d2 = Math.hypot(baseX - ripple2X, baseY - ripple2Y);
        const wave2 = Math.sin(d2 * 0.05 - t * 2.5) * 6;

        // Combined displacement (radial direction)
        const totalWave = wave1 + wave2;
        const angle1 = Math.atan2(baseY - cy, baseX - cx);
        const dx = Math.cos(angle1) * totalWave * 0.5;
        const dy = Math.sin(angle1) * totalWave * 0.5;

        const x = baseX + dx;
        const y = baseY + dy;

        // Size and colour based on displacement
        const intensity = Math.abs(totalWave) / 16;
        const size = 1.2 + intensity * 2;
        const color = intensity > 0.5 ? 0xE63312 : 0xFFFFFF;
        const alpha = 0.15 + intensity * 0.5;

        dotGfx.circle(x, y, size);
        dotGfx.fill({ color, alpha: Math.min(alpha, 0.8) });
      }
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
