import React, { useState } from 'react';
import {
  ArrowLeft,
  Backpack,
  CheckCircle2,
  Code2,
  Flame,
  Shield,
  Swords,
} from 'lucide-react';
import { ProfessorVagnerSprite, EnemyPixelSprite } from './PixelSprites';
import { soundEngine } from '../utils/soundEngine';

interface InteractiveTutorialProps {
  onBack: () => void;
  onCompleteTutorial: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: '1. Ataque Básico & Habilidades',
    instruction:
      'Use "Giz Certeiro" para causar dano sem gastar Foco e carregar +15% da sua Barra Suprema. Clique no botão de ataque abaixo para testar!',
    actionLabel: 'Arremessar Giz Certeiro',
    feedback:
      'Boa! O Boneco de Treino tomou 20 de dano e sua Barra Suprema subiu!',
  },
  {
    title: '2. Desafios de Programação (Golpe Crítico)',
    instruction:
      'Responder corretamente a desafios de FOR, WHILE, Primos e Fibonacci em combate causa dano crítico massivo, cura o Professor Vagner e carrega +35% da Suprema!',
    actionLabel: 'Testar: for (let i=0; i<3; i++) → Quantos passos?',
    options: ['2 passos', '3 passos'],
    correctOption: 1,
    feedback:
      'Arre égua! i=0, 1 e 2 são 3 repetições! Dano crítico aplicado e +18 HP recuperado!',
  },
  {
    title: '3. Postura Docente (Defesa)',
    instruction:
      'Quando um chefe preparar um golpe forte, use "Defender" para reduzir o dano recebido em 60% e recuperar +20 pontos de Foco.',
    actionLabel: 'Ativar Postura Docente',
    feedback:
      'Escudo pedagógico ativo! Foco restaurado para usar habilidades avançadas!',
  },
  {
    title: '4. Poções Pedagógicas',
    instruction:
      'Use frases clássicas de sala de aula como poções! Ex: “A aula já começou!” atordoa o inimigo por 1 turno, e “Presta atenção na explicação!” restaura HP e Foco.',
    actionLabel: 'Usar “A aula já começou!”',
    feedback:
      'O Boneco de Treino congelou de susto na carteira! Atordoado por 1 turno!',
  },
  {
    title: '5. Técnica Suprema: XIQUE-XIQUE, BAHIA!',
    instruction:
      'Quando a Barra Suprema atingir 100%, libere o ataque supremo! Se ele derrotar o aluno bagunceiro, o inimigo sai voando girando até o horizonte!',
    actionLabel: 'Executar XIQUE-XIQUE, BAHIA!',
    feedback:
      'BOOOOM! O Boneco de Treino decolou direto para Xique-Xique! Tutorial concluído!',
  },
];

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  onBack,
  onCompleteTutorial,
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [stepDone, setStepDone] = useState(false);
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'attack' | 'cast'>('idle');
  const [enemyAnim, setEnemyAnim] = useState<'idle' | 'hit' | 'flyAway'>('idle');
  const [shake, setShake] = useState(false);

  const current = TUTORIAL_STEPS[stepIdx];

  const triggerAction = (optIdx?: number) => {
    if (stepDone) return;

    if (stepIdx === 1 && optIdx !== current.correctOption) {
      soundEngine.playCodeWrong();
      return;
    }

    if (stepIdx === 0) {
      soundEngine.playAttack();
      setPlayerAnim('attack');
      setTimeout(() => {
        setPlayerAnim('idle');
        setEnemyAnim('hit');
        setTimeout(() => setEnemyAnim('idle'), 400);
      }, 300);
    } else if (stepIdx === 1) {
      soundEngine.playCodeCorrect();
      setPlayerAnim('cast');
      setTimeout(() => {
        setPlayerAnim('idle');
        setEnemyAnim('hit');
        setTimeout(() => setEnemyAnim('idle'), 400);
      }, 300);
    } else if (stepIdx === 2) {
      soundEngine.playDefend();
    } else if (stepIdx === 3) {
      soundEngine.playPotion();
      soundEngine.speakNordestino('A aula já começou!', 1.0, 1.15);
    } else if (stepIdx === 4) {
      soundEngine.playXiqueXique();
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setEnemyAnim('flyAway');
        soundEngine.playFlyAway();
      }, 350);
    }

    setStepDone(true);
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (stepIdx + 1 < TUTORIAL_STEPS.length) {
      setStepIdx(stepIdx + 1);
      setStepDone(false);
      setEnemyAnim('idle');
    } else {
      onCompleteTutorial();
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#0c1219] text-[#f4efe6] pb-12 ${
        shake ? 'animate-screen-shake' : ''
      }`}
    >
      <header className="border-b border-slate-800 bg-[#101822]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
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
            Tutorial Interativo
          </h1>

          <span className="text-xs font-mono text-slate-400 tabular-nums">
            Passo {stepIdx + 1} / {TUTORIAL_STEPS.length}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        {/* Arena de Treino */}
        <section className="pixel-panel p-6 bg-gradient-to-b from-[#132231] to-[#0b1118] flex items-end justify-between px-8 sm:px-20 min-h-[220px] overflow-hidden">
          <ProfessorVagnerSprite
            animState={playerAnim}
            isDefending={stepIdx === 2 && stepDone}
          />
          <EnemyPixelSprite
            archetype="conversador"
            animState={enemyAnim}
            isStunned={stepIdx === 3 && stepDone}
          />
        </section>

        {/* Cartão de Instrução Interativa */}
        <section className="pixel-panel-gold p-5 sm:p-6 space-y-4">
          <h2 className="font-pixel text-base sm:text-lg text-white">
            {current.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {current.instruction}
          </p>

          {!stepDone ? (
            current.options ? (
              <div className="space-y-2">
                <p className="text-xs font-mono text-emerald-300">
                  {current.actionLabel}
                </p>
                <div className="flex flex-wrap gap-3">
                  {current.options.map((opt, idx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => triggerAction(idx)}
                      className="pixel-btn px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-sm cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => triggerAction()}
                className="pixel-btn px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                {stepIdx === 0 && <Swords className="w-4 h-4" />}
                {stepIdx === 1 && <Code2 className="w-4 h-4" />}
                {stepIdx === 2 && <Shield className="w-4 h-4" />}
                {stepIdx === 3 && <Backpack className="w-4 h-4" />}
                {stepIdx === 4 && <Flame className="w-4 h-4" />}
                <span>{current.actionLabel}</span>
              </button>
            )
          ) : (
            <div className="p-4 bg-emerald-950/50 border border-emerald-500 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{current.feedback}</span>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="pixel-btn px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs sm:text-sm cursor-pointer"
                >
                  {stepIdx + 1 < TUTORIAL_STEPS.length
                    ? 'Próximo Passo'
                    : 'Concluir Tutorial (+20 Didática)'}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
