export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export type EnemyType = 'mushroom' | 'beetle' | 'bat';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  grounded: boolean;
  isJumping: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  health: number;
  maxHealth: number;
  invulnerableTimer: number;
  squishX: number;
  squishY: number;
  animFrame: number;
  animTimer: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  minX: number;
  maxX: number;
  startY: number;
  facing: 'left' | 'right';
  isAlive: boolean;
  squishTimer: number;
  animTimer: number;
  speed: number;
  canBeStomped: boolean;
}

export type PlatformType = 'solid' | 'one-way' | 'moving' | 'bouncy_mushroom';

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  vx?: number;
  minX?: number;
  maxX?: number;
  movingDir?: number;
  bounceTimer?: number;
}

export interface Hazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'brambles' | 'spikes';
}

export type CollectibleType = 'firefly' | 'golden_acorn' | 'heart';

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: CollectibleType;
  collected: boolean;
  bobOffset: number;
  value: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'leaf' | 'sparkle' | 'dust' | 'puff' | 'portal_ember';
}

export interface Goal {
  x: number;
  y: number;
  width: number;
  height: number;
  pulseTimer: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  platforms: Platform[];
  enemies: Enemy[];
  hazards: Hazard[];
  collectibles: Collectible[];
  goal: Goal;
  ambientLight: string;
}
