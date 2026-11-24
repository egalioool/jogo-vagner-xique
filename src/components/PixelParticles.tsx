import React from 'react';
import { FloatingText } from '../types/game';

interface PixelParticlesProps {
  floatingTexts: FloatingText[];
  burstKind: 'none' | 'chalk' | 'code' | 'heal' | 'xique';
}

export const PixelParticles: React.FC<PixelParticlesProps> = ({
  floatingTexts,
  burstKind,
}) => {
  return (
    <>
      {/* Efeitos de Partículas na Arena */}
      {burstKind !== 'none' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
          {Array.from({ length: burstKind === 'xique' ? 22 : 12 }).map((_, i) => {
            const left = `${15 + ((i * 37) % 72)}%`;
            const top = `${18 + ((i * 29) % 58)}%`;
            const colorClass =
              burstKind === 'xique'
                ? i % 2 === 0
                  ? 'bg-amber-400'
                  : 'bg-orange-500'
                : burstKind === 'heal'
                  ? 'bg-emerald-400'
                  : burstKind === 'code'
                    ? 'bg-sky-400'
                    : 'bg-white';
            return (
              <span
                key={i}
                style={{ left, top, animationDelay: `${(i % 5) * 45}ms` }}
                className={`absolute w-2.5 h-2.5 ${colorClass} animate-ping`}
              />
            );
          })}
        </div>
      )}

      {/* Números Flutuantes de Dano/Cura */}
      {floatingTexts.map((ft) => {
        const positionClass =
          ft.target === 'player'
            ? 'left-[18%] sm:left-[24%] top-[32%]'
            : 'right-[16%] sm:right-[22%] top-[28%]';

        const colorClass =
          ft.kind === 'crit'
            ? 'text-amber-300 text-xl sm:text-2xl drop-shadow-[0_3px_0_#7c2d12]'
            : ft.kind === 'heal'
              ? 'text-emerald-300 text-lg sm:text-xl drop-shadow-[0_3px_0_#064e3b]'
              : ft.kind === 'status'
                ? 'text-sky-300 text-sm sm:text-base drop-shadow-[0_2px_0_#0c4a6e]'
                : 'text-rose-400 text-lg sm:text-xl drop-shadow-[0_3px_0_#450a0a]';

        return (
          <div
            key={ft.id}
            className={`pointer-events-none absolute z-30 font-pixel font-bold whitespace-nowrap animate-damage-float ${positionClass} ${colorClass}`}
          >
            {ft.text}
          </div>
        );
      })}
    </>
  );
};
