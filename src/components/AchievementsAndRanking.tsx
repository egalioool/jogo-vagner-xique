import React, { useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, Lock, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { LeaderboardEntry, PlayerProgress } from '../types/game';
import { soundEngine } from '../utils/soundEngine';

interface AchievementsAndRankingProps {
  progress: PlayerProgress;
  leaderboard: LeaderboardEntry[];
  onBack: () => void;
  onSaveScoreToRanking: (playerName: string) => void;
}

export const AchievementsAndRanking: React.FC<AchievementsAndRankingProps> = ({
  progress,
  leaderboard,
  onBack,
  onSaveScoreToRanking,
}) => {
  const [nameInput, setNameInput] = useState('Prof. Vagner');
  const [savedNotice, setSavedNotice] = useState(false);

  const accuracy =
    progress.stats.challengesAttempted > 0
      ? Math.round(
          (progress.stats.challengesSolved /
            progress.stats.challengesAttempted) *
            100
        )
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim() || 'Prof. Vagner';
    soundEngine.playLevelUp();
    onSaveScoreToRanking(trimmed);
    setSavedNotice(true);
  };

  return (
    <div className="min-h-screen bg-[#0c1219] text-[#f4efe6] pb-12">
      <header className="border-b border-slate-800 bg-[#101822]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onBack();
            }}
            className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <h1 className="font-pixel text-sm sm:text-base text-amber-300">
            Conquistas e Ranking Escolar
          </h1>

          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {progress.unlockedAchievements.length}/{ACHIEVEMENTS.length} Conquistas
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ranking de Pontuação */}
        <section className="lg:col-span-5 pixel-panel p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-base text-white">
              Ranking de Pontuação
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-3.5 bg-[#0f1722] border border-slate-700 space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="text-slate-400">Sua Pontuação Atual:</span>
              <span className="text-amber-300 font-bold text-sm">
                {progress.stats.totalScore} pts
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={24}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Seu nome no mural"
                className="flex-1 min-w-0 px-3 py-2 bg-[#090e14] border border-slate-600 text-sm text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="pixel-btn px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
              >
                Registrar
              </button>
            </div>
            {savedNotice && (
              <p className="text-xs text-emerald-300">
                Pontuação salva no Ranking! (Precisão de código: {accuracy}%)
              </p>
            )}
          </form>

          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.id}
                className={`p-3 border flex items-center justify-between gap-3 tabular-nums ${
                  entry.isPlayer
                    ? 'bg-amber-950/35 border-amber-400'
                    : 'bg-[#0f1722] border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`font-pixel text-sm w-6 text-center shrink-0 ${
                      idx === 0
                        ? 'text-amber-300'
                        : idx === 1
                          ? 'text-slate-200'
                          : idx === 2
                            ? 'text-orange-400'
                            : 'text-slate-500'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {entry.playerName}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      Nv.{entry.level} · {entry.stageCleared}/6 fases · {entry.accuracy}% código
                    </p>
                  </div>
                </div>

                <span className="font-mono font-bold text-sm text-amber-300 shrink-0">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Mural de Conquistas */}
        <section className="lg:col-span-7 pixel-panel p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="font-pixel text-base text-white">
              Conquistas Pedagógicas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = progress.unlockedAchievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-3.5 border-2 flex flex-col justify-between gap-2 ${
                    unlocked
                      ? 'bg-[#122320] border-emerald-500/80'
                      : 'bg-[#0e151f] border-slate-800 opacity-65'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-pixel text-xs ${
                          unlocked ? 'text-emerald-300' : 'text-slate-400'
                        }`}
                      >
                        {ach.title}
                      </span>
                      {unlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-snug">
                      {ach.description}
                    </p>
                  </div>
                  <p className="text-[11px] font-mono text-amber-300 tabular-nums">
                    Recompensa: +{ach.rewardCoins} Pontos de Didática
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
