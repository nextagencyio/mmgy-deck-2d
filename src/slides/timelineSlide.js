import { Container, Graphics, Text } from 'pixi.js';

/**
 * Timeline — animated migration roadmap with sequential reveals.
 */
export function createTimelineSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;

  const milestones = [
    { label: 'Discovery', desc: 'Audit & planning', color: 0xE63312 },
    { label: 'Foundation', desc: 'Core platform setup', color: 0x3B82F6 },
    { label: 'Migration', desc: 'Content & data transfer', color: 0x10B981 },
    { label: 'Integration', desc: 'Third-party services', color: 0x8B5CF6 },
    { label: 'Optimization', desc: 'Performance tuning', color: 0xF59E0B },
    { label: 'Launch', desc: 'Go live & monitor', color: 0x06B6D4 },
  ];

  const TRACK_Y = H * 0.55;
  const START_X = W * 0.1;
  const END_X = W * 0.9;
  const STEP = (END_X - START_X) / (milestones.length - 1);
  const STAGGER = 25; // frames between each milestone

  /* Track line */
  const trackGfx = new Graphics();
  container.addChild(trackGfx);

  /* Milestone elements */
  const nodes = milestones.map((m, i) => {
    const x = START_X + i * STEP;

    const nodeGfx = new Graphics();
    nodeGfx.x = x; nodeGfx.y = TRACK_Y;
    nodeGfx.alpha = 0;
    container.addChild(nodeGfx);

    const title = new Text({ text: m.label, style: { fontFamily: 'Oswald', fontSize: 14, fontWeight: '600', fill: m.color, letterSpacing: 1 } });
    title.anchor = { x: 0.5, y: 1 };
    title.x = x; title.y = TRACK_Y - 28;
    title.alpha = 0;
    container.addChild(title);

    const desc = new Text({ text: m.desc, style: { fontFamily: 'Open Sans', fontSize: 10, fill: 0x888888 } });
    desc.anchor = { x: 0.5, y: 0 };
    desc.x = x; desc.y = TRACK_Y + 24;
    desc.alpha = 0;
    container.addChild(desc);

    const num = new Text({ text: `0${i + 1}`, style: { fontFamily: 'Oswald', fontSize: 22, fontWeight: '700', fill: m.color } });
    num.anchor = { x: 0.5, y: 0 };
    num.x = x; num.y = TRACK_Y + 40;
    num.alpha = 0;
    container.addChild(num);

    return { x, color: m.color, gfx: nodeGfx, title, desc, num };
  });

  /* Spark particles */
  const sparks = [];
  const sparkGfx = new Graphics();
  sparkGfx.blendMode = 'add';
  container.addChild(sparkGfx);

  function update(dt) {
    elapsed += dt;

    /* Draw track line progressively */
    trackGfx.clear();
    const lineProgress = Math.min(elapsed / (milestones.length * STAGGER + 30), 1);
    const lineEndX = START_X + (END_X - START_X) * lineProgress;
    trackGfx.moveTo(START_X, TRACK_Y);
    trackGfx.lineTo(lineEndX, TRACK_Y);
    trackGfx.stroke({ width: 2, color: 0xFFFFFF, alpha: 0.08 });

    /* Reveal milestones with stagger */
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const t = Math.max(0, (elapsed - i * STAGGER) / 20);
      const alpha = Math.min(t, 1);
      const eased = 1 - Math.pow(1 - Math.min(t, 1), 3);

      n.gfx.clear();
      n.gfx.alpha = alpha;
      if (alpha > 0) {
        // Glow
        n.gfx.circle(0, 0, 18 * eased);
        n.gfx.fill({ color: n.color, alpha: 0.08 });
        // Ring
        n.gfx.circle(0, 0, 10 * eased);
        n.gfx.stroke({ width: 2, color: n.color, alpha: 0.7 });
        // Center dot
        n.gfx.circle(0, 0, 3 * eased);
        n.gfx.fill({ color: 0xFFFFFF, alpha: 0.9 });
      }

      n.title.alpha = alpha;
      n.desc.alpha = alpha * 0.7;
      n.num.alpha = alpha;

      // Emit sparks when node appears
      if (t > 0.95 && t < 1.1 && sparks.length < 100) {
        for (let j = 0; j < 4; j++) {
          const a = Math.random() * Math.PI * 2;
          sparks.push({ x: n.x, y: TRACK_Y, vx: Math.cos(a) * 1.5, vy: Math.sin(a) * 1.5, life: 1, decay: 0.02, color: n.color });
        }
      }
    }

    /* Draw sparks */
    sparkGfx.clear();
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= s.decay * dt;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      sparkGfx.circle(s.x, s.y, 1.5 * s.life);
      sparkGfx.fill({ color: s.color, alpha: s.life * 0.7 });
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
