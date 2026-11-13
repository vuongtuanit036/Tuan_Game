/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Bộ tổng hợp âm thanh Kiếm Hiệp bằng Web Audio API (không cần file âm thanh ngoài)
 * Tạo tiếng kiếm khí, va chạm binh khí, né tránh thân pháp, ám khí và hồi phục.
 */

class WuxiaCombatAudio {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private ensureContext(): AudioContext | null {
    if (this.isMuted || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * durationSec));
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Tiếng kiếm khí xé gió (Sword Qi Slash)
   */
  public playSwordSlash(isHeavy = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Luồng khí xé gió (Bandpass filtered white noise sweep)
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = this.createNoiseBuffer(ctx, isHeavy ? 0.34 : 0.24);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHeavy ? 1800 : 2400, now);
    filter.frequency.exponentialRampToValueAtTime(isHeavy ? 420 : 650, now + (isHeavy ? 0.32 : 0.22));
    filter.Q.setValueAtTime(2.6, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(isHeavy ? 0.35 : 0.25, now + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.32 : 0.22));

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSrc.start(now);
    noiseSrc.stop(now + (isHeavy ? 0.34 : 0.24));

    // 2. Ngân vang kim loại lưỡi kiếm
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isHeavy ? 1150 : 1480, now);
    osc.frequency.exponentialRampToValueAtTime(isHeavy ? 380 : 520, now + 0.18);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.14, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Tiếng va chạm nội lực / trúng đòn (Heavy Impact & Clash)
   */
  public playHeavyImpact(isCrit = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Trống trầm chấn động (Low-end thump)
    const bass = ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(isCrit ? 150 : 120, now);
    bass.frequency.exponentialRampToValueAtTime(34, now + (isCrit ? 0.28 : 0.2));

    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(isCrit ? 0.45 : 0.32, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + (isCrit ? 0.3 : 0.22));

    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.start(now);
    bass.stop(now + 0.31);

    // 2. Tia va chạm sắc bén (Impact crack)
    const crack = ctx.createBufferSource();
    crack.buffer = this.createNoiseBuffer(ctx, 0.12);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(isCrit ? 3200 : 2200, now);

    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(isCrit ? 0.3 : 0.2, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    crack.connect(lp);
    lp.connect(crackGain);
    crackGain.connect(ctx.destination);
    crack.start(now);
    crack.stop(now + 0.12);
  }

  /**
   * Tiếng binh khí giao tranh / Phản kích (Metal Parry & Counter Clash)
   */
  public playGuardClash(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const partials = [920, 1460, 2240];
    partials.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, now + 0.32);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.33);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  /**
   * Tiếng lướt gió né tránh / Khinh công (Dodge / Flee / Stealth)
   */
  public playDodgeWhoosh(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = this.createNoiseBuffer(ctx, 0.22);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(2600, now + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noiseSrc.start(now);
    noiseSrc.stop(now + 0.22);
  }

  /**
   * Tiếng ám khí phóng ra (Hidden Weapon Dart)
   */
  public playHiddenWeapon(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2800, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.11);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Tiếng chuông thanh âm hồi phục / đan dược (Healing Pentatonic Chime)
   */
  public playHealChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5

    notes.forEach((freq, i) => {
      const start = now + i * 0.07;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }

  /**
   * Âm hưởng chiến thắng ngũ cung (Victory Fanfare)
   */
  public playVictoryFanfare(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5]; // Ngũ cung: Đồ Rê Mi Sol Đố

    notes.forEach((freq, i) => {
      const start = now + i * 0.09;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.48);
    });
  }

  /**
   * Tiếng chiêng trầm khi trọng thương thất bại (Defeat Gong)
   */
  public playDefeatGong(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.exponentialRampToValueAtTime(82, now + 0.8);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  }
}

export const combatAudio = new WuxiaCombatAudio();
