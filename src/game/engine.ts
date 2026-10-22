import { Player, Enemy, Platform, Hazard, Collectible, Particle, Goal, LevelConfig, GameState } from './types';
import { soundEngine } from './audio';

export interface GameStats {
  score: number;
  firefliesCollected: number;
  totalFireflies: number;
  acornsCollected: number;
  timeElapsed: number;
  livesRemaining: number;
}

export class GameEngine {
  public player: Player;
  public enemies: Enemy[];
  public platforms: Platform[];
  public hazards: Hazard[];
  public collectibles: Collectible[];
  public particles: Particle[];
  public goal: Goal;
  public level: LevelConfig;
  public state: GameState = 'MENU';

  // Stats
  public stats: GameStats = {
    score: 0,
    firefliesCollected: 0,
    totalFireflies: 0,
    acornsCollected: 0,
    timeElapsed: 0,
    livesRemaining: 3
  };

  // Camera
  public cameraX: number = 0;
  public cameraY: number = 0;
  public viewportWidth: number = 800;
  public viewportHeight: number = 500;

  // Effects
  public screenShake: number = 0;
  public gameTime: number = 0;

  // Controls input state
  public input = {
    left: false,
    right: false,
    up: false,
    down: false,
    jumpPressed: false,
    jumpHeld: false
  };

  // Callbacks
  public onStateChange?: (state: GameState, stats: GameStats) => void;

  constructor(level: LevelConfig, viewW: number, viewH: number) {
    this.viewportWidth = viewW;
    this.viewportHeight = viewH;
    this.level = level;

    this.player = this.createPlayer(level.playerStart.x, level.playerStart.y);
    this.platforms = JSON.parse(JSON.stringify(level.platforms));
    this.enemies = JSON.parse(JSON.stringify(level.enemies));
    this.hazards = JSON.parse(JSON.stringify(level.hazards));
    this.collectibles = JSON.parse(JSON.stringify(level.collectibles));
    this.goal = { ...level.goal };
    this.particles = [];

    this.initStats();
  }

