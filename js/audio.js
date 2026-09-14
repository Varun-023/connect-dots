/**
 * AudioManager - Web Audio API Procedural Sound & Ambient Music Generator
 * Provides rich sound effects and calm background music without external asset dependencies.
 * 100% offline-ready and client-side synthesized.
 */
class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isMusicEnabled = localStorage.getItem('connect_dots_music') !== 'false';
    this.isSoundEnabled = localStorage.getItem('connect_dots_sound') !== 'false';
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.isBgmRunning = false;
  }

  /**
   * Initialize Web Audio Context on first user gesture
   */
  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audioCtx = new AudioContext();

      // Master BGM Gain
      this.musicGain = this.audioCtx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMusicEnabled ? 0.15 : 0, this.audioCtx.currentTime);
      this.musicGain.connect(this.audioCtx.destination);

      // Master SFX Gain
      this.sfxGain = this.audioCtx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isSoundEnabled ? 0.4 : 0, this.audioCtx.currentTime);
      this.sfxGain.connect(this.audioCtx.destination);

      if (this.isMusicEnabled) {
        this.startBGM();
      }
    } else if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Toggle background music
   */
  toggleMusic() {
    this.initContext();
    this.isMusicEnabled = !this.isMusicEnabled;
    localStorage.setItem('connect_dots_music', this.isMusicEnabled);

    if (this.musicGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.linearRampToValueAtTime(this.isMusicEnabled ? 0.15 : 0, now + 0.3);
    }

    if (this.isMusicEnabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }

    return this.isMusicEnabled;
  }

  /**
   * Toggle sound effects
   */
  toggleSound() {
    this.initContext();
    this.isSoundEnabled = !this.isSoundEnabled;
    localStorage.setItem('connect_dots_sound', this.isSoundEnabled);

    if (this.sfxGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.sfxGain.gain.cancelScheduledValues(now);
      this.sfxGain.gain.linearRampToValueAtTime(this.isSoundEnabled ? 0.4 : 0, now + 0.1);
    }

    return this.isSoundEnabled;
  }

  /**
   * Play satisfying click when connecting a line
   */
  playConnect() {
    if (!this.isSoundEnabled) return;
    this.initContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Play rich harmonic chime when completing a box
   */
  playBoxComplete(isDouble = false) {
    if (!this.isSoundEnabled) return;
    this.initContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const notes = isDouble ? [523.25, 659.25, 783.99, 1046.50] : [523.25, 659.25, 783.99]; // C5, E5, G5, (C6)

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.45);
    });
  }

  /**
   * Play subtle timeout sound when 20s turn expires
   * Descending gentle dual-tone
   */
  playTimeout() {
    if (!this.isSoundEnabled) return;
    this.initContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const notes = [440, 330, 220]; // A4 -> E4 -> A3 descending soft tone

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.14);
    });
  }

  /**
   * Play subtle timer warning tick for final 3 seconds
   */
  playTimerTick(isUrgent = false) {
    if (!this.isSoundEnabled) return;
    this.initContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isUrgent ? 880 : 660, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Play subtle turn change sound
   */
  playTurnSwitch() {
    if (!this.isSoundEnabled) return;
    this.initContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(550, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Play game over fanfare or conclusion sound
   */
  playGameOver(isWinner = true) {
    if (!this.isSoundEnabled) return;
    this.initContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const melody = isWinner
      ? [
          { f: 523.25, t: 0.0, d: 0.15 },
          { f: 659.25, t: 0.15, d: 0.15 },
          { f: 783.99, t: 0.30, d: 0.15 },
          { f: 1046.50, t: 0.45, d: 0.6 }
        ]
      : [
          { f: 523.25, t: 0.0, d: 0.2 },
          { f: 493.88, t: 0.2, d: 0.2 },
          { f: 440.00, t: 0.4, d: 0.5 }
        ];

    melody.forEach(({ f, t, d }) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.3, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + t);
      osc.stop(now + t + d);
    });
  }

  /**
   * UI Click Sound
   */
  playClick() {
    if (!this.isSoundEnabled) return;
    this.initContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Smooth, ambient lo-fi synth chord progression background music
   */
  startBGM() {
    if (this.isBgmRunning || !this.isMusicEnabled) return;
    this.isBgmRunning = true;

    // Calm 4-chord progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4
    const chords = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // C, E, G, B, D
      [220.00, 261.63, 329.63, 392.00, 493.88], // A, C, E, G, B
      [174.61, 261.63, 329.63, 349.23, 440.00], // F, C, E, F, A
      [196.00, 261.63, 293.66, 392.00, 440.00]  // G, C, D, G, A
    ];

    const playNextChord = () => {
      if (!this.isBgmRunning || !this.audioCtx || !this.musicGain) return;

      const chord = chords[this.bgmStep % chords.length];
      const now = this.audioCtx.currentTime;
      const duration = 3.6;

      chord.forEach((freq) => {
        const osc = this.audioCtx.createOscillator();
        const filter = this.audioCtx.createBiquadFilter();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.8);
        gain.gain.linearRampToValueAtTime(0.025, now + duration - 0.6);
        gain.gain.linearRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      this.bgmStep++;
      this.bgmTimer = setTimeout(playNextChord, (duration - 0.4) * 1000);
    };

    playNextChord();
  }

  stopBGM() {
    this.isBgmRunning = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const audio = new AudioManager();
