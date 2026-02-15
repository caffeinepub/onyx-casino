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
      const newBalance = Number(result.balanceAfterSpin);
      
      if (profit > 0) {
        toast.success(`You won ${profit} credits! 🎉`, {
          description: `New balance: ${newBalance} credits`,
          className: 'bg-success/10 border-success/50'
        });
      } else if (profit === 0) {
        toast.info(`Miss! No win this time.`, {
          description: `Balance: ${newBalance} credits`,
          className: 'bg-muted/10 border-muted/50'
        });
      } else {
        toast.error(`Lost ${Math.abs(profit)} credits`, {
          description: `Balance: ${newBalance} credits`,
          className: 'bg-destructive/10 border-destructive/50'
        });
      }
    } catch (error: any) {
      console.error('Spin error:', error);
      toast.error(error.message || 'Spin failed. Please try again.');
      setIsSpinning(false);
      setShowEffects(false);
    }
  };

  const payoutInfo = [
    { label: 'Tiger', multiplier: '1.4x', payout: '+20', color: 'text-primary' },
    { label: 'Dragon', multiplier: '1.96x', payout: '+48', color: 'text-primary' },
    { label: 'Miss', multiplier: '0x', payout: '-50', color: 'text-muted-foreground' },
    { label: 'Crit', multiplier: '-0.5x', payout: '-75', color: 'text-destructive' }
  ];

  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PremiumSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.65_0.18_45/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(0.65_0.18_45/0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <Badge variant="outline" className="border-primary/50 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Live Casino
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient">
              Spin the Wheel
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Test your luck with every spin. 50 credits per spin.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Payout Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Payout Table</h2>
            {payoutInfo.map((info) => (
              <Card key={info.label} className="premium-card hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{info.label}</p>
                      <p className={`text-sm ${info.color}`}>{info.multiplier}</p>
                    </div>
                    <div className={`text-xl font-bold ${info.color}`}>
                      {info.payout}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Quick Actions */}
            <div className="space-y-3 pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: '/buy-credits' })}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: '/transactions' })}
              >
                <Receipt className="h-4 w-4 mr-2" />
                View History
              </Button>
            </div>
          </div>

          {/* Wheel Section */}
          <div className="lg:col-span-2">
            <Card className="premium-card overflow-visible min-h-[500px]">
              <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-6">
                {/* Balance Display */}
                <div className="w-full flex justify-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/30">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Balance:</span>
                    <span className="text-2xl font-bold text-primary">{balance}</span>
                    <span className="text-sm font-medium text-muted-foreground">credits</span>
                  </div>
                </div>

                {/* Wheel */}
                <div className="relative w-full max-w-md">
                  <SpinWheel
                    isSpinning={isSpinning}
                    outcome={lastOutcome || undefined}
                    onSpinComplete={handleSpinComplete}
                  />
                  
                  {/* Outcome Effects Overlay */}
                  {showEffects && lastOutcome && (
                    <OutcomeEffects
                      outcome={lastOutcome}
                      onEffectComplete={handleEffectComplete}
                    />
                  )}
                </div>

                {/* Spin Button */}
                <Button
                  size="lg"
                  onClick={handleSpin}
                  disabled={isSpinning || balance < 50}
                  className="w-full max-w-xs text-lg font-bold h-14 disabled:opacity-100"
                >
                  {isSpinning ? (
                    <span className="opacity-100 flex items-center gap-2">
                      <PremiumSpinner size="sm" />
                      Spinning...
                    </span>
                  ) : balance < 50 ? (
                    'Insufficient Balance'
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Spin (50 credits)
                    </>
                  )}
                </Button>

                {/* Info Text */}
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Each spin costs 50 credits. Win up to 1.96x with Dragon, or lose an additional 0.5x with Crit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
