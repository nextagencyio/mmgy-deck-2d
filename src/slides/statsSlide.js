import { Container, Graphics, Text } from 'pixi.js';

/**
 * Stats Dashboard — animated bar chart with counting numbers and spark particles.
 */
export function createStatsSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  let elapsed = 0;

  /* ── Stats data ──────────────────────────────── */
  const stats = [
    { label: 'UPTIME',      value: 98,   suffix: '%',  color: 0xE63312, barPct: 0.95 },
    { label: 'FASTER',      value: 3,    suffix: 'x',  color: 0x3B82F6, barPct: 0.55 },
    { label: 'INTEGRATIONS', value: 50,  suffix: '+',  color: 0x10B981, barPct: 0.75 },
    { label: 'PAGES SERVED', value: 12,  suffix: 'M',  color: 0x8B5CF6, barPct: 0.65 },
  ];

  const BAR_W = 64;
  const BAR_GAP = 100;
  const MAX_BAR_H = H * 0.42;
  const BASE_Y = H * 0.82;
  const totalW = stats.length * BAR_W + (stats.length - 1) * BAR_GAP;
  const startX = (W - totalW) / 2;

  /* ── Grid lines ──────────────────────────────── */
  const gridGfx = new Graphics();
  for (let i = 0; i <= 4; i++) {
    const y = BASE_Y - (MAX_BAR_H / 4) * i;
    gridGfx.moveTo(startX - 30, y);
    gridGfx.lineTo(startX + totalW + 30, y);
    gridGfx.stroke({ width: 0.5, color: 0xFFFFFF, alpha: 0.05 });
  }
  container.addChild(gridGfx);

  /* ── Bar elements ────────────────────────────── */
  const bars = stats.map((stat, i) => {
    const x = startX + i * (BAR_W + BAR_GAP);

    // Bar graphic
    const barGfx = new Graphics();
    barGfx.x = x;
    barGfx.y = BASE_Y;
    container.addChild(barGfx);

    // Value label
    const valueText = new Text({
      text: '0' + stat.suffix,
      style: {
        fontFamily: 'Oswald',
        fontSize: 36,
        fontWeight: '700',
        fill: 0xFFFFFF,
      },
    });
    valueText.anchor = { x: 0.5, y: 1 };
    valueText.x = x + BAR_W / 2;
    valueText.y = BASE_Y;
    valueText.alpha = 0;
    container.addChild(valueText);

    // Label
    const labelText = new Text({
      text: stat.label,
      style: {
        fontFamily: 'Oswald',
        fontSize: 11,
        fontWeight: '500',
        fill: 0x888888,
        letterSpacing: 2,
      },
    });
    labelText.anchor = { x: 0.5, y: 0 };
    labelText.x = x + BAR_W / 2;
    labelText.y = BASE_Y + 12;
    container.addChild(labelText);

    return {
      stat,
      gfx: barGfx,
      valueText,
      x,
      currentH: 0,
      targetH: stat.barPct * MAX_BAR_H,
      currentValue: 0,
      done: false,
    };
  });

  /* ── Spark particles ─────────────────────────── */
  const sparks = [];
  const sparkGfx = new Graphics();
  sparkGfx.blendMode = 'add';
  container.addChild(sparkGfx);

  function emitSparks(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      sparks.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        color,
        size: Math.random() * 2 + 0.5,
      });
    }
  }

  /* ── Easing ──────────────────────────────────── */
  function easeOutElastic(t) {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
  }

  /* ── Update ──────────────────────────────────── */
  const ANIM_DURATION = 90;  // frames (~1.5s)
  const STAGGER = 15;        // frames between each bar start

  function update(dt) {
    elapsed += dt;

    // Animate bars
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const barStart = i * STAGGER;
      const progress = Math.max(0, Math.min((elapsed - barStart) / ANIM_DURATION, 1));
      const eased = easeOutElastic(progress);

      bar.currentH = eased * bar.targetH;
      bar.currentValue = Math.round(eased * bar.stat.value);

      // Draw bar
      bar.gfx.clear();
      if (bar.currentH > 0) {
        // Bar body
        bar.gfx.roundRect(0, -bar.currentH, BAR_W, bar.currentH, 4);
        bar.gfx.fill({ color: bar.stat.color, alpha: 0.85 });

        // Glow cap
        bar.gfx.roundRect(-4, -bar.currentH - 3, BAR_W + 8, 6, 3);
        bar.gfx.fill({ color: bar.stat.color, alpha: 0.3 });
      }

      // Value text
      bar.valueText.text = bar.currentValue + bar.stat.suffix;
      bar.valueText.y = BASE_Y - bar.currentH - 16;
      bar.valueText.alpha = Math.min(progress * 3, 1);

      // Emit sparks when bar reaches top
      if (progress >= 0.98 && !bar.done) {
        bar.done = true;
        emitSparks(bar.x + BAR_W / 2, BASE_Y - bar.targetH, bar.stat.color);
      }
    }

    // Update sparks
    sparkGfx.clear();
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 0.04 * dt; // gravity
      s.life -= s.decay * dt;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      sparkGfx.circle(s.x, s.y, s.size * s.life);
      sparkGfx.fill({ color: s.color, alpha: s.life * 0.8 });
    }
  }

  function destroy() {
    container.destroy({ children: true });
  }

  return { container, update, destroy };
}
