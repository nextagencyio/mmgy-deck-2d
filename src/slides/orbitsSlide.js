import { Container, Graphics, Text } from 'pixi.js';

/**
 * Solar System — orbiting platform nodes around a central Horizon "sun."
 */
export function createOrbitsSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const cx = W * 0.58;
  const cy = H * 0.5;
  let elapsed = 0;

  /* ── Platform definitions ────────────────────── */
  const platforms = [
    { name: 'CMS',      color: 0x3B82F6, radius: 110, size: 14, speed: 0.012, offset: 0 },
    { name: 'Analytics', color: 0x10B981, radius: 170, size: 11, speed: 0.008, offset: 1.5 },
    { name: 'CRM',      color: 0xF59E0B, radius: 170, size: 11, speed: 0.008, offset: 4.2 },
    { name: 'Search',   color: 0x8B5CF6, radius: 240, size: 10, speed: 0.005, offset: 0.8 },
    { name: 'CDN',      color: 0x06B6D4, radius: 240, size: 10, speed: 0.005, offset: 3.5 },
  ];

  /* ── Orbit rings ─────────────────────────────── */
  const orbitGfx = new Graphics();
  const uniqueRadii = [...new Set(platforms.map((p) => p.radius))];
  for (const r of uniqueRadii) {
    orbitGfx.circle(0, 0, r);
    orbitGfx.stroke({ width: 0.6, color: 0xFFFFFF, alpha: 0.06 });
  }
  orbitGfx.x = cx;
  orbitGfx.y = cy;
  container.addChild(orbitGfx);

  /* ── Central sun ─────────────────────────────── */
  const sun = new Graphics();
  sun.circle(0, 0, 50);
  sun.fill({ color: 0xE63312, alpha: 0.06 });
  sun.circle(0, 0, 28);
  sun.fill({ color: 0xE63312, alpha: 0.15 });
  sun.circle(0, 0, 14);
  sun.fill({ color: 0xE63312, alpha: 0.6 });
  sun.circle(0, 0, 5);
  sun.fill({ color: 0xFFFFFF, alpha: 0.9 });
  sun.x = cx;
  sun.y = cy;
  container.addChild(sun);

  const sunLabel = new Text({
    text: 'HORIZON',
    style: {
      fontFamily: 'Oswald',
      fontSize: 10,
      fontWeight: '600',
      fill: 0xE63312,
      letterSpacing: 3,
    },
  });
  sunLabel.anchor = { x: 0.5, y: 0 };
  sunLabel.x = cx;
  sunLabel.y = cy + 22;
  container.addChild(sunLabel);

  /* ── Planet nodes ────────────────────────────── */
  const connectionGfx = new Graphics();
  container.addChild(connectionGfx);

  const planetNodes = platforms.map((p) => {
    const node = new Container();

    // Glow
    const glow = new Graphics();
    glow.circle(0, 0, p.size * 2.5);
    glow.fill({ color: p.color, alpha: 0.1 });
    node.addChild(glow);

    // Body
    const body = new Graphics();
    body.circle(0, 0, p.size);
    body.fill({ color: p.color, alpha: 0.85 });
    node.addChild(body);

    // Label
    const label = new Text({
      text: p.name,
      style: {
        fontFamily: 'Open Sans',
        fontSize: 10,
        fontWeight: '600',
        fill: p.color,
      },
    });
    label.anchor = { x: 0.5, y: 0 };
    label.y = p.size + 8;
    node.addChild(label);

    container.addChild(node);
    return { def: p, node, px: 0, py: 0 };
  });

  /* ── Data packets (small dots traveling along connections) ── */
  const packets = [];
  const packetGfx = new Graphics();
  packetGfx.blendMode = 'add';
  container.addChild(packetGfx);

  function spawnPacket(fromX, fromY, toX, toY, color) {
    packets.push({
      fromX, fromY, toX, toY, color,
      t: 0, speed: 0.01 + Math.random() * 0.01,
    });
  }

  /* ── Update ──────────────────────────────────── */
  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016;

    // Orbit planets
    for (const p of planetNodes) {
      const angle = t * p.def.speed * 60 + p.def.offset;
      p.px = cx + Math.cos(angle) * p.def.radius;
      p.py = cy + Math.sin(angle) * p.def.radius;
      p.node.x = p.px;
      p.node.y = p.py;
    }

    // Draw connections to sun
    connectionGfx.clear();
    for (const p of planetNodes) {
      connectionGfx.moveTo(cx, cy);
      connectionGfx.lineTo(p.px, p.py);
      connectionGfx.stroke({ width: 0.5, color: p.def.color, alpha: 0.08 });
    }

    // Spawn packets periodically
    if (Math.floor(elapsed) % 40 === 0 && packets.length < 10) {
      const idx = Math.floor(Math.random() * planetNodes.length);
      const p = planetNodes[idx];
      // Alternate direction
      if (Math.random() > 0.5) {
        spawnPacket(cx, cy, p.px, p.py, p.def.color);
      } else {
        spawnPacket(p.px, p.py, cx, cy, p.def.color);
      }
    }

    // Update packets
    packetGfx.clear();
    for (let i = packets.length - 1; i >= 0; i--) {
      const pk = packets[i];
      pk.t += pk.speed * dt;
      if (pk.t >= 1) { packets.splice(i, 1); continue; }
      const x = pk.fromX + (pk.toX - pk.fromX) * pk.t;
      const y = pk.fromY + (pk.toY - pk.fromY) * pk.t;
      const alpha = 1 - Math.abs(pk.t - 0.5) * 2; // fade at edges
      packetGfx.circle(x, y, 3);
      packetGfx.fill({ color: pk.color, alpha: alpha * 0.9 });
    }

    // Sun pulse
    const pulse = 1 + Math.sin(t * 2) * 0.08;
    sun.scale.set(pulse);
  }

  function destroy() {
    container.destroy({ children: true });
  }

  return { container, update, destroy };
}
