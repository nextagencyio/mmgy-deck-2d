import { Container, Text } from 'pixi.js';

/**
 * Kinetic Typography — letters animate in with spring/bounce physics.
 */
export function createKineticSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;

  const phrases = ['MOVE FAST', 'THINK BIG', 'SHIP IT'];
  let phraseIdx = 0;
  let phaseTimer = 0;
  let letters = [];
  const letterContainer = new Container();
  container.addChild(letterContainer);

  function buildPhrase(phrase) {
    letterContainer.removeChildren();
    letters = [];

    const style = {
      fontFamily: 'Oswald',
      fontSize: 80,
      fontWeight: '700',
      fill: 0xFFFFFF,
    };

    // Measure total width (approximate)
    const charW = 48; // rough width per char
    const totalW = phrase.length * charW;
    const startX = (W - totalW) / 2;

    for (let i = 0; i < phrase.length; i++) {
      const ch = phrase[i];
      if (ch === ' ') continue;
      const txt = new Text({ text: ch, style });
      txt.anchor = { x: 0.5, y: 0.5 };

      const targetX = startX + i * charW + charW / 2;
      const targetY = H * 0.5;

      // Start off-screen (above or below, alternating)
      txt.x = targetX;
      txt.y = i % 2 === 0 ? -100 : H + 100;
      txt.rotation = (Math.random() - 0.5) * 1.5;
      txt.scale.set(0.3);
      txt.alpha = 0;

      letterContainer.addChild(txt);
      letters.push({
        txt,
        targetX, targetY,
        vy: 0, vrot: 0, vscale: 0,
        delay: i * 6,  // stagger by 6 frames
        active: false,
      });
    }
  }

  buildPhrase(phrases[0]);

  function update(dt) {
    elapsed += dt;
    phaseTimer += dt;

    // Cycle phrases
    if (phaseTimer > 200) {
      phraseIdx = (phraseIdx + 1) % phrases.length;
      buildPhrase(phrases[phraseIdx]);
      phaseTimer = 0;
    }

    for (const l of letters) {
      if (elapsed < l.delay) continue;
      l.active = true;

      // Spring physics toward target
      const dy = l.targetY - l.txt.y;
      l.vy += dy * 0.06;
      l.vy *= 0.82;
      l.txt.y += l.vy * dt * 0.5;

      // Rotation spring to 0
      l.vrot += (0 - l.txt.rotation) * 0.08;
      l.vrot *= 0.85;
      l.txt.rotation += l.vrot * dt * 0.5;

      // Scale spring to 1
      l.vscale += (1 - l.txt.scale.x) * 0.08;
      l.vscale *= 0.82;
      const s = l.txt.scale.x + l.vscale * dt * 0.5;
      l.txt.scale.set(Math.max(0.1, s));

      // Fade in
      l.txt.alpha = Math.min(l.txt.alpha + 0.05 * dt, 1);
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
