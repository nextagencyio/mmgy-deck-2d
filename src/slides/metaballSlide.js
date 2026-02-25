import { Container, Graphics, BlurFilter } from 'pixi.js';

/**
 * Metaball / Liquid Blobs — soft circles that merge and flow organically.
 */
export function createMetaballSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const cx = W * 0.58;
  const cy = H * 0.5;
  let elapsed = 0;

  /* Blob definitions */
  const blobDefs = [
    { radius: 55, orbitR: 0, speed: 0, offset: 0, color: 0xE63312 },
    { radius: 45, orbitR: 100, speed: 0.008, offset: 0, color: 0xE63312 },
    { radius: 40, orbitR: 100, speed: 0.008, offset: Math.PI, color: 0xFF4D2E },
    { radius: 35, orbitR: 160, speed: 0.005, offset: 1.2, color: 0xC42A0E },
    { radius: 38, orbitR: 160, speed: 0.005, offset: 3.8, color: 0xFF4D2E },
    { radius: 30, orbitR: 130, speed: 0.012, offset: 0.5, color: 0xE63312 },
    { radius: 28, orbitR: 80, speed: 0.015, offset: 2.5, color: 0xC42A0E },
  ];

  /* Blob layer with heavy blur for the merge effect */
  const blobLayer = new Container();
  const blur = new BlurFilter({ strength: 22, quality: 3 });
  blobLayer.filters = [blur];
  container.addChild(blobLayer);

  const blobs = blobDefs.map((def) => {
    const g = new Graphics();
    g.circle(0, 0, def.radius);
    g.fill({ color: def.color, alpha: 0.85 });
    blobLayer.addChild(g);
    return { gfx: g, def };
  });

  /* Ambient particles around blobs */
  const ambientGfx = new Graphics();
  ambientGfx.blendMode = 'add';
  container.addChild(ambientGfx);

  const ambientParticles = Array.from({ length: 60 }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * 200 + 60,
    speed: (Math.random() - 0.5) * 0.005,
    size: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.3 + 0.1,
  }));

  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016;

    /* Move blobs on their orbits */
    for (const b of blobs) {
      const d = b.def;
      const angle = t * d.speed * 60 + d.offset;
      b.gfx.x = cx + Math.cos(angle) * d.orbitR;
      b.gfx.y = cy + Math.sin(angle) * d.orbitR;
    }

    /* Ambient particles */
    ambientGfx.clear();
    for (const p of ambientParticles) {
      p.angle += p.speed * dt;
      const x = cx + Math.cos(p.angle) * p.dist;
      const y = cy + Math.sin(p.angle) * p.dist;
      ambientGfx.circle(x, y, p.size);
      ambientGfx.fill({ color: 0xE63312, alpha: p.alpha });
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
