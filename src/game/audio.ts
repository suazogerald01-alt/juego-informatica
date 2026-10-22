/**
 * Procedural Retro Sound Engine using Web Audio API
 * Generates forest ambient audio and 8-bit / 16-bit sound effects without external assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Ambient sound nodes
  private windSource: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private ambientTimer: number | null = null;
  private chimeTimer: number | null = null;
  private isAmbientRunning: boolean = false;

  constructor() {
    // Check saved mute state
    try {
      const savedMute = localStorage.getItem('duende_audio_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      // ignore
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.35;
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.65;
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('duende_audio_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts ambient forest background audio:
   * 1. Low wind breeze filtered noise
   * 2. Gentle cricket chirps
   * 3. Enchanted forest chimes
   */
  public startAmbient() {
    this.initContext();
    if (!this.ctx || !this.ambientGain || this.isAmbientRunning) return;
    this.isAmbientRunning = true;

    // 1. Procedural Wind Loop (Brown/Pink noise buffer)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 2.5; // Gain
    }

    const wind = this.ctx.createBufferSource();
    wind.buffer = noiseBuffer;
    wind.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    filter.Q.value = 2;

    // Slow wind modulation LFO
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.15; // Slow breeze pulse
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.25;

    wind.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.ambientGain);

    wind.start();
    this.windSource = wind;
    this.windFilter = filter;

    // 2. Periodic Crickets / Night Forest sounds
    this.scheduleCrickets();

    // 3. Periodic Mystical Wind Chimes
    this.scheduleChimes();
  }

  public stopAmbient() {
    this.isAmbientRunning = false;
    if (this.windSource) {
      try {
        this.windSource.stop();
        this.windSource.disconnect();
      } catch {
        // ignore
      }
      this.windSource = null;
    }
    if (this.ambientTimer) {
      window.clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.chimeTimer) {
      window.clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }
  }

  private scheduleCrickets() {
    if (!this.isAmbientRunning) return;
    const nextIn = 3000 + Math.random() * 5000;
    this.ambientTimer = window.setTimeout(() => {
      this.playCricketChirp();
      this.scheduleCrickets();
    }, nextIn);
  }

  private playCricketChirp() {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chirps = 2 + Math.floor(Math.random() * 3);

    for (let c = 0; c < chirps; c++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4500 + Math.random() * 600, now + c * 0.09);

      gain.gain.setValueAtTime(0, now + c * 0.09);
      gain.gain.linearRampToValueAtTime(0.04, now + c * 0.09 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + c * 0.09 + 0.05);

      osc.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(now + c * 0.09);
      osc.stop(now + c * 0.09 + 0.06);
    }
  }

  private scheduleChimes() {
    if (!this.isAmbientRunning) return;
    const nextIn = 6000 + Math.random() * 8000;
    this.chimeTimer = window.setTimeout(() => {
      this.playEnchantedChime();
      this.scheduleChimes();
    }, nextIn);
  }

  private playEnchantedChime() {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Pentatonic scale notes
    const notes = [587.33, 659.25, 783.99, 880.0, 1046.5];
    const note = notes[Math.floor(Math.random() * notes.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(now);
    osc.stop(now + 1.9);
  }

  // --- SFX (Sound Effects) ---

  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playSpring() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playFirefly() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Twin sparkling bell notes
    const freqs = [880, 1174.66, 1567.98];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.2);
    });
  }

  public playAcorn() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0.22, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.27);
    });
  }

  public playStomp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playHurt() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playHeart() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const notes = [440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.28);
    });
  }

  public playVictory() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Joyful fanfare: C5, E5, G5, C6 (extended hold)
    const melody = [
      { note: 523.25, time: 0, dur: 0.12 },
      { note: 659.25, time: 0.14, dur: 0.12 },
      { note: 783.99, time: 0.28, dur: 0.12 },
      { note: 1046.5, time: 0.42, dur: 0.5 },
      { note: 880.0, time: 0.95, dur: 0.14 },
      { note: 1046.5, time: 1.12, dur: 0.65 }
    ];

    melody.forEach((item) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.note, now + item.time);

      gain.gain.setValueAtTime(0, now + item.time);
      gain.gain.linearRampToValueAtTime(0.28, now + item.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + item.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + item.time);
      osc.stop(now + item.time + item.dur + 0.02);
    });
  }

  public playGameOver() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const melody = [
      { note: 392.0, time: 0, dur: 0.2 },
      { note: 349.23, time: 0.22, dur: 0.2 },
      { note: 311.13, time: 0.44, dur: 0.25 },
      { note: 261.63, time: 0.72, dur: 0.5 }
    ];

    melody.forEach((item) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(item.note, now + item.time);

      gain.gain.setValueAtTime(0.22, now + item.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + item.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + item.time);
      osc.stop(now + item.time + item.dur + 0.02);
    });
  }
}

export const soundEngine = new SoundEngine();
