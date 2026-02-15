import { useEffect, useState } from 'react';
import type { GameOutcome } from '../../backend';
import { assetUrl } from '../../utils/assetUrl';
import { GENERATED_ASSETS } from '../../utils/generatedAssets';

interface OutcomeEffectsProps {
  outcome: GameOutcome | null;
  onEffectComplete?: () => void;
}

export default function OutcomeEffects({ outcome, onEffectComplete }: OutcomeEffectsProps) {
  const [showEffect, setShowEffect] = useState(false);

  useEffect(() => {
    if (outcome) {
      setShowEffect(true);
      
      // Effect duration based on outcome type
      const duration = outcome === 'tiger' || outcome === 'dragon' ? 2500 : 1500;
      
      const timer = setTimeout(() => {
        setShowEffect(false);
        onEffectComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [outcome, onEffectComplete]);

  if (!showEffect || !outcome) return null;

  // Win effects for Tiger and Dragon
  if (outcome === 'tiger' || outcome === 'dragon') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        {/* Sparkles overlay */}
        <img 
          src={assetUrl(GENERATED_ASSETS.winSparkles)}
          alt=""
          className="absolute inset-0 w-full h-full object-contain animate-win-sparkles"
        />
        
        {/* Burst overlay */}
        <img 
          src={assetUrl(GENERATED_ASSETS.winBurst)}
          alt=""
          className="absolute inset-0 w-full h-full object-contain animate-win-burst"
        />
      </div>
    );
  }

  // Neutral effect for Miss
  if (outcome === 'miss') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <img 
          src={assetUrl(GENERATED_ASSETS.missNeutral)}
          alt=""
          className="absolute inset-0 w-full h-full object-contain animate-miss-neutral"
        />
      </div>
    );
  }

  // Loss effect for Crit
  if (outcome === 'crit') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <img 
          src={assetUrl(GENERATED_ASSETS.critLoss)}
          alt=""
          className="absolute inset-0 w-full h-full object-contain animate-crit-loss"
        />
      </div>
    );
  }

  return null;
}
