import { useEffect, useState, useRef } from 'react';
import type { GameOutcome } from '../../backend';

interface SpinWheelProps {
  isSpinning: boolean;
  outcome?: GameOutcome;
  onWin?: () => void;
}

const SEGMENTS = [
  { outcome: 'tiger' as GameOutcome, color: '#FFD700', label: 'TIGER', startAngle: 0 },
  { outcome: 'miss' as GameOutcome, color: '#1A1A1A', label: 'MISS', startAngle: 90 },
  { outcome: 'dragon' as GameOutcome, color: '#CD7F32', label: 'DRAGON', startAngle: 180 },
  { outcome: 'crit' as GameOutcome, color: '#404040', label: 'CRIT', startAngle: 270 },
];

export default function SpinWheel({ isSpinning, outcome, onWin }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  // Draw premium wheel with enhanced visuals
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 15;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw segments with enhanced gradients
    SEGMENTS.forEach((segment, index) => {
      const startAngle = (index * Math.PI) / 2 - Math.PI / 2;
      const endAngle = ((index + 1) * Math.PI) / 2 - Math.PI / 2;

      // Create radial gradient for depth
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      
      if (segment.color === '#FFD700') {
        // Gold tiger segment
        gradient.addColorStop(0, '#FFF4CC');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#B8941F');
      } else if (segment.color === '#CD7F32') {
        // Bronze dragon segment
        gradient.addColorStop(0, '#E6B88A');
        gradient.addColorStop(0.5, '#CD7F32');
        gradient.addColorStop(1, '#8B5A2B');
      } else if (segment.color === '#404040') {
        // Dark gray crit segment
        gradient.addColorStop(0, '#606060');
        gradient.addColorStop(0.5, '#404040');
        gradient.addColorStop(1, '#202020');
      } else {
        // Black miss segment
        gradient.addColorStop(0, '#2A2A2A');
        gradient.addColorStop(0.5, '#1A1A1A');
        gradient.addColorStop(1, '#0A0A0A');
      }

      // Draw segment with gradient
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add subtle inner highlight
      const highlightGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.3);
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      // Draw segment border with glow
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 5;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw label with enhanced typography
      ctx.save();
      const midAngle = startAngle + Math.PI / 4;
      ctx.rotate(midAngle);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text styling with better contrast
      const isLightBg = segment.color === '#FFD700' || segment.color === '#CD7F32';
      ctx.fillStyle = isLightBg ? '#000000' : '#FFFFFF';
      ctx.font = 'bold 36px "Inter", sans-serif';
      ctx.letterSpacing = '2px';
      
      // Text shadow for depth
      ctx.shadowColor = isLightBg ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(segment.label, radius * 0.65, 0);
      ctx.restore();
    });

    // Draw premium outer rim with gradient
    const rimGradient = ctx.createLinearGradient(-radius, 0, radius, 0);
    rimGradient.addColorStop(0, '#B8941F');
    rimGradient.addColorStop(0.5, '#FFD700');
    rimGradient.addColorStop(1, '#B8941F');
    
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = rimGradient;
    ctx.lineWidth = 12;
    ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner rim accent
    ctx.beginPath();
    ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw premium center hub with metallic effect
    const hubRadius = radius * 0.18;
    const hubGradient = ctx.createRadialGradient(0, -hubRadius * 0.3, 0, 0, 0, hubRadius);
    hubGradient.addColorStop(0, '#FFFACD');
    hubGradient.addColorStop(0.3, '#FFD700');
    hubGradient.addColorStop(0.7, '#D4AF37');
    hubGradient.addColorStop(1, '#8B7500');
    
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, Math.PI * 2);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    
    // Hub highlight
    const highlightGradient = ctx.createRadialGradient(0, -hubRadius * 0.4, 0, 0, 0, hubRadius * 0.6);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, Math.PI * 2);
    ctx.fillStyle = highlightGradient;
    ctx.fill();
    
    // Hub border with glow
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.stroke();

    ctx.restore();
  }, []);

  // Enhanced spin animation with smoother easing
  useEffect(() => {
    if (isSpinning && outcome && wheelRef.current) {
      // Map outcomes to their segment center angles (top = 0°)
      const outcomeAngles: Record<GameOutcome, number> = {
        tiger: 0,
        miss: 90,
        dragon: 180,
        crit: 270
      };
      
      const targetSegmentCenter = outcomeAngles[outcome];
      const randomOffset = (Math.random() - 0.5) * 40;
      const targetAngle = targetSegmentCenter + randomOffset;
      
      const spins = 6 + Math.floor(Math.random() * 2);
      const totalRotation = 360 * spins + (360 - targetAngle);
      
      const normalizedCurrent = rotation % 360;
      const finalRotation = normalizedCurrent + totalRotation;
      
      if (animationRef.current) {
        animationRef.current.cancel();
      }

      // Smoother, more polished easing curve
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
        
        if (outcome === 'tiger' || outcome === 'dragon') {
          setShowCelebration(true);
          onWin?.();
          setTimeout(() => setShowCelebration(false), 2500);
        }
      };
    }
  }, [isSpinning, outcome, onWin, rotation]);

  return (
    <div className="relative w-full max-w-sm aspect-square">
      {/* Enhanced fixed pointer at top */}
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
      
      {/* Wheel container with enhanced shadow */}
      <div className="absolute inset-0 flex items-center justify-center pt-8">
        <div 
          ref={wheelRef}
          className="relative w-full h-full wheel-container"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))'
          }}
        >
          <canvas
            ref={canvasRef}
            width={512}
            height={512}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Enhanced celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <img 
            src="/assets/generated/win-sparkles-overlay.dim_1024x1024.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain animate-celebration-sparkles"
          />
          
          <img 
            src="/assets/generated/win-celebration-burst.dim_1024x1024.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain animate-celebration-burst"
          />
        </div>
      )}
    </div>
  );
}
