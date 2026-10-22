import { Player, Enemy, Platform, Hazard, Collectible, Particle, Goal, LevelConfig } from './types';

export class PixelRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.ctx.imageSmoothingEnabled = false;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Clear and draw entire frame with camera transformation
   */
  public render(
    level: LevelConfig,
    player: Player,
    enemies: Enemy[],
    platforms: Platform[],
    hazards: Hazard[],
    collectibles: Collectible[],
    particles: Particle[],
    goal: Goal,
    cameraX: number,
    cameraY: number,
    shakeOffset: { x: number; y: number },
    gameTime: number
  ) {
    const ctx = this.ctx;
    ctx.save();

    // Clear background
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(0, 0, this.width, this.height);

    // Render Parallax Background (Independent of camera scale, driven by cameraX)
    this.renderParallaxBackground(cameraX, cameraY, level, gameTime);

    // Apply Camera & Screen Shake to World Layer
    ctx.save();
    ctx.translate(Math.floor(-cameraX + shakeOffset.x), Math.floor(-cameraY + shakeOffset.y));

    // 1. Goal (Portal) background glow
    this.renderGoalBack(goal, gameTime);

    // 2. Platforms & Hazards
    this.renderPlatforms(platforms, gameTime);
    this.renderHazards(hazards, gameTime);

    // 3. Goal Stone Structure
    this.renderGoalPortal(goal, gameTime);

    // 4. Collectibles
    this.renderCollectibles(collectibles, gameTime);

    // 5. Enemies
    this.renderEnemies(enemies, gameTime);

    // 6. Player (Duende)
    this.renderPlayer(player, gameTime);

    // 7. Particles
    this.renderParticles(particles);

    // Restore Camera
    ctx.restore();

    // 8. Foreground Vignette & Forest Lighting Atmosphere
    this.renderAmbientLighting(level, gameTime);

    ctx.restore();
  }

  // --- PARALLAX BACKGROUND ---
  private renderParallaxBackground(camX: number, camY: number, level: LevelConfig, time: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Sky gradient (Deep twilight forest indigo to mystic mossy cyan)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#040814');
    skyGrad.addColorStop(0.45, '#0b192e');
    skyGrad.addColorStop(0.8, '#132e3b');
    skyGrad.addColorStop(1, '#1b3f36');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Twinkling Pixel Stars
    ctx.fillStyle = '#f0f9ff';
    for (let i = 0; i < 45; i++) {
      const starX = (i * 97 + Math.sin(i * 12) * 50) % w;
      const starY = (i * 47) % (h * 0.5);
      const twinkle = (Math.sin(time * 3 + i * 2) + 1) * 0.5;
      if (twinkle > 0.3) {
        ctx.globalAlpha = twinkle * 0.8;
        ctx.fillRect(Math.floor(starX), Math.floor(starY), twinkle > 0.7 ? 2 : 1, twinkle > 0.7 ? 2 : 1);
      }
    }
    ctx.globalAlpha = 1.0;

    // Crescent Moon
    const moonX = w - 120;
    const moonY = 60;
    ctx.save();
    // Moon glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 70);
    moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    moonGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b192e';
    ctx.beginPath();
    ctx.arc(moonX + 9, moonY - 5, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Parallax Layer 1: Distant misty mountain & tall pines silhouette (Scroll factor: 0.1)
    const p1Offset = (camX * 0.1) % 400;
    ctx.fillStyle = '#0d222b';
    for (let x = -p1Offset - 400; x < w + 400; x += 180) {
      // Tree silhouette
      ctx.beginPath();
      ctx.moveTo(x + 90, h * 0.4);
      ctx.lineTo(x + 180, h);
      ctx.lineTo(x, h);
      ctx.closePath();
      ctx.fill();
    }

    // Parallax Layer 2: Mid-distance Ancient Forest Canopy (Scroll factor: 0.25)
    const p2Offset = (camX * 0.25) % 500;
    ctx.fillStyle = '#10332f';
    for (let x = -p2Offset - 500; x < w + 500; x += 140) {
      // Gnarly oak silhouette
      const trunkH = h * 0.55;
      ctx.fillRect(x + 55, trunkH, 30, h - trunkH);
      // Canopy bulb
      ctx.beginPath();
      ctx.arc(x + 70, trunkH - 10, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 35, trunkH + 10, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 105, trunkH + 10, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Parallax Layer 3: Close Forest Silhouette with glowing fungi (Scroll factor: 0.45)
    const p3Offset = (camX * 0.45) % 600;
    ctx.fillStyle = '#0c2320';
    for (let x = -p3Offset - 600; x < w + 600; x += 220) {
      // Massive foreground trunks
      ctx.fillRect(x + 30, h * 0.2, 55, h * 0.8);

      // Hanging moss strands
      ctx.strokeStyle = '#1d4838';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 40, h * 0.35);
      ctx.lineTo(x + 38, h * 0.48);
      ctx.moveTo(x + 70, h * 0.38);
      ctx.lineTo(x + 72, h * 0.52);
      ctx.stroke();

      // Glowing shelf fungus on tree bark
      ctx.fillStyle = '#34d399';
      ctx.fillRect(x + 25, h * 0.42, 10, 4);
      ctx.fillRect(x + 75, h * 0.55, 12, 4);
    }
  }

  // --- PLATFORMS ---
  private renderPlatforms(platforms: Platform[], time: number) {
    const ctx = this.ctx;

    for (const p of platforms) {
      if (p.type === 'bouncy_mushroom') {
        this.renderBouncyMushroom(p, time);
        continue;
      }

      if (p.type === 'moving') {
        this.renderMovingLog(p, time);
        continue;
      }

      // Normal Mossy Ground / Stone Platform
      const isGround = p.height > 50;

      // Earth body
      ctx.fillStyle = '#271810';
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.width, p.height);

      // Inner dirt layers & stone patterns
      ctx.fillStyle = '#3b2518';
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y + 6), p.width, Math.min(22, p.height - 6));

      // Pixel pebble accents
      ctx.fillStyle = '#5c4033';
      for (let px = p.x + 8; px < p.x + p.width - 12; px += 32) {
        ctx.fillRect(Math.floor(px), Math.floor(p.y + 14), 6, 4);
      }
      ctx.fillStyle = '#4a5568';
      for (let px = p.x + 20; px < p.x + p.width - 16; px += 44) {
        ctx.fillRect(Math.floor(px), Math.floor(p.y + 20), 8, 5);
      }

      // Lush mossy grass fringe on top (Deep green + bright pixel tips)
      ctx.fillStyle = '#1e5e3a';
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.width, 6);

      ctx.fillStyle = '#34d399';
      // Jagged grass fringe
      for (let gx = p.x; gx < p.x + p.width; gx += 4) {
        const bladeH = ((gx * 7) % 5);
        ctx.fillRect(Math.floor(gx), Math.floor(p.y - bladeH), 3, bladeH + 2);
      }

      // Hanging moss tendrils on lower edges
      ctx.fillStyle = '#227248';
      for (let mx = p.x + 12; mx < p.x + p.width - 10; mx += 26) {
        const mossLen = ((mx * 11) % 7) + 3;
        ctx.fillRect(Math.floor(mx), Math.floor(p.y + 6), 3, mossLen);
      }
    }
  }

  // --- BOUNCY MUSHROOM ---
  private renderBouncyMushroom(p: Platform, time: number) {
    const ctx = this.ctx;
    const isBouncing = (p.bounceTimer ?? 0) > 0;
    const squishY = isBouncing ? 0.6 : 1.0;
    const squishX = isBouncing ? 1.3 : 1.0;

    const cx = p.x + p.width / 2;
    const cy = p.y + p.height;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(squishX, squishY);

    // Stem
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-8, -16, 16, 16);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-6, -12, 4, 12);

    // Vibrant Red Cap
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, -18, p.width * 0.48, 14, 0, Math.PI, 0);
    ctx.fill();

    // Cap underline
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-p.width * 0.44, -18, p.width * 0.88, 3);

    // White polka dots
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-10, -23, 3, 0, Math.PI * 2);
    ctx.arc(0, -26, 4, 0, Math.PI * 2);
    ctx.arc(10, -22, 3, 0, Math.PI * 2);
    ctx.fill();

    // Subtle magic glow
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.beginPath();
    ctx.arc(0, -22, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- MOVING LOG ---
  private renderMovingLog(p: Platform, time: number) {
    const ctx = this.ctx;
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);

    // Dark Bark Log
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y, p.width, p.height);

    // Wood Grain lines
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 4, y + 3, p.width - 8, p.height - 6);

    // Log Tree Rings on edges
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 2, y + 2, 4, p.height - 4);
    ctx.fillRect(x + p.width - 6, y + 2, 4, p.height - 4);

    // Green Moss on top
    ctx.fillStyle = '#10b981';
    for (let mx = x + 8; mx < x + p.width - 8; mx += 14) {
      ctx.fillRect(mx, y - 2, 8, 3);
    }
  }

  // --- HAZARDS (BRAMBLES & THORNS) ---
  private renderHazards(hazards: Hazard[], time: number) {
    const ctx = this.ctx;

    for (const h of hazards) {
      // Dark thorny ground
      ctx.fillStyle = '#1f132b';
      ctx.fillRect(Math.floor(h.x), Math.floor(h.y), h.width, h.height);

      // Sharp thorny spikes
      ctx.fillStyle = '#831843';
      for (let sx = h.x; sx < h.x + h.width; sx += 12) {
        ctx.beginPath();
        ctx.moveTo(sx, h.y + h.height);
        ctx.lineTo(sx + 6, h.y + 4);
        ctx.lineTo(sx + 12, h.y + h.height);
        ctx.closePath();
        ctx.fill();

        // Poisonous purple tip
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(sx + 5, h.y + 4, 2, 5);
        ctx.fillStyle = '#831843';
      }
    }
  }

  // --- COLLECTIBLES ---
  private renderCollectibles(collectibles: Collectible[], time: number) {
    const ctx = this.ctx;

    for (const c of collectibles) {
      if (c.collected) continue;

      const bob = Math.sin(time * 4 + c.bobOffset) * 4;
      const x = Math.floor(c.x);
      const y = Math.floor(c.y + bob);

      if (c.type === 'firefly') {
        // Glowing Firefly Fairy Orb
        // Outer soft glow
        const glow = ctx.createRadialGradient(x + 9, y + 9, 2, x + 9, y + 9, 16);
        glow.addColorStop(0, 'rgba(253, 224, 71, 0.7)');
        glow.addColorStop(0.5, 'rgba(163, 230, 53, 0.35)');
        glow.addColorStop(1, 'rgba(163, 230, 53, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x + 9, y + 9, 16, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x + 9, y + 9, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 8, y + 8, 2, 2);

        // Flapping translucent wings
        const wingFlap = Math.sin(time * 18 + c.bobOffset) * 3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(x + 6, y + 5 + wingFlap, 3, 2);
        ctx.fillRect(x + 10, y + 5 - wingFlap, 3, 2);
      } else if (c.type === 'golden_acorn') {
        // Golden Acorn
        // Glow
        const glow = ctx.createRadialGradient(x + 11, y + 11, 3, x + 11, y + 11, 20);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
        glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x + 11, y + 11, 20, 0, Math.PI * 2);
        ctx.fill();

        // Acorn cap (Dark bronze)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 4, y + 3, 14, 5);
        ctx.fillRect(x + 9, y + 1, 4, 3); // Stem

        // Nut body (Bright Gold)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(x + 11, y + 13, 7, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Golden highlight
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(x + 8, y + 10, 3, 5);
      } else if (c.type === 'heart') {
        // Forest Heart Berry
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 5);
        ctx.bezierCurveTo(x + 10, y + 2, x + 5, y + 1, x + 3, y + 5);
        ctx.bezierCurveTo(x + 1, y + 10, x + 6, y + 14, x + 10, y + 18);
        ctx.bezierCurveTo(x + 14, y + 14, x + 19, y + 10, x + 17, y + 5);
        ctx.bezierCurveTo(x + 15, y + 1, x + 10, y + 2, x + 10, y + 5);
        ctx.fill();

        // Shimmer
        ctx.fillStyle = '#fecaca';
        ctx.fillRect(x + 5, y + 5, 2, 3);
      }
    }
  }

  // --- ENEMIES ---
  private renderEnemies(enemies: Enemy[], time: number) {
    const ctx = this.ctx;

    for (const e of enemies) {
      if (!e.isAlive && e.squishTimer <= 0) continue;

      ctx.save();
      const cx = e.x + e.width / 2;
      const cy = e.y + e.height;

      // Handle squished state
      if (!e.isAlive) {
        // Squashed flat animation
        ctx.translate(cx, cy);
        ctx.scale(1.4, 0.25);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(-16, -16, 32, 16);
        ctx.restore();
        continue;
      }

      ctx.translate(cx, cy);
      if (e.facing === 'left') {
        ctx.scale(-1, 1);
      }

      if (e.type === 'mushroom') {
        // Seta Brava (Angry forest mushroom)
        const walkCycle = Math.sin(time * 10) * 2;

        // Feet
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-10, -5 + (walkCycle > 0 ? -2 : 0), 7, 5);
        ctx.fillRect(3, -5 + (walkCycle < 0 ? -2 : 0), 7, 5);

        // Stem
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(-8, -18, 16, 14);

        // Angry Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-5, -14, 3, 3);
        ctx.fillRect(2, -14, 3, 3);
        // Angry eyebrow angle
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-6, -16, 5, 2);
        ctx.fillRect(1, -16, 5, 2);

        // Cap (Deep wine red with spiked edge)
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.ellipse(0, -22, 16, 11, 0, Math.PI, 0);
        ctx.fill();

        // Cap lower trim
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-16, -22, 32, 4);

        // Spots
        ctx.fillStyle = '#fecaca';
        ctx.fillRect(-9, -28, 3, 3);
        ctx.fillRect(3, -29, 4, 3);
      } else if (e.type === 'beetle') {
        // Escarabajo Acorazado (Armored beetle, cannot be stomped)
        const legCycle = Math.sin(time * 16) * 3;

        // Spiky shell legs
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-14, -4 + legCycle, 4, 5);
        ctx.fillRect(-4, -4 - legCycle, 4, 5);
        ctx.fillRect(6, -4 + legCycle, 4, 5);

        // Purple-black armored carapace
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.ellipse(-2, -14, 15, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spikes on shell! (Visual cue that stomping hurts)
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-8, -27, 4, 4);
        ctx.fillRect(0, -28, 4, 4);
        ctx.fillRect(8, -25, 4, 4);

        // Glowing red predator eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(10, -15, 4, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, -14, 2, 2);

        // Mandibles / pincers
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(14, -10, 4, 3);
      } else if (e.type === 'bat') {
        // Murciélago Espectral (Flying bat)
        const wingFlap = Math.sin(time * 14) * 8;

        // Body
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.ellipse(0, -14, 7, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#4338ca';
        ctx.fillRect(-6, -26, 4, 6);
        ctx.fillRect(2, -26, 4, 6);

        // Yellow Eyes
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-4, -18, 3, 3);
        ctx.fillRect(2, -18, 3, 3);

        // Wings (Flapping up and down)
        ctx.fillStyle = '#1e1b4b';
        // Left Wing
        ctx.beginPath();
        ctx.moveTo(-5, -14);
        ctx.lineTo(-20, -14 + wingFlap);
        ctx.lineTo(-12, -6 + wingFlap * 0.5);
        ctx.closePath();
        ctx.fill();

        // Right Wing
        ctx.beginPath();
        ctx.moveTo(5, -14);
        ctx.lineTo(20, -14 + wingFlap);
        ctx.lineTo(12, -6 + wingFlap * 0.5);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- DUENDE (PLAYER) ---
  private renderPlayer(p: Player, time: number) {
    const ctx = this.ctx;

    // Invulnerability blink (flash transparent when hit)
    if (p.invulnerableTimer > 0 && Math.floor(time * 25) % 2 === 0) {
      return;
    }

    ctx.save();
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height;

    ctx.translate(cx, cy);

    // Apply squish & stretch on jump/landing
    ctx.scale(p.squishX, p.squishY);

    if (p.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // 1. Magical Lantern / Fairy Aura around Duende
    const aura = ctx.createRadialGradient(0, -18, 5, 0, -18, 40);
    aura.addColorStop(0, 'rgba(253, 224, 71, 0.22)');
    aura.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -18, 40, 0, Math.PI * 2);
    ctx.fill();

    // 2. Animated Legs & Boots
    const isMoving = Math.abs(p.vx) > 0.2 && p.grounded;
    const legOffset = isMoving ? Math.sin(time * 15) * 4 : 0;

    // Brown leather boots
    ctx.fillStyle = '#451a03';
    if (!p.grounded) {
      // Jumping pose: legs tucked slightly
      ctx.fillRect(-7, -5, 5, 5);
      ctx.fillRect(2, -7, 5, 5);
    } else {
      ctx.fillRect(-8, -4 + legOffset, 6, 5);
      ctx.fillRect(2, -4 - legOffset, 6, 5);
    }

    // 3. Torso: Moss-Green Tunic & Belt
    // Striped sleeves
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-8, -17, 4, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -15, 4, 2);

    // Tunic body
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-6, -20, 12, 14);

    // Brown leather belt with gold buckle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6, -10, 12, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-2, -10, 4, 3);

    // 4. Head & Face
    // Skin tone
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-5, -28, 10, 9);

    // Pointy Elf Ears!
    ctx.fillStyle = '#fdba74';
    ctx.beginPath();
    ctx.moveTo(-5, -24);
    ctx.lineTo(-10, -27);
    ctx.lineTo(-5, -21);
    ctx.closePath();
    ctx.fill();

    // Rosy Cheeks
    ctx.fillStyle = '#f87171';
    ctx.fillRect(1, -22, 2, 2);

    // Big expressive pixel eyes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, -25, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -26, 1, 1);

    // Cheerful smile
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(1, -21, 2, 1);

    // 5. Pointy Emerald Elf Hat with Gold Bell Tip!
    const hatFlutter = !p.grounded ? -4 : (isMoving ? Math.sin(time * 12) * 2 : 0);

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(-7, -27);
    ctx.lineTo(6, -27);
    ctx.lineTo(-2 + hatFlutter, -40);
    ctx.closePath();
    ctx.fill();

    // Hat rim
    ctx.fillStyle = '#14532d';
    ctx.fillRect(-7, -28, 14, 3);

    // Golden Bell on the tip of the hat
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-2 + hatFlutter, -41, 3, 0, Math.PI * 2);
    ctx.fill();

    // Little glowing spark on bell
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3 + hatFlutter, -42, 1, 1);

    ctx.restore();
  }

  // --- GOAL: THE ANCIENT RUNIC PORTAL ---
  private renderGoalBack(g: Goal, time: number) {
    const ctx = this.ctx;
    const cx = g.x + g.width / 2;
    const cy = g.y + g.height / 2;

    // Grand Mystical Portal Light Vortex (Drawn behind portal stones)
    const portalGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 75);
    portalGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    portalGrad.addColorStop(0.4, 'rgba(52, 211, 153, 0.55)');
    portalGrad.addColorStop(0.8, 'rgba(251, 191, 36, 0.25)');
    portalGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 75, 0, Math.PI * 2);
    ctx.fill();

    // Swirling energy vortex rings
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 1.5);
    for (let r = 0; r < 4; r++) {
      ctx.strokeStyle = r % 2 === 0 ? '#38bdf8' : '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24 + r * 10, 16 + r * 6, (r * Math.PI) / 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderGoalPortal(g: Goal, time: number) {
    const ctx = this.ctx;
    const x = Math.floor(g.x);
    const y = Math.floor(g.y);

    // Ancient Stone Megalith Pillars (Left & Right)
    ctx.fillStyle = '#334155';
    // Left Pillar
    ctx.fillRect(x, y + 10, 22, g.height - 10);
    // Right Pillar
    ctx.fillRect(x + g.width - 22, y + 10, 22, g.height - 10);
    // Top Arch Stone
    ctx.fillRect(x - 4, y, g.width + 8, 20);

    // Ancient carved runes glowing on the stone
    ctx.fillStyle = '#38bdf8';
    const runeGlow = (Math.sin(time * 4) + 1) * 0.5;
    ctx.globalAlpha = 0.5 + runeGlow * 0.5;

    // Left runes
    ctx.fillRect(x + 8, y + 26, 6, 2);
    ctx.fillRect(x + 10, y + 32, 2, 8);
    ctx.fillRect(x + 6, y + 46, 10, 3);
    ctx.fillRect(x + 8, y + 60, 6, 6);

    // Right runes
    ctx.fillRect(x + g.width - 16, y + 26, 6, 2);
    ctx.fillRect(x + g.width - 14, y + 36, 2, 8);
    ctx.fillRect(x + g.width - 18, y + 48, 10, 3);
    ctx.fillRect(x + g.width - 16, y + 62, 6, 6);

    // Arch Rune
    ctx.fillRect(x + g.width / 2 - 8, y + 6, 16, 4);
    ctx.fillRect(x + g.width / 2 - 2, y + 2, 4, 12);

    ctx.globalAlpha = 1.0;

    // Overgrown moss and ivy vines on the stones
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x - 2, y + 2, 8, 6);
    ctx.fillRect(x + 18, y + 4, 12, 4);
    ctx.fillRect(x + g.width - 12, y + 2, 10, 6);
    ctx.fillRect(x + 2, y + 30, 4, 14);
    ctx.fillRect(x + g.width - 6, y + 40, 4, 16);
  }

  // --- PARTICLES ---
  private renderParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'leaf') {
        // Fluttering forest leaf
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 1.5, p.size * 0.8, p.life * 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'portal_ember') {
        // Glowing cyan/gold ember
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dust puff or sparkle
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }

      ctx.restore();
    }
  }

  // --- AMBIENT FOREST LIGHTING ---
  private renderAmbientLighting(level: LevelConfig, time: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Vignette corners for deep retro forest mood
    const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.85);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(5, 12, 10, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Subtle scanline overlay for authentic CRT / 16-bit arcade screen feel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
  }
}
