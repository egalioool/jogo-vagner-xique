import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  FlaskConical,
  Lock,
  ShoppingBag,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CAMPAIGN_STAGES } from '../data/enemiesAndStages';
import { POTION_LIST } from '../data/potionsAndSkills';
import { PlayerProgress, PotionId, StageConfig } from '../types/game';
import { soundEngine } from '../utils/soundEngine';

interface CampaignMapProps {
  progress: PlayerProgress;
  isMuted: boolean;
  onToggleMute: () => void;
  onBackTitle: () => void;
  onSelectStage: (stage: StageConfig) => void;
  onBuyPotion: (potionId: PotionId) => void;
  onOpenLab: () => void;
  onOpenRanking: () => void;
}

export const CampaignMap: React.FC<CampaignMapProps> = ({
  progress,
  isMuted,
  onToggleMute,
  onBackTitle,
  onSelectStage,
  onBuyPotion,
  onOpenLab,
  onOpenRanking,
}) => {
  const xpPercent = Math.min(
    100,
    Math.round((progress.xp / progress.xpToNext) * 100)
  );

  return (
    <div className="min-h-screen bg-[#0c1219] text-[#f4efe6] pb-12">
      {/* Cabeçalho de Navegação */}
      <header className="border-b border-slate-800 bg-[#101822]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onBackTitle();
            }}
            className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Início</span>
          </button>

          <nav className="flex items-center gap-4 sm:gap-6 text-sm">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenLab();
              }}
              className="text-slate-300 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Laboratório</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenRanking();
              }}
              className="text-slate-300 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trophy className="w-4 h-4" />
              <span>Ranking</span>
            </button>
          </nav>

          <button
            type="button"
            onClick={onToggleMute}
            className="pixel-btn px-3 py-1.5 bg-[#1a2634] border border-slate-600 text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="hidden sm:inline">
              {isMuted ? 'Mudo' : 'Som Ativo'}
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Status do Professor Vagner */}
        <section className="pixel-panel p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-amber-400">
                Mapa da Campanha Escolar · Corredor dos Laboratórios
              </p>
              <h1 className="font-pixel text-xl sm:text-2xl text-white mt-1">
                Sala dos Professores — Nível {progress.level}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm tabular-nums">
              <div>
                <span className="text-slate-400">HP Máx: </span>
                <span className="font-mono font-bold text-emerald-300">
                  {progress.maxHp}
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div>
                <span className="text-slate-400">Ataque: </span>
                <span className="font-mono font-bold text-amber-300">
                  {progress.baseAttack}
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="font-mono font-bold text-amber-300">
                  {progress.didacticCoins} Pontos de Didática
                </span>
              </div>
            </div>
          </div>

          {/* Barra de XP */}
          <div className="mt-4">
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1 tabular-nums">
              <span>Experiência (XP)</span>
              <span>
                {progress.xp} / {progress.xpToNext} XP
              </span>
            </div>
            <div className="h-3 bg-slate-900 border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Grade Principal: 6 Fases + Cantina/Farmácia Pedagógica */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lista de Fases Progressivas */}
          <section className="lg:col-span-8 space-y-3">
            <h2 className="font-pixel text-base sm:text-lg text-white">
              Fases da Campanha (6 Desafios)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CAMPAIGN_STAGES.map((stage) => {
                const isUnlocked = stage.id <= progress.highestStageCleared + 1;
                const isCleared = stage.id <= progress.highestStageCleared;

                return (
                  <div
                    key={stage.id}
                    className={`pixel-panel p-4 flex flex-col justify-between gap-3 ${
                      !isUnlocked ? 'opacity-60' : ''
                    } ${stage.isBoss ? 'border-amber-500/80' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs font-mono">
                        <span
                          className={
                            stage.isBoss ? 'text-amber-300 font-bold' : 'text-sky-300'
                          }
                        >
                          {stage.environmentTag}
                        </span>
                        {isCleared && (
                          <span className="text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Vencida
                          </span>
                        )}
                      </div>

                      <h3 className="font-pixel text-sm sm:text-base text-white mt-1.5">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {stage.subtitle}
                      </p>

                      <div className="mt-2.5 text-xs text-slate-300 space-y-1 tabular-nums">
                        <p>
                          <span className="text-slate-400">Oponente: </span>
                          <span className="font-semibold text-white">
                            {stage.enemy.name}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-400">HP: </span>
                          <span className="font-mono">{stage.enemy.maxHp}</span>
                          <span aria-hidden="true"> · </span>
                          <span className="text-slate-400">Recompensa: </span>
                          <span className="font-mono text-amber-300">
                            +{stage.enemy.xpReward} XP
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        soundEngine.playClick();
                        onSelectStage(stage);
                      }}
                      className={`pixel-btn w-full min-h-10 px-3 py-2 text-xs sm:text-sm font-pixel flex items-center justify-center gap-2 whitespace-nowrap ${
                        isUnlocked
                          ? stage.isBoss
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Swords className="w-4 h-4" />
                          <span>{isCleared ? 'Rejogar Fase' : 'Iniciar Aula'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Vença a Fase {stage.id - 1}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Loja / Estoque de Poções Pedagógicas */}
          <aside className="lg:col-span-4 pixel-panel p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
              <ShoppingBag className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h2 className="font-pixel text-sm sm:text-base text-white">
                  Mochila & Poções
                </h2>
                <p className="text-xs text-slate-400">
                  Troque Pontos de Didática por reforços
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {POTION_LIST.map((potion) => {
                const count = progress.inventory[potion.id] || 0;
                const canAfford = progress.didacticCoins >= potion.cost;

                return (
                  <div
                    key={potion.id}
                    className="p-3 bg-[#0f1722] border border-slate-700 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-amber-300">
                        {potion.phrase}
                      </p>
                      <span className="font-mono text-xs text-slate-300 tabular-nums shrink-0">
                        Qtd: {count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      {potion.effectSummary}
                    </p>
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => {
                          soundEngine.playPotion();
                          onBuyPotion(potion.id);
                        }}
                        className={`pixel-btn px-3 py-1.5 text-xs font-mono font-bold whitespace-nowrap ${
                          canAfford
                            ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Comprar ({potion.cost} pts)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
