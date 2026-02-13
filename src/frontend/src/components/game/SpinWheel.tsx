import { useEffect, useState } from 'react';
import type { GameOutcome } from '../../backend';

interface SpinWheelProps {
  isSpinning: boolean;
  outcome?: GameOutcome;
  onWin?: () => void;
}

export default function SpinWheel({ isSpinning, outcome, onWin }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isSpinning && outcome) {
      const outcomeAngles: Record<GameOutcome, number> = {
        tiger: 45,
        dragon: 135,
        miss: 225,
        crit: 315
      };
      
      const targetAngle = outcomeAngles[outcome];
      const spins = 6;
      const finalRotation = 360 * spins + targetAngle;
      
      setRotation(finalRotation);

      if (outcome === 'tiger' || outcome === 'dragon') {
        setTimeout(() => {
          setShowCelebration(true);
          onWin?.();
          setTimeout(() => setShowCelebration(false), 2000);
        }, 3200);
      }
    }
  }, [isSpinning, outcome, onWin]);

  return (
    <div className="relative w-full max-w-sm aspect-square">
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-full h-full"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}
        >
          <img 
            src="/assets/generated/spin-wheel-face.dim_1024x1024.png"
            alt="Spin Wheel"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>
      
      {/* Gold Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
        <img 
          src="/assets/generated/spin-wheel-pointer-gold.dim_512x512.png"
          alt="Pointer"
          className="w-12 h-12 drop-shadow-xl"
        />
      </div>

      {/* Win Celebration */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center z-20 animate-celebration">
          <img 
            src="/assets/generated/win-celebration-burst.dim_1024x1024.png"
            alt="Win!"
            className="w-full h-full object-contain animate-pulse-scale"
          />
        </div>
      )}
    </div>
  );
}
