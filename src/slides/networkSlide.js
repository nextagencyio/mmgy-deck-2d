import { Container, Graphics, Text } from 'pixi.js';

/**
 * Network Graph — force-directed layout with flowing data packets.
 */
export function createNetworkSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const cx = W * 0.55;
  const cy = H * 0.5;
  let elapsed = 0;

  /* Node definitions */
  const nodeDefs = [
    { label: 'API Gateway', color: 0xE63312, size: 16 },
    { label: 'Auth', color: 0x3B82F6, size: 12 },
    { label: 'CMS', color: 0x10B981, size: 14 },
    { label: 'Search', color: 0x8B5CF6, size: 12 },
    { label: 'Analytics', color: 0xF59E0B, size: 11 },
    { label: 'CDN', color: 0x06B6D4, size: 13 },
    { label: 'Cache', color: 0x3B82F6, size: 10 },
    { label: 'Queue', color: 0x10B981, size: 10 },
    { label: 'Storage', color: 0xF59E0B, size: 11 },
    { label: 'Monitor', color: 0x8B5CF6, size: 10 },
  ];

  const edges = [[0,1],[0,2],[0,3],[0,5],[1,6],[2,3],[2,7],[3,4],[4,9],[5,6],[5,8],[7,8],[8,9],[1,4]];

  /* Initialize nodes with random positions */
  const nodes = nodeDefs.map((def, i) => ({
    ...def,
    x: cx + (Math.random() - 0.5) * 250,
    y: cy + (Math.random() - 0.5) * 250,
    vx: 0, vy: 0,
  }));

  /* Packets */
  const packets = [];
  let packetTimer = 0;

  const edgeGfx = new Graphics();
  container.addChild(edgeGfx);
  const packetGfx = new Graphics();
  packetGfx.blendMode = 'add';
  container.addChild(packetGfx);

  /* Node containers (glow + body + label) */
  const nodeContainers = nodes.map((n) => {
    const nc = new Container();
    const glow = new Graphics();
    glow.circle(0, 0, n.size * 2.2);
    glow.fill({ color: n.color, alpha: 0.08 });
    nc.addChild(glow);
    const body = new Graphics();
    body.circle(0, 0, n.size);
    body.fill({ color: n.color, alpha: 0.85 });
    nc.addChild(body);
    const label = new Text({ text: n.label, style: { fontFamily: 'Open Sans', fontSize: 9, fill: n.color, fontWeight: '600' } });
    label.anchor = { x: 0.5, y: 0 };
    label.y = n.size + 6;
    nc.addChild(label);
    container.addChild(nc);
    return nc;
  });

  function updateForces() {
    /* Repulsion between all pairs */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.max(Math.hypot(dx, dy), 15);
        const f = 4000 / (dist * dist);
        const fx = (dx / dist) * f, fy = (dy / dist) * f;
        nodes[i].vx -= fx; nodes[i].vy -= fy;
        nodes[j].vx += fx; nodes[j].vy += fy;
      }
    }
    /* Edge attraction */
    for (const [a, b] of edges) {
      const dx = nodes[b].x - nodes[a].x;
      const dy = nodes[b].y - nodes[a].y;
      const dist = Math.max(Math.hypot(dx, dy), 1);
      const f = (dist - 90) * 0.008;
      const fx = (dx / dist) * f, fy = (dy / dist) * f;
      nodes[a].vx += fx; nodes[a].vy += fy;
      nodes[b].vx -= fx; nodes[b].vy -= fy;
    }
    /* Center gravity */
    for (const n of nodes) {
      n.vx += (cx - n.x) * 0.0008;
      n.vy += (cy - n.y) * 0.0008;
    }
    /* Damping + update */
    for (const n of nodes) {
      n.vx *= 0.9; n.vy *= 0.9;
      n.x += n.vx; n.y += n.vy;
    }
  }

  function update(dt) {
    elapsed += dt;
    updateForces();

    /* Draw edges */
    edgeGfx.clear();
    for (const [a, b] of edges) {
      edgeGfx.moveTo(nodes[a].x, nodes[a].y);
      edgeGfx.lineTo(nodes[b].x, nodes[b].y);
      edgeGfx.stroke({ width: 0.8, color: 0xFFFFFF, alpha: 0.06 });
    }

    /* Position node visuals */
    for (let i = 0; i < nodes.length; i++) {
      nodeContainers[i].x = nodes[i].x;
      nodeContainers[i].y = nodes[i].y;
    }

    /* Spawn packets */
    packetTimer += dt;
    if (packetTimer > 12 && packets.length < 15) {
      const e = edges[Math.floor(Math.random() * edges.length)];
      const dir = Math.random() > 0.5;
      const from = dir ? e[0] : e[1], to = dir ? e[1] : e[0];
      packets.push({ from, to, t: 0, speed: 0.012 + Math.random() * 0.01, color: nodes[from].color });
      packetTimer = 0;
    }

    /* Draw packets */
    packetGfx.clear();
    for (let i = packets.length - 1; i >= 0; i--) {
      const pk = packets[i];
      pk.t += pk.speed * dt;
      if (pk.t >= 1) { packets.splice(i, 1); continue; }
      const x = nodes[pk.from].x + (nodes[pk.to].x - nodes[pk.from].x) * pk.t;
      const y = nodes[pk.from].y + (nodes[pk.to].y - nodes[pk.from].y) * pk.t;
      const alpha = 1 - Math.abs(pk.t - 0.5) * 2;
      packetGfx.circle(x, y, 3);
      packetGfx.fill({ color: pk.color, alpha: alpha * 0.9 });
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
