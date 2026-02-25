import { Container, Graphics, Text } from 'pixi.js';

/**
 * Parallax Layers — multi-depth landscape responding to mouse movement.
 */
export function createParallaxSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;
  let mouseX = 0, mouseY = 0;

  function onMouseMove(e) {
    mouseX = (e.clientX / W - 0.5) * 2; // -1 to 1
    mouseY = (e.clientY / H - 0.5) * 2;
  }
  window.addEventListener('mousemove', onMouseMove);

  /* ── Layer 0: Deep stars (slowest) ─────────── */
  const starLayer = new Container();
  const starGfx = new Graphics();
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * W * 1.2 - W * 0.1,
    y: Math.random() * H * 0.6,
    size: Math.random() * 1.2 + 0.3,
    alpha: Math.random() * 0.5 + 0.2,
  }));
  for (const s of stars) {
    starGfx.circle(s.x, s.y, s.size);
    starGfx.fill({ color: 0xFFFFFF, alpha: s.alpha });
  }
  starLayer.addChild(starGfx);
  container.addChild(starLayer);

  /* ── Layer 1: Far mountains ────────────────── */
  const farMountains = new Graphics();
  farMountains.moveTo(-50, H);
  const farPeaks = [0, 0.65, 0.12, 0.38, 0.18, 0.55, 0.25, 0.42, 0.3, 0.6, 0.15, 0.5, 1.05];
  for (let i = 0; i < farPeaks.length; i++) {
    farMountains.lineTo((i / (farPeaks.length - 1)) * (W + 100) - 50, H * (0.45 + farPeaks[i] * 0.2));
  }
  farMountains.lineTo(W + 50, H);
  farMountains.closePath();
  farMountains.fill({ color: 0x1a1a2e });
  container.addChild(farMountains);

  /* ── Layer 2: Mid hills ────────────────────── */
  const midHills = new Graphics();
  midHills.moveTo(-50, H);
  const midPeaks = [0, 0.5, 0.15, 0.45, 0.2, 0.55, 0.1, 0.4, 0.25, 0.5, 0.18, 1.05];
  for (let i = 0; i < midPeaks.length; i++) {
    midHills.lineTo((i / (midPeaks.length - 1)) * (W + 100) - 50, H * (0.6 + midPeaks[i] * 0.15));
  }
  midHills.lineTo(W + 50, H);
  midHills.closePath();
  midHills.fill({ color: 0x16213e });
  container.addChild(midHills);

  /* ── Layer 3: Near ground ──────────────────── */
  const nearGround = new Graphics();
  nearGround.moveTo(-50, H);
  const nearPeaks = [0, 0.3, 0.1, 0.35, 0.15, 0.25, 0.2, 0.3, 0.08, 1.05];
  for (let i = 0; i < nearPeaks.length; i++) {
    nearGround.lineTo((i / (nearPeaks.length - 1)) * (W + 100) - 50, H * (0.78 + nearPeaks[i] * 0.1));
  }
  nearGround.lineTo(W + 50, H);
  nearGround.closePath();
  nearGround.fill({ color: 0x0f3460 });
  container.addChild(nearGround);

  /* ── Layer 4: Foreground glow ──────────────── */
  const fgGlow = new Graphics();
  fgGlow.rect(-50, H * 0.92, W + 100, H * 0.08 + 10);
  fgGlow.fill({ color: 0xE63312, alpha: 0.03 });
  container.addChild(fgGlow);

  /* Moon */
  const moon = new Graphics();
  moon.circle(0, 0, 25);
  moon.fill({ color: 0xE8E4DE, alpha: 0.15 });
  moon.circle(0, 0, 18);
  moon.fill({ color: 0xE8E4DE, alpha: 0.3 });
  moon.circle(0, 0, 10);
  moon.fill({ color: 0xFFFFFF, alpha: 0.6 });
  moon.x = W * 0.75;
  moon.y = H * 0.2;
  container.addChild(moon);

  /* Depth factors (higher = more movement) */
  const layers = [
    { obj: starLayer, depth: 0.01 },
    { obj: moon, depth: 0.015 },
    { obj: farMountains, depth: 0.025 },
    { obj: midHills, depth: 0.045 },
    { obj: nearGround, depth: 0.07 },
    { obj: fgGlow, depth: 0.09 },
  ];

  /* Store original positions */
  const basePositions = layers.map((l) => ({ x: l.obj.x, y: l.obj.y }));

  function update(dt) {
    elapsed += dt;

    for (let i = 0; i < layers.length; i++) {
      const l = layers[i];
      const base = basePositions[i];
      l.obj.x = base.x + mouseX * l.depth * W * -0.5;
      l.obj.y = base.y + mouseY * l.depth * H * -0.3;
    }
  }

  function destroy() {
    window.removeEventListener('mousemove', onMouseMove);
    container.destroy({ children: true });
  }
  return { container, update, destroy };
}
