import { Container, Graphics, Text } from 'pixi.js';

/**
 * Radar / Spider Chart — animated capability comparison.
 */
export function createRadarSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const cx = W * 0.55;
  const cy = H * 0.5;
  const R = Math.min(W, H) * 0.28;
  let elapsed = 0;

  const axes = ['Performance', 'Security', 'Scalability', 'UX', 'SEO', 'Accessibility'];
  const N = axes.length;
  const angleStep = (Math.PI * 2) / N;

  /* Dataset values (0-1) */
  const dataset1 = [0.9, 0.85, 0.95, 0.8, 0.88, 0.75]; // Horizon
  const dataset2 = [0.45, 0.5, 0.35, 0.4, 0.55, 0.3];   // Legacy

  /* Grid rings */
  const gridGfx = new Graphics();
  for (let ring = 1; ring <= 4; ring++) {
    const r = (ring / 4) * R;
    for (let i = 0; i < N; i++) {
      const a1 = i * angleStep - Math.PI / 2;
      const a2 = (i + 1) * angleStep - Math.PI / 2;
      gridGfx.moveTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
      gridGfx.lineTo(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
    }
    gridGfx.stroke({ width: 0.5, color: 0xFFFFFF, alpha: 0.05 });
  }
  /* Axis lines */
  for (let i = 0; i < N; i++) {
    const a = i * angleStep - Math.PI / 2;
    gridGfx.moveTo(cx, cy);
    gridGfx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    gridGfx.stroke({ width: 0.5, color: 0xFFFFFF, alpha: 0.05 });
  }
  container.addChild(gridGfx);

  /* Axis labels */
  for (let i = 0; i < N; i++) {
    const a = i * angleStep - Math.PI / 2;
    const lx = cx + Math.cos(a) * (R + 24);
    const ly = cy + Math.sin(a) * (R + 24);
    const label = new Text({ text: axes[i], style: { fontFamily: 'Open Sans', fontSize: 10, fill: 0x888888, fontWeight: '600' } });
    label.anchor = { x: 0.5, y: 0.5 };
    label.x = lx; label.y = ly;
    container.addChild(label);
  }

  /* Animated polygons */
  const legacyGfx = new Graphics();
  container.addChild(legacyGfx);
  const horizonGfx = new Graphics();
  container.addChild(horizonGfx);

  /* Legend */
  const legendItems = [
    { label: 'Horizon', color: 0xE63312 },
    { label: 'Legacy', color: 0x555555 },
  ];
  legendItems.forEach((item, i) => {
    const ly = cy + R + 60 + i * 20;
    const lg = new Graphics();
    lg.circle(cx - 40, ly, 4);
    lg.fill({ color: item.color, alpha: 0.8 });
    container.addChild(lg);
    const lt = new Text({ text: item.label, style: { fontFamily: 'Open Sans', fontSize: 11, fill: item.color } });
    lt.x = cx - 30; lt.y = ly - 6;
    container.addChild(lt);
  });

  function drawPolygon(gfx, data, progress, fillColor, strokeColor, fillAlpha) {
    gfx.clear();
    const pts = data.map((val, i) => {
      const a = i * angleStep - Math.PI / 2;
      const r = val * R * progress;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    });
    if (pts.length === 0) return;
    gfx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) gfx.lineTo(pts[i].x, pts[i].y);
    gfx.closePath();
    gfx.fill({ color: fillColor, alpha: fillAlpha });
    gfx.stroke({ width: 1.5, color: strokeColor, alpha: 0.8 });
    /* Vertex dots */
    for (const pt of pts) {
      gfx.circle(pt.x, pt.y, 3);
      gfx.fill({ color: strokeColor, alpha: 0.9 });
    }
  }

  const ANIM_DURATION = 60;

  function update(dt) {
    elapsed += dt;
    const progress = Math.min(elapsed / ANIM_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    drawPolygon(legacyGfx, dataset2, eased, 0x555555, 0x888888, 0.08);
    drawPolygon(horizonGfx, dataset1, eased, 0xE63312, 0xE63312, 0.12);
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
