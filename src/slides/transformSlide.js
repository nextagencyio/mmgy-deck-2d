import { Container, Graphics, Text } from 'pixi.js';

/**
 * Transform — Challenges dissolve into Solutions through a
 * central energy beam with particle metamorphosis.
 */
export function createTransformSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const S = Math.min(W, H) / 800;
  let elapsed = 0;

  /* ── Data ───────────────────────────────────────── */
  const pairs = [
    { challenge: 'Legacy Debt',        solution: 'Modern Stack' },
    { challenge: 'Slow Deployments',   solution: 'CI/CD Pipeline' },
    { challenge: 'Data Silos',         solution: 'Unified Platform' },
    { challenge: 'Manual Processes',   solution: 'Automation' },
    { challenge: 'Poor Scalability',   solution: 'Cloud Native' },
  ];

  const COLS = { left: W * 0.18, right: W * 0.82, center: W * 0.5 };
  const ROW_START = H * 0.18;
  const ROW_SPACING = H * 0.145;

  /* ── Background ─────────────────────────────────── */
  const bgGfx = new Graphics();
  // Subtle gradient split — dark left, slightly lighter right
  bgGfx.rect(0, 0, W * 0.5, H);
  bgGfx.fill({ color: 0x111111, alpha: 0.4 });
  bgGfx.rect(W * 0.5, 0, W * 0.5, H);
  bgGfx.fill({ color: 0x0A1628, alpha: 0.3 });
  container.addChild(bgGfx);

  /* ── Central energy beam ────────────────────────── */
  const beamGfx = new Graphics();
  container.addChild(beamGfx);

  /* ── Challenge blocks (left side) ───────────────── */
  const challengeItems = [];
  for (let i = 0; i < pairs.length; i++) {
    const y = ROW_START + i * ROW_SPACING;
    const ic = new Container();
    ic.x = -200; // start off-screen left
    ic.y = y;
    ic.alpha = 0;

    // Dark angular block
    const bg = new Graphics();
    const bw = 140 * S;
    const bh = 32 * S;
    // Hexagonal / angular shape
    bg.moveTo(8 * S, 0);
    bg.lineTo(bw - 4 * S, 0);
    bg.lineTo(bw, bh * 0.5);
    bg.lineTo(bw - 4 * S, bh);
    bg.lineTo(8 * S, bh);
    bg.lineTo(0, bh * 0.5);
    bg.closePath();
    bg.fill({ color: 0x1A1A1A, alpha: 0.9 });
    bg.stroke({ width: 1.5 * S, color: 0xE63312, alpha: 0.6 });
    ic.addChild(bg);

    // Warning icon — small triangle
    const warn = new Graphics();
    warn.moveTo(12 * S, bh * 0.28);
    warn.lineTo(20 * S, bh * 0.72);
    warn.lineTo(4 * S, bh * 0.72);
    warn.closePath();
    warn.fill({ color: 0xE63312, alpha: 0.8 });
    ic.addChild(warn);

    const label = new Text({
      text: pairs[i].challenge,
      style: {
        fontFamily: 'Oswald', fontSize: 13 * S, fill: 0xE8E4DE,
        fontWeight: '500', letterSpacing: 1,
      }
    });
    label.x = 26 * S;
    label.y = bh * 0.18;
    ic.addChild(label);

    container.addChild(ic);
    challengeItems.push({ container: ic, targetX: COLS.left - bw * 0.5, delay: i * 15 });
  }

  /* ── Solution orbs (right side) ─────────────────── */
  const solutionItems = [];
  for (let i = 0; i < pairs.length; i++) {
    const y = ROW_START + i * ROW_SPACING;
    const ic = new Container();
    ic.x = W + 200; // start off-screen right
    ic.y = y;
    ic.alpha = 0;

    // Glowing rounded card
    const bg = new Graphics();
    const bw = 140 * S;
    const bh = 32 * S;
    // Glow behind
    bg.roundRect(-6 * S, -4 * S, bw + 12 * S, bh + 8 * S, 12 * S);
    bg.fill({ color: 0x3B82F6, alpha: 0.08 });
    // Main card
    bg.roundRect(0, 0, bw, bh, 6 * S);
    bg.fill({ color: 0x0F2847, alpha: 0.9 });
    bg.stroke({ width: 1.5 * S, color: 0x3B82F6, alpha: 0.5 });
    ic.addChild(bg);

    // Check icon — small circle with check
    const check = new Graphics();
    check.circle(12 * S, bh * 0.5, 7 * S);
    check.fill({ color: 0x10B981, alpha: 0.8 });
    // Checkmark lines
    check.moveTo(8 * S, bh * 0.5);
    check.lineTo(11 * S, bh * 0.5 + 3 * S);
    check.lineTo(16 * S, bh * 0.5 - 4 * S);
    check.stroke({ width: 1.5 * S, color: 0xFFFFFF, alpha: 0.9 });
    ic.addChild(check);

    const label = new Text({
      text: pairs[i].solution,
      style: {
        fontFamily: 'Oswald', fontSize: 13 * S, fill: 0xE8E4DE,
        fontWeight: '500', letterSpacing: 1,
      }
    });
    label.x = 24 * S;
    label.y = bh * 0.18;
    ic.addChild(label);

    container.addChild(ic);
    solutionItems.push({ container: ic, targetX: COLS.right - bw * 0.5, delay: i * 15 + 60 });
  }

  /* ── Flow particles (challenges → solutions) ────── */
  const flowParticles = [];
  const flowGfx = new Graphics();
  flowGfx.blendMode = 'add';
  container.addChild(flowGfx);

  /* ── Connection arrows between pairs ────────────── */
  const arrowGfx = new Graphics();
  container.addChild(arrowGfx);

  /* ── Column headers ─────────────────────────────── */
  const headerLeft = new Text({
    text: 'CHALLENGES',
    style: {
      fontFamily: 'Oswald', fontSize: 11 * S, fill: 0xE63312,
      fontWeight: '600', letterSpacing: 4 * S,
    }
  });
  headerLeft.anchor = { x: 0.5, y: 0.5 };
  headerLeft.x = COLS.left; headerLeft.y = ROW_START - 30 * S;
  headerLeft.alpha = 0;
  container.addChild(headerLeft);

  const headerRight = new Text({
    text: 'SOLUTIONS',
    style: {
      fontFamily: 'Oswald', fontSize: 11 * S, fill: 0x3B82F6,
      fontWeight: '600', letterSpacing: 4 * S,
    }
  });
  headerRight.anchor = { x: 0.5, y: 0.5 };
  headerRight.x = COLS.right; headerRight.y = ROW_START - 30 * S;
  headerRight.alpha = 0;
  container.addChild(headerRight);

  /* ── Update ────────────────────────────────────── */
  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016;

    // A) Fade in headers
    headerLeft.alpha = Math.min(elapsed / 20, 1);
    headerRight.alpha = Math.min((elapsed - 40) / 20, 1);

    // B) Slide in challenge blocks
    for (const item of challengeItems) {
      const progress = Math.max(0, elapsed - item.delay) / 25;
      if (progress > 0) {
        const ease = Math.min(1 - Math.pow(1 - Math.min(progress, 1), 3), 1);
        item.container.x = -200 + (item.targetX - (-200)) * ease;
        item.container.alpha = Math.min(progress * 2, 1);
      }
    }

    // C) Slide in solution cards
    for (const item of solutionItems) {
      const progress = Math.max(0, elapsed - item.delay) / 25;
      if (progress > 0) {
        const ease = Math.min(1 - Math.pow(1 - Math.min(progress, 1), 3), 1);
        item.container.x = (W + 200) + (item.targetX - (W + 200)) * ease;
        item.container.alpha = Math.min(progress * 2, 1);
      }
    }

    // D) Central energy beam
    beamGfx.clear();
    const beamAlpha = Math.min((elapsed - 30) / 40, 0.4);
    if (beamAlpha > 0) {
      // Vertical beam at center
      const beamW = 3 * S + Math.sin(t * 3) * 1 * S;
      beamGfx.rect(COLS.center - beamW / 2, H * 0.08, beamW, H * 0.84);
      beamGfx.fill({ color: 0x8B5CF6, alpha: beamAlpha * 0.5 });
      // Wider glow
      beamGfx.rect(COLS.center - 15 * S, H * 0.08, 30 * S, H * 0.84);
      beamGfx.fill({ color: 0x8B5CF6, alpha: beamAlpha * 0.08 });
    }

    // E) Connection arrows (after both sides are in)
    arrowGfx.clear();
    for (let i = 0; i < pairs.length; i++) {
      const showAt = 60 + i * 15 + 25;
      const arrowProgress = Math.max(0, Math.min((elapsed - showAt) / 30, 1));
      if (arrowProgress <= 0) continue;

      const y = ROW_START + i * ROW_SPACING + 16 * S;
      const leftEdge = COLS.left + 70 * S;
      const rightEdge = COLS.right - 70 * S;
      const midX = COLS.center;

      // Arrow line — grows from left to right
      const lineEndX = leftEdge + (rightEdge - leftEdge) * arrowProgress;

      // Dashed / dotted connection
      const segLen = 6 * S;
      const gapLen = 4 * S;
      let cx = leftEdge;
      while (cx < lineEndX) {
        const endSeg = Math.min(cx + segLen, lineEndX);
        arrowGfx.moveTo(cx, y);
        arrowGfx.lineTo(endSeg, y);

        // Color transition: red → purple → blue
        const pct = (cx - leftEdge) / (rightEdge - leftEdge);
        const color = pct < 0.5 ? 0xE63312 : 0x3B82F6;
        const alpha = 0.3 + Math.sin(t * 4 + pct * Math.PI) * 0.1;
        arrowGfx.stroke({ width: 1.5 * S, color, alpha });

        cx += segLen + gapLen;
      }

      // Arrowhead at current end
      if (arrowProgress > 0.1) {
        const ax = lineEndX;
        arrowGfx.moveTo(ax, y);
        arrowGfx.lineTo(ax - 5 * S, y - 3 * S);
        arrowGfx.lineTo(ax - 5 * S, y + 3 * S);
        arrowGfx.closePath();
        arrowGfx.fill({ color: 0x3B82F6, alpha: 0.5 * arrowProgress });
      }

      // Center node (purple dot on the beam)
      if (arrowProgress > 0.4) {
        const nodeAlpha = Math.min((arrowProgress - 0.4) / 0.3, 1);
        arrowGfx.circle(midX, y, 4 * S);
        arrowGfx.fill({ color: 0x8B5CF6, alpha: 0.7 * nodeAlpha });
        arrowGfx.circle(midX, y, 8 * S);
        arrowGfx.fill({ color: 0x8B5CF6, alpha: 0.12 * nodeAlpha });
      }
    }

    // F) Flow particles — spawn from challenge side, drift to solution side
    if (elapsed > 80 && Math.random() < 0.3) {
      const row = Math.floor(Math.random() * pairs.length);
      const y = ROW_START + row * ROW_SPACING + 16 * S;
      flowParticles.push({
        x: COLS.left + 70 * S,
        y: y + (Math.random() - 0.5) * 10 * S,
        vx: 1.5 + Math.random() * 1.5,
        vy: (Math.random() - 0.5) * 0.3,
        life: 1,
        decay: 0.008 + Math.random() * 0.005,
        size: 1.5 + Math.random() * 2,
        phase: 0, // 0 = red(challenge), transitions to blue(solution)
      });
    }

    flowGfx.clear();
    for (let i = flowParticles.length - 1; i >= 0; i--) {
      const p = flowParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt + Math.sin(t * 3 + p.x * 0.01) * 0.2;
      p.life -= p.decay * dt;
      p.phase = Math.min((p.x - (COLS.left + 70 * S)) / (COLS.right - 70 * S - COLS.left - 70 * S), 1);

      if (p.life <= 0 || p.x > COLS.right + 20 * S) {
        flowParticles.splice(i, 1);
        continue;
      }

      // Color morphs: red → purple → blue
      let color;
      if (p.phase < 0.4) color = 0xE63312;
      else if (p.phase < 0.6) color = 0x8B5CF6;
      else color = 0x3B82F6;

      flowGfx.circle(p.x, p.y, p.size * S * p.life);
      flowGfx.fill({ color, alpha: p.life * 0.6 });
    }
    if (flowParticles.length > 60) flowParticles.length = 60;

    // G) Subtle pulse on challenge blocks (throb)
    for (let i = 0; i < challengeItems.length; i++) {
      const ic = challengeItems[i].container;
      if (ic.alpha > 0.5) {
        const pulse = 1 + Math.sin(t * 2 + i * 0.8) * 0.015;
        ic.scale.set(pulse);
      }
    }

    // H) Gentle float on solution cards
    for (let i = 0; i < solutionItems.length; i++) {
      const ic = solutionItems[i].container;
      if (ic.alpha > 0.5) {
        const baseY = ROW_START + i * ROW_SPACING;
        ic.y = baseY + Math.sin(t * 1.2 + i * 0.6) * 3 * S;
        const pulse = 1 + Math.sin(t * 1.8 + i * 0.7) * 0.01;
        ic.scale.set(pulse);
      }
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
