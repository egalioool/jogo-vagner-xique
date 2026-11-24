import React from 'react';
import { EnemyArchetype, SpriteAnimState } from '../types/game';

interface HeroSpriteProps {
  animState: SpriteAnimState;
  isBuffed?: boolean;
  isDefending?: boolean;
}

export const ProfessorVagnerSprite: React.FC<HeroSpriteProps> = ({
  animState,
  isBuffed,
  isDefending,
}) => {
  const animClass =
    animState === 'attack' || animState === 'cast'
      ? 'animate-lunge-right'
      : animState === 'hit'
        ? 'animate-hit-flash'
        : animState === 'ko'
          ? 'opacity-40 grayscale translate-y-4'
          : 'animate-float-idle';

  return (
    <div className={`relative select-none ${animClass}`}>
      {/* Aura de Buff "Vou colocar no quadro!" */}
      {isBuffed && (
        <div className="pointer-events-none absolute -inset-3 rounded-full bg-amber-400/20 blur-md animate-pulse" />
      )}
      {/* Escudo de Postura Docente */}
      {isDefending && (
        <div className="pointer-events-none absolute -right-3 top-2 bottom-2 w-3 bg-sky-400/70 border-2 border-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
      )}

      <svg
        viewBox="0 0 32 32"
        className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 pixel-art drop-shadow-[0_8px_0_rgba(0,0,0,0.5)]"
        shapeRendering="crispEdges"
        aria-label="Sprite em pixel art do Professor Vagner"
      >
        {/* Sombra no chão */}
        <rect x="7" y="29" width="18" height="2" fill="#000000" opacity="0.45" />

        {/* Cabelo */}
        <rect x="10" y="3" width="12" height="3" fill="#1e1b18" />
        <rect x="9" y="5" width="2" height="4" fill="#1e1b18" />
        <rect x="21" y="5" width="2" height="4" fill="#1e1b18" />

        {/* Rosto */}
        <rect x="10" y="6" width="12" height="9" fill="#c68642" />
        <rect x="9" y="9" width="1" height="3" fill="#b47435" />
        <rect x="22" y="9" width="1" height="3" fill="#b47435" />

        {/* Óculos retangulares */}
        <rect x="10" y="8" width="5" height="3" fill="#111827" />
        <rect x="17" y="8" width="5" height="3" fill="#111827" />
        <rect x="15" y="9" width="2" height="1" fill="#111827" />
        <rect x="11" y="9" width="3" height="1" fill="#e0f2fe" />
        <rect x="18" y="9" width="3" height="1" fill="#e0f2fe" />
        <rect x="12" y="9" width="1" height="1" fill="#1e293b" />
        <rect x="19" y="9" width="1" height="1" fill="#1e293b" />

        {/* Barba aparada e sorriso */}
        <rect x="10" y="12" width="12" height="3" fill="#27211d" />
        <rect x="13" y="12" width="6" height="1" fill="#f8fafc" />
        <rect x="12" y="15" width="8" height="1" fill="#27211d" />

        {/* Camisa Polo Azul Marinho */}
        <rect x="8" y="16" width="16" height="8" fill="#1d4ed8" />
        <rect x="12" y="16" width="8" height="2" fill="#3b82f6" />
        <rect x="15" y="17" width="2" height="4" fill="#1e3a8a" />
        {/* Crachá */}
        <rect x="18" y="19" width="3" height="2" fill="#fef08a" />

        {/* Braço esquerdo segurando Livro Dourado de Algoritmos */}
        <rect x="5" y="17" width="3" height="5" fill="#c68642" />
        <rect x="3" y="17" width="5" height="7" fill="#f59e0b" />
        <rect x="4" y="18" width="3" height="5" fill="#fde047" />
        <rect x="4" y="20" width="3" height="1" fill="#b45309" />

        {/* Braço direito erguendo Giz Branco (Espada do Conhecimento) */}
        <rect x="24" y="15" width="3" height="5" fill="#c68642" />
        <rect x="26" y="7" width="2" height="9" fill="#f8fafc" />
        <rect x="26" y="7" width="2" height="2" fill="#38bdf8" />
        <rect x="25" y="14" width="4" height="2" fill="#94a3b8" />

        {/* Calça e sapatos */}
        <rect x="9" y="24" width="6" height="4" fill="#1e293b" />
        <rect x="17" y="24" width="6" height="4" fill="#1e293b" />
        <rect x="8" y="28" width="6" height="2" fill="#0f172a" />
        <rect x="18" y="28" width="6" height="2" fill="#0f172a" />
      </svg>
    </div>
  );
};

