import { useEffect, useState, useRef } from 'react';
import type { GameOutcome } from '../../backend';

interface SpinWheelProps {
  isSpinning: boolean;
  outcome?: GameOutcome;
  onSpinComplete?: () => void;
}

export default function SpinWheel({ isSpinning, outcome, onSpinComplete }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  // Deterministic spin animation that lands on the backend-provided outcome
  useEffect(() => {
    if (isSpinning && outcome && wheelRef.current) {
      // Map outcomes to their segment center angles (pointer at top = 0°)
      // Wheel has 4 segments: Tiger (top), Dragon (right), Miss (bottom), Crit (left)
      const outcomeAngles: Record<GameOutcome, number> = {
        tiger: 0,      // Top segment (0°)
        dragon: 90,    // Right segment (90°)
        miss: 180,     // Bottom segment (180°)
        crit: 270      // Left segment (270°)
      };
      
      const targetSegmentCenter = outcomeAngles[outcome];
      // Add small random offset within segment for natural feel
      const randomOffset = (Math.random() - 0.5) * 30;
      const targetAngle = targetSegmentCenter + randomOffset;
      
      // Multiple full rotations for dramatic effect
      const spins = 6 + Math.floor(Math.random() * 2);
      const totalRotation = 360 * spins + (360 - targetAngle);
      
      const normalizedCurrent = rotation % 360;
      const finalRotation = normalizedCurrent + totalRotation;
      
      if (animationRef.current) {
        animationRef.current.cancel();
      }

      // Smooth easing with acceleration and deceleration
      const animation = wheelRef.current.animate(
        [
          { transform: `rotate(${normalizedCurrent}deg)` },
          { 
            transform: `rotate(${normalizedCurrent + totalRotation * 0.15}deg)`, 
            offset: 0.1, 
            easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' 
          },
          { 
            transform: `rotate(${normalizedCurrent + totalRotation * 0.5}deg)`, 
            offset: 0.45, 
            easing: 'cubic-bezier(0.42, 0, 0.58, 1)' 
          },
          { 
            transform: `rotate(${normalizedCurrent + totalRotation * 0.85}deg)`, 
            offset: 0.8, 
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
          },
          { 
            transform: `rotate(${finalRotation}deg)`, 
            easing: 'cubic-bezier(0.19, 1, 0.22, 1)' 
          }
        ],
        {
          duration: 5000,
          fill: 'forwards',
          easing: 'linear'
        }
      );

      animationRef.current = animation;

      animation.onfinish = () => {
        setRotation(finalRotation % 360);
        // Signal that the wheel has stopped spinning
        onSpinComplete?.();
      };
    }
  }, [isSpinning, outcome, onSpinComplete, rotation]);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative w-full aspect-square min-h-[280px] sm:min-h-[320px]">
        {/* Fixed pointer at top - always visible */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none wheel-pointer">
          <div 
            className="relative"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.8)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6))'
            }}
          >
            <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[48px] border-t-[#FFD700]" />
            {/* Inner highlight for 3D effect */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[36px] border-t-[#FFFACD]"
              style={{ opacity: 0.4 }}
            />
          </div>
        </div>
        
        {/* Casino wheel container - always visible with content */}
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          <div 
            ref={wheelRef}
            className="relative w-full h-full wheel-container select-none"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))',
              pointerEvents: isSpinning ? 'none' : 'auto',
              minHeight: '280px',
              minWidth: '280px'
            }}
          >
            {/* SVG Wheel with 4 labeled segments */}
            <svg 
              viewBox="0 0 400 400" 
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.3))' }}
            >
              {/* Outer rim - gold */}
              <circle 
                cx="200" 
                cy="200" 
                r="195" 
                fill="none" 
                stroke="oklch(0.65 0.18 45)" 
                strokeWidth="10"
                opacity="0.9"
              />
              
              {/* Inner rim */}
              <circle 
                cx="200" 
                cy="200" 
                r="175" 
                fill="none" 
                stroke="oklch(0.55 0.18 45)" 
                strokeWidth="4"
                opacity="0.7"
              />
              
              {/* Background circle */}
              <circle 
                cx="200" 
                cy="200" 
                r="170" 
                fill="oklch(0.15 0.02 240)"
                opacity="0.95"
              />
              
              {/* 4 segments with dividing lines */}
              {/* Tiger segment (top) - gold */}
              <path
                d="M 200 30 A 170 170 0 0 1 370 200 L 200 200 Z"
                fill="oklch(0.65 0.18 45)"
                opacity="0.35"
                stroke="oklch(0.65 0.18 45)"
                strokeWidth="2"
              />
              
              {/* Dragon segment (right) - lighter gold */}
              <path
                d="M 370 200 A 170 170 0 0 1 200 370 L 200 200 Z"
                fill="oklch(0.70 0.18 45)"
                opacity="0.3"
                stroke="oklch(0.65 0.18 45)"
                strokeWidth="2"
              />
              
              {/* Miss segment (bottom) - muted gray */}
              <path
                d="M 200 370 A 170 170 0 0 1 30 200 L 200 200 Z"
                fill="oklch(0.30 0.03 240)"
                opacity="0.4"
                stroke="oklch(0.65 0.18 45)"
                strokeWidth="2"
              />
              
              {/* Crit segment (left) - destructive red */}
              <path
                d="M 30 200 A 170 170 0 0 1 200 30 L 200 200 Z"
                fill="oklch(0.55 0.22 25)"
                opacity="0.35"
                stroke="oklch(0.65 0.18 45)"
                strokeWidth="2"
              />
              
              {/* Dividing lines - vertical and horizontal */}
              <line x1="200" y1="30" x2="200" y2="370" stroke="oklch(0.65 0.18 45)" strokeWidth="3" opacity="0.7" />
              <line x1="30" y1="200" x2="370" y2="200" stroke="oklch(0.65 0.18 45)" strokeWidth="3" opacity="0.7" />
              
              {/* Segment labels */}
              {/* Tiger label (top) */}
              <text 
                x="200" 
                y="90" 
                textAnchor="middle" 
                fill="oklch(0.95 0.01 240)" 
                fontSize="28"
                fontWeight="700"
                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
              >
                TIGER
              </text>
              <text 
                x="200" 
                y="115" 
                textAnchor="middle" 
                fill="oklch(0.65 0.18 45)" 
                fontSize="18"
                fontWeight="600"
              >
                1.4x
              </text>
              
              {/* Dragon label (right) */}
              <text 
                x="310" 
                y="205" 
                textAnchor="middle" 
                fill="oklch(0.95 0.01 240)" 
                fontSize="28"
                fontWeight="700"
                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
              >
                DRAGON
              </text>
              <text 
                x="310" 
                y="230" 
                textAnchor="middle" 
                fill="oklch(0.70 0.18 45)" 
                fontSize="18"
                fontWeight="600"
              >
                1.96x
              </text>
              
              {/* Miss label (bottom) */}
              <text 
                x="200" 
                y="305" 
                textAnchor="middle" 
                fill="oklch(0.95 0.01 240)" 
                fontSize="28"
                fontWeight="700"
                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
              >
                MISS
              </text>
              <text 
                x="200" 
                y="330" 
                textAnchor="middle" 
                fill="oklch(0.60 0.01 240)" 
                fontSize="18"
                fontWeight="600"
              >
                0x
              </text>
              
              {/* Crit label (left) */}
              <text 
                x="90" 
                y="205" 
                textAnchor="middle" 
                fill="oklch(0.95 0.01 240)" 
                fontSize="28"
                fontWeight="700"
                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
              >
                CRIT
              </text>
              <text 
                x="90" 
                y="230" 
                textAnchor="middle" 
                fill="oklch(0.55 0.22 25)" 
                fontSize="18"
                fontWeight="600"
              >
                -0.5x
              </text>
              
              {/* Center circle - decorative hub */}
              <circle 
                cx="200" 
                cy="200" 
                r="45" 
                fill="oklch(0.65 0.18 45)"
                opacity="0.9"
              />
              <circle 
                cx="200" 
                cy="200" 
                r="38" 
                fill="oklch(0.12 0.02 240)"
                opacity="0.95"
              />
              
              {/* Center text */}
              <text 
                x="200" 
                y="205" 
                textAnchor="middle" 
                fill="oklch(0.65 0.18 45)" 
                fontSize="16"
                fontWeight="700"
              >
                SPIN
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
