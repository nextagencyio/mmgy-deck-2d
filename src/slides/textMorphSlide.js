import { Container, Graphics } from 'pixi.js';

/**
 * Text Particle Morphing — particles scatter and reform to spell words.
 */
export function createTextMorphSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;

  /* 5×7 pixel font for the characters we need */
  const FONT = {
    H: [0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001, 0b10001],
    O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
    I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
    Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
    N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
    M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
    G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
    Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  };

  function getWordPositions(word, cx, cy, scale) {
    const positions = [];
    const totalW = word.length * 6 - 1; // 5 wide + 1 gap per char
    const startX = cx - (totalW * scale) / 2;
    const startY = cy - (7 * scale) / 2;
    for (let c = 0; c < word.length; c++) {
      const rows = FONT[word[c]];
      if (!rows) continue;
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          if (rows[row] & (1 << (4 - col))) {
            positions.push({
              x: startX + (c * 6 + col) * scale,
              y: startY + row * scale,
            });
          }
        }
      }
    }
    return positions;
  }

  /* Word targets */
  const words = ['HORIZON', 'MMGY'];
  const targetSets = words.map((w) => getWordPositions(w, W * 0.55, H * 0.5, 10));
  const maxCount = Math.max(...targetSets.map((t) => t.length));

  // Pad shorter target sets with random scatter positions
  for (const tgt of targetSets) {
    while (tgt.length < maxCount) {
      tgt.push({ x: W * 0.55 + (Math.random() - 0.5) * 400, y: H * 0.5 + (Math.random() - 0.5) * 200 });
    }
  }

  /* Particles */
  const particles = Array.from({ length: maxCount }, (_, i) => ({
    x: W * 0.55 + (Math.random() - 0.5) * 500,
    y: H * 0.5 + (Math.random() - 0.5) * 300,
    tx: targetSets[0][i].x,
    ty: targetSets[0][i].y,
    vx: 0, vy: 0,
    size: Math.random() * 2 + 1,
  }));

  const gfx = new Graphics();
  gfx.blendMode = 'add';
  container.addChild(gfx);

  /* State machine: form → hold → scatter → form next word */
  const PHASE_FORM = 0, PHASE_HOLD = 1, PHASE_SCATTER = 2;
  let phase = PHASE_FORM;
  let phaseTimer = 0;
  let wordIdx = 0;

  function setTargets(idx) {
    for (let i = 0; i < particles.length; i++) {
      particles[i].tx = targetSets[idx][i].x;
      particles[i].ty = targetSets[idx][i].y;
    }
  }

  function scatter() {
    for (const p of particles) {
      p.tx = W * 0.55 + (Math.random() - 0.5) * 600;
      p.ty = H * 0.5 + (Math.random() - 0.5) * 400;
    }
  }

  function update(dt) {
    elapsed += dt;
    phaseTimer += dt;

    if (phase === PHASE_FORM && phaseTimer > 90) {
      phase = PHASE_HOLD; phaseTimer = 0;
    } else if (phase === PHASE_HOLD && phaseTimer > 80) {
      scatter(); phase = PHASE_SCATTER; phaseTimer = 0;
    } else if (phase === PHASE_SCATTER && phaseTimer > 50) {
      wordIdx = (wordIdx + 1) % words.length;
      setTargets(wordIdx);
      phase = PHASE_FORM; phaseTimer = 0;
    }

    gfx.clear();
    for (const p of particles) {
      // Spring toward target
      const dx = p.tx - p.x, dy = p.ty - p.y;
      p.vx += dx * 0.04; p.vy += dy * 0.04;
      p.vx *= 0.88; p.vy *= 0.88;
      p.x += p.vx * dt * 0.5; p.y += p.vy * dt * 0.5;

      const dist = Math.hypot(dx, dy);
      const alpha = phase === PHASE_HOLD ? 0.85 : Math.min(0.85, 0.3 + (1 - Math.min(dist / 200, 1)) * 0.55);
      gfx.circle(p.x, p.y, p.size);
      gfx.fill({ color: 0xE63312, alpha });
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
