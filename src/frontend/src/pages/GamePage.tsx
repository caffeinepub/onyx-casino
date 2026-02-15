import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSpinWheel, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SpinWheel from '../components/game/SpinWheel';
import OutcomeEffects from '../components/game/OutcomeEffects';
import { Sparkles, CreditCard, Receipt, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { GameOutcome } from '../backend';
import PremiumSpinner from '../components/common/PremiumSpinner';

export default function GamePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const spinWheel = useSpinWheel();
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<GameOutcome | null>(null);
  const [showEffects, setShowEffects] = useState(false);

  const balance = profile?.credits ? Number(profile.credits) : 0;

  const handleSpinComplete = () => {
    // Wheel has stopped, now show outcome effects
    setShowEffects(true);
  };

  const handleEffectComplete = () => {
    // Effects are done, allow next spin
    setShowEffects(false);
    setIsSpinning(false);
  };

  const handleSpin = async () => {
    if (balance < 50) {
      toast.error('Insufficient balance! Minimum 50 credits required.');
      return;
    }

    // Reset state for new spin
    setIsSpinning(true);
    setShowEffects(false);
    setLastOutcome(null);

    try {
      const result = await spinWheel.mutateAsync();
      setLastOutcome(result.outcome);

      // Show toast based on profit
      const profit = Number(result.profit);
      if (profit > 0) {
        toast.success(`You won ${profit} credits!`, {
          description: `New balance: ${Number(result.balanceAfterSpin).toLocaleString()} credits`
        });
      } else if (profit < 0) {
        toast.error(`You lost ${Math.abs(profit)} credits`, {
          description: `New balance: ${Number(result.balanceAfterSpin).toLocaleString()} credits`
        });
      } else {
        toast.info('No change in balance', {
          description: `Balance: ${Number(result.balanceAfterSpin).toLocaleString()} credits`
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to spin wheel');
      setIsSpinning(false);
      setLastOutcome(null);
    }
  };

  // Show lightweight loading only on initial load
  if (profileLoading && !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PremiumSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left: Hero Section */}
        <div className="space-y-6 animate-fade-in order-2 lg:order-1">
          <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 text-sm font-bold">
            <Sparkles className="h-4 w-4" />
            JACKPOT: ₹10,000,000
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-gradient">The Peak of Betting</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              Experience fair play and massive rewards on Nepal's premier gaming platform. Spin the wheel to test your destiny.
            </p>
          </div>

          {/* Payout Info Cards */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <Card className="premium-card border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">1.96x</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Dragon Payout</p>
              </CardContent>
            </Card>
            <Card className="premium-card border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">1.40x</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Tiger Payout</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => navigate({ to: '/buy-credits' })}
              variant="outline"
              size="lg"
              className="hover-lift gap-2 bg-background/50"
            >
              <CreditCard className="h-5 w-5" />
              Deposit Funds
            </Button>
            <Button
              onClick={() => navigate({ to: '/transactions' })}
              variant="outline"
              size="lg"
              className="hover-lift gap-2 bg-background/50"
            >
              <Receipt className="h-5 w-5" />
              View History
            </Button>
          </div>
        </div>

        {/* Right: Wheel + Spin Button */}
        <div className="space-y-6 animate-fade-in order-1 lg:order-2" style={{ animationDelay: '100ms' }}>
          <Card className="border-primary/20 premium-surface">
            <CardContent className="p-6 flex items-center justify-center">
              <div className="relative">
                <SpinWheel 
                  outcome={lastOutcome || undefined} 
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                />
                {showEffects && (
                  <OutcomeEffects 
                    outcome={lastOutcome} 
                    onEffectComplete={handleEffectComplete}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSpin}
            disabled={isSpinning || showEffects || balance < 50}
            size="lg"
            className="w-full h-16 text-lg font-bold hover-lift touch-friendly shadow-premium-lg bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 disabled:opacity-100"
          >
            {isSpinning || showEffects ? (
              <span className="flex items-center justify-center opacity-100">
                <PremiumSpinner size="sm" className="mr-2" />
                <span className="text-foreground font-bold">Spinning...</span>
              </span>
            ) : (
              <>
                <TrendingUp className="mr-2 h-5 w-5" />
                SPIN • 50 CREDITS
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