interface EnemySpriteProps {
  archetype: EnemyArchetype;
  animState: SpriteAnimState;
  isStunned?: boolean;
  isWeakened?: boolean;
}

export const EnemyPixelSprite: React.FC<EnemySpriteProps> = ({
  archetype,
  animState,
  isStunned,
  isWeakened,
}) => {
  const animClass =
    animState === 'flyAway'
      ? 'animate-fly-away'
      : animState === 'attack'
        ? 'animate-lunge-left'
        : animState === 'hit'
          ? 'animate-hit-flash'
          : animState === 'ko'
            ? 'opacity-30 rotate-90 translate-y-6 transition-all duration-300'
            : 'animate-float-idle';

  return (
    <div className="relative select-none">
      {animState === 'flyAway' && (
        <div className="pointer-events-none absolute -top-10 -right-8 z-30">
          <svg
            viewBox="0 0 24 24"
            className="w-16 h-16 animate-star-twinkle"
            shapeRendering="crispEdges"
          >
            <rect x="11" y="2" width="2" height="20" fill="#fde047" />
            <rect x="2" y="11" width="20" height="2" fill="#fde047" />
            <rect x="8" y="8" width="8" height="8" fill="#fef08a" />
            <rect x="10" y="10" width="4" height="4" fill="#ffffff" />
          </svg>
        </div>
      )}

      {isStunned && animState !== 'flyAway' && (
        <div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 font-pixel text-xs text-amber-300 bg-slate-900/90 border border-amber-400 px-2 py-0.5 whitespace-nowrap">
          ATORDOADO!
        </div>
      )}

      {isWeakened && !isStunned && animState !== 'flyAway' && (
        <div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 font-pixel text-xs text-rose-300 bg-slate-900/90 border border-rose-400 px-2 py-0.5 whitespace-nowrap">
          ATQ -40%
        </div>
      )}

      <div className={animClass}>
        <svg
          viewBox="0 0 32 32"
          className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 pixel-art drop-shadow-[0_8px_0_rgba(0,0,0,0.5)]"
          shapeRendering="crispEdges"
          aria-label={`Sprite do inimigo ${archetype}`}
        >
          <rect x="7" y="29" width="18" height="2" fill="#000000" opacity="0.45" />

          {archetype === 'conversador' && (
            <>
              {/* Boné virado pra trás */}
              <rect x="10" y="3" width="12" height="4" fill="#ef4444" />
              <rect x="20" y="5" width="5" height="2" fill="#b91c1c" />
              {/* Rosto falante */}
              <rect x="10" y="7" width="12" height="8" fill="#f1c27d" />
              <rect x="12" y="9" width="2" height="2" fill="#111827" />
              <rect x="16" y="9" width="2" height="2" fill="#111827" />
              {/* Boca bem aberta falando */}
              <rect x="12" y="12" width="5" height="2" fill="#7f1d1d" />
              {/* Balão de fofoca */}
              <rect x="2" y="4" width="7" height="5" fill="#ffffff" />
              <rect x="3" y="6" width="1" height="1" fill="#111827" />
              <rect x="5" y="6" width="1" height="1" fill="#111827" />
              <rect x="7" y="6" width="1" height="1" fill="#111827" />
              {/* Uniforme escolar bagunçado */}
              <rect x="8" y="15" width="16" height="9" fill="#16a34a" />
              <rect x="10" y="15" width="4" height="9" fill="#22c55e" />
              {/* Aviãozinho de papel na mão */}
              <rect x="4" y="15" width="5" height="2" fill="#f8fafc" />
              <rect x="5" y="14" width="3" height="1" fill="#cbd5e1" />
              <rect x="9" y="24" width="5" height="5" fill="#334155" />
              <rect x="18" y="24" width="5" height="5" fill="#334155" />
            </>
          )}

          {archetype === 'dorminhoco' && (
            <>
              {/* Capuz cinza */}
              <rect x="9" y="4" width="14" height="11" fill="#475569" />
              <rect x="11" y="7" width="10" height="7" fill="#e0ac69" />
              {/* Olhos fechados dormindo */}
              <rect x="12" y="10" width="3" height="1" fill="#1e293b" />
              <rect x="17" y="10" width="3" height="1" fill="#1e293b" />
              {/* Bolha de sono */}
              <rect x="14" y="12" width="3" height="3" fill="#bae6fd" />
              {/* Moletom largo */}
              <rect x="7" y="15" width="18" height="10" fill="#64748b" />
              <rect x="12" y="19" width="8" height="4" fill="#475569" />
              {/* Travesseiro gigante */}
              <rect x="3" y="14" width="6" height="9" fill="#f8fafc" />
              <rect x="4" y="15" width="4" height="7" fill="#e2e8f0" />
              {/* Zzz */}
              <rect x="23" y="3" width="4" height="1" fill="#38bdf8" />
              <rect x="25" y="4" width="1" height="1" fill="#38bdf8" />
              <rect x="23" y="5" width="4" height="1" fill="#38bdf8" />
              <rect x="9" y="25" width="5" height="4" fill="#1e293b" />
              <rect x="18" y="25" width="5" height="4" fill="#1e293b" />
            </>
          )}

          {archetype === 'freefire' && (
            <>
              {/* Bandana vermelha estilo FF */}
              <rect x="10" y="3" width="12" height="3" fill="#18181b" />
              <rect x="9" y="6" width="14" height="2" fill="#dc2626" />
              <rect x="23" y="7" width="3" height="2" fill="#dc2626" />
              {/* Headset gamer */}
              <rect x="8" y="7" width="2" height="5" fill="#f59e0b" />
              <rect x="22" y="7" width="2" height="5" fill="#f59e0b" />
              {/* Rosto intenso */}
              <rect x="10" y="8" width="12" height="7" fill="#d99b66" />
              <rect x="12" y="10" width="2" height="2" fill="#111827" />
              <rect x="17" y="10" width="2" height="2" fill="#111827" />
              <rect x="13" y="13" width="5" height="1" fill="#7f1d1d" />
              {/* Jaqueta preta e amarela */}
              <rect x="8" y="15" width="16" height="9" fill="#18181b" />
              <rect x="13" y="15" width="6" height="9" fill="#f59e0b" />
              {/* Celular na horizontal brilhando */}
              <rect x="2" y="15" width="8" height="5" fill="#0f172a" />
              <rect x="3" y="16" width="6" height="3" fill="#38bdf8" />
              <rect x="4" y="17" width="2" height="1" fill="#fde047" />
              <rect x="9" y="24" width="5" height="5" fill="#0f172a" />
              <rect x="18" y="24" width="5" height="5" fill="#0f172a" />
            </>
          )}

          {archetype === 'copiador' && (
            <>
              {/* Capuz hacker roxo escuro */}
              <rect x="9" y="3" width="14" height="12" fill="#312e81" />
              <rect x="11" y="6" width="10" height="7" fill="#f1c27d" />
              {/* Óculos escuros refletindo código */}
              <rect x="11" y="8" width="4" height="3" fill="#09090b" />
              <rect x="17" y="8" width="4" height="3" fill="#09090b" />
              <rect x="12" y="9" width="2" height="1" fill="#4ade80" />
              <rect x="18" y="9" width="2" height="1" fill="#4ade80" />
              {/* Corpo */}
              <rect x="8" y="15" width="16" height="9" fill="#4338ca" />
              {/* Pergaminho Ctrl+C colado */}
              <rect x="2" y="12" width="7" height="10" fill="#fef3c7" />
              <rect x="3" y="14" width="5" height="1" fill="#16a34a" />
              <rect x="3" y="16" width="4" height="1" fill="#dc2626" />
              <rect x="3" y="18" width="5" height="1" fill="#2563eb" />
              <rect x="9" y="24" width="5" height="5" fill="#1e1b4b" />
              <rect x="18" y="24" width="5" height="5" fill="#1e1b4b" />
            </>
          )}

          {archetype === 'dj_caixinha' && (
            <>
              {/* Cabelo moicano neon */}
              <rect x="13" y="2" width="6" height="4" fill="#ec4899" />
              <rect x="10" y="6" width="12" height="8" fill="#8d5524" />
              {/* Óculos juliet */}
              <rect x="10" y="8" width="12" height="3" fill="#06b6d4" />
              <rect x="15" y="8" width="2" height="3" fill="#0f172a" />
              {/* Camisa estilosa */}
              <rect x="8" y="14" width="16" height="10" fill="#be185d" />
              {/* Caixinha JBL gigante no ombro */}
              <rect x="1" y="10" width="8" height="12" fill="#0f172a" />
              <rect x="2" y="12" width="6" height="4" fill="#334155" />
              <rect x="3" y="13" width="4" height="2" fill="#ef4444" />
              <rect x="2" y="17" width="6" height="4" fill="#334155" />
              <rect x="3" y="18" width="4" height="2" fill="#ef4444" />
              <rect x="9" y="24" width="5" height="5" fill="#0f172a" />
              <rect x="18" y="24" width="5" height="5" fill="#0f172a" />
            </>
          )}

          {archetype === 'lorde_bagunca' && (
            <>
              {/* Coroa dourada do Lorde da Bagunça */}
              <rect x="9" y="1" width="2" height="4" fill="#fbbf24" />
              <rect x="15" y="0" width="2" height="5" fill="#fbbf24" />
              <rect x="21" y="1" width="2" height="4" fill="#fbbf24" />
              <rect x="9" y="4" width="14" height="3" fill="#f59e0b" />
              <rect x="15" y="5" width="2" height="1" fill="#ef4444" />
              {/* Capa vermelha dramática */}
              <rect x="5" y="13" width="22" height="13" fill="#7f1d1d" />
              {/* Cabeça */}
              <rect x="10" y="7" width="12" height="7" fill="#d99b66" />
              {/* Olhos brilhantes */}
              <rect x="12" y="9" width="2" height="2" fill="#ef4444" />
              <rect x="18" y="9" width="2" height="2" fill="#ef4444" />
              {/* Armadura escolar sombria */}
              <rect x="9" y="14" width="14" height="10" fill="#1e1b4b" />
              <rect x="14" y="15" width="4" height="8" fill="#f59e0b" />
              {/* Celular na esquerda e Pergaminho Ctrl+V na direita */}
              <rect x="2" y="12" width="6" height="4" fill="#38bdf8" />
              <rect x="24" y="11" width="6" height="8" fill="#fef3c7" />
              <rect x="25" y="13" width="4" height="1" fill="#ef4444" />
              <rect x="25" y="15" width="4" height="1" fill="#ef4444" />
              <rect x="10" y="24" width="5" height="5" fill="#0f172a" />
              <rect x="17" y="24" width="5" height="5" fill="#0f172a" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};
