import React, { useState } from 'react';
import { CheckCircle2, Code2, XCircle } from 'lucide-react';
import { CodeChallenge } from '../types/game';
import { TOPIC_LABELS } from '../data/challenges';
import { soundEngine } from '../utils/soundEngine';

interface CodeChallengeModalProps {
  challenge: CodeChallenge;
  comboCount: number;
  isWeaknessMatch: boolean;
  onComplete: (correct: boolean) => void;
}

export const CodeChallengeModal: React.FC<CodeChallengeModalProps> = ({
  challenge,
  comboCount,
  isWeaknessMatch,
  onComplete,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selectedIdx === challenge.correctIndex;

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedIdx(idx);
    setSubmitted(true);
    if (idx === challenge.correctIndex) {
      soundEngine.playCodeCorrect();
    } else {
      soundEngine.playCodeWrong();
    }
  };

  const formatLabel =
    challenge.format === 'SAIDA'
      ? 'Prever Saída'
      : challenge.format === 'LACUNA'
        ? 'Completar Lacuna'
        : 'Caçar o Bug';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl pixel-panel-gold p-4 sm:p-6 my-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
            <Code2 className="w-4 h-4 shrink-0" />
            <span>{TOPIC_LABELS[challenge.topic]}</span>
            <span aria-hidden="true">·</span>
            <span>{formatLabel}</span>
            {isWeaknessMatch && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-300 font-semibold">
                  Fraqueza do Inimigo (Dano Extra)
                </span>
              </>
            )}
          </div>
          {comboCount > 0 && (
            <span className="text-xs font-mono text-sky-300 tabular-nums">
              Combo Atual: {comboCount}x
            </span>
          )}
        </div>

        <h3 className="font-pixel text-base sm:text-lg text-white mt-3">
          {challenge.title}
        </h3>
        <p className="text-sm sm:text-base text-slate-200 mt-1">
          {challenge.prompt}
        </p>

        {/* Bloco de Código JavaScript */}
        <pre className="mt-3 p-3.5 bg-[#090e14] border-2 border-slate-700 text-xs sm:text-sm font-mono text-emerald-300 overflow-x-auto leading-relaxed">
          <code>{challenge.code}</code>
        </pre>

        {/* Opções de Resposta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
          {challenge.options.map((opt, idx) => {
            let btnStyle =
              'bg-[#1b2736] border-2 border-slate-600 hover:border-amber-400 text-slate-100';
            if (submitted) {
              if (idx === challenge.correctIndex) {
                btnStyle =
                  'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200';
              } else if (idx === selectedIdx) {
                btnStyle =
                  'bg-rose-950/90 border-2 border-rose-400 text-rose-200';
              } else {
                btnStyle =
                  'bg-[#131b24] border-2 border-slate-800 text-slate-500';
              }
            }
            const letter = ['A', 'B', 'C', 'D'][idx];
            return (
              <button
                key={idx}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(idx)}
                className={`pixel-btn min-h-11 px-3.5 py-2.5 text-left text-sm font-mono flex items-start gap-2.5 cursor-pointer disabled:cursor-default ${btnStyle}`}
              >
                <span className="font-bold text-amber-400 shrink-0">
                  {letter})
                </span>
                <span className="break-words">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explicação Pedagógica após responder */}
        {submitted && (
          <div className="mt-4 p-3.5 bg-[#0f1722] border-2 border-slate-700">
            <div className="flex items-center gap-2 font-pixel text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">
                    Arre égua! Resposta Correta — Golpe Crítico de Sabedoria!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span className="text-rose-300">
                    Oxente, deu bug! Mas o Professor explica:
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed">
              {challenge.explanation}
            </p>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onComplete(isCorrect);
                }}
                className="pixel-btn px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-sm font-bold cursor-pointer whitespace-nowrap"
              >
                {isCorrect ? 'Aplicar Golpe Crítico!' : 'Continuar Batalha'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
