import { Container, Graphics, Text } from 'pixi.js';

/**
 * Before/After Wipe — animated reveal comparing Legacy vs Horizon.
 */
export function createWipeSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;

  /* ── "Before" layer (left side — static, gray, boring) ── */
  const beforeLayer = new Container();
  const beforeBg = new Graphics();
  // Dull grid
  for (let x = 0; x < W; x += 40) {
    beforeBg.moveTo(x, 0); beforeBg.lineTo(x, H);
    beforeBg.stroke({ width: 0.5, color: 0xFFFFFF, alpha: 0.03 });
  }
  for (let y = 0; y < H; y += 40) {
    beforeBg.moveTo(0, y); beforeBg.lineTo(W, y);
    beforeBg.stroke({ width: 0.5, color: 0xFFFFFF, alpha: 0.03 });
  }
  beforeLayer.addChild(beforeBg);
  // Static gray boxes
  const boxes = [
    { x: W * 0.15, y: H * 0.25, w: 200, h: 30 },
    { x: W * 0.15, y: H * 0.35, w: 280, h: 120 },
    { x: W * 0.15, y: H * 0.58, w: 130, h: 80 },
    { x: W * 0.35, y: H * 0.58, w: 130, h: 80 },
  ];
  const boxGfx = new Graphics();
  for (const b of boxes) {
    boxGfx.rect(b.x, b.y, b.w, b.h);
    boxGfx.fill({ color: 0x333333, alpha: 0.5 });
    boxGfx.stroke({ width: 1, color: 0x444444, alpha: 0.3 });
  }
  beforeLayer.addChild(boxGfx);
  const legacyLabel = new Text({ text: 'LEGACY', style: { fontFamily: 'Oswald', fontSize: 16, fill: 0x555555, letterSpacing: 4, fontWeight: '600' } });
  legacyLabel.anchor = { x: 0.5, y: 0.5 };
  legacyLabel.x = W * 0.3; legacyLabel.y = H * 0.15;
  beforeLayer.addChild(legacyLabel);
  container.addChild(beforeLayer);

  /* ── "After" layer (right side — vibrant, animated) ── */
  const afterLayer = new Container();
  // Animated particles
  const COUNT = 200;
  const afterParticles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 2.5 + 0.5,
    color: [0xE63312, 0x3B82F6, 0x10B981, 0x8B5CF6][Math.floor(Math.random() * 4)],
    alpha: Math.random() * 0.4 + 0.2,
  }));
  const afterGfx = new Graphics();
  afterGfx.blendMode = 'add';
  afterLayer.addChild(afterGfx);

  // Colorful UI mockup boxes
  const afterBoxes = new Graphics();
  afterBoxes.roundRect(W * 0.15, H * 0.25, 200, 30, 4);
  afterBoxes.fill({ color: 0xE63312, alpha: 0.3 });
  afterBoxes.roundRect(W * 0.15, H * 0.35, 280, 120, 6);
  afterBoxes.fill({ color: 0x3B82F6, alpha: 0.15 });
  afterBoxes.stroke({ width: 1, color: 0x3B82F6, alpha: 0.3 });
  afterBoxes.roundRect(W * 0.15, H * 0.58, 130, 80, 4);
  afterBoxes.fill({ color: 0x10B981, alpha: 0.15 });
  afterBoxes.stroke({ width: 1, color: 0x10B981, alpha: 0.3 });
  afterBoxes.roundRect(W * 0.35, H * 0.58, 130, 80, 4);
  afterBoxes.fill({ color: 0x8B5CF6, alpha: 0.15 });
  afterBoxes.stroke({ width: 1, color: 0x8B5CF6, alpha: 0.3 });
  afterLayer.addChild(afterBoxes);

  const horizonLabel = new Text({ text: 'HORIZON', style: { fontFamily: 'Oswald', fontSize: 16, fill: 0xE63312, letterSpacing: 4, fontWeight: '600' } });
  horizonLabel.anchor = { x: 0.5, y: 0.5 };
  horizonLabel.x = W * 0.3; horizonLabel.y = H * 0.15;
  afterLayer.addChild(horizonLabel);

  container.addChild(afterLayer);

  /* ── Mask for the "after" layer ── */
  const mask = new Graphics();
  afterLayer.mask = mask;
  container.addChild(mask);

  /* ── Divider line ── */
  const divider = new Graphics();
  container.addChild(divider);

  /* ── Animation ── */
  const WIPE_START = 40;   // delay before wipe starts
  const WIPE_DURATION = 120; // frames for full wipe

  function update(dt) {
    elapsed += dt;

    // Wipe progress
    const wipeT = Math.max(0, Math.min((elapsed - WIPE_START) / WIPE_DURATION, 1));
    const eased = wipeT < 1 ? 1 - Math.pow(1 - wipeT, 3) : 1; // ease-out
    const dividerX = eased * W;

    // Update mask
    mask.clear();
    mask.rect(0, 0, dividerX, H);
    mask.fill(0xFFFFFF);

    // Divider line
    divider.clear();
    if (wipeT > 0 && wipeT < 1) {
      divider.moveTo(dividerX, 0);
      divider.lineTo(dividerX, H);
      divider.stroke({ width: 2, color: 0xE63312, alpha: 0.8 });
      // Glow
      divider.rect(dividerX - 8, 0, 16, H);
      divider.fill({ color: 0xE63312, alpha: 0.05 });
    }

    // Animate after particles
    afterGfx.clear();
    for (const p of afterParticles) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      afterGfx.circle(p.x, p.y, p.size);
      afterGfx.fill({ color: p.color, alpha: p.alpha });
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
