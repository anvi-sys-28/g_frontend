/**
 * Procedural Web Audio API Sound Synthesizer & Haptic Engine
 * Provides zero-latency, realistic casino audio without external audio asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private spinNoiseNode: AudioBufferSourceNode | null = null;
  private spinGainNode: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopBallSpinLoop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public triggerHaptic(pattern: number | number[] = 15) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  /**
   * Crisp tactile chip drop sound
   */
  public playChipSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic(10);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * Clear or undo sound
   */
  public playClearSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic(15);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  /**
   * Continuous ball orbiting loop sound
   */
  public startBallSpinLoop(durationSec: number = 6) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.stopBallSpinLoop();

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Bandpass filter to simulate smooth rolling ball on wood/brass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + durationSec);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.5);
    gain.gain.setValueAtTime(0.18, now + durationSec * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + durationSec + 0.1);

    this.spinNoiseNode = whiteNoise;
    this.spinGainNode = gain;
  }

  public stopBallSpinLoop() {
    if (this.spinNoiseNode) {
      try {
        this.spinNoiseNode.stop();
        this.spinNoiseNode.disconnect();
      } catch {}
      this.spinNoiseNode = null;
    }
  }

  /**
   * Ball bouncing against metal frets and settling
   */
  public playBallBounceSound(intensity: number = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic(20);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const baseFreq = 2200 + Math.random() * 400;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.035);

    const vol = Math.min(0.35 * intensity, 0.4);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Payout / Win celebration fanfare
   */
  public playWinFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic([40, 60, 40, 100]);

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const noteStart = now + idx * 0.08;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.55);
    });
  }
}

export const soundEffects = new SoundEngine();
