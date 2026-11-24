export type ScreenView =
  | 'TITLE'
  | 'TUTORIAL'
  | 'CAMPAIGN'
  | 'BATTLE'
  | 'LAB'
  | 'RANKING';

export type EnemyArchetype =
  | 'conversador'
  | 'dorminhoco'
  | 'freefire'
  | 'copiador'
  | 'dj_caixinha'
  | 'lorde_bagunca';

export type SpriteAnimState =
  | 'idle'
  | 'attack'
  | 'hit'
  | 'defend'
  | 'cast'
  | 'ko'
  | 'flyAway';

export type ProgrammingTopic =
  | 'FOR'
  | 'WHILE'
  | 'VARIAVEIS'
  | 'PRIMOS'
  | 'FIBONACCI'
  | 'TABUADA'
  | 'ALGORITMOS';

export type ChallengeFormat = 'SAIDA' | 'LACUNA' | 'BUG';

export interface CodeChallenge {
  id: string;
  topic: ProgrammingTopic;
  format: ChallengeFormat;
  difficulty: 1 | 2 | 3;
  title: string;
  prompt: string;
  code: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type PotionId =
  | 'aula_comecou'
  | 'compartilhar_turma'
  | 'colocar_no_quadro'
  | 'presta_atencao';

export interface PotionItem {
  id: PotionId;
  phrase: string;
  name: string;
  effectSummary: string;
  cost: number;
  color: string;
}

export interface PlayerSkill {
  id: string;
  name: string;
  focusCost: number;
  unlockLevel: number;
  powerMultiplier: number;
  description: string;
  type: 'damage' | 'pierce' | 'heal_strike';
}

export interface EnemyMove {
  name: string;
  speech: string;
  damageMultiplier: number;
  effect?: 'drain_focus' | 'self_heal' | 'weaken_player' | 'double_hit';
}

export interface StageConfig {
  id: number;
  title: string;
  subtitle: string;
  environmentTag: string;
  isBoss: boolean;
  recommendedLevel: number;
  enemy: {
    name: string;
    title: string;
    archetype: EnemyArchetype;
    maxHp: number;
    attack: number;
    defense: number;
    xpReward: number;
    pointsReward: number;
    didacticCoinsReward: number;
    weaknessTopic: ProgrammingTopic;
    introDialogue: string[];
    victoryQuote: string;
    defeatQuote: string;
    moves: EnemyMove[];
  };
  topicPool: ProgrammingTopic[];
  dropPotion?: PotionId;
}

export interface PlayerProgress {
  level: number;
  xp: number;
  xpToNext: number;
  maxHp: number;
  maxFocus: number;
  baseAttack: number;
  baseDefense: number;
  didacticCoins: number;
  highestStageCleared: number;
  inventory: Record<PotionId, number>;
  stats: {
    battlesWon: number;
    challengesSolved: number;
    challengesAttempted: number;
    bestCombo: number;
    xiqueXiqueUsed: number;
    xiqueXiqueKOs: number;
    labExperimentsRun: number;
    totalScore: number;
    perfectVictories: number;
  };
  unlockedAchievements: string[];
  tutorialCompleted: boolean;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  iconName: string;
  check: (progress: PlayerProgress) => boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  level: number;
  stageCleared: number;
  accuracy: number;
  date: string;
  isPlayer?: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  target: 'player' | 'enemy';
  kind: 'damage' | 'crit' | 'heal' | 'status' | 'miss';
}
