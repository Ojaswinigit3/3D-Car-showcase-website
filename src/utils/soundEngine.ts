/**
 * Procedural Web Audio Synthesizer for Bugatti La Voiture Noire
 * -------------------------------------------------------------
 * Muted by default per user instructions. When toggled ON, generates:
 * 1. Deep cinematic trailer sub-bass & atmospheric harmonic pad
 * 2. 8.0L W16 Quad-Turbo low-frequency firing rumble modulated by scroll velocity
 * 3. Crisp mechanical lock-in click/boom on Chapter 06 reassembly
 * 4. Subtle precision UI clicks on hotspot/button interaction
 *
 * NOTE: To swap in real recorded audio files, place `/public/audio/w16_loop.mp3`
 * and `/public/audio/trailer_score.mp3` and load them via HTMLAudioElement in `enable()`.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    if (this.isMuted) {
      this.enable();
    } else {
      this.disable();
    }
    return this.isMuted;
  }

  public enable(): void {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.24;
        this.masterGain.connect(this.ctx.destination);

        // W16 low firing rumble oscillator pair
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0.18;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 135;

        this.engineOsc1 = this.ctx.createOscillator();
        this.engineOsc1.type = 'sawtooth';
        this.engineOsc1.frequency.value = 38;

        this.engineOsc2 = this.ctx.createOscillator();
        this.engineOsc2.type = 'triangle';
        this.engineOsc2.frequency.value = 57;

        this.engineOsc1.connect(filter);
        this.engineOsc2.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);

        this.engineOsc1.start();
        this.engineOsc2.start();

        // Atmospheric dark cinema drone
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0.14;
        this.droneOsc = this.ctx.createOscillator();
        this.droneOsc.type = 'sine';
        this.droneOsc.frequency.value = 55;
        this.droneOsc.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);
        this.droneOsc.start();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0.24, this.ctx.currentTime, 0.15);
      }
      this.isMuted = false;
    } catch {
      this.isMuted = true;
    }
  }

  public disable(): void {
    this.isMuted = true;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.12);
    }
  }

  /**
   * Modulate W16 pitch and volume continuously from scroll velocity & chapter state
   */
  public updateTelemetry(scrollVelocity: number, speedFactor: number): void {
    if (this.isMuted || !this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineGain) {
      return;
    }
    const now = this.ctx.currentTime;
    const rev = Math.min(1.5, Math.abs(scrollVelocity) * 0.45 + speedFactor * 0.85);
    this.engineOsc1.frequency.setTargetAtTime(38 + rev * 56, now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(57 + rev * 84, now, 0.08);
    this.engineGain.gain.setTargetAtTime(0.14 + Math.min(0.25, rev * 0.18), now, 0.08);
  }

  /**
   * Subtle high-precision metallic click for buttons & hotspots
   */
  public playTick(freq = 680): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore audio state errors
    }
  }

  /**
   * Deep mechanical lock-in thud when Chapter 06 finishes reassembling the car
   */
  public playLockIn(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore audio state errors
    }
  }
}

export const soundEngine = new SoundEngine();
