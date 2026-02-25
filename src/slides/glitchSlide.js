import { Container, Graphics, Text } from 'pixi.js';

/**
 * Glitch Text — RGB channel separation, scan lines, and random displacement.
 */
export function createGlitchSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;

  const WORD = 'HORIZON';
  const style = {
    fontFamily: 'Oswald',
    fontSize: 100,
    fontWeight: '700',
    fill: 0xFFFFFF,
    letterSpacing: 8,
  };

  /* Three colour channel layers */
  const redText = new Text({ text: WORD, style: { ...style, fill: 0xFF0000 } });
  const greenText = new Text({ text: WORD, style: { ...style, fill: 0x00FF00 } });
  const blueText = new Text({ text: WORD, style: { ...style, fill: 0x0000FF } });

  for (const t of [redText, greenText, blueText]) {
    t.anchor = { x: 0.5, y: 0.5 };
    t.x = W / 2; t.y = H / 2;
    t.blendMode = 'add';
    container.addChild(t);
  }

  /* Scan lines overlay */
  const scanLines = new Graphics();
  for (let y = 0; y < H; y += 3) {
    scanLines.rect(0, y, W, 1);
    scanLines.fill({ color: 0x000000, alpha: 0.12 });
  }
  container.addChild(scanLines);

  /* Glitch bar overlay (horizontal displacement strips) */
  const glitchBars = new Graphics();
  container.addChild(glitchBars);

  /* Glitch state */
  let glitchTimer = 0;
  let glitching = false;
  let glitchDuration = 0;
  let offsetR = { x: 0, y: 0 };
  let offsetG = { x: 0, y: 0 };
  let offsetB = { x: 0, y: 0 };
  let bars = [];

  function triggerGlitch() {
    glitching = true;
    glitchDuration = 4 + Math.random() * 8;
    offsetR = { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 6 };
    offsetG = { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 6 };
    offsetB = { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 6 };

    // Random displacement bars
    bars = [];
    const count = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < count; i++) {
      bars.push({
        y: Math.random() * H,
        h: Math.random() * 20 + 4,
        offset: (Math.random() - 0.5) * 60,
        color: [0xE63312, 0x3B82F6, 0x10B981][Math.floor(Math.random() * 3)],
      });
    }
  }

  function update(dt) {
    elapsed += dt;
    glitchTimer += dt;

    // Trigger glitch randomly
    if (!glitching && glitchTimer > 15 + Math.random() * 30) {
      triggerGlitch();
      glitchTimer = 0;
    }

    if (glitching) {
      glitchDuration -= dt;
      if (glitchDuration <= 0) {
        glitching = false;
        offsetR = offsetG = offsetB = { x: 0, y: 0 };
        bars = [];
      }
    }

    // Apply offsets
    redText.x = W / 2 + offsetR.x;
    redText.y = H / 2 + offsetR.y;
    greenText.x = W / 2 + offsetG.x;
    greenText.y = H / 2 + offsetG.y;
    blueText.x = W / 2 + offsetB.x;
    blueText.y = H / 2 + offsetB.y;

    // Small constant jitter
    const jx = Math.sin(elapsed * 0.3) * 0.5;
    const jy = Math.cos(elapsed * 0.25) * 0.3;
    redText.x += jx; greenText.x -= jx;
    redText.y += jy; blueText.y -= jy;

    // Draw glitch bars
    glitchBars.clear();
    for (const bar of bars) {
      glitchBars.rect(bar.offset, bar.y, W, bar.h);
      glitchBars.fill({ color: bar.color, alpha: 0.15 });
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