  private createPlayer(x: number, y: number): Player {
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      width: 24,
      height: 32,
      facing: 'right',
      grounded: false,
      isJumping: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      health: 3,
      maxHealth: 3,
      invulnerableTimer: 0,
      squishX: 1,
      squishY: 1,
      animFrame: 0,
      animTimer: 0
    };
  }

  private initStats() {
    const totalFlies = this.collectibles.filter(c => c.type === 'firefly').length;
    this.stats = {
      score: 0,
      firefliesCollected: 0,
      totalFireflies: totalFlies,
      acornsCollected: 0,
      timeElapsed: 0,
      livesRemaining: 3
    };
  }

  public loadLevel(level: LevelConfig) {
    this.level = level;
    this.player = this.createPlayer(level.playerStart.x, level.playerStart.y);
    this.platforms = JSON.parse(JSON.stringify(level.platforms));
    this.enemies = JSON.parse(JSON.stringify(level.enemies));
    this.hazards = JSON.parse(JSON.stringify(level.hazards));
    this.collectibles = JSON.parse(JSON.stringify(level.collectibles));
    this.goal = { ...level.goal };
    this.particles = [];
    this.cameraX = 0;
    this.cameraY = 0;
    this.screenShake = 0;
    this.initStats();
  }

  public restartCurrentLevel() {
    this.loadLevel(this.level);
    this.state = 'PLAYING';
    soundEngine.startAmbient();
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING') {
      // Keep ambient particle drift when menu/paused
      this.updateAmbientParticles();
      return;
    }

    this.gameTime += dt;
    this.stats.timeElapsed += dt;

    // Decay screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Update Player
    this.updatePlayer(dt);

    // Update Moving Platforms
    this.updatePlatforms(dt);

    // Update Enemies
    this.updateEnemies(dt);

    // Check Collisions
    this.checkPlatformCollisions();
    this.checkEnemyCollisions();
    this.checkHazardCollisions();
    this.checkCollectibleCollisions();
    this.checkGoalCollision();

    // Check Chasm Fall
    if (this.player.y > this.level.height + 60) {
      this.handlePlayerHurt(2);
      this.respawnPlayer();
    }

    // Update Particles
    this.updateParticles(dt);

    // Update Camera
    this.updateCamera();

    // Notify UI of stats update
    this.stats.livesRemaining = this.player.health;
  }

  private respawnPlayer() {
    this.player.x = this.level.playerStart.x;
    this.player.y = this.level.playerStart.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.invulnerableTimer = 60;
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Squish recovery
    p.squishX += (1 - p.squishX) * 0.2;
    p.squishY += (1 - p.squishY) * 0.2;

    // Invulnerability timer
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer--;
    }

    // Coyote time & Jump buffer countdown
    if (p.grounded) {
      p.coyoteTimer = 7;
    } else if (p.coyoteTimer > 0) {
      p.coyoteTimer--;
    }

    if (this.input.jumpPressed) {
      p.jumpBufferTimer = 6;
      this.input.jumpPressed = false; // consume
    } else if (p.jumpBufferTimer > 0) {
      p.jumpBufferTimer--;
    }

    // Horizontal Movement
    const accel = p.grounded ? 0.75 : 0.55;
    const friction = p.grounded ? 0.82 : 0.91;
    const maxSpeed = 3.8;

    if (this.input.left) {
      p.vx -= accel;
      p.facing = 'left';
    } else if (this.input.right) {
      p.vx += accel;
      p.facing = 'right';
    } else {
      p.vx *= friction;
      if (Math.abs(p.vx) < 0.08) p.vx = 0;
    }

    // Clamp horizontal speed
    p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));

    // Jump Initiation (via buffer + coyote time)
    if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
      p.vy = -9.2;
      p.grounded = false;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      p.isJumping = true;
      p.squishX = 0.75;
      p.squishY = 1.35;
      soundEngine.playJump();

      // Spawn dust puff particles
      this.spawnDust(p.x + p.width / 2, p.y + p.height, 5);
    }

    // Variable Jump Height (cutting upward velocity on release)
    if (!this.input.jumpHeld && p.vy < -2.5 && p.isJumping) {
      p.vy *= 0.52;
    }

    // Gravity
    const gravity = 0.44;
    p.vy += gravity;
    const maxFallSpeed = 10;
    if (p.vy > maxFallSpeed) p.vy = maxFallSpeed;

    // Apply movement
    p.x += p.vx;
    p.y += p.vy;

    // Clamp inside left level boundary
    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }
  }

  private updatePlatforms(dt: number) {
    for (const p of this.platforms) {
      if (p.type === 'moving' && p.minX !== undefined && p.maxX !== undefined) {
        const speed = p.vx ?? 1.2;
        const dir = p.movingDir ?? 1;
        p.x += speed * dir;

        if (p.x > p.maxX) {
          p.x = p.maxX;
          p.movingDir = -1;
        } else if (p.x < p.minX) {
          p.x = p.minX;
          p.movingDir = 1;
        }

        // If player is riding this platform, move player along
        const playerBottom = this.player.y + this.player.height;
        if (
          this.player.grounded &&
          playerBottom >= p.y - 2 &&
          playerBottom <= p.y + 8 &&
          this.player.x + this.player.width > p.x &&
          this.player.x < p.x + p.width
        ) {
          this.player.x += speed * (p.movingDir ?? 1);
        }
      }

      if (p.bounceTimer && p.bounceTimer > 0) {
        p.bounceTimer--;
      }
    }
  }

  private updateEnemies(dt: number) {
    for (const e of this.enemies) {
      if (!e.isAlive) {
        if (e.squishTimer > 0) e.squishTimer--;
        continue;
      }

      e.animTimer += dt;

      if (e.type === 'mushroom' || e.type === 'beetle') {
        // Ground Patrol
        e.x += e.vx;
        if (e.x > e.maxX) {
          e.x = e.maxX;
          e.vx = -Math.abs(e.vx);
          e.facing = 'left';
        } else if (e.x < e.minX) {
          e.x = e.minX;
          e.vx = Math.abs(e.vx);
          e.facing = 'right';
        }
      } else if (e.type === 'bat') {
        // Flying Bat: sinus wave flight
        e.x += e.vx;
        e.y = e.startY + Math.sin(this.gameTime * 4 + e.x * 0.02) * 22;

        if (e.x > e.maxX) {
          e.x = e.maxX;
          e.vx = -Math.abs(e.vx);
          e.facing = 'left';
        } else if (e.x < e.minX) {
          e.x = e.minX;
          e.vx = Math.abs(e.vx);
          e.facing = 'right';
        }
      }
    }
  }

  private checkPlatformCollisions() {
    const p = this.player;
    let onGroundThisFrame = false;

    for (const plat of this.platforms) {
      // AABB overlap check
      const overlapsX = p.x + p.width > plat.x && p.x < plat.x + plat.width;
      const overlapsY = p.y + p.height > plat.y && p.y < plat.y + plat.height;

      if (!overlapsX) continue;

      // Check landing on top (falling down)
      const prevBottom = p.y + p.height - p.vy;
      if (p.vy >= 0 && prevBottom <= plat.y + 6 && p.y + p.height >= plat.y) {
        // Landed on platform!
        p.y = plat.y - p.height;
        p.vy = 0;
        p.grounded = true;
        p.isJumping = false;
        onGroundThisFrame = true;

        // Bouncy Mushroom interaction
        if (plat.type === 'bouncy_mushroom') {
          p.vy = -12.2; // Super high spring jump!
          p.grounded = false;
          p.isJumping = true;
          p.squishX = 0.7;
          p.squishY = 1.45;
          plat.bounceTimer = 12;
          soundEngine.playSpring();

          // Spawn bouncy spores
          this.spawnSparkles(plat.x + plat.width / 2, plat.y, '#f87171', 8);
        }
      } else if (plat.type === 'solid' && overlapsY) {
        // Solid side & bottom collisions
        if (p.vy < 0 && p.y < plat.y + plat.height && prevBottom > plat.y + plat.height) {
          // Hit ceiling
          p.y = plat.y + plat.height;
          p.vy = 0;
        } else if (p.vx > 0 && p.x + p.width >= plat.x && p.x < plat.x) {
          // Hit left wall
          p.x = plat.x - p.width;
          p.vx = 0;
        } else if (p.vx < 0 && p.x <= plat.x + plat.width && p.x + p.width > plat.x + plat.width) {
          // Hit right wall
          p.x = plat.x + plat.width;
          p.vx = 0;
        }
      }
    }

    if (!onGroundThisFrame && p.grounded) {
      p.grounded = false;
    }
  }

  private checkEnemyCollisions() {
    const p = this.player;

    for (const e of this.enemies) {
      if (!e.isAlive) continue;

      // AABB overlap check
      const overlapsX = p.x + p.width > e.x + 4 && p.x < e.x + e.width - 4;
      const overlapsY = p.y + p.height > e.y && p.y < e.y + e.height;

      if (overlapsX && overlapsY) {
        // Can it be stomped from above?
        const isFallingOnTop = p.vy > 0 && (p.y + p.height - p.vy) <= e.y + e.height * 0.55;

        if (e.canBeStomped && isFallingOnTop) {
          // STOMP SUCCESS!
          e.isAlive = false;
          e.squishTimer = 25;
          p.vy = -7.5; // Bounce up
          p.squishX = 1.35;
          p.squishY = 0.7;
          this.stats.score += 150;
          soundEngine.playStomp();

          // Defeat star particles
          this.spawnSparkles(e.x + e.width / 2, e.y + e.height / 2, '#fbbf24', 12);
        } else {
          // Player takes damage!
          if (p.invulnerableTimer <= 0) {
            this.handlePlayerHurt(1);
            // Knockback
            p.vx = p.facing === 'right' ? -4 : 4;
            p.vy = -4.5;
          }
        }
      }
    }
  }

  private checkHazardCollisions() {
    const p = this.player;

    for (const h of this.hazards) {
      const overlapsX = p.x + p.width > h.x && p.x < h.x + h.width;
      const overlapsY = p.y + p.height > h.y + 4 && p.y < h.y + h.height;

      if (overlapsX && overlapsY) {
        if (p.invulnerableTimer <= 0) {
          this.handlePlayerHurt(1);
          p.vy = -7.0; // Jump back from thorns
          p.vx = p.facing === 'right' ? -3 : 3;
        }
      }
    }
  }

  private checkCollectibleCollisions() {
    const p = this.player;

    for (const c of this.collectibles) {
      if (c.collected) continue;

      const overlapsX = p.x + p.width > c.x && p.x < c.x + c.width;
      const overlapsY = p.y + p.height > c.y && p.y < c.y + c.height;

      if (overlapsX && overlapsY) {
        c.collected = true;
        this.stats.score += c.value;

        if (c.type === 'firefly') {
          this.stats.firefliesCollected++;
          soundEngine.playFirefly();
          this.spawnSparkles(c.x + c.width / 2, c.y + c.height / 2, '#fde047', 8);
        } else if (c.type === 'golden_acorn') {
          this.stats.acornsCollected++;
          soundEngine.playAcorn();
          this.spawnSparkles(c.x + c.width / 2, c.y + c.height / 2, '#f59e0b', 14);
        } else if (c.type === 'heart') {
          p.health = Math.min(p.maxHealth, p.health + 1);
          soundEngine.playHeart();
          this.spawnSparkles(c.x + c.width / 2, c.y + c.height / 2, '#ef4444', 10);
        }
      }
    }
  }

  private checkGoalCollision() {
    const p = this.player;
    const g = this.goal;

    const overlapsX = p.x + p.width > g.x + 15 && p.x < g.x + g.width - 15;
    const overlapsY = p.y + p.height > g.y + 10 && p.y < g.y + g.height;

    if (overlapsX && overlapsY) {
      // VICTORY REACHED!
      this.state = 'VICTORY';
      soundEngine.stopAmbient();
      soundEngine.playVictory();

      // Bonus score for remaining health & speed
      this.stats.score += p.health * 300;
      if (this.stats.timeElapsed < 60) {
        this.stats.score += Math.floor((60 - this.stats.timeElapsed) * 15);
      }

      // Massive portal confetti particles
      this.spawnVictoryExplosion(g.x + g.width / 2, g.y + g.height / 2);

      if (this.onStateChange) {
        this.onStateChange('VICTORY', this.stats);
      }
    }
  }

  private handlePlayerHurt(damage: number) {
    this.player.health -= damage;
    this.player.invulnerableTimer = 90; // 1.5s i-frames
    this.screenShake = 12;
    soundEngine.playHurt();

    // Red damage particles
    this.spawnSparkles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ef4444', 10);

    if (this.player.health <= 0) {
      this.player.health = 0;
      this.state = 'GAME_OVER';
      soundEngine.stopAmbient();
      soundEngine.playGameOver();

      if (this.onStateChange) {
        this.onStateChange('GAME_OVER', this.stats);
      }
    }
  }

  private updateCamera() {
    // Center camera on player with smooth lerp
    const targetCamX = this.player.x - this.viewportWidth * 0.42;
    const targetCamY = this.player.y - this.viewportHeight * 0.58;

    this.cameraX += (targetCamX - this.cameraX) * 0.08;
    this.cameraY += (targetCamY - this.cameraY) * 0.06;

    // Clamp camera within level bounds
    const maxCamX = Math.max(0, this.level.width - this.viewportWidth);
    const maxCamY = Math.max(0, this.level.height - this.viewportHeight);

    this.cameraX = Math.max(0, Math.min(maxCamX, this.cameraX));
    this.cameraY = Math.max(0, Math.min(maxCamY, this.cameraY));
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx;
      p.y += p.vy;

      if (p.type === 'leaf') {
        p.vx += Math.sin(this.gameTime * 3 + p.y * 0.05) * 0.04;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Ambient floating leaves & fireflies spawn
    if (Math.random() < 0.15 && this.particles.length < 90) {
      const spawnX = this.cameraX + Math.random() * this.viewportWidth;
      const spawnY = this.cameraY - 10;
      this.particles.push({
        x: spawnX,
        y: spawnY,
        vx: -0.4 + Math.random() * 0.8,
        vy: 0.5 + Math.random() * 0.8,
        life: 5.0,
        maxLife: 5.0,
        color: Math.random() > 0.5 ? '#10b981' : '#f59e0b',
        size: 3,
        type: 'leaf'
      });
    }

    // Goal portal swirling sparks
    if (Math.random() < 0.4) {
      const g = this.goal;
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 30;
      this.particles.push({
        x: g.x + g.width / 2 + Math.cos(angle) * dist,
        y: g.y + g.height / 2 + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * 0.6,
        vy: -Math.sin(angle) * 0.6,
        life: 1.2,
        maxLife: 1.2,
        color: Math.random() > 0.5 ? '#38bdf8' : '#34d399',
        size: 2,
        type: 'portal_ember'
      });
    }
  }

  private updateAmbientParticles() {
    if (Math.random() < 0.1 && this.particles.length < 30) {
      this.particles.push({
        x: Math.random() * this.viewportWidth,
        y: Math.random() * this.viewportHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        life: 4.0,
        maxLife: 4.0,
        color: '#34d399',
        size: 2,
        type: 'sparkle'
      });
    }
  }

  private spawnDust(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y - 2,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -Math.random() * 1.2,
        life: 0.4,
        maxLife: 0.4,
        color: '#94a3b8',
        size: 3,
        type: 'dust'
      });
    }
  }

  private spawnSparkles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.2 + Math.random() * 2.4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6,
        maxLife: 0.6,
        color,
        size: 3,
        type: 'sparkle'
      });
    }
  }

  private spawnVictoryExplosion(x: number, y: number) {
    const colors = ['#facc15', '#38bdf8', '#34d399', '#f43f5e', '#a855f7'];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.8,
        maxLife: 1.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.floor(Math.random() * 3),
        type: 'sparkle'
      });
    }
  }
}
