import { Container, Graphics } from 'pixi.js';

/**
 * Spaceship — sleek fighter cruising through a streaming starfield
 * with engine thrust particles, wing glow, and gentle banking.
 */
export function createSpaceshipSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const S = Math.min(W, H) / 800;
  let elapsed = 0;

  /* ── Starfield (streaming past) ────────────────── */
  const STAR_COUNT = 300;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    z: Math.random(),                              // 0 = far, 1 = near
    speed: 1.5 + Math.random() * 4,
  }));
  const starGfx = new Graphics();
  container.addChild(starGfx);

  /* ── Ship container (for banking / position) ───── */
  const shipContainer = new Container();
  shipContainer.x = W * 0.55;
  shipContainer.y = H * 0.5;
  container.addChild(shipContainer);

  /* ── Draw the fighter ship ─────────────────────── */
  const shipGfx = new Graphics();

  // Main fuselage — elongated pointed shape
  shipGfx.moveTo(70 * S, 0);            // nose
  shipGfx.lineTo(20 * S, -12 * S);      // upper fuselage
  shipGfx.lineTo(-50 * S, -10 * S);     // rear upper
  shipGfx.lineTo(-60 * S, 0);           // tail center
  shipGfx.lineTo(-50 * S, 10 * S);      // rear lower
  shipGfx.lineTo(20 * S, 12 * S);       // lower fuselage
  shipGfx.closePath();
  shipGfx.fill({ color: 0xE8E4DE, alpha: 0.95 });
  shipGfx.stroke({ width: 1.5 * S, color: 0xBBBBBB, alpha: 0.4 });

  // Cockpit canopy
  shipGfx.moveTo(55 * S, 0);
  shipGfx.lineTo(30 * S, -7 * S);
  shipGfx.lineTo(20 * S, -6 * S);
  shipGfx.lineTo(25 * S, 0);
  shipGfx.lineTo(20 * S, 6 * S);
  shipGfx.lineTo(30 * S, 7 * S);
  shipGfx.closePath();
  shipGfx.fill({ color: 0x3B82F6, alpha: 0.5 });
  shipGfx.stroke({ width: 1 * S, color: 0x60A5FA, alpha: 0.6 });

  // Top wing
  shipGfx.moveTo(10 * S, -12 * S);
  shipGfx.lineTo(-20 * S, -50 * S);
  shipGfx.lineTo(-45 * S, -48 * S);
  shipGfx.lineTo(-55 * S, -14 * S);
  shipGfx.closePath();
  shipGfx.fill({ color: 0xD0CCC6, alpha: 0.9 });
  shipGfx.stroke({ width: 1 * S, color: 0xBBBBBB, alpha: 0.3 });

  // Bottom wing
  shipGfx.moveTo(10 * S, 12 * S);
  shipGfx.lineTo(-20 * S, 50 * S);
  shipGfx.lineTo(-45 * S, 48 * S);
  shipGfx.lineTo(-55 * S, 14 * S);
  shipGfx.closePath();
  shipGfx.fill({ color: 0xD0CCC6, alpha: 0.9 });
  shipGfx.stroke({ width: 1 * S, color: 0xBBBBBB, alpha: 0.3 });

  // Wing red accent stripes
  shipGfx.moveTo(-5 * S, -20 * S);
  shipGfx.lineTo(-15 * S, -42 * S);
  shipGfx.lineTo(-22 * S, -41 * S);
  shipGfx.lineTo(-12 * S, -19 * S);
  shipGfx.closePath();
  shipGfx.fill({ color: 0xE63312, alpha: 0.7 });

  shipGfx.moveTo(-5 * S, 20 * S);
  shipGfx.lineTo(-15 * S, 42 * S);
  shipGfx.lineTo(-22 * S, 41 * S);
  shipGfx.lineTo(-12 * S, 19 * S);
  shipGfx.closePath();
  shipGfx.fill({ color: 0xE63312, alpha: 0.7 });

  // Engine nozzles (rear)
  shipGfx.circle(-55 * S, -8 * S, 5 * S);
  shipGfx.fill({ color: 0x555555, alpha: 0.8 });
  shipGfx.circle(-55 * S, 8 * S, 5 * S);
  shipGfx.fill({ color: 0x555555, alpha: 0.8 });

  shipContainer.addChild(shipGfx);

  /* ── Engine glow (static halo behind nozzles) ──── */
  const engineGlowGfx = new Graphics();
  shipContainer.addChildAt(engineGlowGfx, 0); // behind ship

  /* ── Thrust particles ──────────────────────────── */
  const thrustParticles = [];
  const thrustGfx = new Graphics();
  thrustGfx.blendMode = 'add';
  shipContainer.addChildAt(thrustGfx, 0); // behind ship

  /* ── Wing-tip glow particles ───────────────────── */
  const tipGfx = new Graphics();
  tipGfx.blendMode = 'add';
  shipContainer.addChild(tipGfx);

  /* ── Update ────────────────────────────────────── */
  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016;

    // A) Gentle banking — ship sways vertically and rotates slightly
    const bankY = Math.sin(t * 0.7) * 20 * S;
    const bankRot = Math.sin(t * 0.7) * 0.04;
    const swayX = Math.sin(t * 0.4) * 10 * S;
    shipContainer.y = H * 0.5 + bankY;
    shipContainer.x = W * 0.55 + swayX;
    shipContainer.rotation = bankRot;

    // B) Streaming starfield
    starGfx.clear();
    for (const s of stars) {
      s.x -= s.speed * dt * (0.5 + s.z * 2);
      if (s.x < -10) {
        s.x = W + 10;
        s.y = Math.random() * H;
        s.z = Math.random();
      }
      const size = 0.5 + s.z * 2;
      const streakLen = s.speed * (0.5 + s.z * 2) * 2;
      const alpha = 0.15 + s.z * 0.5;

      // Streak line
      starGfx.moveTo(s.x, s.y);
      starGfx.lineTo(s.x + streakLen, s.y);
      starGfx.stroke({ width: size * 0.6, color: 0xFFFFFF, alpha: alpha * 0.5 });

      // Head dot
      starGfx.circle(s.x, s.y, size * 0.5);
      starGfx.fill({ color: 0xFFFFFF, alpha });
    }

    // C) Engine glow (pulsing halos)
    engineGlowGfx.clear();
    const glowPulse = 0.8 + Math.sin(t * 6) * 0.2;
    const glowSize = 18 * S * glowPulse;
    // Top engine
    engineGlowGfx.circle(-58 * S, -8 * S, glowSize);
    engineGlowGfx.fill({ color: 0x3B82F6, alpha: 0.15 * glowPulse });
    engineGlowGfx.circle(-58 * S, -8 * S, glowSize * 0.5);
    engineGlowGfx.fill({ color: 0x60A5FA, alpha: 0.3 * glowPulse });
    // Bottom engine
    engineGlowGfx.circle(-58 * S, 8 * S, glowSize);
    engineGlowGfx.fill({ color: 0x3B82F6, alpha: 0.15 * glowPulse });
    engineGlowGfx.circle(-58 * S, 8 * S, glowSize * 0.5);
    engineGlowGfx.fill({ color: 0x60A5FA, alpha: 0.3 * glowPulse });

    // D) Thrust exhaust particles
    // Emit from each engine nozzle
    for (let n = 0; n < 2; n++) {
      const ny = n === 0 ? -8 * S : 8 * S;
      if (Math.random() < 0.6) {
        thrustParticles.push({
          x: -60 * S,
          y: ny + (Math.random() - 0.5) * 4 * S,
          vx: -(3 + Math.random() * 3),
          vy: (Math.random() - 0.5) * 0.8,
          life: 1,
          decay: 0.025 + Math.random() * 0.015,
          size: 2 + Math.random() * 3,
          color: Math.random() > 0.4 ? 0x3B82F6 : 0x60A5FA,
        });
      }
    }

    thrustGfx.clear();
    for (let i = thrustParticles.length - 1; i >= 0; i--) {
      const p = thrustParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) { thrustParticles.splice(i, 1); continue; }
      const a = p.life;
      // Exhaust streak
      thrustGfx.moveTo(p.x, p.y);
      thrustGfx.lineTo(p.x + 6 * a, p.y);
      thrustGfx.stroke({ width: p.size * a * S, color: p.color, alpha: a * 0.6 });
      // Core dot
      thrustGfx.circle(p.x, p.y, p.size * a * S * 0.4);
      thrustGfx.fill({ color: 0xFFFFFF, alpha: a * 0.4 });
    }
    // Cap particles
    if (thrustParticles.length > 80) thrustParticles.length = 80;

    // E) Wing-tip glow
    tipGfx.clear();
    const tipPulse = 0.6 + Math.sin(t * 4) * 0.4;
    // Top wing tip
    tipGfx.circle(-32 * S, -49 * S, 4 * S);
    tipGfx.fill({ color: 0xE63312, alpha: 0.7 * tipPulse });
    tipGfx.circle(-32 * S, -49 * S, 8 * S);
    tipGfx.fill({ color: 0xE63312, alpha: 0.15 * tipPulse });
    // Bottom wing tip
    tipGfx.circle(-32 * S, 49 * S, 4 * S);
    tipGfx.fill({ color: 0xE63312, alpha: 0.7 * tipPulse });
    tipGfx.circle(-32 * S, 49 * S, 8 * S);
    tipGfx.fill({ color: 0xE63312, alpha: 0.15 * tipPulse });
    // Nose light
    const nosePulse = 0.5 + Math.sin(t * 2) * 0.5;
    tipGfx.circle(68 * S, 0, 3 * S);
    tipGfx.fill({ color: 0xFFFFFF, alpha: 0.8 * nosePulse });
    tipGfx.circle(68 * S, 0, 7 * S);
    tipGfx.fill({ color: 0x3B82F6, alpha: 0.12 * nosePulse });
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
