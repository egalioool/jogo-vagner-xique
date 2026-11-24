type MusicMode = 'none' | 'title' | 'battle' | 'boss';

class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private bgmEnabled = true;
  private voiceEnabled = true;
  private currentMusic: MusicMode = 'none';
  private musicTimer: number | null = null;
  private stepIndex = 0;

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

  // Fala cômica nordestina opcional via Web Speech API do navegador
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
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  // Instrumentos Nordestinos sintetizados: Triângulo, Zabumba, Sanfona e Pífano
  private playTriangle(delay = 0, open = false) {
    if (this.isMuted) return;
    // Triângulo metálico brilhante usando harmônicos agudos
    this.playTone(2340, open ? 0.14 : 0.055, 'sine', 0.032, delay);
    this.playTone(3510, open ? 0.12 : 0.045, 'triangle', 0.018, delay);
  }

  private playZabumba(delay = 0, accent = false) {
    if (this.isMuted) return;
    // Tum grave da zabumba nordestina + bacalhau estalado no contratempo
    this.playTone(accent ? 115 : 88, 0.14, 'sine', accent ? 0.11 : 0.085, delay, 42);
    this.playTone(accent ? 150 : 110, 0.06, 'triangle', 0.04, delay, 55);
  }

  private playSanfonaChord(freqs: number[], duration = 0.18, delay = 0, volume = 0.035) {
    freqs.forEach((f) => {
      this.playTone(f, duration, 'sawtooth', volume * 0.55, delay);
      this.playTone(f * 1.004, duration, 'triangle', volume * 0.65, delay);
    });
  }

  // Efeito cômico de "Boing" / mola nordestina
  public playBoing() {
    this.playTone(190, 0.22, 'sine', 0.09, 0, 560);
    this.playTone(560, 0.16, 'triangle', 0.05, 0.12, 320);
  }

  public playClick() {
    // Ting do triângulo nordestino ao clicar
    this.playTriangle(0, false);
    this.playTone(720, 0.045, 'triangle', 0.04, 0, 880);
  }

  public playHover() {
    this.playTone(1760, 0.025, 'sine', 0.02);
  }

  public playAttack() {
    // Chicote / chinelada nordestina + estalo de giz + boing cômico!
    this.playTone(780, 0.07, 'sawtooth', 0.09, 0, 190);
    this.playZabumba(0.05, true);
    this.playTone(260, 0.12, 'square', 0.07, 0.07, 520);
  }

  public playHit() {
    // Pancada de zabumba + "Oxente!" slide descendente de pífano
    this.playZabumba(0, true);
    this.playTone(480, 0.16, 'sawtooth', 0.08, 0.02, 130);
    this.playTriangle(0.08, false);
  }

  public playDefend() {
    // Acorde protetor de sanfona (Dó maior nordestino)
    this.playSanfonaChord([261.63, 329.63, 392.0], 0.2, 0, 0.05);
    this.playTriangle(0.06, true);
  }

  public playPotion() {
    // Riffs alegres de pífano e triângulo ("Arre égua, revigorou!")
    const notes = [523.25, 659.25, 783.99, 932.33, 1046.5]; // escala mixolídia nordestina!
    notes.forEach((n, i) => {
      this.playTone(n, 0.1, 'triangle', 0.075, i * 0.055);
    });
    this.playTriangle(0.12, true);
    this.playTriangle(0.24, true);
  }

  public playCodeCorrect() {
    // Frase clássica inspirada em baião vitorioso + voz "Arre égua!"
    const baiao = [
      { f: 523.25, d: 0.08, t: 0 },
      { f: 587.33, d: 0.08, t: 0.08 },
      { f: 659.25, d: 0.1, t: 0.16 },
      { f: 783.99, d: 0.1, t: 0.26 },
      { f: 932.33, d: 0.09, t: 0.36 },
      { f: 1046.5, d: 0.22, t: 0.45 },
    ];
    baiao.forEach((n) => this.playTone(n.f, n.d, 'square', 0.065, n.t));
    this.playTriangle(0.16, false);
    this.playTriangle(0.36, true);
    this.playZabumba(0.45, true);
  }

  public playCodeWrong() {
    // Trombone cômico nordestino ("Oxente, deu bug!")
    this.playTone(311.13, 0.16, 'sawtooth', 0.08, 0, 293.66);
    this.playTone(277.18, 0.16, 'sawtooth', 0.08, 0.17, 261.63);
    this.playTone(233.08, 0.34, 'sawtooth', 0.09, 0.34, 155.56);
    this.playZabumba(0.34, false);
  }

  public playLevelUp() {
    // Fanfarra de São João em 8-bit!
    const notes = [523.25, 659.25, 783.99, 932.33, 1046.5, 1318.51];
    notes.forEach((n, i) => {
      this.playTone(n, 0.13, 'square', 0.065, i * 0.075);
      if (i % 2 === 0) this.playTriangle(i * 0.075, true);
    });
    this.playSanfonaChord([523.25, 659.25, 783.99], 0.35, 0.45, 0.055);
  }

  public playXiqueXique() {
    // Crescendo épico de sanfona + zabumba pesada + pífano do sertão!
    this.playZabumba(0, true);
    this.playZabumba(0.14, true);
    this.playTone(196, 0.3, 'sawtooth', 0.1, 0, 784);
    const sertaoRiff = [523.25, 659.25, 740.0, 783.99, 932.33, 1046.5, 1318.5];
    sertaoRiff.forEach((n, i) => {
      this.playTone(n, 0.13, 'square', 0.085, 0.28 + i * 0.065);
      this.playTriangle(0.28 + i * 0.065, i === sertaoRiff.length - 1);
    });
    this.playSanfonaChord([261.63, 329.63, 392.0, 466.16], 0.45, 0.72, 0.06);
    this.speakNordestino('Xique-Xique, Bahia!', 1.05, 1.1);
  }

  public playFlyAway() {
    // Assobio cômico de decolagem até o sertão + plim estrelinha!
    this.playTone(240, 0.85, 'sine', 0.09, 0, 1650);
    this.playBoing();
    this.playTriangle(0.88, true);
    this.playTone(2093.0, 0.24, 'triangle', 0.08, 0.96);
  }

  public playVictory() {
    // Quadrilha de São João vitoriosa!
    const melody = [
      { f: 523.25, d: 0.11, t: 0 },
      { f: 659.25, d: 0.11, t: 0.11 },
      { f: 783.99, d: 0.11, t: 0.22 },
      { f: 932.33, d: 0.12, t: 0.33 },
      { f: 1046.5, d: 0.25, t: 0.46 },
      { f: 932.33, d: 0.11, t: 0.72 },
      { f: 1046.5, d: 0.38, t: 0.85 },
    ];
    melody.forEach((m, idx) => {
      this.playTone(m.f, m.d, 'square', 0.075, m.t);
      if (idx % 2 === 0) this.playTriangle(m.t, idx === melody.length - 1);
    });
    this.playZabumba(0, true);
    this.playZabumba(0.46, true);
    this.playZabumba(0.85, true);
  }

  public playDefeat() {
    const notes = [392, 349.23, 311.13, 233.08, 196];
    notes.forEach((n, i) => {
      this.playTone(n, 0.24, 'sawtooth', 0.065, i * 0.22, n * 0.94);
    });
  }

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

    // Escala Nordestina Lídio-Mixolídia (Fá# + Sib) com saltos cômicos de sanfona e pífano!
    // Title: Forró Alegre da Sala de Aula (bem saltitante e engraçado!)
    const titleLead = [
      523.25, 659.25, 783.99, 932.33, 783.99, 659.25, 587.33, 523.25,
      587.33, 740.0, 880.0, 740.0, 659.25, 587.33, 523.25, 392.0,
      523.25, 659.25, 932.33, 1046.5, 932.33, 783.99, 659.25, 587.33,
      523.25, 392.0, 466.16, 523.25, 392.0, 523.25, 783.99, 1046.5,
    ];

    // Battle: Baião Frenético do Quadro Negro (ritmo acelerado e humorístico!)
    const battleLead = [
      440.0, 554.37, 659.25, 783.99, 659.25, 554.37, 440.0, 392.0,
      440.0, 659.25, 880.0, 783.99, 659.25, 587.33, 523.25, 440.0,
      587.33, 740.0, 880.0, 987.77, 880.0, 740.0, 659.25, 587.33,
      523.25, 659.25, 783.99, 659.25, 523.25, 392.0, 440.0, 880.0,
    ];

    // Boss: Embolada de Repente do Lorde da Bagunça (rápido, dramático e cômico!)
    const bossLead = [
      329.63, 415.3, 493.88, 622.25, 493.88, 415.3, 329.63, 293.66,
      329.63, 493.88, 659.25, 587.33, 493.88, 440.0, 392.0, 329.63,
      392.0, 493.88, 622.25, 783.99, 659.25, 587.33, 493.88, 415.3,
      329.63, 659.25, 329.63, 587.33, 329.63, 493.88, 440.0, 659.25,
    ];

    const tempoMs = mode === 'boss' ? 165 : mode === 'battle' ? 190 : 215;
    const pattern =
      mode === 'boss'
        ? bossLead
        : mode === 'battle'
          ? battleLead
          : titleLead;

    this.musicTimer = window.setInterval(() => {
      if (this.isMuted || !this.bgmEnabled) return;
      const idx = this.stepIndex % pattern.length;
      const note = pattern[idx];

      // Melodia de sanfona / pífano
      const isJumpNote = idx === 31 || idx === 19;
      this.playTone(
        note,
        isJumpNote ? 0.16 : 0.12,
        idx % 4 === 2 ? 'square' : 'triangle',
        0.026,
        0,
        isJumpNote ? note * 1.06 : undefined
      );

      // Ritmo autêntico de Baião: Zabumba no 0 e 3, Triângulo metálico no contratempo (1, 2, 3)
      const beat = idx % 4;
      if (beat === 0) {
        this.playZabumba(0, false);
        // Baixo da sanfona
        this.playTone(note / 4, 0.15, 'triangle', 0.025);
      } else if (beat === 1) {
        this.playTriangle(0, false);
      } else if (beat === 2) {
        this.playTriangle(0, true);
      } else if (beat === 3) {
        this.playZabumba(0, true);
        this.playTriangle(0, false);
      }

      // Acorde cômico da sanfona no início de cada compasso de 8 tempos
      if (idx % 8 === 0) {
        this.playSanfonaChord([note / 2, (note / 2) * 1.25], 0.18, 0, 0.015);
      }

      this.stepIndex++;
    }, tempoMs);
  }
}

export const soundEngine = new RetroSoundEngine();
