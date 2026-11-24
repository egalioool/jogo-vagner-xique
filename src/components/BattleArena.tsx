import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Backpack,
  Code2,
  Flame,
  Shield,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CodeChallenge,
  FloatingText,
  PlayerProgress,
  PlayerSkill,
  PotionId,
  SpriteAnimState,
  StageConfig,
} from '../types/game';
import { PLAYER_SKILLS, POTIONS, POTION_LIST } from '../data/potionsAndSkills';
import { pickChallenge, TOPIC_LABELS } from '../data/challenges';
import { EnemyPixelSprite, ProfessorVagnerSprite } from './PixelSprites';
import { PixelParticles } from './PixelParticles';
import { CodeChallengeModal } from './CodeChallengeModal';
import { soundEngine } from '../utils/soundEngine';

export interface BattleResultPayload {
  won: boolean;
  stageId: number;
  xpEarned: number;
  coinsEarned: number;
  scoreEarned: number;
  dropPotion?: PotionId;
  challengesSolved: number;
  challengesAttempted: number;
  bestCombo: number;
  xiqueUsed: number;
  xiqueKO: boolean;
  perfectVictory: boolean;
  potionsUsed: Record<PotionId, number>;
}

interface BattleArenaProps {
  stage: StageConfig;
  progress: PlayerProgress;
  isMuted: boolean;
  onToggleMute: () => void;
  onExit: () => void;
  onBattleFinish: (result: BattleResultPayload) => void;
  onNextStage?: () => void;
}

type BattlePhase =
  | 'INTRO'
  | 'PLAYER_TURN'
  | 'ANIMATING'
  | 'ENEMY_TURN'
  | 'VICTORY'
  | 'DEFEAT';

type SubMenu = 'MAIN' | 'SKILLS' | 'POTIONS';

