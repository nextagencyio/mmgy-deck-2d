import { Container, Graphics, Text } from 'pixi.js';

/**
 * 8-Bit Platform — pixel character runs, jumps, hits a "?" block,
 * and content items pop out one by one.
 */
export function createPlatformSlide(app) {
  const container = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const PX = Math.max(Math.round(Math.min(W, H) / 200), 2); // pixel size
  let elapsed = 0;

  /* ── Color palette ──────────────────────────────── */
  const C = {
    red:    0xE63312, redDark: 0xB02A0E,
    skin:   0xF5C8A0, skinDark: 0xD4A06A,
    blue:   0x3B82F6, blueDark: 0x2563EB,
    white:  0xFFFFFF, black: 0x1A1A1A,
    gold:   0xF5A623, goldDark: 0xC88415,
    brown:  0x8B5E3C, brownDark: 0x5E3A1E,
    gray:   0x555555, grayLight: 0x888888,
  };

  /* ── Ground / platform layer ────────────────────── */
  const groundY = H * 0.72;
  const groundGfx = new Graphics();
  // Ground bricks
  for (let x = 0; x < W; x += PX * 8) {
    const row = Math.floor(x / (PX * 8));
    groundGfx.rect(x, groundY, PX * 8, PX * 4);
    groundGfx.fill({ color: row % 2 === 0 ? C.brown : C.brownDark, alpha: 0.6 });
    groundGfx.rect(x, groundY, PX * 8, PX * 0.5);
    groundGfx.fill({ color: C.brown, alpha: 0.3 });
    // Second row
    groundGfx.rect(x + PX * 4, groundY + PX * 4, PX * 8, PX * 4);
    groundGfx.fill({ color: row % 2 === 0 ? C.brownDark : C.brown, alpha: 0.5 });
  }
  container.addChild(groundGfx);

  /* ── ? Block ────────────────────────────────────── */
  const blockX = W * 0.48;
  const blockY = groundY - PX * 28; // above ground, reachable by jump
  const blockSize = PX * 8;
  let blockHit = false;
  let blockBounce = 0;        // bounce offset after hit
  let blockBounceVel = 0;

  const blockContainer = new Container();
  blockContainer.x = blockX;
  blockContainer.y = blockY;
  container.addChild(blockContainer);

  function drawBlock() {
    blockGfx.clear();
    if (!blockHit) {
      // Gold ? block
      blockGfx.roundRect(0, 0, blockSize, blockSize, PX);
      blockGfx.fill({ color: C.gold });
      blockGfx.stroke({ width: PX * 0.8, color: C.goldDark, alpha: 0.8 });
      // Inner shadow
      blockGfx.rect(PX, PX, blockSize - PX * 2, blockSize - PX * 2);
      blockGfx.stroke({ width: PX * 0.5, color: 0xFFFFFF, alpha: 0.3 });
      // Shine dot
      blockGfx.rect(PX * 1.5, PX * 1.5, PX * 1.5, PX * 1.5);
      blockGfx.fill({ color: 0xFFFFFF, alpha: 0.6 });
    } else {
      // Empty / used block
      blockGfx.roundRect(0, 0, blockSize, blockSize, PX);
      blockGfx.fill({ color: C.gray });
      blockGfx.stroke({ width: PX * 0.8, color: 0x444444, alpha: 0.8 });
    }
  }

  const blockGfx = new Graphics();
  blockContainer.addChild(blockGfx);

  // "?" text on the block
  const qMark = new Text({
    text: '?',
    style: {
      fontFamily: 'Oswald', fontSize: blockSize * 0.7,
      fill: C.brownDark, fontWeight: '700',
    }
  });
  qMark.anchor = { x: 0.5, y: 0.5 };
  qMark.x = blockSize / 2;
  qMark.y = blockSize / 2;
  blockContainer.addChild(qMark);

  drawBlock();

  /* ── Pixel character sprite data (16×16 grid) ──── */
  // Color key: R=red(helmet), S=skin, B=blue(suit), D=darkBlue(boots),
  //            W=white(eyes/visor), K=black(outline), G=gold(belt), .=empty
  // Run frame 1 (standing / right foot forward)
  const frame1 = [
    '....KKKK........',
    '...KRRRRK.......',
    '..KRRRRRRRK.....',
    '..KRRWWWRRK.....',
    '..KSWKWKWSK.....',
    '..KSSSSSSK......',
    '...KSSSSK.......',
    '....KBBK........',
    '...KBBBBK.......',
    '..KBBGBBK.......',
    '..KBBBBBBK......',
    '..KBK.KBK.......',
    '..KBK.KBK.......',
    '..KDK.KDK.......',
    '..KDDK.KDDK.....',
    '..KKKK.KKKK.....',
  ];
  // Run frame 2 (mid-stride — legs apart)
  const frame2 = [
    '....KKKK........',
    '...KRRRRK.......',
    '..KRRRRRRRK.....',
    '..KRRWWWRRK.....',
    '..KSWKWKWSK.....',
    '..KSSSSSSK......',
    '...KSSSSK.......',
    '....KBBK........',
    '...KBBBBK.......',
    '..KBBGBBK.......',
    '..KBBBBBBK......',
    '...KBK.KBK......',
    '..KDK...KBK.....',
    '.KDDK...KDDK....',
    '.KKKK....KKKK...',
    '................',
  ];
  // Jump frame (arms up, legs tucked)
  const jumpFrame = [
    '....KKKK........',
    '...KRRRRK.......',
    '..KRRRRRRRK.....',
    '..KRRWWWRRK.....',
    '..KSWKWKWSK.....',
    '.KSSSSSSSSK.....',
    'KKKSSSSSKK......',
    'KSK.KBBK.KSK...',
    '....KBBBBK......',
    '...KBBGBBK......',
    '...KBBBBBBK.....',
    '...KBKKBK.......',
    '...KDKKDK.......',
    '..KDDK.KDDK.....',
    '..KKKK.KKKK.....',
    '................',
  ];

  const colorMap = {
    'R': C.red, 'S': C.skin, 'B': C.blue,
    'D': C.blueDark, 'W': C.white, 'K': C.black,
    'G': C.gold, '.': null,
  };

  function drawSprite(gfx, frameData, px) {
    gfx.clear();
    for (let row = 0; row < frameData.length; row++) {
      for (let col = 0; col < frameData[row].length; col++) {
        const c = colorMap[frameData[row][col]];
        if (c !== null) {
          gfx.rect(col * px, row * px, px, px);
          gfx.fill({ color: c });
        }
      }
    }
  }

  /* ── Character container ────────────────────────── */
  const charContainer = new Container();
  const charGfx = new Graphics();
  charContainer.addChild(charGfx);

  // Character starts off-screen left
  const charW = 16 * PX;
  const charH = 16 * PX;
  charContainer.x = -charW * 2;
  charContainer.y = groundY - charH;
  container.addChild(charContainer);

  drawSprite(charGfx, frame1, PX);

  /* ── Content items that pop out of the block ────── */
  const infoItems = [
    { icon: '01', text: 'PixiJS 2D Engine' },
    { icon: '02', text: 'Procedural Graphics' },
    { icon: '03', text: 'Particle Systems' },
    { icon: '04', text: 'Physics Simulation' },
    { icon: '05', text: 'Data Visualization' },
  ];

  const itemContainers = [];
  const itemTargets = [];
  const ITEM_SPACING = PX * 14;
  const ITEM_START_X = W * 0.58;
  const ITEM_START_Y = groundY - PX * 30;

  for (let i = 0; i < infoItems.length; i++) {
    const ic = new Container();
    ic.x = blockX + blockSize / 2;
    ic.y = blockY;
    ic.alpha = 0;
    ic.scale.set(0.3);

    // Coin/card background
    const bg = new Graphics();
    bg.roundRect(0, 0, PX * 40, PX * 6, PX);
    bg.fill({ color: 0x1A1A1A, alpha: 0.8 });
    bg.stroke({ width: 1, color: C.red, alpha: 0.4 });
    ic.addChild(bg);

    // Number badge
    const badge = new Graphics();
    badge.roundRect(PX * 0.5, PX * 0.5, PX * 5, PX * 5, PX * 0.5);
    badge.fill({ color: C.red, alpha: 0.9 });
    ic.addChild(badge);

    const numText = new Text({
      text: infoItems[i].icon,
      style: { fontFamily: 'Oswald', fontSize: PX * 3, fill: 0xFFFFFF, fontWeight: '600' }
    });
    numText.anchor = { x: 0.5, y: 0.5 };
    numText.x = PX * 3; numText.y = PX * 3;
    ic.addChild(numText);

    const label = new Text({
      text: infoItems[i].text,
      style: { fontFamily: 'Open Sans', fontSize: PX * 3, fill: 0xE8E4DE, fontWeight: '400' }
    });
    label.x = PX * 7; label.y = PX * 1.2;
    ic.addChild(label);

    container.addChild(ic);
    itemContainers.push(ic);
    itemTargets.push({
      x: ITEM_START_X,
      y: ITEM_START_Y + i * ITEM_SPACING,
    });
  }

  /* ── Coin particle burst on hit ─────────────────── */
  const coins = [];
  const coinGfx = new Graphics();
  coinGfx.blendMode = 'add';
  container.addChild(coinGfx);

  /* ── State machine ─────────────────────────────── */
  const STATE = { RUN: 0, JUMP: 1, HIT: 2, REVEAL: 3, IDLE: 4 };
  let state = STATE.RUN;
  let charVX = 2.5;             // run speed
  let charVY = 0;
  let jumpStartX = blockX - PX * 4; // where to start jumping
  let frameTimer = 0;
  let runFrame = 0;
  let revealIndex = 0;
  let revealTimer = 0;

  /* ── Sparkle on ? block ─────────────────────────── */
  const sparkleGfx = new Graphics();
  container.addChild(sparkleGfx);

  /* ── Update ────────────────────────────────────── */
  function update(dt) {
    elapsed += dt;
    const t = elapsed * 0.016;

    // Sparkle on ? block before hit
    sparkleGfx.clear();
    if (!blockHit) {
      const sparkle = Math.sin(t * 5) * 0.5 + 0.5;
      sparkleGfx.star(blockX + blockSize / 2, blockY - PX * 2, 4, PX * 2 * sparkle, PX * 0.5 * sparkle);
      sparkleGfx.fill({ color: 0xFFFFFF, alpha: sparkle * 0.7 });
    }

    // Animate block bounce
    if (blockBounce !== 0 || blockBounceVel !== 0) {
      blockBounce += blockBounceVel * dt;
      blockBounceVel += 0.5 * dt; // gravity back
      if (blockBounce > 0) { blockBounce = 0; blockBounceVel = 0; }
      blockContainer.y = blockY + blockBounce;
    }

    switch (state) {
      case STATE.RUN: {
        charContainer.x += charVX * dt;
        frameTimer += dt;
        if (frameTimer > 6) {
          runFrame = 1 - runFrame;
          drawSprite(charGfx, runFrame === 0 ? frame1 : frame2, PX);
          frameTimer = 0;
        }
        // Start jump when near block
        if (charContainer.x >= jumpStartX) {
          state = STATE.JUMP;
          charVY = -6.5;
          charVX = 1.2;
          drawSprite(charGfx, jumpFrame, PX);
        }
        break;
      }
      case STATE.JUMP: {
        charContainer.x += charVX * dt;
        charContainer.y += charVY * dt;
        charVY += 0.18 * dt; // gravity

        // Check if head hits block from below
        const charTop = charContainer.y;
        const charCenterX = charContainer.x + charW / 2;
        const blockBottom = blockContainer.y + blockSize;
        const blockLeft = blockContainer.x;
        const blockRight = blockContainer.x + blockSize;

        if (!blockHit &&
            charTop <= blockBottom + PX &&
            charTop >= blockBottom - PX * 4 &&
            charCenterX > blockLeft - PX * 2 &&
            charCenterX < blockRight + PX * 2 &&
            charVY < 0) {
          // HIT!
          state = STATE.HIT;
          blockHit = true;
          blockBounceVel = -3;
          charVY = 2; // bounce character down
          drawBlock();
          qMark.alpha = 0;

          // Spawn coin particles
          for (let i = 0; i < 15; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
            coins.push({
              x: blockX + blockSize / 2,
              y: blockY,
              vx: Math.cos(angle) * (2 + Math.random() * 3),
              vy: Math.sin(angle) * (2 + Math.random() * 3),
              life: 1,
              decay: 0.015 + Math.random() * 0.01,
              color: Math.random() > 0.5 ? C.gold : C.red,
              size: PX * (1 + Math.random()),
            });
          }
        }

        // Land on ground
        if (charContainer.y >= groundY - charH) {
          charContainer.y = groundY - charH;
          if (blockHit) {
            state = STATE.REVEAL;
            charVX = 0;
            drawSprite(charGfx, frame1, PX);
          } else {
            charVY = 0;
            state = STATE.RUN;
            charVX = 2.5;
          }
        }
        break;
      }
      case STATE.HIT: {
        // Brief moment of hit — character falling back down
        charContainer.y += charVY * dt;
        charVY += 0.18 * dt;
        if (charContainer.y >= groundY - charH) {
          charContainer.y = groundY - charH;
          state = STATE.REVEAL;
          charVX = 0;
          drawSprite(charGfx, frame1, PX);
        }
        break;
      }
      case STATE.REVEAL: {
        revealTimer += dt;
        if (revealTimer > 12 && revealIndex < infoItems.length) {
          // Pop next item
          const ic = itemContainers[revealIndex];
          ic.alpha = 1;
          ic.scale.set(1);
          revealIndex++;
          revealTimer = 0;

          // Small bounce on block for each item
          if (blockBounce === 0) blockBounceVel = -1.5;
        }

        // Animate items toward targets with spring
        for (let i = 0; i < revealIndex; i++) {
          const ic = itemContainers[i];
          const tgt = itemTargets[i];
          ic.x += (tgt.x - ic.x) * 0.08 * dt;
          ic.y += (tgt.y - ic.y) * 0.08 * dt;
        }

        if (revealIndex >= infoItems.length && revealTimer > 30) {
          state = STATE.IDLE;
        }

        // Idle character bob
        frameTimer += dt;
        if (frameTimer > 20) {
          runFrame = 1 - runFrame;
          drawSprite(charGfx, runFrame === 0 ? frame1 : frame2, PX);
          frameTimer = 0;
        }
        break;
      }
      case STATE.IDLE: {
        // Character gentle idle
        frameTimer += dt;
        if (frameTimer > 25) {
          runFrame = 1 - runFrame;
          drawSprite(charGfx, runFrame === 0 ? frame1 : frame2, PX);
          frameTimer = 0;
        }

        // Settled items — gentle float
        for (let i = 0; i < itemContainers.length; i++) {
          const ic = itemContainers[i];
          const tgt = itemTargets[i];
          ic.x += (tgt.x - ic.x) * 0.1 * dt;
          ic.y = tgt.y + Math.sin(t * 1.5 + i * 0.5) * PX;
        }
        break;
      }
    }

    // Coin particles
    coinGfx.clear();
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 0.12 * dt;
      c.life -= c.decay * dt;
      if (c.life <= 0) { coins.splice(i, 1); continue; }
      coinGfx.rect(c.x - c.size / 2, c.y - c.size / 2, c.size, c.size);
      coinGfx.fill({ color: c.color, alpha: c.life * 0.8 });
    }
  }

  function destroy() { container.destroy({ children: true }); }
  return { container, update, destroy };
}
