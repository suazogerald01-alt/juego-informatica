/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, Play, Pause, Trophy, ArrowRight, Heart, Sparkles, Shield, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { GameEngine, GameStats } from './game/engine';
import { PixelRenderer } from './game/renderer';
import { LEVELS } from './game/levels';
import { soundEngine } from './game/audio';
import { GameState } from './game/types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<PixelRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // UI State
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());
  const [highScores, setHighScores] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('duende_high_scores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    firefliesCollected: 0,
    totalFireflies: 0,
    acornsCollected: 0,
    timeElapsed: 0,
    livesRemaining: 3
  });

  const [playerDistance, setPlayerDistance] = useState<number>(0); // 0 to 100%

  // Logical internal resolution for crisp 16-bit pixel art
  const V_WIDTH = 800;
  const V_HEIGHT = 480;

  // Initialize Game Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentLevel = LEVELS[currentLevelIndex];
    const engine = new GameEngine(currentLevel, V_WIDTH, V_HEIGHT);
    const renderer = new PixelRenderer(ctx, V_WIDTH, V_HEIGHT);

    engine.onStateChange = (newState, newStats) => {
      setGameState(newState);
      setStats({ ...newStats });

      if (newState === 'VICTORY') {
        // Save high score
        setHighScores((prev) => {
          const currentBest = prev[currentLevel.id] || 0;
          if (newStats.score > currentBest) {
            const updated = { ...prev, [currentLevel.id]: newStats.score };
            try {
              localStorage.setItem('duende_high_scores', JSON.stringify(updated));
            } catch {
              // ignore
            }
            return updated;
          }
          return prev;
        });
      }
    };

    engineRef.current = engine;
    rendererRef.current = renderer;

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      soundEngine.stopAmbient();
    };
  }, [currentLevelIndex]);

  // Main Game Loop
  useEffect(() => {
    let active = true;

    const loop = (timestamp: number) => {
      if (!active) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Clamp delta time to avoid large jumps during tab switches
      const dt = Math.min(rawDt, 0.05);

      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (engine && renderer) {
        engine.update(dt);

        // Screen shake calculation
        const shakeX = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake : 0;
        const shakeY = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake : 0;

        renderer.render(
          engine.level,
          engine.player,
          engine.enemies,
          engine.platforms,
          engine.hazards,
          engine.collectibles,
          engine.particles,
          engine.goal,
          engine.cameraX,
          engine.cameraY,
          { x: shakeX, y: shakeY },
          engine.gameTime
        );

        // Update progress bar
        const distanceProgress = Math.min(100, Math.max(0, (engine.player.x / (engine.goal.x - 40)) * 100));
        setPlayerDistance(distanceProgress);

        // Sync stats periodically for HUD
        setStats({ ...engine.stats });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (engine.state === 'PLAYING') {
          engine.state = 'PAUSED';
          setGameState('PAUSED');
          soundEngine.stopAmbient();
        } else if (engine.state === 'PAUSED') {
          engine.state = 'PLAYING';
          setGameState('PLAYING');
          soundEngine.startAmbient();
        }
        return;
      }

      if (engine.state !== 'PLAYING') return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.input.left = true;
        e.preventDefault();
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.input.right = true;
        e.preventDefault();
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        if (!engine.input.jumpHeld) {
          engine.input.jumpPressed = true;
        }
        engine.input.jumpHeld = true;
        e.preventDefault();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engine.input.down = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.input.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.input.right = false;
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        engine.input.jumpHeld = false;
        engine.input.jumpPressed = false;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engine.input.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Action: Start Game
  const handleStartGame = useCallback((lvlIndex?: number) => {
    const idx = lvlIndex !== undefined ? lvlIndex : currentLevelIndex;
    setCurrentLevelIndex(idx);

    const engine = engineRef.current;
    if (engine) {
      engine.loadLevel(LEVELS[idx]);
      engine.state = 'PLAYING';
      setGameState('PLAYING');
      soundEngine.startAmbient();
    }
  }, [currentLevelIndex]);

  // Action: Restart Level
  const handleRestart = useCallback(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.restartCurrentLevel();
      setGameState('PLAYING');
    }
  }, []);

  // Action: Resume Game
  const handleResume = useCallback(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.state = 'PLAYING';
      setGameState('PLAYING');
      soundEngine.startAmbient();
    }
  }, []);

  // Action: Toggle Sound
  const handleToggleSound = useCallback(() => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  // Action: Next Level
  const handleNextLevel = useCallback(() => {
    if (currentLevelIndex < LEVELS.length - 1) {
      const nextIdx = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIdx);
      handleStartGame(nextIdx);
    } else {
      // Completed all levels! Return to menu
      setGameState('MENU');
      if (engineRef.current) {
        engineRef.current.state = 'MENU';
      }
    }
  }, [currentLevelIndex, handleStartGame]);

  // Touch button helpers
  const handleTouchStart = (action: 'left' | 'right' | 'jump') => {
    const engine = engineRef.current;
    if (!engine || engine.state !== 'PLAYING') return;

    if (action === 'left') engine.input.left = true;
    if (action === 'right') engine.input.right = true;
    if (action === 'jump') {
      if (!engine.input.jumpHeld) engine.input.jumpPressed = true;
      engine.input.jumpHeld = true;
    }
  };

  const handleTouchEnd = (action: 'left' | 'right' | 'jump') => {
    const engine = engineRef.current;
    if (!engine) return;

    if (action === 'left') engine.input.left = false;
    if (action === 'right') engine.input.right = false;
    if (action === 'jump') {
      engine.input.jumpHeld = false;
      engine.input.jumpPressed = false;
    }
  };

  const currentLevel = LEVELS[currentLevelIndex];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-display select-none">
      {/* TOP BAR CONTRACT: Brand Wordmark — Unboxed Metadata — Primary Controls */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-emerald-900/30 bg-slate-900/90 backdrop-blur-md z-30 shrink-0">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-pixel text-xs">
            🍄
          </div>
          <span className="text-base font-bold tracking-tight text-emerald-400 font-pixel text-xs md:text-sm">
            Aventura del Duende
          </span>
        </div>

        {/* Zone 2: Single-Line Unboxed Metadata */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300 font-pixel whitespace-nowrap shrink-0">
          <span className="text-emerald-300">{currentLevel.name}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tabular-nums">{stats.firefliesCollected}</span> / <span className="tabular-nums">{stats.totalFireflies}</span> Lúmines
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-sky-300 tabular-nums">
            Score: {stats.score}
          </span>
        </div>

        {/* Zone 3: Primary Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleSound}
            title={isMuted ? "Activar sonido" : "Silenciar sonido"}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-800"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {gameState === 'PLAYING' ? (
            <button
              onClick={() => {
                if (engineRef.current) {
                  engineRef.current.state = 'PAUSED';
                  setGameState('PAUSED');
                  soundEngine.stopAmbient();
                }
              }}
              title="Pausar juego"
              className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-800"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : gameState === 'PAUSED' ? (
            <button
              onClick={handleResume}
              title="Reanudar juego"
              className="p-2 text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/80 rounded-lg transition-colors border border-emerald-800"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : null}

          {gameState !== 'MENU' && (
            <button
              onClick={() => {
                soundEngine.stopAmbient();
                setGameState('MENU');
                if (engineRef.current) engineRef.current.state = 'MENU';
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            >
              Menú
            </button>
          )}
        </div>
      </header>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden">
        {/* Game Canvas Container with retro wooden/moss frame */}
        <div className="relative w-full max-w-5xl aspect-[5/3] max-h-[80vh] rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-950/80 bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={V_WIDTH}
            height={V_HEIGHT}
            className="w-full h-full object-contain pixelated"
          />

          {/* IN-GAME HUD OVERLAY (when PLAYING or PAUSED) */}
          {gameState === 'PLAYING' && (
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              {/* Hearts / Lives */}
              <div className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-900/50 shadow-md">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-transform ${
                      i < stats.livesRemaining
                        ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                        : 'fill-slate-800 text-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Level Progress Bar: Duende running towards ancient portal */}
              <div className="flex items-center gap-2 bg-slate-950/75 backdrop-blur-sm px-4 py-1.5 rounded-lg border border-emerald-900/50 shadow-md max-w-xs w-full mx-4">
                <span className="text-xs">🧝</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-150 rounded-full"
                    style={{ width: `${playerDistance}%` }}
                  />
                </div>
                <span className="text-xs">🌀</span>
              </div>

              {/* Fireflies & Acorns HUD */}
              <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-900/50 font-pixel text-[10px] shadow-md">
                <div className="flex items-center gap-1 text-amber-300">
                  <span className="text-amber-400">✨</span>
                  <span className="tabular-nums">{stats.firefliesCollected}</span>
                </div>
                {stats.acornsCollected > 0 && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <span>🌰</span>
                    <span className="tabular-nums">{stats.acornsCollected}</span>
                  </div>
                )}
                <div className="text-sky-300 tabular-nums">
                  {stats.score}
                </div>
              </div>
            </div>
          )}

          {/* OVERLAY: TITLE MENU */}
          {gameState === 'MENU' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 overflow-y-auto">
              <div className="max-w-md w-full bg-slate-900/90 border border-emerald-800/60 p-6 md:p-8 rounded-2xl shadow-2xl relative">
                <div className="inline-block p-3 rounded-2xl bg-emerald-950/80 border border-emerald-700/50 text-3xl mb-3 shadow-inner">
                  🧝✨
                </div>

                <h1 className="font-pixel text-xl sm:text-2xl text-emerald-400 tracking-wider mb-2 drop-shadow-[0_2px_10px_rgba(52,211,153,0.3)]">
                  AVENTURA DEL DUENDE
                </h1>
                <p className="text-xs sm:text-sm text-emerald-200/80 mb-6">
                  Guía al duende a través del bosque encantado, esquiva criaturas y salta obstáculos hasta el portal sagrado.
                </p>

                {/* Level Selection Grid */}
                <div className="space-y-2 mb-6 text-left">
                  <span className="text-[11px] font-pixel text-slate-400 uppercase tracking-wider block mb-1">
                    Selecciona un Nivel
                  </span>
                  {LEVELS.map((lvl, index) => {
                    const isSelected = index === currentLevelIndex;
                    const best = highScores[lvl.id] || 0;
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => setCurrentLevelIndex(index)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <div className="font-pixel text-xs text-emerald-300 mb-0.5">
                            {lvl.name}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {lvl.description}
                          </div>
                        </div>
                        {best > 0 && (
                          <div className="text-right shrink-0 ml-3">
                            <span className="text-[10px] text-amber-400 font-pixel block tabular-nums">
                              ★ {best}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Instructions Box */}
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-left text-xs text-slate-300 mb-6 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-pixel text-[10px] text-emerald-400">
                      ← → / A D
                    </span>
                    <span>Mover al Duende</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-pixel text-[10px] text-emerald-400">
                      Espacio / W
                    </span>
                    <span>Saltar (mantén presionado para mayor altura)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-pixel text-[10px] text-amber-400">
                      Pisar
                    </span>
                    <span>Salta sobre las setas rojas para vencerlas</span>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => handleStartGame()}
                  className="w-full py-3.5 px-6 font-pixel text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform cursor-pointer"
                >
                  Comenzar Aventura
                </button>
              </div>
            </div>
          )}

          {/* OVERLAY: PAUSED */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="max-w-sm w-full bg-slate-900/90 border border-slate-700 p-6 rounded-2xl shadow-2xl">
                <h2 className="font-pixel text-lg text-amber-400 mb-2">
                  Juego Pausado
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  {currentLevel.name}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleResume}
                    className="w-full py-3 px-4 font-pixel text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Reanudar
                  </button>
                  <button
                    onClick={handleRestart}
                    className="w-full py-2.5 px-4 font-pixel text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reiniciar Nivel
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.stopAmbient();
                      setGameState('MENU');
                      if (engineRef.current) engineRef.current.state = 'MENU';
                    }}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
                  >
                    Volver al Menú
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OVERLAY: VICTORY */}
          {gameState === 'VICTORY' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="max-w-md w-full bg-slate-900/95 border-2 border-emerald-500/60 p-6 md:p-8 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-3xl mb-3 shadow-inner">
                  🌀✨
                </div>

                <h2 className="font-pixel text-lg sm:text-xl text-emerald-400 tracking-wide mb-1">
                  ¡NIVEL COMPLETADO!
                </h2>
                <p className="text-xs text-emerald-200/80 mb-6">
                  Has alcanzado el portal rúnico y desbloqueado la magia del bosque.
                </p>

                {/* Score & Statistics Breakdown */}
                <div className="grid grid-cols-2 gap-2.5 bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-left mb-6 font-pixel text-xs">
                  <div className="text-slate-400">
                    Lúmines:
                  </div>
                  <div className="text-right text-amber-300 tabular-nums">
                    {stats.firefliesCollected} / {stats.totalFireflies}
                  </div>
                  <div className="text-slate-400">
                    Vidas restantes:
                  </div>
                  <div className="text-right text-rose-400 tabular-nums">
                    {stats.livesRemaining} / 3
                  </div>
                  <div className="text-slate-400">
                    Tiempo:
                  </div>
                  <div className="text-right text-sky-300 tabular-nums">
                    {Math.floor(stats.timeElapsed)}s
                  </div>
                  <div className="text-slate-300 font-bold pt-2 border-t border-slate-800">
                    Puntuación:
                  </div>
                  <div className="text-right text-emerald-400 font-bold pt-2 border-t border-slate-800 tabular-nums">
                    {stats.score} pts
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  {currentLevelIndex < LEVELS.length - 1 ? (
                    <button
                      onClick={handleNextLevel}
                      className="w-full py-3.5 px-6 font-pixel text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Siguiente Nivel</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartGame(0)}
                      className="w-full py-3.5 px-6 font-pixel text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 rounded-xl font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>¡Juego Completado! Volver a jugar</span>
                    </button>
                  )}

                  <button
                    onClick={handleRestart}
                    className="w-full py-2.5 px-4 font-pixel text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-colors"
                  >
                    Repetir Nivel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OVERLAY: GAME OVER */}
          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="max-w-md w-full bg-slate-900/95 border border-rose-900/60 p-6 md:p-8 rounded-2xl shadow-2xl">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/80 border border-rose-700/50 flex items-center justify-center text-3xl mb-3 shadow-inner">
                  🍂💀
                </div>

                <h2 className="font-pixel text-lg sm:text-xl text-rose-400 tracking-wide mb-2">
                  HAS CAÍDO EN EL BOSQUE
                </h2>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Las criaturas del bosque te han atrapado. Recuerda que puedes pisar a las setas rojas, pero los escarabajos con púas y murciélagos deben esquivarse con saltos precisos.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleRestart}
                    className="w-full py-3.5 px-6 font-pixel text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reintentar Nivel</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.stopAmbient();
                      setGameState('MENU');
                      if (engineRef.current) engineRef.current.state = 'MENU';
                    }}
                    className="w-full py-2.5 px-4 font-pixel text-xs text-slate-400 hover:text-white rounded-xl transition-colors"
                  >
                    Volver al Menú
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ON-SCREEN RETRO CONTROLS (Always available, great for touch & mobile) */}
        <div className="w-full max-w-5xl mt-3 flex items-center justify-between px-2 sm:px-4 z-10 select-none">
          {/* Left / Right D-Pad */}
          <div className="flex items-center gap-3">
            <button
              onMouseDown={() => handleTouchStart('left')}
              onMouseUp={() => handleTouchEnd('left')}
              onMouseLeave={() => handleTouchEnd('left')}
              onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
              className="touch-control w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 border-2 border-emerald-900/60 active:border-emerald-400 active:bg-emerald-950/60 flex items-center justify-center text-slate-200 active:text-emerald-300 shadow-lg active:scale-95 transition-transform"
              title="Mover a la izquierda"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onMouseDown={() => handleTouchStart('right')}
              onMouseUp={() => handleTouchEnd('right')}
              onMouseLeave={() => handleTouchEnd('right')}
              onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
              className="touch-control w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 border-2 border-emerald-900/60 active:border-emerald-400 active:bg-emerald-950/60 flex items-center justify-center text-slate-200 active:text-emerald-300 shadow-lg active:scale-95 transition-transform"
              title="Mover a la derecha"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* Quick Helper Tips for Desktop */}
          <div className="hidden md:flex flex-col items-center text-[11px] text-slate-500 font-pixel">
            <span>[← / → / A / D] Moverse</span>
            <span className="text-emerald-500/80 mt-1">[ESPACIO / W] Saltar · [P] Pausa</span>
          </div>

          {/* Jump Action Button */}
          <div className="flex items-center gap-3">
            <button
              onMouseDown={() => handleTouchStart('jump')}
              onMouseUp={() => handleTouchEnd('jump')}
              onMouseLeave={() => handleTouchEnd('jump')}
              onTouchStart={(e) => { e.preventDefault(); handleTouchStart('jump'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('jump'); }}
              className="touch-control w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-emerald-600 to-emerald-800 border-2 border-emerald-400 active:from-emerald-500 active:to-emerald-700 flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-900/40 active:scale-95 transition-transform font-pixel text-xs"
              title="Saltar"
            >
              <ArrowUp className="w-6 h-6 mb-0.5" />
              <span>SALTO</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
