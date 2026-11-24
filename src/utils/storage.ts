import { LeaderboardEntry, PlayerProgress } from '../types/game';

const SAVE_KEY = 'prof_vagner_rpg_save_v1';
const RANKING_KEY = 'prof_vagner_rpg_ranking_v1';

export const createInitialProgress = (): PlayerProgress => ({
  level: 1,
  xp: 0,
  xpToNext: 100,
  maxHp: 120,
  maxFocus: 60,
  baseAttack: 18,
  baseDefense: 8,
  didacticCoins: 40,
  highestStageCleared: 0,
  inventory: {
    aula_comecou: 2,
    compartilhar_turma: 1,
    colocar_no_quadro: 1,
    presta_atencao: 2,
  },
  stats: {
    battlesWon: 0,
    challengesSolved: 0,
    challengesAttempted: 0,
    bestCombo: 0,
    xiqueXiqueUsed: 0,
    xiqueXiqueKOs: 0,
    labExperimentsRun: 0,
    totalScore: 0,
    perfectVictories: 0,
  },
  unlockedAchievements: [],
  tutorialCompleted: false,
});

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota issues safely
  }
}

export function loadProgress(): PlayerProgress | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlayerProgress;
    const base = createInitialProgress();
    return {
      ...base,
      ...parsed,
      inventory: { ...base.inventory, ...(parsed.inventory || {}) },
      stats: { ...base.stats, ...(parsed.stats || {}) },
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
    };
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    playerName: 'Prof. Ada Lovelace',
    score: 8450,
    level: 8,
    stageCleared: 6,
    accuracy: 95,
    date: '18/11/2026',
  },
  {
    id: 'seed-2',
    playerName: 'Prof. Alan Turing',
    score: 7120,
    level: 7,
    stageCleared: 6,
    accuracy: 88,
    date: '19/11/2026',
  },
  {
    id: 'seed-3',
    playerName: 'Monitora Carol (FOR)',
    score: 5200,
    level: 5,
    stageCleared: 4,
    accuracy: 82,
    date: '20/11/2026',
  },
  {
    id: 'seed-4',
    playerName: 'Estagiário Lucas',
    score: 3100,
    level: 3,
    stageCleared: 3,
    accuracy: 75,
    date: '21/11/2026',
  },
];

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(RANKING_KEY);
    if (!raw) return DEFAULT_LEADERBOARD;
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : DEFAULT_LEADERBOARD;
  } catch {
    return DEFAULT_LEADERBOARD;
  }
}

export function saveLeaderboardScore(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry[] {
  const existing = loadLeaderboard();
  const today = new Date().toLocaleDateString('pt-BR');
  const filtered = existing.filter((e) => !e.isPlayer);
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `player-${Date.now()}`,
    date: today,
    isPlayer: true,
  };
  const updated = [...filtered, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  try {
    localStorage.setItem(RANKING_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}
