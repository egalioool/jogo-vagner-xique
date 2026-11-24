type MusicMode = 'none' | 'title' | 'battle' | 'boss';

class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted = false;
  private bgmEnabled = true;
  private voiceEnabled = true;
  private currentMusic: MusicMode = 'none';
  private musicTimer: number | null = null;
  private stepIndex = 0;
  private unlockBound = false;

  constructor() {
    this.bindAutoUnlock();
  }

  private bindAutoUnlock() {
    if (typeof window === 'undefined' || this.unlockBound) return;
    this.unlockBound = true;
    const unlock = () => {
      const ctx = this.ensureContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (!this.isMuted && this.bgmEnabled && this.currentMusic !== 'none' && this.musicTimer === null) {
        this.startMusicLoop(this.currentMusic);
      }
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.noiseBuffer) {
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopMusicLoop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else if (this.bgmEnabled && this.currentMusic !== 'none') {
      this.startMusicLoop(this.currentMusic);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopMusicLoop();
    } else if (!this.isMuted && this.currentMusic !== 'none') {
      this.startMusicLoop(this.currentMusic);
    }
  }

  public getBgmEnabled() {
    return this.bgmEnabled;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public getVoiceEnabled() {
    return this.voiceEnabled;
  }

  public speakNordestino(phrase: string, pitch = 1.1, rate = 1.15) {
    if (this.isMuted || !this.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(phrase);
      utter.lang = 'pt-BR';
      utter.pitch = pitch;
      utter.rate = rate;
      utter.volume = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang.toLowerCase().includes('pt'));
      if (ptVoice) utter.voice = ptVoice;
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore if speech synthesis unavailable
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.08,
    delay = 0,
    slideTo?: number
  ) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, slideTo),
        now + duration
      );
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  // ==================== BATERIA DE DJ & SYNTHS PESADOS ====================

  // Bumbo 808 / Pancadão de DJ + Zabumba
  private playDjKick(delay = 0, heavy = false) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(heavy ? 185 : 155, now);
    osc.frequency.exponentialRampToValueAtTime(heavy ? 36 : 44, now + 0.14);

    gain.gain.setValueAtTime(heavy ? 0.22 : 0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    // Click de ataque do bumbo eletrônico
    this.playTone(heavy ? 320 : 260, 0.025, 'triangle', 0.07, delay, 75);
  }

  // Caixa / Clap eletrônico de DJ
  private playDjClap(delay = 0, big = false) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;

    const now = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(big ? 1900 : 2300, now);
    filter.Q.setValueAtTime(1.4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(big ? 0.13 : 0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (big ? 0.16 : 0.11));

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.18);

    // Corpo grave da caixa
    this.playTone(195, 0.07, 'triangle', 0.055, delay, 105);
  }

  // Chimbal (Hi-hat) rápido de DJ / Trap / Funk
  private playDjHiHat(delay = 0, open = false) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;

    const now = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.065 : 0.042, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (open ? 0.13 : 0.038));

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + (open ? 0.15 : 0.05));
  }

  // Baixo Acid / Piseiro com filtro ressonante
  private playAcidBass(freq: number, duration = 0.14, delay = 0, volume = 0.075) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(5.5, now);
    filter.frequency.setValueAtTime(950, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  // Efeito de Scratch de DJ no vinil!
  private playDjScratch(delay = 0) {
    if (this.isMuted) return;
    this.playTone(320, 0.055, 'sawtooth', 0.06, delay, 680);
    this.playTone(680, 0.065, 'sawtooth', 0.06, delay + 0.055, 210);
    this.playTone(250, 0.05, 'sawtooth', 0.05, delay + 0.12, 540);
  }

  // Corneta / Airhorn cômico de DJ do Nordeste!
  private playDjAirhorn(delay = 0) {
    if (this.isMuted) return;
    this.playTone(440, 0.14, 'sawtooth', 0.045, delay, 428);
    this.playTone(554.37, 0.14, 'sawtooth', 0.04, delay, 540);
    this.playTone(440, 0.24, 'sawtooth', 0.05, delay + 0.16, 415);
    this.playTone(554.37, 0.24, 'sawtooth', 0.045, delay + 0.16, 523);
  }

  // ==================== INSTRUMENTOS NORDESTINOS ====================

  private playTriangle(delay = 0, open = false) {
    if (this.isMuted) return;
    this.playTone(2540, open ? 0.13 : 0.05, 'sine', 0.032, delay);
    this.playTone(3810, open ? 0.11 : 0.04, 'triangle', 0.02, delay);
  }

  private playZabumba(delay = 0, accent = false) {
    if (this.isMuted) return;
    this.playTone(accent ? 120 : 92, 0.14, 'sine', accent ? 0.11 : 0.085, delay, 42);
    this.playTone(accent ? 155 : 112, 0.06, 'triangle', 0.04, delay, 55);
  }

  private playSanfonaChord(freqs: number[], duration = 0.18, delay = 0, volume = 0.035) {
    freqs.forEach((f) => {
      this.playTone(f, duration, 'sawtooth', volume * 0.55, delay);
      this.playTone(f * 1.005, duration, 'triangle', volume * 0.65, delay);
    });
  }

  // ==================== EFEITOS SONOROS DE COMBATE ====================

  public playBoing() {
    this.playTone(190, 0.22, 'sine', 0.09, 0, 560);
    this.playTone(560, 0.16, 'triangle', 0.05, 0.12, 320);
  }

  public playClick() {
    this.playTriangle(0, false);
    this.playDjHiHat(0, false);
    this.playTone(760, 0.04, 'triangle', 0.04, 0, 920);
  }

  public playHover() {
    this.playTone(1760, 0.02, 'sine', 0.018);
  }

  public playAttack() {
    this.playDjKick(0, true);
    this.playTone(780, 0.07, 'sawtooth', 0.09, 0, 190);
    this.playDjClap(0.05, true);
    this.playTone(260, 0.12, 'square', 0.07, 0.07, 540);
  }

  public playHit() {
    this.playDjKick(0, true);
    this.playZabumba(0, true);
    this.playTone(480, 0.16, 'sawtooth', 0.08, 0.02, 120);
    this.playDjScratch(0.06);
  }

  public playDefend() {
    this.playSanfonaChord([261.63, 329.63, 392.0], 0.2, 0, 0.05);
    this.playTriangle(0.06, true);
  }

  public playPotion() {
    const notes = [523.25, 659.25, 783.99, 932.33, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.1, 'triangle', 0.075, i * 0.05);
    });
    this.playTriangle(0.1, true);
    this.playDjHiHat(0.18, true);
  }

  public playCodeCorrect() {
    this.playDjKick(0, true);
    const baiao = [
      { f: 523.25, d: 0.08, t: 0 },
      { f: 587.33, d: 0.08, t: 0.075 },
      { f: 659.25, d: 0.1, t: 0.15 },
      { f: 783.99, d: 0.1, t: 0.24 },
      { f: 932.33, d: 0.09, t: 0.33 },
      { f: 1046.5, d: 0.22, t: 0.42 },
    ];
    baiao.forEach((n) => this.playTone(n.f, n.d, 'square', 0.065, n.t));
    this.playDjClap(0.24, true);
    this.playTriangle(0.36, true);
  }

  public playCodeWrong() {
    this.playDjScratch(0);
    this.playTone(311.13, 0.16, 'sawtooth', 0.08, 0.05, 293.66);
    this.playTone(277.18, 0.16, 'sawtooth', 0.08, 0.21, 261.63);
    this.playTone(233.08, 0.34, 'sawtooth', 0.09, 0.38, 145);
  }

  public playLevelUp() {
    this.playDjAirhorn(0);
    const notes = [523.25, 659.25, 783.99, 932.33, 1046.5, 1318.51];
    notes.forEach((n, i) => {
      this.playTone(n, 0.13, 'square', 0.065, 0.12 + i * 0.075);
      if (i % 2 === 0) this.playTriangle(0.12 + i * 0.075, true);
    });
  }

  public playXiqueXique() {
    this.playDjKick(0, true);
    this.playDjKick(0.12, true);
    this.playDjAirhorn(0.16);
    this.playTone(196, 0.3, 'sawtooth', 0.1, 0, 880);
    const sertaoRiff = [523.25, 659.25, 740.0, 783.99, 932.33, 1046.5, 1318.5];
    sertaoRiff.forEach((n, i) => {
      this.playTone(n, 0.13, 'square', 0.085, 0.32 + i * 0.06);
      this.playDjClap(0.32 + i * 0.06, i === sertaoRiff.length - 1);
    });
    this.playSanfonaChord([261.63, 329.63, 392.0, 466.16], 0.45, 0.72, 0.06);
    this.speakNordestino('Xique-Xique, Bahia!', 1.05, 1.1);
  }

  public playFlyAway() {
    this.playTone(240, 0.85, 'sine', 0.09, 0, 1650);
    this.playBoing();
    this.playTriangle(0.88, true);
    this.playTone(2093.0, 0.24, 'triangle', 0.08, 0.96);
  }

  public playVictory() {
    this.playDjAirhorn(0);
    const melody = [
      { f: 523.25, d: 0.11, t: 0.1 },
      { f: 659.25, d: 0.11, t: 0.21 },
      { f: 783.99, d: 0.11, t: 0.32 },
      { f: 932.33, d: 0.12, t: 0.43 },
      { f: 1046.5, d: 0.25, t: 0.56 },
      { f: 932.33, d: 0.11, t: 0.82 },
      { f: 1046.5, d: 0.38, t: 0.95 },
    ];
    melody.forEach((m, idx) => {
      this.playTone(m.f, m.d, 'square', 0.075, m.t);
      if (idx % 2 === 0) this.playDjClap(m.t, idx === melody.length - 1);
    });
    this.playDjKick(0.1, true);
    this.playDjKick(0.56, true);
  }

  public playDefeat() {
    const notes = [392, 349.23, 311.13, 233.08, 196];
    notes.forEach((n, i) => {
      this.playTone(n, 0.24, 'sawtooth', 0.065, i * 0.22, n * 0.94);
    });
  }

  // ==================== TRILHA INSANA DE DJ + BAIÃO RAVE ====================

  public startMusic(mode: MusicMode) {
    if (this.currentMusic === mode && this.musicTimer !== null) return;
    this.currentMusic = mode;
    this.stepIndex = 0;
    this.stopMusicLoop();
    if (!this.isMuted && this.bgmEnabled && mode !== 'none') {
      this.startMusicLoop(mode);
    }
  }

  private stopMusicLoop() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private startMusicLoop(mode: MusicMode) {
    this.stopMusicLoop();

    // Sequenciador de 16 semicolcheias por compasso!
    // Title: Forró Electro-Groove (~128 BPM -> 117ms por semicolcheia)
    const titleMelody: (number | null)[] = [
      523.25, null, 659.25, 783.99, null, 932.33, 783.99, null,
      659.25, 587.33, 523.25, null, 392.0, null, 523.25, 659.25,
      783.99, null, 932.33, 1046.5, null, 932.33, 783.99, 659.25,
      587.33, null, 740.0, 880.0, 740.0, 659.25, 523.25, 1046.5,
    ];

    // Battle: Piseiro Rave Turbinado (~145 BPM -> 103ms por semicolcheia)
    const battleMelody: (number | null)[] = [
      440.0, 440.0, null, 659.25, 783.99, null, 659.25, 554.37,
      440.0, null, 880.0, 783.99, 659.25, 587.33, 523.25, 392.0,
      440.0, 554.37, 659.25, null, 880.0, 987.77, 880.0, 740.0,
      659.25, null, 783.99, 932.33, 1046.5, 932.33, 783.99, 1318.5,
    ];

    // Boss: Mega-Pancadão do Lorde Ctrl+V (~156 BPM -> 96ms por semicolcheia)
    const bossMelody: (number | null)[] = [
      329.63, 329.63, 659.25, null, 493.88, 622.25, 659.25, null,
      783.99, 659.25, 622.25, 493.88, 392.0, 440.0, 493.88, 659.25,
      329.63, 493.88, 659.25, 783.99, 987.77, null, 783.99, 659.25,
      622.25, 493.88, 659.25, 783.99, 987.77, 1318.5, 987.77, 1318.5,
    ];

    const stepMs = mode === 'boss' ? 96 : mode === 'battle' ? 105 : 118;
    const melody =
      mode === 'boss'
        ? bossMelody
        : mode === 'battle'
          ? battleMelody
          : titleMelody;

    this.musicTimer = window.setInterval(() => {
      if (this.isMuted || !this.bgmEnabled) return;

      const step = this.stepIndex;
      const barStep = step % 16; // 0..15 dentro do compasso
      const phraseStep = step % 64; // 0..63 frase de 4 compassos
      const melNote = melody[step % melody.length];

      // 1) BATIDA DE DJ (Four-on-the-floor + Sincopado Piseiro/Funk!)
      // Bumbo pesado nos tempos 0, 4, 8, 12 + contratempos insanos em battle/boss!
      if (barStep % 4 === 0) {
        this.playDjKick(0, barStep === 0);
      } else if (
        (mode !== 'title' && (barStep === 3 || barStep === 10 || barStep === 14)) ||
        (mode === 'boss' && barStep === 6)
      ) {
        this.playDjKick(0, false);
      }

      // 2) CLAP / SNARE DE DJ nos tempos 4 e 12 (+ virada rápida no final da frase!)
      if (barStep === 4 || barStep === 12) {
        this.playDjClap(0, true);
      } else if (phraseStep >= 60) {
        // Virada frenética de caixa no final dos 4 compassos antes do DROP!
        this.playDjClap(0, phraseStep === 63);
      }

      // 3) HI-HATS & TRIÂNGULO NORDESTINO em semicolcheias!
      if (barStep % 2 === 1) {
        this.playDjHiHat(0, barStep === 7 || barStep === 15);
      } else if (barStep === 2 || barStep === 10) {
        this.playTriangle(0, barStep === 10);
      }
      // Trap/DJ rapid hi-hat roll no passo 14 e 15 de compassos pares
      if (step % 32 >= 29) {
        this.playDjHiHat(0, false);
        this.playDjHiHat(stepMs / 2000, false);
      }

      // 4) BAIXO ACID / SUB-BASS PULSANTE
      const rootFreq =
        mode === 'boss' ? 82.41 : mode === 'battle' ? 110.0 : 130.81; // Mi / Lá / Dó
      const bassPattern = [1, 0, 1.5, 1, 0, 1.33, 1, 1.5, 1, 0, 1.5, 1.25, 1, 1.5, 1.33, 2];
      const bassMult = bassPattern[barStep];
      if (bassMult > 0) {
        this.playAcidBass(
          rootFreq * bassMult,
          stepMs / 1000 * 1.1,
          0,
          mode === 'boss' ? 0.085 : 0.068
        );
      }

      // 5) MELODIA INSANA DE SANFONA RAVE + PITCH BENDS CÔMICOS
      if (melNote) {
        const isCrazySlide = step % 16 === 15 || step % 32 === 5;
        this.playTone(
          melNote,
          isCrazySlide ? 0.15 : 0.1,
          step % 8 < 4 ? 'square' : 'sawtooth',
          mode === 'title' ? 0.028 : 0.036,
          0,
          isCrazySlide ? melNote * 1.12 : undefined
        );
      }

      // 6) EFEITOS ESPECIAIS DE DJ NOS DROPS (Scratch e Corneta!)
      if (phraseStep === 30) {
        this.playDjScratch(0);
      }
      if (phraseStep === 0 && step > 0) {
        // Drop triunfante a cada 4 compassos!
        this.playSanfonaChord([rootFreq * 2, rootFreq * 2.5, rootFreq * 3], 0.22, 0, 0.028);
        if (mode !== 'title' && step % 128 === 0) {
          this.playDjAirhorn(0);
        }
      }

      this.stepIndex++;
    }, stepMs);
  }
}

export const soundEngine = new RetroSoundEngine();
