import { useCallback, useEffect, useState } from 'react';
import { ACHIEVEMENTS } from './data/achievements';
import { CAMPAIGN_STAGES } from './data/enemiesAndStages';
import { POTIONS } from './data/potionsAndSkills';
import {
  AchievementDef,
  LeaderboardEntry,
  PlayerProgress,
  PotionId,
  ScreenView,
  StageConfig,
} from './types/game';
import {
  clearProgress,
  createInitialProgress,
  loadLeaderboard,
  loadProgress,
  saveLeaderboardScore,
  saveProgress,
} from './utils/storage';
import { soundEngine } from './utils/soundEngine';
import { TitleScreen } from './components/TitleScreen';
import { CampaignMap } from './components/CampaignMap';
import { BattleArena, BattleResultPayload } from './components/BattleArena';
import { ProfessorLab } from './components/ProfessorLab';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { AchievementsAndRanking } from './components/AchievementsAndRanking';
import { AchievementToast } from './components/AchievementToast';

export default function App() {
  const [savedInitial] = useState<PlayerProgress | null>(() => loadProgress());
  const [progress, setProgress] = useState<PlayerProgress>(
    () => savedInitial ?? createInitialProgress()
  );
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(
    () => savedInitial !== null
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() =>
    loadLeaderboard()
  );

  const [screen, setScreen] = useState<ScreenView>('TITLE');
  const [returnScreen, setReturnScreen] = useState<ScreenView>('TITLE');
  const [activeStage, setActiveStage] = useState<StageConfig>(
    CAMPAIGN_STAGES[0]
  );
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastAchievement, setToastAchievement] =
    useState<AchievementDef | null>(null);
  const [levelUpBanner, setLevelUpBanner] = useState<number | null>(null);

  // Salvamento automático no localStorage sempre que progress mudar
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Controle de música ambiente por tela
  useEffect(() => {
    if (screen !== 'BATTLE') {
      soundEngine.startMusic('title');
    }
  }, [screen]);

  const evaluateAchievements = useCallback((next: PlayerProgress): PlayerProgress => {
    let updated = { ...next };
    let newlyUnlocked: AchievementDef | null = null;

    for (const ach of ACHIEVEMENTS) {
      if (!updated.unlockedAchievements.includes(ach.id) && ach.check(updated)) {
        updated = {
          ...updated,
          didacticCoins: updated.didacticCoins + ach.rewardCoins,
          unlockedAchievements: [...updated.unlockedAchievements, ach.id],
        };
        if (!newlyUnlocked) newlyUnlocked = ach;
      }
    }

    if (newlyUnlocked) {
      setToastAchievement(newlyUnlocked);
      window.setTimeout(() => setToastAchievement(null), 4500);
    }
    return updated;
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
    if (!nextMuted) soundEngine.playClick();
  };

  const handleStartNewGame = () => {
    clearProgress();
    const fresh = createInitialProgress();
    setProgress(fresh);
    setHasSavedGame(true);
    setScreen('CAMPAIGN');
  };

  const handleContinueGame = () => {
    setHasSavedGame(true);
    setScreen('CAMPAIGN');
  };

  const handleSelectStage = (stage: StageConfig) => {
    setActiveStage(stage);
    setScreen('BATTLE');
  };

  const handleBuyPotion = (potionId: PotionId) => {
    const cost = POTIONS[potionId].cost;
    setProgress((prev) => {
      if (prev.didacticCoins < cost) return prev;
      return {
        ...prev,
        didacticCoins: prev.didacticCoins - cost,
        inventory: {
          ...prev.inventory,
          [potionId]: (prev.inventory[potionId] || 0) + 1,
        },
      };
    });
  };

  const handleBattleFinish = useCallback(
    (res: BattleResultPayload) => {
      if (!res.won) return;
      setHasSavedGame(true);

      setProgress((prev) => {
        let xp = prev.xp + res.xpEarned;
        let level = prev.level;
        let xpToNext = prev.xpToNext;
        let maxHp = prev.maxHp;
        let maxFocus = prev.maxFocus;
        let baseAttack = prev.baseAttack;
        let baseDefense = prev.baseDefense;
        let leveledUpTo: number | null = null;

        while (xp >= xpToNext) {
          xp -= xpToNext;
          level += 1;
          xpToNext = Math.round(xpToNext * 1.35);
          maxHp += 22;
          maxFocus += 8;
          baseAttack += 4;
          baseDefense += 2;
          leveledUpTo = level;
        }

        if (leveledUpTo !== null) {
          soundEngine.playLevelUp();
          setLevelUpBanner(leveledUpTo);
          window.setTimeout(() => setLevelUpBanner(null), 4500);
        }

        const nextInventory: Record<PotionId, number> = {
          aula_comecou: Math.max(
            0,
            (prev.inventory.aula_comecou || 0) -
              (res.potionsUsed.aula_comecou || 0)
          ),
          compartilhar_turma: Math.max(
            0,
            (prev.inventory.compartilhar_turma || 0) -
              (res.potionsUsed.compartilhar_turma || 0)
          ),
          colocar_no_quadro: Math.max(
            0,
            (prev.inventory.colocar_no_quadro || 0) -
              (res.potionsUsed.colocar_no_quadro || 0)
          ),
          presta_atencao: Math.max(
            0,
            (prev.inventory.presta_atencao || 0) -
              (res.potionsUsed.presta_atencao || 0)
          ),
        };

        if (res.dropPotion) {
          nextInventory[res.dropPotion] =
            (nextInventory[res.dropPotion] || 0) + 1;
        }

        const nextProgress: PlayerProgress = {
          ...prev,
          level,
          xp,
          xpToNext,
          maxHp,
          maxFocus,
          baseAttack,
          baseDefense,
          didacticCoins: prev.didacticCoins + res.coinsEarned,
          highestStageCleared: Math.max(prev.highestStageCleared, res.stageId),
          inventory: nextInventory,
          stats: {
            battlesWon: prev.stats.battlesWon + 1,
            challengesSolved: prev.stats.challengesSolved + res.challengesSolved,
            challengesAttempted:
              prev.stats.challengesAttempted + res.challengesAttempted,
            bestCombo: Math.max(prev.stats.bestCombo, res.bestCombo),
            xiqueXiqueUsed: prev.stats.xiqueXiqueUsed + res.xiqueUsed,
            xiqueXiqueKOs: prev.stats.xiqueXiqueKOs + (res.xiqueKO ? 1 : 0),
            labExperimentsRun: prev.stats.labExperimentsRun,
            totalScore: prev.stats.totalScore + res.scoreEarned,
            perfectVictories:
              prev.stats.perfectVictories + (res.perfectVictory ? 1 : 0),
          },
        };

        return evaluateAchievements(nextProgress);
      });
    },
    [evaluateAchievements]
  );

  const handleExperimentRun = useCallback(() => {
    setProgress((prev) => {
      const next: PlayerProgress = {
        ...prev,
        stats: {
          ...prev.stats,
          labExperimentsRun: prev.stats.labExperimentsRun + 1,
        },
      };
      return evaluateAchievements(next);
    });
  }, [evaluateAchievements]);

  const handleCompleteTutorial = useCallback(() => {
    setHasSavedGame(true);
    setProgress((prev) => {
      const next: PlayerProgress = {
        ...prev,
        tutorialCompleted: true,
        didacticCoins: prev.tutorialCompleted
          ? prev.didacticCoins
          : prev.didacticCoins + 20,
      };
      return evaluateAchievements(next);
    });
    setScreen('CAMPAIGN');
  }, [evaluateAchievements]);

  const handleSaveScoreToRanking = (playerName: string) => {
    const accuracy =
      progress.stats.challengesAttempted > 0
        ? Math.round(
            (progress.stats.challengesSolved /
              progress.stats.challengesAttempted) *
              100
          )
        : 0;
    const updated = saveLeaderboardScore({
      playerName,
      score: progress.stats.totalScore,
      level: progress.level,
      stageCleared: progress.highestStageCleared,
      accuracy,
    });
    setLeaderboard(updated);
  };

  const nextStage = CAMPAIGN_STAGES.find((s) => s.id === activeStage.id + 1);

  return (
    <>
      {screen === 'TITLE' && (
        <TitleScreen
          hasSavedGame={hasSavedGame}
          progress={progress}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onContinue={handleContinueGame}
          onNewGame={handleStartNewGame}
          onOpenTutorial={() => setScreen('TUTORIAL')}
          onOpenLab={() => {
            setReturnScreen('TITLE');
            setScreen('LAB');
          }}
          onOpenRanking={() => {
            setReturnScreen('TITLE');
            setScreen('RANKING');
          }}
        />
      )}

      {screen === 'CAMPAIGN' && (
        <CampaignMap
          progress={progress}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onBackTitle={() => setScreen('TITLE')}
          onSelectStage={handleSelectStage}
          onBuyPotion={handleBuyPotion}
          onOpenLab={() => {
            setReturnScreen('CAMPAIGN');
            setScreen('LAB');
          }}
          onOpenRanking={() => {
            setReturnScreen('CAMPAIGN');
            setScreen('RANKING');
          }}
        />
      )}

      {screen === 'BATTLE' && (
        <BattleArena
          key={activeStage.id}
          stage={activeStage}
          progress={progress}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onExit={() => setScreen('CAMPAIGN')}
          onBattleFinish={handleBattleFinish}
          onNextStage={
            nextStage
              ? () => {
                  setActiveStage(nextStage);
                }
              : undefined
          }
        />
      )}

      {screen === 'LAB' && (
        <ProfessorLab
          onBack={() => setScreen(returnScreen)}
          onExperimentRun={handleExperimentRun}
        />
      )}

      {screen === 'TUTORIAL' && (
        <InteractiveTutorial
          onBack={() => setScreen('TITLE')}
          onCompleteTutorial={handleCompleteTutorial}
        />
      )}

      {screen === 'RANKING' && (
        <AchievementsAndRanking
          progress={progress}
          leaderboard={leaderboard}
          onBack={() => setScreen(returnScreen)}
          onSaveScoreToRanking={handleSaveScoreToRanking}
        />
      )}

      {/* Notificação de Subida de Nível */}
      {levelUpBanner !== null && (
        <div
          role="status"
          onClick={() => setLevelUpBanner(null)}
          className="fixed top-4 right-4 z-50 pixel-panel-gold px-4 py-3 animate-xique-banner cursor-pointer"
        >
          <p className="font-pixel text-xs sm:text-sm text-amber-300">
            SUBIU PARA O NÍVEL {levelUpBanner}!
          </p>
          <p className="text-xs text-slate-200 mt-0.5">
            +22 HP Máx · +8 Foco · +4 Ataque · +2 Defesa
          </p>
        </div>
      )}

      {/* Notificação de Conquista Desbloqueada */}
      <AchievementToast
        achievement={toastAchievement}
        onDismiss={() => setToastAchievement(null)}
      />
    </>
  );
}
