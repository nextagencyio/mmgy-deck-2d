import { Container, Graphics } from 'pixi.js';

/**
 * Robot Mascot — friendly cartoon robot with idle breathing,
 * eye blinking, and a periodic wave animation.
 */
export function createRobotSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const S = Math.min(W, H) / 800;
  let elapsed = 0;

  /* ── Background layer ─────────────────────────── */
  const bgGfx = new Graphics();
  // Dot grid
  for (let x = 0; x < W; x += 40) {
    for (let y = 0; y < H; y += 40) {
      bgGfx.circle(x, y, 1);
      bgGfx.fill({ color: 0xFFFFFF, alpha: 0.04 });
    }
  }
  container.addChild(bgGfx);

  // Floating ambient circles
  const floatingCircles = Array.from({ length: 18 }, () => ({
    baseX: Math.random() * W,
    baseY: Math.random() * H,
    radius: 8 + Math.random() * 25,
    color: [0xE63312, 0x3B82F6, 0x10B981, 0x8B5CF6][Math.floor(Math.random() * 4)],
    alpha: 0.03 + Math.random() * 0.05,
    speedX: 0.2 + Math.random() * 0.3,
    speedY: 0.15 + Math.random() * 0.25,
    rangeX: 20 + Math.random() * 40,
    rangeY: 15 + Math.random() * 30,
    offsetX: Math.random() * Math.PI * 2,
    offsetY: Math.random() * Math.PI * 2,
  }));
  const floatGfx = new Graphics();
  container.addChild(floatGfx);

  /* ── Robot container (centered slightly right) ── */
  const robotContainer = new Container();
  const centerX = W * 0.55;
  const centerY = H * 0.48;
  robotContainer.x = centerX;
  robotContainer.y = centerY;
  container.addChild(robotContainer);

  /* ── Legs ──────────────────────────────────────── */
  const legsGfx = new Graphics();
  // Left leg
  legsGfx.roundRect(-28 * S, 55 * S, 24 * S, 45 * S, 8 * S);
  legsGfx.fill({ color: 0xBBBBBB, alpha: 0.7 });
  // Left foot
  legsGfx.roundRect(-32 * S, 95 * S, 32 * S, 12 * S, 5 * S);
  legsGfx.fill({ color: 0x999999, alpha: 0.7 });
  // Right leg
  legsGfx.roundRect(4 * S, 55 * S, 24 * S, 45 * S, 8 * S);
  legsGfx.fill({ color: 0xBBBBBB, alpha: 0.7 });
  // Right foot
  legsGfx.roundRect(0, 95 * S, 32 * S, 12 * S, 5 * S);
  legsGfx.fill({ color: 0x999999, alpha: 0.7 });
  robotContainer.addChild(legsGfx);

  /* ── Left arm (resting) ────────────────────────── */
  const leftArmContainer = new Container();
  leftArmContainer.x = -55 * S;
  leftArmContainer.y = -20 * S;
  leftArmContainer.pivot.set(0, 0); // shoulder pivot
  leftArmContainer.rotation = 0.15;

  const leftArmGfx = new Graphics();
  leftArmGfx.roundRect(-10 * S, 0, 20 * S, 65 * S, 10 * S);
  leftArmGfx.fill({ color: 0xBBBBBB, alpha: 0.7 });
  // Hand
  leftArmGfx.circle(0, 70 * S, 12 * S);
  leftArmGfx.fill({ color: 0xE8E4DE, alpha: 0.9 });
  leftArmContainer.addChild(leftArmGfx);
  robotContainer.addChild(leftArmContainer);

  /* ── Torso ─────────────────────────────────────── */
  const bodyGfx = new Graphics();
  // Main body
  bodyGfx.roundRect(-50 * S, -60 * S, 100 * S, 120 * S, 15 * S);
  bodyGfx.fill({ color: 0xE8E4DE, alpha: 0.92 });
  bodyGfx.stroke({ width: 2 * S, color: 0xBBBBBB, alpha: 0.3 });
  // Chest panel
  bodyGfx.roundRect(-22 * S, -35 * S, 44 * S, 55 * S, 8 * S);
  bodyGfx.fill({ color: 0xE63312, alpha: 0.12 });
  bodyGfx.stroke({ width: 1, color: 0xE63312, alpha: 0.2 });
  robotContainer.addChild(bodyGfx);

  // Heart indicator (separate for pulsing)
  const heartGfx = new Graphics();
  heartGfx.circle(0, -8 * S, 7 * S);
  heartGfx.fill({ color: 0xE63312, alpha: 0.85 });
  // Glow ring
  heartGfx.circle(0, -8 * S, 12 * S);
  heartGfx.fill({ color: 0xE63312, alpha: 0.1 });
  robotContainer.addChild(heartGfx);

  /* ── Right arm (wave arm) ──────────────────────── */
  const rightArmContainer = new Container();
  rightArmContainer.x = 55 * S;
  rightArmContainer.y = -20 * S;
  rightArmContainer.pivot.set(0, 0); // shoulder pivot
  rightArmContainer.rotation = -0.15;

  const rightArmGfx = new Graphics();
  rightArmGfx.roundRect(-10 * S, 0, 20 * S, 65 * S, 10 * S);
  rightArmGfx.fill({ color: 0xBBBBBB, alpha: 0.7 });
  // Hand
  rightArmGfx.circle(0, 70 * S, 12 * S);
  rightArmGfx.fill({ color: 0xE8E4DE, alpha: 0.9 });
  rightArmContainer.addChild(rightArmGfx);
  robotContainer.addChild(rightArmContainer);

  /* ── Head ───────────────────────────────────────── */
  const headContainer = new Container();
  headContainer.y = -60 * S;
  robotContainer.addChild(headContainer);

  // Head shape
  const headGfx = new Graphics();
  headGfx.roundRect(-60 * S, -75 * S, 120 * S, 100 * S, 20 * S);
  headGfx.fill({ color: 0xE8E4DE, alpha: 0.95 });
  headGfx.stroke({ width: 2 * S, color: 0xBBBBBB, alpha: 0.3 });
  headContainer.addChild(headGfx);

  // Ears
  const earsGfx = new Graphics();
  // Left ear
  earsGfx.roundRect(-68 * S, -45 * S, 10 * S, 24 * S, 3 * S);
  earsGfx.fill({ color: 0xBBBBBB, alpha: 0.6 });
  // Right ear
  earsGfx.roundRect(58 * S, -45 * S, 10 * S, 24 * S, 3 * S);
  earsGfx.fill({ color: 0xBBBBBB, alpha: 0.6 });
  headContainer.addChild(earsGfx);

  // Visor
  const visorGfx = new Graphics();
  visorGfx.roundRect(-50 * S, -48 * S, 100 * S, 42 * S, 10 * S);
  visorGfx.fill({ color: 0x1A1A1A, alpha: 0.9 });
  headContainer.addChild(visorGfx);

  // Left eye
  const leftEyeGfx = new Graphics();
  // White
  leftEyeGfx.circle(-20 * S, -28 * S, 11 * S);
  leftEyeGfx.fill({ color: 0xFFFFFF, alpha: 0.95 });
  // Pupil (blue)
  leftEyeGfx.circle(-20 * S, -28 * S, 6 * S);
  leftEyeGfx.fill({ color: 0x3B82F6, alpha: 1 });
  // Highlight
  leftEyeGfx.circle(-23 * S, -31 * S, 2.5 * S);
  leftEyeGfx.fill({ color: 0xFFFFFF, alpha: 1 });
  headContainer.addChild(leftEyeGfx);

  // Right eye
  const rightEyeGfx = new Graphics();
  rightEyeGfx.circle(20 * S, -28 * S, 11 * S);
  rightEyeGfx.fill({ color: 0xFFFFFF, alpha: 0.95 });
  rightEyeGfx.circle(20 * S, -28 * S, 6 * S);
  rightEyeGfx.fill({ color: 0x3B82F6, alpha: 1 });
  rightEyeGfx.circle(17 * S, -31 * S, 2.5 * S);
  rightEyeGfx.fill({ color: 0xFFFFFF, alpha: 1 });
  headContainer.addChild(rightEyeGfx);

  // Eyelids (for blink — drawn on top of eyes)
  const leftLid = new Graphics();
  leftLid.roundRect(-31 * S, -39 * S, 22 * S, 22 * S, 4 * S);
  leftLid.fill({ color: 0x1A1A1A, alpha: 0.95 });
  leftLid.scale.y = 0;
  leftLid.pivot.set(0, -28 * S); // pivot at eye center for scale
  headContainer.addChild(leftLid);

  const rightLid = new Graphics();
  rightLid.roundRect(9 * S, -39 * S, 22 * S, 22 * S, 4 * S);
  rightLid.fill({ color: 0x1A1A1A, alpha: 0.95 });
  rightLid.scale.y = 0;
  rightLid.pivot.set(0, -28 * S);
  headContainer.addChild(rightLid);

  // Mouth (smile arc)
  const mouthGfx = new Graphics();
  mouthGfx.arc(0, -8 * S, 14 * S, 0.1, Math.PI - 0.1, false);
  mouthGfx.stroke({ width: 2.5 * S, color: 0xE63312, alpha: 0.8 });
  headContainer.addChild(mouthGfx);

  /* ── Antenna ───────────────────────────────────── */
  const antennaContainer = new Container();
  antennaContainer.y = -75 * S;
  headContainer.addChild(antennaContainer);

  const antennaGfx = new Graphics();
  // Stalk
  antennaGfx.rect(-2 * S, -28 * S, 4 * S, 28 * S);
  antennaGfx.fill({ color: 0xBBBBBB, alpha: 0.8 });
  // Ball
  antennaGfx.circle(0, -35 * S, 8 * S);
  antennaGfx.fill({ color: 0xE63312, alpha: 1 });
  // Glow
  antennaGfx.circle(0, -35 * S, 16 * S);
  antennaGfx.fill({ color: 0xE63312, alpha: 0.12 });
  antennaContainer.addChild(antennaGfx);

  /* ── Spark particles ───────────────────────────── */
  const sparks = [];
  const sparkGfx = new Graphics();
  sparkGfx.blendMode = 'add';
  container.addChild(sparkGfx);

  /* ── Update ────────────────────────────────────── */
  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016;

    // A) Idle bob
    const bobY = Math.sin(t * 1.8) * 6 * S;
    robotContainer.y = centerY + bobY;

    // B) Breath scale
    const breathScale = 1 + Math.sin(t * 1.2) * 0.012;
    robotContainer.scale.set(breathScale);

    // C) Eye blink
    const blinkCycle = 3.5;
    const blinkDur = 0.1;
    const bp1 = t % blinkCycle;
    const blink1 = bp1 < blinkDur ? Math.sin((bp1 / blinkDur) * Math.PI) : 0;
    const bp2 = t % 7.3;
    const blink2 = (bp2 > 0.2 && bp2 < 0.3) ? Math.sin(((bp2 - 0.2) / 0.1) * Math.PI) : 0;
    const blinkVal = Math.max(blink1, blink2);
    leftLid.scale.y = blinkVal;
    rightLid.scale.y = blinkVal;

    // D) Wave arm
    const waveCycle = 8;
    const wp = t % waveCycle;
    let armRot = -0.15;
    if (wp < 1.0) {
      const p = wp;
      const e = 1 - Math.pow(1 - p, 3);
      armRot = -0.15 + (-1.8 - (-0.15)) * e;
    } else if (wp < 3.5) {
      armRot = -1.8 + Math.sin((wp - 1.0) * 6) * 0.25;
    } else if (wp < 4.5) {
      const p = (wp - 3.5);
      const e = 1 - Math.pow(1 - p, 3);
      armRot = -1.8 + (-0.15 - (-1.8)) * e;
    }
    rightArmContainer.rotation = armRot;

    // E) Antenna bob
    antennaContainer.rotation = Math.sin(t * 1.8 - 0.4) * 0.12 + Math.sin(t * 3.5) * 0.05;

    // F) Heart pulse
    const heartPulse = 1 + Math.sin(t * 2.5) * 0.15;
    heartGfx.scale.set(heartPulse);

    // G) Floating circles
    floatGfx.clear();
    for (const c of floatingCircles) {
      const fx = c.baseX + Math.sin(t * c.speedX + c.offsetX) * c.rangeX;
      const fy = c.baseY + Math.sin(t * c.speedY + c.offsetY) * c.rangeY;
      floatGfx.circle(fx, fy, c.radius);
      floatGfx.fill({ color: c.color, alpha: c.alpha });
    }

    // H) Spark particles from antenna
    if (Math.floor(elapsed) % 25 === 0 && sparks.length < 30) {
      // Approximate antenna ball world position
      const ax = robotContainer.x + headContainer.x + antennaContainer.x;
      const ay = robotContainer.y + headContainer.y + antennaContainer.y - 35 * S;
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        sparks.push({
          x: ax, y: ay,
          vx: Math.cos(angle) * (0.8 + Math.random() * 0.8),
          vy: Math.sin(angle) * (0.8 + Math.random() * 0.8) - 0.6,
          life: 1,
          decay: 0.012 + Math.random() * 0.01,
          color: Math.random() > 0.5 ? 0xE63312 : 0xFF6B4A,
        });
      }
    }
    sparkGfx.clear();
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= s.decay * dt;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      sparkGfx.circle(s.x, s.y, 2.5 * s.life);
      sparkGfx.fill({ color: s.color, alpha: s.life * 0.7 });
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
