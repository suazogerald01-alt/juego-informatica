import { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Nivel 1: El Sendero del Musgo",
    description: "Aprende a moverte, salta sobre setas elásticas y esquiva a las setas gruñonas.",
    width: 2800,
    height: 600,
    playerStart: { x: 80, y: 400 },
    ambientLight: 'rgba(20, 45, 30, 0.2)',
    platforms: [
      // Starting base ground
      { id: 'g1', x: 0, y: 500, width: 600, height: 100, type: 'solid' },
      // First elevated mossy stone ledge
      { id: 'p1', x: 260, y: 410, width: 140, height: 28, type: 'solid' },
      { id: 'p2', x: 440, y: 340, width: 120, height: 28, type: 'solid' },

      // Bouncy mushroom to jump high over pit
      { id: 'bm1', x: 580, y: 476, width: 56, height: 24, type: 'bouncy_mushroom' },

      // Second ground section with gap
      { id: 'g2', x: 680, y: 500, width: 500, height: 100, type: 'solid' },
      { id: 'p3', x: 780, y: 390, width: 160, height: 28, type: 'solid' },
      { id: 'p4', x: 1000, y: 320, width: 140, height: 28, type: 'solid' },

      // Moving log platform
      { id: 'm1', x: 1220, y: 420, width: 120, height: 24, type: 'moving', minX: 1200, maxX: 1420, vx: 1.2, movingDir: 1 },

      // Third ground section
      { id: 'g3', x: 1480, y: 500, width: 620, height: 100, type: 'solid' },
      { id: 'p5', x: 1560, y: 410, width: 130, height: 26, type: 'solid' },
      { id: 'bm2', x: 1740, y: 476, width: 56, height: 24, type: 'bouncy_mushroom' },
      { id: 'p6', x: 1820, y: 310, width: 180, height: 28, type: 'solid' },

      // High floating branch
      { id: 'p7', x: 2040, y: 370, width: 140, height: 26, type: 'solid' },

      // Final stretch to the portal
      { id: 'g4', x: 2220, y: 500, width: 580, height: 100, type: 'solid' },
      { id: 'p8', x: 2360, y: 420, width: 130, height: 26, type: 'solid' }
    ],
    hazards: [
      // Bramble hazard in first pit
      { id: 'h1', x: 600, y: 560, width: 80, height: 40, type: 'brambles' },
      // Brambles in moving log pit
      { id: 'h2', x: 1180, y: 560, width: 300, height: 40, type: 'brambles' },
      // Brambles in final gap
      { id: 'h3', x: 2100, y: 560, width: 120, height: 40, type: 'brambles' }
    ],
    enemies: [
      // Ground patrol mushrooms
      {
        id: 'e1',
        type: 'mushroom',
        x: 320,
        y: 468,
        vx: 1.0,
        vy: 0,
        width: 32,
        height: 32,
        minX: 180,
        maxX: 520,
        startY: 468,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.0,
        canBeStomped: true
      },
      {
        id: 'e2',
        type: 'mushroom',
        x: 820,
        y: 468,
        vx: -1.0,
        vy: 0,
        width: 32,
        height: 32,
        minX: 720,
        maxX: 1120,
        startY: 468,
        facing: 'left',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.1,
        canBeStomped: true
      },
      {
        id: 'e3',
        type: 'mushroom',
        x: 1600,
        y: 468,
        vx: 1.2,
        vy: 0,
        width: 32,
        height: 32,
        minX: 1500,
        maxX: 1980,
        startY: 468,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.2,
        canBeStomped: true
      },
      // Flying bat near tree branches
      {
        id: 'e4',
        type: 'bat',
        x: 1850,
        y: 240,
        vx: 1.5,
        vy: 0,
        width: 30,
        height: 24,
        minX: 1750,
        maxX: 2100,
        startY: 240,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.5,
        canBeStomped: false
      },
      {
        id: 'e5',
        type: 'mushroom',
        x: 2420,
        y: 468,
        vx: 1.0,
        vy: 0,
        width: 32,
        height: 32,
        minX: 2280,
        maxX: 2560,
        startY: 468,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.0,
        canBeStomped: true
      }
    ],
    collectibles: [
      // Fireflies
      { id: 'c1', x: 280, y: 360, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 0, value: 50 },
      { id: 'c2', x: 330, y: 360, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 1, value: 50 },
      { id: 'c3', x: 470, y: 290, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 2, value: 50 },
      { id: 'c4', x: 600, y: 350, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 3, value: 50 },
      { id: 'c5', x: 800, y: 340, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 4, value: 50 },
      { id: 'c6', x: 850, y: 340, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 5, value: 50 },
      { id: 'c7', x: 1040, y: 270, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 6, value: 50 },
      { id: 'c8', x: 1260, y: 360, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 7, value: 50 },
      { id: 'c9', x: 1340, y: 360, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 8, value: 50 },
      { id: 'c10', x: 1580, y: 360, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 9, value: 50 },
      { id: 'c11', x: 1760, y: 350, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 10, value: 50 },
      { id: 'c12', x: 1860, y: 260, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 11, value: 50 },
      { id: 'c13', x: 1920, y: 260, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 12, value: 50 },
      { id: 'c14', x: 2080, y: 320, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 13, value: 50 },
      { id: 'c15', x: 2380, y: 370, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 14, value: 50 },
      // Golden Acorns
      { id: 'ga1', x: 1060, y: 230, width: 22, height: 22, type: 'golden_acorn', collected: false, bobOffset: 0, value: 200 },
      { id: 'ga2', x: 1900, y: 210, width: 22, height: 22, type: 'golden_acorn', collected: false, bobOffset: 2, value: 200 },
      // Heart berry
      { id: 'hp1', x: 1620, y: 460, width: 20, height: 20, type: 'heart', collected: false, bobOffset: 1, value: 100 }
    ],
    goal: {
      x: 2620,
      y: 390,
      width: 70,
      height: 110,
      pulseTimer: 0
    }
  },
  {
    id: 2,
    name: "Nivel 2: Las Raíces Sombrías",
    description: "Cuidado con los escarabajos acorazados y los murciélagos. Usa las plataformas móviles.",
    width: 3400,
    height: 650,
    playerStart: { x: 80, y: 420 },
    ambientLight: 'rgba(15, 25, 45, 0.28)',
    platforms: [
      { id: 'l2_g1', x: 0, y: 520, width: 450, height: 130, type: 'solid' },
      { id: 'l2_p1', x: 240, y: 430, width: 130, height: 26, type: 'solid' },
      { id: 'l2_bm1', x: 420, y: 496, width: 56, height: 24, type: 'bouncy_mushroom' },

      // Moving log 1
      { id: 'l2_m1', x: 530, y: 420, width: 110, height: 24, type: 'moving', minX: 500, maxX: 720, vx: 1.4, movingDir: 1 },

      // Island 2
      { id: 'l2_g2', x: 780, y: 520, width: 400, height: 130, type: 'solid' },
      { id: 'l2_p2', x: 880, y: 410, width: 140, height: 26, type: 'solid' },
      { id: 'l2_p3', x: 1040, y: 320, width: 120, height: 26, type: 'solid' },

      // Moving vertical or horizontal log 2
      { id: 'l2_m2', x: 1240, y: 380, width: 110, height: 24, type: 'moving', minX: 1200, maxX: 1450, vx: 1.6, movingDir: -1 },

      // Island 3 with bouncy mushroom
      { id: 'l2_g3', x: 1520, y: 520, width: 480, height: 130, type: 'solid' },
      { id: 'l2_bm2', x: 1600, y: 496, width: 56, height: 24, type: 'bouncy_mushroom' },
      { id: 'l2_p4', x: 1700, y: 360, width: 150, height: 26, type: 'solid' },
      { id: 'l2_p5', x: 1880, y: 280, width: 130, height: 26, type: 'solid' },

      // Moving log 3
      { id: 'l2_m3', x: 2080, y: 360, width: 120, height: 24, type: 'moving', minX: 2040, maxX: 2300, vx: 1.8, movingDir: 1 },

      // High tree canopy
      { id: 'l2_p6', x: 2360, y: 420, width: 140, height: 26, type: 'solid' },
      { id: 'l2_bm3', x: 2540, y: 396, width: 56, height: 24, type: 'bouncy_mushroom' },
      { id: 'l2_p7', x: 2640, y: 270, width: 160, height: 26, type: 'solid' },

      // Final ground
      { id: 'l2_g4', x: 2860, y: 520, width: 540, height: 130, type: 'solid' },
      { id: 'l2_p8', x: 2980, y: 430, width: 140, height: 26, type: 'solid' }
    ],
    hazards: [
      { id: 'l2_h1', x: 450, y: 590, width: 330, height: 60, type: 'brambles' },
      { id: 'l2_h2', x: 1180, y: 590, width: 340, height: 60, type: 'brambles' },
      { id: 'l2_h3', x: 2000, y: 590, width: 860, height: 60, type: 'brambles' }
    ],
    enemies: [
      // Beetle (spiky, fast, can't be stomped!)
      {
        id: 'l2_e1',
        type: 'beetle',
        x: 200,
        y: 488,
        vx: 1.8,
        vy: 0,
        width: 34,
        height: 28,
        minX: 120,
        maxX: 380,
        startY: 488,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.8,
        canBeStomped: false
      },
      // Bat 1
      {
        id: 'l2_e2',
        type: 'bat',
        x: 620,
        y: 280,
        vx: 1.6,
        vy: 0,
        width: 30,
        height: 24,
        minX: 520,
        maxX: 760,
        startY: 280,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.6,
        canBeStomped: false
      },
      // Stompable mushroom
      {
        id: 'l2_e3',
        type: 'mushroom',
        x: 920,
        y: 488,
        vx: 1.2,
        vy: 0,
        width: 32,
        height: 32,
        minX: 800,
        maxX: 1140,
        startY: 488,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.2,
        canBeStomped: true
      },
      // Beetle on platform
      {
        id: 'l2_e4',
        type: 'beetle',
        x: 1720,
        y: 488,
        vx: 2.0,
        vy: 0,
        width: 34,
        height: 28,
        minX: 1660,
        maxX: 1960,
        startY: 488,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 2.0,
        canBeStomped: false
      },
      // Bat 2
      {
        id: 'l2_e5',
        type: 'bat',
        x: 2160,
        y: 240,
        vx: 1.8,
        vy: 0,
        width: 30,
        height: 24,
        minX: 2060,
        maxX: 2340,
        startY: 240,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.8,
        canBeStomped: false
      },
      // Mushroom guard near goal
      {
        id: 'l2_e6',
        type: 'mushroom',
        x: 3020,
        y: 488,
        vx: 1.0,
        vy: 0,
        width: 32,
        height: 32,
        minX: 2900,
        maxX: 3180,
        startY: 488,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.0,
        canBeStomped: true
      }
    ],
    collectibles: [
      { id: 'l2_c1', x: 260, y: 380, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 0, value: 50 },
      { id: 'l2_c2', x: 580, y: 360, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 1, value: 50 },
      { id: 'l2_c3', x: 920, y: 360, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 2, value: 50 },
      { id: 'l2_c4', x: 1080, y: 270, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 3, value: 50 },
      { id: 'l2_c5', x: 1300, y: 320, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 4, value: 50 },
      { id: 'l2_c6', x: 1740, y: 310, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 5, value: 50 },
      { id: 'l2_c7', x: 1920, y: 230, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 6, value: 50 },
      { id: 'l2_c8', x: 2150, y: 300, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 7, value: 50 },
      { id: 'l2_c9', x: 2700, y: 220, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 8, value: 50 },
      { id: 'l2_c10', x: 3040, y: 380, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 9, value: 50 },
      // Golden Acorns
      { id: 'l2_ga1', x: 1100, y: 190, width: 22, height: 22, type: 'golden_acorn', collected: false, bobOffset: 1, value: 200 },
      { id: 'l2_ga2', x: 2720, y: 160, width: 22, height: 22, type: 'golden_acorn', collected: false, bobOffset: 2, value: 200 },
      // Heart
      { id: 'l2_hp1', x: 1840, y: 480, width: 20, height: 20, type: 'heart', collected: false, bobOffset: 0, value: 100 }
    ],
    goal: {
      x: 3220,
      y: 410,
      width: 70,
      height: 110,
      pulseTimer: 0
    }
  },
  {
    id: 3,
    name: "Nivel 3: El Gran Roble Sagrado",
    description: "El templo sagrado de los duendes. Saltos precisos en el dosel del bosque para activar el portal final.",
    width: 3800,
    height: 700,
    playerStart: { x: 80, y: 460 },
    ambientLight: 'rgba(25, 20, 50, 0.3)',
    platforms: [
      { id: 'l3_g1', x: 0, y: 560, width: 400, height: 140, type: 'solid' },
      { id: 'l3_p1', x: 220, y: 460, width: 120, height: 26, type: 'solid' },
      { id: 'l3_bm1', x: 360, y: 536, width: 56, height: 24, type: 'bouncy_mushroom' },

      // High floating branch chain
      { id: 'l3_p2', x: 480, y: 390, width: 140, height: 26, type: 'solid' },
      { id: 'l3_m1', x: 670, y: 340, width: 110, height: 24, type: 'moving', minX: 650, maxX: 880, vx: 1.8, movingDir: 1 },
      { id: 'l3_p3', x: 940, y: 280, width: 150, height: 26, type: 'solid' },

      // Descent to mid-island
      { id: 'l3_bm2', x: 1040, y: 256, width: 56, height: 24, type: 'bouncy_mushroom' },
      { id: 'l3_p4', x: 1180, y: 190, width: 140, height: 26, type: 'solid' },
      { id: 'l3_g2', x: 1360, y: 560, width: 440, height: 140, type: 'solid' },
      { id: 'l3_p5', x: 1460, y: 450, width: 130, height: 26, type: 'solid' },

      // Double moving platforms over thorny chasm
      { id: 'l3_m2', x: 1850, y: 460, width: 100, height: 24, type: 'moving', minX: 1830, maxX: 2060, vx: 2.0, movingDir: 1 },
      { id: 'l3_m3', x: 2130, y: 390, width: 100, height: 24, type: 'moving', minX: 2100, maxX: 2340, vx: -2.0, movingDir: -1 },

      // High tree canopy sanctuary
      { id: 'l3_g3', x: 2420, y: 560, width: 420, height: 140, type: 'solid' },
      { id: 'l3_bm3', x: 2460, y: 536, width: 56, height: 24, type: 'bouncy_mushroom' },
      { id: 'l3_p6', x: 2560, y: 380, width: 160, height: 26, type: 'solid' },
      { id: 'l3_p7', x: 2780, y: 300, width: 140, height: 26, type: 'solid' },

      // Final moving log to portal altar
      { id: 'l3_m4', x: 2980, y: 360, width: 120, height: 24, type: 'moving', minX: 2950, maxX: 3220, vx: 1.5, movingDir: 1 },

      // Sanctuary platform
      { id: 'l3_g4', x: 3300, y: 540, width: 500, height: 160, type: 'solid' },
      { id: 'l3_p8', x: 3420, y: 440, width: 160, height: 28, type: 'solid' }
    ],
    hazards: [
      { id: 'l3_h1', x: 400, y: 630, width: 960, height: 70, type: 'brambles' },
      { id: 'l3_h2', x: 1800, y: 630, width: 620, height: 70, type: 'brambles' },
      { id: 'l3_h3', x: 2840, y: 630, width: 460, height: 70, type: 'brambles' }
    ],
    enemies: [
      // Patrol Beetle
      {
        id: 'l3_e1',
        type: 'beetle',
        x: 180,
        y: 528,
        vx: 2.2,
        vy: 0,
        width: 34,
        height: 28,
        minX: 100,
        maxX: 340,
        startY: 528,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 2.2,
        canBeStomped: false
      },
      // Swooping Bat 1
      {
        id: 'l3_e2',
        type: 'bat',
        x: 750,
        y: 220,
        vx: 2.0,
        vy: 0,
        width: 30,
        height: 24,
        minX: 640,
        maxX: 900,
        startY: 220,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 2.0,
        canBeStomped: false
      },
      // Mushroom on island 2
      {
        id: 'l3_e3',
        type: 'mushroom',
        x: 1450,
        y: 528,
        vx: 1.4,
        vy: 0,
        width: 32,
        height: 32,
        minX: 1380,
        maxX: 1720,
        startY: 528,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.4,
        canBeStomped: true
      },
      // Bat 2
      {
        id: 'l3_e4',
        type: 'bat',
        x: 2000,
        y: 310,
        vx: 2.0,
        vy: 0,
        width: 30,
        height: 24,
        minX: 1880,
        maxX: 2240,
        startY: 310,
        facing: 'left',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 2.0,
        canBeStomped: false
      },
      // Beetle on high sanctuary
      {
        id: 'l3_e5',
        type: 'beetle',
        x: 2540,
        y: 528,
        vx: 2.0,
        vy: 0,
        width: 34,
        height: 28,
        minX: 2440,
        maxX: 2780,
        startY: 528,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 2.0,
        canBeStomped: false
      },
      // Guardian Mushroom near final portal
      {
        id: 'l3_e6',
        type: 'mushroom',
        x: 3480,
        y: 508,
        vx: 1.2,
        vy: 0,
        width: 32,
        height: 32,
        minX: 3360,
        maxX: 3650,
        startY: 508,
        facing: 'right',
        isAlive: true,
        squishTimer: 0,
        animTimer: 0,
        speed: 1.2,
        canBeStomped: true
      }
    ],
    collectibles: [
      { id: 'l3_c1', x: 260, y: 410, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 0, value: 50 },
      { id: 'l3_c2', x: 520, y: 340, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 1, value: 50 },
      { id: 'l3_c3', x: 720, y: 280, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 2, value: 50 },
      { id: 'l3_c4', x: 990, y: 230, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 3, value: 50 },
      { id: 'l3_c5', x: 1220, y: 140, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 4, value: 50 },
      { id: 'l3_c6', x: 1500, y: 400, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 5, value: 50 },
      { id: 'l3_c7', x: 1900, y: 400, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 6, value: 50 },
      { id: 'l3_c8', x: 2180, y: 330, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 7, value: 50 },
      { id: 'l3_c9', x: 2620, y: 330, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 8, value: 50 },
      { id: 'l3_c10', x: 2840, y: 250, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 9, value: 50 },
      { id: 'l3_c11', x: 3040, y: 300, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 10, value: 50 },
      { id: 'l3_c12', x: 3460, y: 390, width: 18, height: 18, type: 'firefly', collected: false, bobOffset: 11, value: 50 },
      // Golden Acorns
      { id: 'l3_ga1', x: 1240, y: 90, width: 22, height: 22, type: 'golden_acorn', collected: false, bobOffset: 0, value: 200 },
      { id: 'l3_ga2', x: 2850, y: 200, width: 22, height: 22, type: 'golden_acorn', collected: false, bobOffset: 2, value: 200 },
      // Hearts
      { id: 'l3_hp1', x: 1620, y: 510, width: 20, height: 20, type: 'heart', collected: false, bobOffset: 0, value: 100 },
      { id: 'l3_hp2', x: 2680, y: 510, width: 20, height: 20, type: 'heart', collected: false, bobOffset: 1, value: 100 }
    ],
    goal: {
      x: 3650,
      y: 430,
      width: 76,
      height: 114,
      pulseTimer: 0
    }
  }
];
