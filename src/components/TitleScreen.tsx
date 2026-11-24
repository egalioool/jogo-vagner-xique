import React, { useState } from 'react';
import {
  BookOpen,
  FlaskConical,
  Play,
  RotateCcw,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PlayerProgress } from '../types/game';
import { soundEngine } from '../utils/soundEngine';

interface TitleScreenProps {
  hasSavedGame: boolean;
  progress: PlayerProgress;
  isMuted: boolean;
  onToggleMute: () => void;
  onContinue: () => void;
  onNewGame: () => void;
  onOpenTutorial: () => void;
  onOpenLab: () => void;
  onOpenRanking: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSavedGame,
  progress,
  isMuted,
  onToggleMute,
  onContinue,
  onNewGame,
  onOpenTutorial,
  onOpenLab,
  onOpenRanking,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0c1219] text-[#f4efe6]">
      {/* Barra Superior Limpa */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <span className="font-pixel text-sm sm:text-base text-amber-400 whitespace-nowrap shrink-0">
          Prof. Vagner RPG
        </span>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenTutorial();
            }}
            className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Tutorial
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenLab();
            }}
            className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Laboratório
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenRanking();
            }}
            className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Conquistas e Ranking
          </button>
        </nav>

        <button
          type="button"
          onClick={onToggleMute}
          className="pixel-btn px-3 py-2 bg-[#1a2634] border-2 border-slate-600 text-xs font-medium text-slate-200 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>Som Desligado</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>DJ Rave Ativo</span>
            </>
          )}
        </button>
      </header>

      {/* Palco Cinematográfico Principal */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Arte Cinematográfica da Sala de Aula */}
          <div className="lg:col-span-7 relative overflow-hidden pixel-panel min-h-[280px] sm:min-h-[380px] flex flex-col justify-end">
            <img
              src="/src/assets/images/title_classroom_arena_1795517352490.jpg"
              alt="Sala de aula em pixel art do Professor Vagner"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-top pixel-art"
            />
            {/* Gradiente garantindo contraste > 4.5:1 e cobrindo a borda inferior da imagem */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-[#0b1118]/75 to-black/20" />

            <div className="relative z-10 p-5 sm:p-7">
              <p className="text-xs sm:text-sm font-mono text-amber-300 mb-2">
                Edição Completa · 6 Fases · Laboratório de Algoritmos
              </p>
              <h1 className="font-pixel text-2xl sm:text-4xl text-white leading-tight drop-shadow-[0_4px_0_#000] text-balance">
                Professor Vagner: A Batalha pelo Conhecimento
              </h1>
              <p className="text-sm sm:text-base text-slate-200 mt-3 max-w-xl leading-relaxed">
                Enfrente alunos conversadores, dorminhocos, jogadores de Free Fire e copiadores de código usando laços de repetição, poções pedagógicas e a lendária técnica{' '}
                <span className="text-amber-300 font-semibold">
                  Xique-Xique, Bahia!
                </span>
              </p>
            </div>
          </div>

          {/* Card do Herói + Menu Principal */}
          <div className="lg:col-span-5 pixel-panel p-5 sm:p-6 flex flex-col justify-between gap-5">
            {/* Retrato do Professor Vagner */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden border-2 border-amber-400 bg-slate-900">
                <img
                  src="/src/assets/images/hero_prof_vagner_1795517352849.jpg"
                  alt="Retrato em pixel art do Professor Vagner"
                  referrerPolicy="no-referrer"
                  className="w-full h-[116%] object-cover object-top pixel-art"
                />
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-center font-pixel text-[9px] text-amber-300 py-0.5 border-t border-amber-500/60">
                  PROF. VAGNER
                </div>
              </div>

              <div className="min-w-0">
                <h2 className="font-pixel text-base sm:text-lg text-white">
                  Mestre da Lousa
                </h2>
                <div className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums">
                  <span>Nível {progress.level}</span>
                  <span aria-hidden="true">·</span>
                  <span>{progress.highestStageCleared}/6 Fases</span>
                  <span aria-hidden="true">·</span>
                  <span>{progress.stats.totalScore} pts</span>
                </div>
                <p className="text-xs text-emerald-300 mt-1.5">
                  Progresso salvo automaticamente no navegador
                </p>
              </div>
            </div>

            {/* Botões Principais */}
            <div className="flex flex-col gap-2.5">
              {hasSavedGame && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onContinue();
                  }}
                  className="pixel-btn w-full min-h-12 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Continuar Campanha</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  if (hasSavedGame && progress.highestStageCleared > 0 && !confirmReset) {
                    setConfirmReset(true);
                  } else {
                    setConfirmReset(false);
                    onNewGame();
                  }
                }}
                className={`pixel-btn w-full min-h-12 px-4 py-3 font-pixel text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap ${
                  hasSavedGame
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Swords className="w-5 h-5" />
                <span>
                  {confirmReset
                    ? 'Confirmar Novo Jogo?'
                    : hasSavedGame
                      ? 'Nova Campanha'
                      : 'Iniciar Batalha'}
                </span>
              </button>

              {confirmReset && (
                <div className="flex items-center justify-between gap-2 text-xs text-amber-200 bg-amber-950/50 border border-amber-500/60 px-3 py-2">
                  <span>Isso reinicia o nível e fases salvas.</span>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="underline font-semibold cursor-pointer shrink-0"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenTutorial();
                  }}
                  className="pixel-btn min-h-11 px-3 py-2.5 bg-[#1e2c3d] hover:bg-[#26384d] border border-slate-600 text-slate-100 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Tutorial</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenLab();
                  }}
                  className="pixel-btn min-h-11 px-3 py-2.5 bg-[#1e2c3d] hover:bg-[#26384d] border border-slate-600 text-slate-100 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <FlaskConical className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Laboratório</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenRanking();
                }}
                className="pixel-btn w-full min-h-11 px-4 py-2.5 bg-[#1a2431] hover:bg-[#223041] border border-slate-600 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Conquistas e Ranking</span>
              </button>

              {hasSavedGame && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setConfirmReset(true);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 pt-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar progresso salvo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