export const BattleArena: React.FC<BattleArenaProps> = ({
  stage,
  progress,
  isMuted,
  onToggleMute,
  onExit,
  onBattleFinish,
  onNextStage,
}) => {
  const [phase, setPhase] = useState<BattlePhase>('INTRO');
  const [introIdx, setIntroIdx] = useState(0);
  const [subMenu, setSubMenu] = useState<SubMenu>('MAIN');

  // Combatentes
  const [playerHp, setPlayerHp] = useState(progress.maxHp);
  const [playerFocus, setPlayerFocus] = useState(progress.maxFocus);
  const [ultimateCharge, setUltimateCharge] = useState(30);
  const [isDefending, setIsDefending] = useState(false);
  const [attackBuffTurns, setAttackBuffTurns] = useState(0);
  const [playerWeakenTurns, setPlayerWeakenTurns] = useState(0);

  const [enemyHp, setEnemyHp] = useState(stage.enemy.maxHp);
  const [enemyStunTurns, setEnemyStunTurns] = useState(0);
  const [enemyWeakenTurns, setEnemyWeakenTurns] = useState(0);

  // Inventário local na batalha (cópia sincronizada ao final)
  const [localPotions, setLocalPotions] = useState<Record<PotionId, number>>({
    ...progress.inventory,
  });
  const [potionsUsed, setPotionsUsed] = useState<Record<PotionId, number>>({
    aula_comecou: 0,
    compartilhar_turma: 0,
    colocar_no_quadro: 0,
    presta_atencao: 0,
  });

  // Animações e feedback visual
  const [playerAnim, setPlayerAnim] = useState<SpriteAnimState>('idle');
  const [enemyAnim, setEnemyAnim] = useState<SpriteAnimState>('idle');
  const [screenShake, setScreenShake] = useState(false);
  const [showXiqueCutIn, setShowXiqueCutIn] = useState(false);
  const [burstKind, setBurstKind] = useState<'none' | 'chalk' | 'code' | 'heal' | 'xique'>('none');
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [battleLog, setBattleLog] = useState<string>(
    `${stage.enemy.name} apareceu atrapalhando a aula!`
  );

  // Desafios de programação
  const [activeChallenge, setActiveChallenge] = useState<CodeChallenge | null>(null);
  const usedChallengeIds = useRef<Set<string>>(new Set());
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [xiqueUsedCount, setXiqueUsedCount] = useState(0);
  const [wasXiqueKO, setWasXiqueKO] = useState(false);
  const [victoryReported, setVictoryReported] = useState(false);
  const [turnCount, setTurnCount] = useState(1);

  const timersRef = useRef<number[]>([]);
  const floatIdRef = useRef(1);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    soundEngine.startMusic(stage.isBoss ? 'boss' : 'battle');
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [stage.isBoss]);

  const spawnFloat = useCallback(
    (text: string, target: 'player' | 'enemy', kind: FloatingText['kind']) => {
      const id = floatIdRef.current++;
      setFloatingTexts((prev) => [...prev, { id, text, target, kind }]);
      scheduleTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
      }, 1050);
    },
    [scheduleTimeout]
  );

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    scheduleTimeout(() => setScreenShake(false), 680);
  }, [scheduleTimeout]);

  const triggerBurst = useCallback(
    (kind: 'chalk' | 'code' | 'heal' | 'xique') => {
      setBurstKind(kind);
      scheduleTimeout(() => setBurstKind('none'), 650);
    },
    [scheduleTimeout]
  );

  const finishVictory = useCallback(
    (finalPlayerHp: number, xiqueKO: boolean, xiqueUses: number, finalSolved: number, finalAttempted: number, finalBestCombo: number, usedPots: Record<PotionId, number>) => {
      if (victoryReported) return;
      setVictoryReported(true);
      setWasXiqueKO(xiqueKO);

      if (xiqueKO) {
        setEnemyAnim('flyAway');
        soundEngine.playFlyAway();
        spawnFloat('DECOLANDO PRA XIQUE-XIQUE!', 'enemy', 'crit');
        setBattleLog(`${stage.enemy.name} saiu voando direto pro sertão baiano!`);
      } else {
        setEnemyAnim('ko');
        soundEngine.playVictory();
        setBattleLog(stage.enemy.victoryQuote);
      }

      scheduleTimeout(() => {
        if (xiqueKO) soundEngine.playVictory();
        setPhase('VICTORY');

        const hpBonus = Math.round((finalPlayerHp / progress.maxHp) * 300);
        const accuracyBonus =
          finalAttempted > 0
            ? Math.round((finalSolved / finalAttempted) * 250)
            : 100;
        const xiqueBonus = xiqueKO ? 250 : 0;
        const totalScoreEarned =
          stage.enemy.pointsReward + hpBonus + accuracyBonus + finalBestCombo * 80 + xiqueBonus;

        onBattleFinish({
          won: true,
          stageId: stage.id,
          xpEarned: stage.enemy.xpReward,
          coinsEarned: stage.enemy.didacticCoinsReward,
          scoreEarned: totalScoreEarned,
          dropPotion: stage.dropPotion,
          challengesSolved: finalSolved,
          challengesAttempted: finalAttempted,
          bestCombo: finalBestCombo,
          xiqueUsed: xiqueUses,
          xiqueKO,
          perfectVictory: finalAttempted > 0 && finalSolved === finalAttempted,
          potionsUsed: usedPots,
        });
      }, xiqueKO ? 1450 : 750);
    },
    [onBattleFinish, progress.maxHp, scheduleTimeout, spawnFloat, stage, victoryReported]
  );

  // Turno do Inimigo
  const runEnemyTurn = useCallback(
    (
      currentPlayerHp: number,
      currentEnemyHp: number,
      currentStun: number,
      currentEnemyWeaken: number,
      playerDefendingNow: boolean,
      currentPlayerWeaken: number,
      currentBuff: number
    ) => {
      if (currentEnemyHp <= 0) return;

      setPhase('ENEMY_TURN');

      if (currentStun > 0) {
        setEnemyStunTurns(currentStun - 1);
        setBattleLog(`${stage.enemy.name} ficou atordoado com “A aula já começou!” e perdeu o turno!`);
        spawnFloat('ATORDOADO!', 'enemy', 'status');
        soundEngine.playBoing();

        scheduleTimeout(() => {
          setIsDefending(false);
          if (currentBuff > 0) setAttackBuffTurns(currentBuff - 1);
          if (currentPlayerWeaken > 0) setPlayerWeakenTurns(currentPlayerWeaken - 1);
          if (currentEnemyWeaken > 0) setEnemyWeakenTurns(currentEnemyWeaken - 1);
          setTurnCount((t) => t + 1);
          setPhase('PLAYER_TURN');
        }, 1150);
        return;
      }

      const moves = stage.enemy.moves;
      const chosenMove = moves[Math.floor(Math.random() * moves.length)];

      setBattleLog(`${stage.enemy.name} usou ${chosenMove.name}: ${chosenMove.speech}`);
      setEnemyAnim('attack');

      scheduleTimeout(() => {
        setEnemyAnim('idle');

        if (chosenMove.effect === 'self_heal') {
          const healAmt = Math.round(stage.enemy.maxHp * 0.12);
          setEnemyHp((hp) => Math.min(stage.enemy.maxHp, hp + healAmt));
          spawnFloat(`+${healAmt} HP`, 'enemy', 'heal');
          soundEngine.playPotion();
        }

        let rawDmg =
          stage.enemy.attack * chosenMove.damageMultiplier -
          progress.baseDefense * 0.45;
        if (currentEnemyWeaken > 0) {
          rawDmg *= 0.6;
        }
        if (playerDefendingNow) {
          rawDmg *= 0.4;
        }
        const finalDmg = Math.max(4, Math.round(rawDmg + (Math.random() * 4 - 2)));

        if (chosenMove.effect === 'double_hit') {
          soundEngine.playHit();
          setPlayerAnim('hit');
          const hit1 = Math.max(3, Math.round(finalDmg * 0.55));
          const hit2 = Math.max(3, Math.round(finalDmg * 0.55));
          const totalDouble = hit1 + hit2;
          spawnFloat(`-${hit1}! -${hit2}!`, 'player', 'damage');
          const nextHp = Math.max(0, currentPlayerHp - totalDouble);
          setPlayerHp(nextHp);
          setUltimateCharge((u) => Math.min(100, u + 12));

          scheduleTimeout(() => {
            setPlayerAnim('idle');
            if (nextHp <= 0) {
              setPlayerAnim('ko');
              soundEngine.playDefeat();
              setBattleLog(stage.enemy.defeatQuote);
              setPhase('DEFEAT');
              return;
            }
            setIsDefending(false);
            if (currentBuff > 0) setAttackBuffTurns(currentBuff - 1);
            if (currentPlayerWeaken > 0) setPlayerWeakenTurns(currentPlayerWeaken - 1);
            if (currentEnemyWeaken > 0) setEnemyWeakenTurns(currentEnemyWeaken - 1);
            setTurnCount((t) => t + 1);
            setPhase('PLAYER_TURN');
          }, 700);
          return;
        }

        soundEngine.playHit();
        setPlayerAnim('hit');
        spawnFloat(`-${finalDmg}`, 'player', 'damage');

        if (chosenMove.effect === 'drain_focus') {
          setPlayerFocus((f) => Math.max(0, f - 10));
          spawnFloat('-10 FOCO', 'player', 'status');
        }
        if (chosenMove.effect === 'weaken_player') {
          setPlayerWeakenTurns(2);
          spawnFloat('DISTRAÍDO!', 'player', 'status');
        }

        const nextHp = Math.max(0, currentPlayerHp - finalDmg);
        setPlayerHp(nextHp);
        setUltimateCharge((u) => Math.min(100, u + 12));

        scheduleTimeout(() => {
          setPlayerAnim('idle');
          if (nextHp <= 0) {
            setPlayerAnim('ko');
            soundEngine.playDefeat();
            setBattleLog(stage.enemy.defeatQuote);
            setPhase('DEFEAT');
            return;
          }
          setIsDefending(false);
          if (currentBuff > 0) setAttackBuffTurns(currentBuff - 1);
          if (currentPlayerWeaken > 0) setPlayerWeakenTurns(currentPlayerWeaken - 1);
          if (currentEnemyWeaken > 0) setEnemyWeakenTurns(currentEnemyWeaken - 1);
          setTurnCount((t) => t + 1);
          setPhase('PLAYER_TURN');
        }, 700);
      }, 420);
    },
    [progress.baseDefense, scheduleTimeout, spawnFloat, stage.enemy]
  );

  const computePlayerDamage = (multiplier: number, ignoreDefense = false) => {
    let atk = progress.baseAttack * multiplier;
    if (attackBuffTurns > 0) atk *= 1.45;
    if (playerWeakenTurns > 0) atk *= 0.8;
    const defPenalty = ignoreDefense ? stage.enemy.defense * 0.15 : stage.enemy.defense * 0.45;
    return Math.max(8, Math.round(atk - defPenalty + Math.random() * 5));
  };

  // Ação: Habilidade / Ataque
  const handleUseSkill = (skill: PlayerSkill) => {
    if (phase !== 'PLAYER_TURN') return;
    if (playerFocus < skill.focusCost) return;

    setSubMenu('MAIN');
    setPhase('ANIMATING');
    setPlayerFocus((f) => f - skill.focusCost);
    setPlayerAnim('attack');
    soundEngine.playAttack();
    triggerBurst('chalk');

    const dmg = computePlayerDamage(skill.powerMultiplier, skill.type === 'pierce');
    let newHp = playerHp;

    if (skill.type === 'heal_strike') {
      newHp = Math.min(progress.maxHp, playerHp + 25);
      setPlayerHp(newHp);
      spawnFloat('+25 HP', 'player', 'heal');
    }

    const nextEnemyHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(nextEnemyHp);
    setUltimateCharge((u) =>
      Math.min(100, u + (skill.id === 'giz_certeiro' ? 15 : 20))
    );
    setBattleLog(`Prof. Vagner usou ${skill.name} e causou ${dmg} de dano pedagógico!`);

    scheduleTimeout(() => {
      setPlayerAnim('idle');
      setEnemyAnim('hit');
      spawnFloat(`-${dmg}`, 'enemy', skill.powerMultiplier >= 1.5 ? 'crit' : 'damage');

      scheduleTimeout(() => {
        setEnemyAnim('idle');
        if (nextEnemyHp <= 0) {
          finishVictory(newHp, false, xiqueUsedCount, solvedCount, attemptedCount, bestCombo, potionsUsed);
        } else {
          runEnemyTurn(
            newHp,
            nextEnemyHp,
            enemyStunTurns,
            enemyWeakenTurns,
            false,
            playerWeakenTurns,
            attackBuffTurns
          );
        }
      }, 480);
    }, 340);
  };

  // Ação: Defender (Postura Docente)
  const handleDefend = () => {
    if (phase !== 'PLAYER_TURN') return;
    setSubMenu('MAIN');
    setPhase('ANIMATING');
    setIsDefending(true);
    soundEngine.playDefend();
    const restoredFocus = Math.min(progress.maxFocus, playerFocus + 20);
    setPlayerFocus(restoredFocus);
    setUltimateCharge((u) => Math.min(100, u + 15));
    spawnFloat('+20 FOCO · ESCUDO', 'player', 'status');
    setBattleLog(
      'Prof. Vagner assumiu a Postura Docente! Dano reduzido em 60% e +20 de Foco.'
    );

    scheduleTimeout(() => {
      runEnemyTurn(
        playerHp,
        enemyHp,
        enemyStunTurns,
        enemyWeakenTurns,
        true,
        playerWeakenTurns,
        attackBuffTurns
      );
    }, 750);
  };

  // Ação: Abrir Desafio de Programação
  const handleOpenChallenge = () => {
    if (phase !== 'PLAYER_TURN') return;
    soundEngine.playClick();
    setSubMenu('MAIN');
    const chosen = pickChallenge(
      stage.topicPool,
      usedChallengeIds.current,
      stage.enemy.weaknessTopic
    );
    usedChallengeIds.current.add(chosen.id);
    setActiveChallenge(chosen);
  };

  const handleChallengeComplete = (correct: boolean) => {
    const ch = activeChallenge;
    setActiveChallenge(null);
    if (!ch) return;

    const nextAttempted = attemptedCount + 1;
    setAttemptedCount(nextAttempted);
    setPhase('ANIMATING');
    setPlayerAnim('cast');

    if (correct) {
      const nextSolved = solvedCount + 1;
      const nextCombo = combo + 1;
      const nextBestCombo = Math.max(bestCombo, nextCombo);
      setSolvedCount(nextSolved);
      setCombo(nextCombo);
      setBestCombo(nextBestCombo);

      const isWeakness = ch.topic === stage.enemy.weaknessTopic;
      const comboMult = 1 + Math.min(0.6, (nextCombo - 1) * 0.15);
      const dmg = computePlayerDamage(
        (isWeakness ? 2.55 : 2.05) * comboMult,
        true
      );

      const healedHp = Math.min(progress.maxHp, playerHp + 18);
      setPlayerHp(healedHp);
      setPlayerFocus((f) => Math.min(progress.maxFocus, f + 15));
      setUltimateCharge((u) => Math.min(100, u + 35));

      const nextEnemyHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(nextEnemyHp);

      triggerBurst('code');
      triggerShake();
      soundEngine.playBoing();
      soundEngine.speakNordestino('Arre égua, acertou na mosca!', 1.1, 1.15);
      setBattleLog(
        `Código compilou perfeitamente! ${
          isWeakness ? 'FRAQUEZA EXPLORADA! ' : ''
        }Causou ${dmg} de dano crítico e recuperou +18 HP!`
      );

      scheduleTimeout(() => {
        setPlayerAnim('idle');
        setEnemyAnim('hit');
        spawnFloat(`CRÍTICO -${dmg}!`, 'enemy', 'crit');
        spawnFloat('+18 HP', 'player', 'heal');

        scheduleTimeout(() => {
          setEnemyAnim('idle');
          if (nextEnemyHp <= 0) {
            finishVictory(
              healedHp,
              false,
              xiqueUsedCount,
              nextSolved,
              nextAttempted,
              nextBestCombo,
              potionsUsed
            );
          } else {
            runEnemyTurn(
              healedHp,
              nextEnemyHp,
              enemyStunTurns,
              enemyWeakenTurns,
              false,
              playerWeakenTurns,
              attackBuffTurns
            );
          }
        }, 550);
      }, 360);
    } else {
      setCombo(0);
      const glanceDmg = Math.max(4, Math.round(progress.baseAttack * 0.4));
      const nextEnemyHp = Math.max(0, enemyHp - glanceDmg);
      setEnemyHp(nextEnemyHp);
      soundEngine.speakNordestino('Oxente, deu bug no código!', 1.0, 1.1);
      setBattleLog(
        `O código deu erro de lógica! Apenas ${glanceDmg} de dano de raspão.`
      );

      scheduleTimeout(() => {
        setPlayerAnim('idle');
        setEnemyAnim('hit');
        spawnFloat(`-${glanceDmg}`, 'enemy', 'damage');

        scheduleTimeout(() => {
          setEnemyAnim('idle');
          if (nextEnemyHp <= 0) {
            finishVictory(
              playerHp,
              false,
              xiqueUsedCount,
              solvedCount,
              nextAttempted,
              bestCombo,
              potionsUsed
            );
          } else {
            runEnemyTurn(
              playerHp,
              nextEnemyHp,
              enemyStunTurns,
              enemyWeakenTurns,
              false,
              playerWeakenTurns,
              attackBuffTurns
            );
          }
        }, 480);
      }, 360);
    }
  };

  // Ação: Usar Poção Pedagógica
  const handleUsePotion = (potionId: PotionId) => {
    if (phase !== 'PLAYER_TURN') return;
    if ((localPotions[potionId] || 0) <= 0) return;

    const potion = POTIONS[potionId];
    setSubMenu('MAIN');
    setPhase('ANIMATING');
    soundEngine.playPotion();

    setLocalPotions((prev) => ({ ...prev, [potionId]: prev[potionId] - 1 }));
    const updatedUsed = {
      ...potionsUsed,
      [potionId]: (potionsUsed[potionId] || 0) + 1,
    };
    setPotionsUsed(updatedUsed);

    setPlayerAnim('cast');
    setBattleLog(`Prof. Vagner bradou: ${potion.phrase}`);

    let nextPlayerHp = playerHp;
    let nextEnemyHp = enemyHp;
    let nextStun = enemyStunTurns;
    let nextEnemyWeaken = enemyWeakenTurns;
    let nextBuff = attackBuffTurns;

    if (potionId === 'aula_comecou') {
      triggerBurst('chalk');
      nextStun = enemyStunTurns + 1;
      setEnemyStunTurns(nextStun);
      nextEnemyHp = Math.max(0, enemyHp - 22);
      setEnemyHp(nextEnemyHp);
      setEnemyAnim('hit');
      spawnFloat('-22 · ATORDOADO!', 'enemy', 'crit');
      soundEngine.speakNordestino('A aula já começou!', 1.0, 1.15);
    } else if (potionId === 'compartilhar_turma') {
      triggerBurst('code');
      nextEnemyWeaken = 2;
      setEnemyWeakenTurns(2);
      nextEnemyHp = Math.max(0, enemyHp - 18);
      setEnemyHp(nextEnemyHp);
      setEnemyAnim('hit');
      spawnFloat('-18 · VERGONHA!', 'enemy', 'status');
      soundEngine.speakNordestino('Quer compartilhar com a turma?', 1.05, 1.15);
    } else if (potionId === 'colocar_no_quadro') {
      triggerBurst('heal');
      nextBuff = 3;
      setAttackBuffTurns(3);
      setUltimateCharge((u) => Math.min(100, u + 25));
      spawnFloat('ATQ +45% · +25% SUPREMA', 'player', 'status');
      soundEngine.speakNordestino('Vou colocar no quadro!', 1.0, 1.15);
    } else if (potionId === 'presta_atencao') {
      triggerBurst('heal');
      nextPlayerHp = Math.min(progress.maxHp, playerHp + 60);
      setPlayerHp(nextPlayerHp);
      setPlayerFocus((f) => Math.min(progress.maxFocus, f + 25));
      setPlayerWeakenTurns(0);
      spawnFloat('+60 HP · +25 FOCO', 'player', 'heal');
      soundEngine.speakNordestino('Presta atenção na explicação!', 1.05, 1.15);
    }

    scheduleTimeout(() => {
      setPlayerAnim('idle');
      setEnemyAnim('idle');
      if (nextEnemyHp <= 0) {
        finishVictory(
          nextPlayerHp,
          false,
          xiqueUsedCount,
          solvedCount,
          attemptedCount,
          bestCombo,
          updatedUsed
        );
      } else {
        runEnemyTurn(
          nextPlayerHp,
          nextEnemyHp,
          nextStun,
          nextEnemyWeaken,
          false,
          playerWeakenTurns,
          nextBuff
        );
      }
    }, 850);
  };

  // GOLPE SUPREMO: "XIQUE-XIQUE, BAHIA!"
  const handleUltimateXiqueXique = () => {
    if (phase !== 'PLAYER_TURN' || ultimateCharge < 100) return;

    setSubMenu('MAIN');
    setPhase('ANIMATING');
    const nextXiqueUses = xiqueUsedCount + 1;
    setXiqueUsedCount(nextXiqueUses);
    setUltimateCharge(0);

    soundEngine.playXiqueXique();
    setShowXiqueCutIn(true);
    setBattleLog('PROF. VAGNER INVOCOU O GOLPE SUPREMO: “XIQUE-XIQUE, BAHIA!”');

    const ultDamage = 105 + progress.level * 18 + (attackBuffTurns > 0 ? 30 : 0);
    const nextEnemyHp = Math.max(0, enemyHp - ultDamage);

    scheduleTimeout(() => {
      setShowXiqueCutIn(false);
      triggerShake();
      triggerBurst('xique');
      setPlayerAnim('attack');
      setEnemyAnim('hit');
      setEnemyHp(nextEnemyHp);
      spawnFloat(`-${ultDamage} XIQUE-XIQUE!!`, 'enemy', 'crit');

      scheduleTimeout(() => {
        setPlayerAnim('idle');
        if (nextEnemyHp <= 0) {
          finishVictory(
            playerHp,
            true,
            nextXiqueUses,
            solvedCount,
            attemptedCount,
            bestCombo,
            potionsUsed
          );
        } else {
          setEnemyAnim('idle');
          runEnemyTurn(
            playerHp,
            nextEnemyHp,
            enemyStunTurns,
            enemyWeakenTurns,
            false,
            playerWeakenTurns,
            attackBuffTurns
          );
        }
      }, 720);
    }, 1450);
  };

  const handleRestartFight = () => {
    soundEngine.playClick();
    setPlayerHp(progress.maxHp);
    setPlayerFocus(progress.maxFocus);
    setUltimateCharge(30);
    setIsDefending(false);
    setAttackBuffTurns(0);
    setPlayerWeakenTurns(0);
    setEnemyHp(stage.enemy.maxHp);
    setEnemyStunTurns(0);
    setEnemyWeakenTurns(0);
    setPlayerAnim('idle');
    setEnemyAnim('idle');
    setLocalPotions({ ...progress.inventory });
    setPotionsUsed({
      aula_comecou: 0,
      compartilhar_turma: 0,
      colocar_no_quadro: 0,
      presta_atencao: 0,
    });
    setCombo(0);
    setBestCombo(0);
    setSolvedCount(0);
    setAttemptedCount(0);
    setXiqueUsedCount(0);
    setWasXiqueKO(false);
    setVictoryReported(false);
    setTurnCount(1);
    setPhase('PLAYER_TURN');
    setBattleLog('Recomeçando a aula! Mostre quem manda na lógica!');
  };

  const playerHpPct = Math.max(0, Math.round((playerHp / progress.maxHp) * 100));
  const playerFocusPct = Math.max(
    0,
    Math.round((playerFocus / progress.maxFocus) * 100)
  );
  const enemyHpPct = Math.max(
    0,
    Math.round((enemyHp / stage.enemy.maxHp) * 100)
  );

  return (
    <div
      className={`min-h-screen bg-[#0b1016] text-[#f4efe6] flex flex-col ${
        screenShake ? 'animate-screen-shake' : ''
      }`}
    >
      {/* Top Bar de Combate */}
      <header className="border-b border-slate-800 bg-[#101822]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onExit();
            }}
            className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sair da Aula</span>
          </button>

          <div className="text-center min-w-0">
            <p className="font-pixel text-xs sm:text-sm text-amber-300 truncate">
              {stage.title}
            </p>
            <p className="text-xs text-slate-400 font-mono tabular-nums">
              Turno {turnCount} · Fraqueza:{' '}
              <span className="text-emerald-300">
                {TOPIC_LABELS[stage.enemy.weaknessTopic]}
              </span>
            </p>
          </div>

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
            <span className="hidden sm:inline">{isMuted ? 'Mudo' : 'Som'}</span>
          </button>
        </div>
      </header>

      {/* Palco Principal da Batalha */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4">
        {/* Arena Visual */}
        <section className="relative pixel-panel overflow-hidden min-h-[300px] sm:min-h-[370px] flex flex-col justify-between p-4 sm:p-6">
          {/* Cenário da Sala de Aula em Pixel Art */}
          <img
            src="/src/assets/images/title_classroom_arena_1795517352490.jpg"
            alt="Cenário da sala de aula em batalha"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-[118%] object-cover object-top pixel-art opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1118]/75 via-[#0e1722]/60 to-[#090e14]/95" />

          {/* Partículas & Números Flutuantes */}
          <PixelParticles floatingTexts={floatingTexts} burstKind={burstKind} />

          {/* Cut-in Cinematográfico: XIQUE-XIQUE, BAHIA! */}
          {showXiqueCutIn && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 animate-xique-banner">
              <img
                src="/src/assets/images/ultimate_xique_xique_1795517352610.jpg"
                alt="Cenário épico de Xique-Xique, Bahia!"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover pixel-art opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70" />
              <div className="relative z-10 text-center px-4">
                <p className="font-pixel text-xs sm:text-sm text-amber-200 tracking-widest mb-2 drop-shadow-[0_2px_0_#000]">
                  TÉCNICA SUPREMA DO SERTÃO
                </p>
                <h2 className="font-pixel text-2xl sm:text-5xl text-amber-300 drop-shadow-[0_5px_0_#7c2d12]">
                  XIQUE-XIQUE, BAHIA!
                </h2>
              </div>
            </div>
          )}

          {/* HUD Superior dos Combatentes (HP/Foco) */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8">
            {/* Status Professor Vagner */}
            <div className="bg-[#0e1620]/90 border-2 border-slate-600 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-pixel text-xs sm:text-sm text-white">
                  Prof. Vagner (Nv.{progress.level})
                </span>
                <span className="font-mono text-xs text-emerald-300 tabular-nums">
                  HP: {playerHp}/{progress.maxHp}
                </span>
              </div>
              <div className="h-3 bg-slate-900 border border-slate-700 mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    playerHpPct > 40
                      ? 'bg-emerald-500'
                      : playerHpPct > 20
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${playerHpPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 mt-2 text-[11px] font-mono tabular-nums">
                <span className="text-sky-300">
                  Foco: {playerFocus}/{progress.maxFocus}
                </span>
                <span className="text-amber-300">
                  Suprema: {ultimateCharge}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="h-2 bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all duration-300"
                    style={{ width: `${playerFocusPct}%` }}
                  />
                </div>
                <div className="h-2 bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      ultimateCharge >= 100
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${ultimateCharge}%` }}
                  />
                </div>
              </div>

              {(attackBuffTurns > 0 || isDefending || playerWeakenTurns > 0) && (
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                  {attackBuffTurns > 0 && (
                    <span className="text-amber-300">
                      Lousa Implacável ({attackBuffTurns}t)
                    </span>
                  )}
                  {isDefending && (
                    <span className="text-sky-300">Postura Docente</span>
                  )}
                  {playerWeakenTurns > 0 && (
                    <span className="text-rose-300">
                      Distraído ({playerWeakenTurns}t)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Status Inimigo */}
            <div className="bg-[#0e1620]/90 border-2 border-slate-600 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-pixel text-xs sm:text-sm text-rose-200 truncate">
                  {stage.enemy.name}
                </span>
                <span className="font-mono text-xs text-rose-300 tabular-nums shrink-0">
                  HP: {enemyHp}/{stage.enemy.maxHp}
                </span>
              </div>
              <div className="h-3 bg-slate-900 border border-slate-700 mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${enemyHpPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 truncate">
                {stage.enemy.title}
              </p>
            </div>
          </div>

          {/* Sprites dos Combatentes no Palco */}
          <div className="relative z-10 flex items-end justify-between px-4 sm:px-14 pt-6 pb-2">
            <ProfessorVagnerSprite
              animState={playerAnim}
              isBuffed={attackBuffTurns > 0}
              isDefending={isDefending}
            />
            <EnemyPixelSprite
              archetype={stage.enemy.archetype}
              animState={enemyAnim}
              isStunned={enemyStunTurns > 0}
              isWeakened={enemyWeakenTurns > 0}
            />
          </div>
        </section>

        {/* Caixa de Diálogo / Log de Combate */}
        <section className="pixel-panel p-4">
          {phase === 'INTRO' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
                {stage.enemy.introDialogue[introIdx]}
              </p>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  if (introIdx + 1 < stage.enemy.introDialogue.length) {
                    setIntroIdx(introIdx + 1);
                  } else {
                    setPhase('PLAYER_TURN');
                    setBattleLog('Sua vez, Professor! Escolha sua ação pedagógica.');
                  }
                }}
                className="pixel-btn px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap shrink-0"
              >
                {introIdx + 1 < stage.enemy.introDialogue.length
                  ? 'Continuar'
                  : 'Começar Batalha!'}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm sm:text-base text-slate-100 font-medium">
                {battleLog}
              </p>
              <span className="text-xs font-mono text-amber-300 shrink-0">
                {phase === 'PLAYER_TURN'
                  ? 'Seu Turno'
                  : phase === 'ENEMY_TURN'
                    ? 'Turno do Bagunceiro'
                    : phase === 'VICTORY'
                      ? 'Vitória!'
                      : phase === 'DEFEAT'
                        ? 'Fim de Aula'
                        : 'Executando...'}
              </span>
            </div>
          )}
        </section>

        {/* Painel de Ações do Jogador */}
        {(phase === 'PLAYER_TURN' || phase === 'ANIMATING' || phase === 'ENEMY_TURN') && (
          <section className="pixel-panel p-4">
            {subMenu === 'MAIN' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    disabled={phase !== 'PLAYER_TURN'}
                    onClick={() => {
                      soundEngine.playClick();
                      setSubMenu('SKILLS');
                    }}
                    className="pixel-btn min-h-12 px-3 py-2.5 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-pixel text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Swords className="w-4 h-4 shrink-0" />
                    <span>Atacar</span>
                  </button>

                  <button
                    type="button"
                    disabled={phase !== 'PLAYER_TURN'}
                    onClick={handleOpenChallenge}
                    className="pixel-btn min-h-12 px-3 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-pixel text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Code2 className="w-4 h-4 shrink-0" />
                    <span>Desafio Código</span>
                  </button>

                  <button
                    type="button"
                    disabled={phase !== 'PLAYER_TURN'}
                    onClick={handleDefend}
                    className="pixel-btn min-h-12 px-3 py-2.5 bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-white font-pixel text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>Defender</span>
                  </button>

                  <button
                    type="button"
                    disabled={phase !== 'PLAYER_TURN'}
                    onClick={() => {
                      soundEngine.playClick();
                      setSubMenu('POTIONS');
                    }}
                    className="pixel-btn min-h-12 px-3 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold font-pixel text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Backpack className="w-4 h-4 shrink-0" />
                    <span>Poções</span>
                  </button>
                </div>

                {/* Botão Suprema: XIQUE-XIQUE, BAHIA! */}
                <button
                  type="button"
                  disabled={phase !== 'PLAYER_TURN' || ultimateCharge < 100}
                  onClick={handleUltimateXiqueXique}
                  className={`pixel-btn w-full min-h-12 px-4 py-3 font-pixel text-xs sm:text-base flex items-center justify-center gap-2.5 whitespace-nowrap ${
                    ultimateCharge >= 100 && phase === 'PLAYER_TURN'
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-bold cursor-pointer animate-pulse'
                      : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Flame className="w-5 h-5 shrink-0" />
                  <span>
                    {ultimateCharge >= 100
                      ? 'SUPREMA LIBERADA: XIQUE-XIQUE, BAHIA!'
                      : `Suprema: XIQUE-XIQUE, BAHIA! (${ultimateCharge}%)`}
                  </span>
                  <Sparkles className="w-5 h-5 shrink-0" />
                </button>
              </div>
            )}

            {subMenu === 'SKILLS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-pixel text-xs sm:text-sm text-amber-300">
                    Escolha o Golpe Pedagógico
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSubMenu('MAIN');
                    }}
                    className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Voltar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PLAYER_SKILLS.map((skill) => {
                    const locked = progress.level < skill.unlockLevel;
                    const noFocus = playerFocus < skill.focusCost;
                    const disabled = locked || noFocus || phase !== 'PLAYER_TURN';

                    return (
                      <button
                        key={skill.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleUseSkill(skill)}
                        className={`pixel-btn p-3 text-left border-2 transition-colors ${
                          disabled
                            ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-[#1a2634] hover:bg-[#233346] border-slate-600 hover:border-amber-400 text-white cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-pixel text-xs sm:text-sm">
                            {skill.name}
                          </span>
                          <span className="font-mono text-xs text-sky-300 tabular-nums shrink-0">
                            {locked
                              ? `Nível ${skill.unlockLevel}`
                              : skill.focusCost === 0
                                ? '0 Foco'
                                : `${skill.focusCost} Foco`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {skill.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {subMenu === 'POTIONS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-pixel text-xs sm:text-sm text-amber-300">
                    Poções Pedagógicas na Mochila
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSubMenu('MAIN');
                    }}
                    className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Voltar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {POTION_LIST.map((pot) => {
                    const qty = localPotions[pot.id] || 0;
                    const disabled = qty <= 0 || phase !== 'PLAYER_TURN';
                    return (
                      <button
                        key={pot.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleUsePotion(pot.id)}
                        className={`pixel-btn p-3 text-left border-2 ${
                          disabled
                            ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-[#1a2634] hover:bg-[#243447] border-amber-500/70 text-white cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs sm:text-sm text-amber-300">
                            {pot.phrase}
                          </span>
                          <span className="font-mono text-xs tabular-nums shrink-0">
                            Restam: {qty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {pot.effectSummary}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tela de Vitória */}
        {phase === 'VICTORY' && (
          <section className="pixel-panel-gold p-5 sm:p-6 space-y-4">
            <h2 className="font-pixel text-xl sm:text-2xl text-emerald-300">
              {wasXiqueKO
                ? 'Vitória Espetacular: Passagem para Xique-Xique!'
                : 'Aula Concluída com Sucesso!'}
            </h2>
            <p className="text-sm sm:text-base text-slate-200">
              {stage.enemy.victoryQuote}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm font-mono bg-[#0f1722] p-3.5 border border-slate-700 tabular-nums">
              <div>
                <span className="text-slate-400 block">XP Ganho</span>
                <span className="text-amber-300 font-bold">
                  +{stage.enemy.xpReward} XP
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Didática</span>
                <span className="text-sky-300 font-bold">
                  +{stage.enemy.didacticCoinsReward} pts
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Desafios</span>
                <span className="text-emerald-300 font-bold">
                  {solvedCount}/{attemptedCount} acertos
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Espólio</span>
                <span className="text-rose-300 font-bold truncate block">
                  {stage.dropPotion
                    ? POTIONS[stage.dropPotion].phrase
                    : 'Sem item'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onExit();
                }}
                className="pixel-btn px-4 py-2.5 bg-[#1e2c3d] hover:bg-[#2a3d54] text-white font-pixel text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              >
                Voltar ao Mapa
              </button>
              {onNextStage && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onNextStage();
                  }}
                  className="pixel-btn px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  Próxima Fase
                </button>
              )}
            </div>
          </section>
        )}

        {/* Tela de Derrota */}
        {phase === 'DEFEAT' && (
          <section className="pixel-panel p-5 sm:p-6 border-rose-500 space-y-4">
            <h2 className="font-pixel text-xl sm:text-2xl text-rose-400">
              A Turma Venceu Este Round!
            </h2>
            <p className="text-sm sm:text-base text-slate-200">
              {stage.enemy.defeatQuote} Dica do coordenador: use{' '}
              <span className="text-emerald-300 font-semibold">
                Desafio Código
              </span>{' '}
              para causar dano crítico e curar o Professor Vagner, além das
              Poções Pedagógicas!
            </p>
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onExit();
                }}
                className="pixel-btn px-4 py-2.5 bg-[#1e2c3d] hover:bg-[#2a3d54] text-white font-pixel text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              >
                Voltar ao Mapa
              </button>
              <button
                type="button"
                onClick={handleRestartFight}
                className="pixel-btn px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-pixel text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              >
                Tentar Novamente
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Modal de Desafio de Programação */}
      {activeChallenge && (
        <CodeChallengeModal
          challenge={activeChallenge}
          comboCount={combo}
          isWeaknessMatch={activeChallenge.topic === stage.enemy.weaknessTopic}
          onComplete={handleChallengeComplete}
        />
      )}
    </div>
  );
};
