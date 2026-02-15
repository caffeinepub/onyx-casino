import { useEffect, useState, useRef } from 'react';
import type { GameOutcome } from '../../backend';
import { assetUrl } from '../../utils/assetUrl';
import { GENERATED_ASSETS } from '../../utils/generatedAssets';
import { AlertCircle, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import PremiumSpinner from '../common/PremiumSpinner';

interface SpinWheelProps {
  isSpinning: boolean;
  outcome?: GameOutcome;
  onSpinComplete?: () => void;
}

export default function SpinWheel({ isSpinning, outcome, onSpinComplete }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const errorLoggedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchCheckedRef = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const wheelImageUrl = assetUrl(GENERATED_ASSETS.wheelBase);

  // One-time fetch check when image fails or times out
  const performFetchCheck = async () => {
    if (fetchCheckedRef.current) return;
    fetchCheckedRef.current = true;

    try {
      const response = await fetch(wheelImageUrl, { method: 'HEAD' });
      setFetchStatus(`HTTP ${response.status} ${response.statusText}`);
    } catch (error: any) {
      setFetchStatus(`Network error: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle image load error
  const handleImageError = () => {
    if (!errorLoggedRef.current) {
      console.error('[SpinWheel] Failed to load wheel image', {
        wheelImageUrl,
        BASE_URL: import.meta.env.BASE_URL,
        GENERATED_ASSETS_wheelBase: GENERATED_ASSETS.wheelBase,
        timestamp: new Date().toISOString()
      });
      errorLoggedRef.current = true;
    }
    setImageError(true);
    setShowFallback(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    performFetchCheck();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setShowFallback(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Check if image is already cached/loaded on mount
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      // Image is already loaded (cached)
      setImageLoaded(true);
      setImageError(false);
      setShowFallback(false);
    }
  }, []);

  // Timeout for slow-loading images
  useEffect(() => {
    if (!imageLoaded && !imageError) {
      timeoutRef.current = setTimeout(() => {
        if (!imageLoaded && !errorLoggedRef.current) {
          console.warn('[SpinWheel] Wheel image load timeout (4s)', {
            wheelImageUrl,
            BASE_URL: import.meta.env.BASE_URL,
            GENERATED_ASSETS_wheelBase: GENERATED_ASSETS.wheelBase,
            timestamp: new Date().toISOString()
          });
          errorLoggedRef.current = true;
          setShowFallback(true);
          performFetchCheck();
        }
      }, 4000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [imageLoaded, imageError, wheelImageUrl]);

  // Deterministic spin animation that lands on the backend-provided outcome
  useEffect(() => {
    if (isSpinning && outcome && wheelRef.current) {
      // Map outcomes to their segment center angles (pointer at top = 0°)
      // Casino wheel has 4 segments: Tiger (top), Dragon (right), Miss (bottom), Crit (left)
      const outcomeAngles: Record<GameOutcome, number> = {
        tiger: 0,      // Top segment
        dragon: 90,    // Right segment
        miss: 180,     // Bottom segment
        crit: 270      // Left segment
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

  const imageState = imageLoaded ? 'loaded' : imageError ? 'error' : showFallback ? 'timeout' : 'loading';
  const shouldShowDiagnosticsButton = (imageError || showFallback) && !imageLoaded;

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative w-full aspect-square">
        {/* Fixed pointer at top */}
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
        
        {/* Casino wheel container with enhanced shadow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            ref={wheelRef}
            className="relative w-full h-full wheel-container select-none"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))',
              pointerEvents: isSpinning ? 'none' : 'auto'
            }}
          >
            {/* Loading placeholder - always visible until image loads or errors */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-full border-4 border-primary/20 backdrop-blur-sm">
                <PremiumSpinner size="lg" className="mb-3" />
                <p className="text-sm font-semibold text-foreground">Loading wheel...</p>
              </div>
            )}

            {/* Fallback placeholder when image fails or times out */}
            {(imageError || showFallback) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 rounded-full border-4 border-primary/30">
                <AlertCircle className="h-16 w-16 text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground text-center px-4">
                  Wheel image unavailable
                </p>
              </div>
            )}

            {/* Actual wheel image */}
            <img
              ref={imgRef}
              src={wheelImageUrl}
              alt="Casino Wheel"
              className="w-full h-full object-contain transition-opacity duration-300"
              draggable={false}
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ 
                opacity: imageLoaded ? 1 : 0,
                display: imageError ? 'none' : 'block'
              }}
            />
          </div>
        </div>
      </div>

      {/* Diagnostics button - only shown when wheel fails */}
      {shouldShowDiagnosticsButton && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="gap-2"
          >
            <Bug className="h-4 w-4" />
            Wheel Diagnostics
            {showDiagnostics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Diagnostics panel */}
      {shouldShowDiagnosticsButton && showDiagnostics && (
        <Card className="mt-4 border-warning/50 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bug className="h-5 w-5 text-warning" />
              Wheel Image Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="font-semibold text-muted-foreground mb-1">Image State:</div>
              <div className="font-mono text-xs bg-muted/50 p-2 rounded">
                {imageState}
              </div>
            </div>

            <div>
              <div className="font-semibold text-muted-foreground mb-1">Resolved URL:</div>
              <div className="font-mono text-xs bg-muted/50 p-2 rounded break-all">
                {wheelImageUrl}
              </div>
            </div>

            <div>
              <div className="font-semibold text-muted-foreground mb-1">BASE_URL:</div>
              <div className="font-mono text-xs bg-muted/50 p-2 rounded">
                {import.meta.env.BASE_URL || '/'}
              </div>
            </div>

            <div>
              <div className="font-semibold text-muted-foreground mb-1">Asset Path (from generatedAssets):</div>
              <div className="font-mono text-xs bg-muted/50 p-2 rounded break-all">
                {GENERATED_ASSETS.wheelBase}
              </div>
            </div>

            {fetchStatus && (
              <div>
                <div className="font-semibold text-muted-foreground mb-1">Fetch Check Result:</div>
                <div className="font-mono text-xs bg-muted/50 p-2 rounded">
                  {fetchStatus}
                </div>
              </div>
            )}

            <div>
              <div className="font-semibold text-muted-foreground mb-1">Image Preview:</div>
              <div className="bg-muted/50 p-2 rounded">
                <img 
                  src={wheelImageUrl} 
                  alt="Wheel preview" 
                  className="w-24 h-24 object-contain mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
