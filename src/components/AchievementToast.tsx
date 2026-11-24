import React from 'react';
import { Trophy } from 'lucide-react';
import { AchievementDef } from '../types/game';

interface AchievementToastProps {
  achievement: AchievementDef | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
}) => {
  if (!achievement) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 max-w-sm pixel-panel-gold p-3.5 flex items-center gap-3 animate-xique-banner cursor-pointer"
      onClick={onDismiss}
    >
      <div className="w-10 h-10 bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shrink-0 text-amber-300">
        <Trophy className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="font-pixel text-[11px] text-amber-300 tracking-wide">
          Conquista Desbloqueada
        </p>
        <p className="text-sm font-bold text-white truncate">
          {achievement.title}
        </p>
        <p className="text-xs text-amber-200/80">
          +{achievement.rewardCoins} Pontos de Didática
        </p>
      </div>
    </div>
  );
};
