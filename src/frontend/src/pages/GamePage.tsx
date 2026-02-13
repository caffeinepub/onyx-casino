import { useState } from 'react';
import { useGetCallerUserProfile, useSpinWheel } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SpinWheel from '../components/game/SpinWheel';
import BalanceTicker from '../components/wallet/BalanceTicker';
import { toast } from 'sonner';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import type { GameOutcome } from '../backend';

export default function GamePage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const spinWheel = useSpinWheel();
  const [lastResult, setLastResult] = useState<{ outcome: GameOutcome; profit: bigint } | null>(null);

  const handleSpin = async () => {
    try {
      const result = await spinWheel.mutateAsync();
      setLastResult({ outcome: result.outcome, profit: result.profit });
      
      const profitNum = Number(result.profit);
      if (profitNum > 0) {
        toast.success(`You won ${profitNum} credits!`, {
          description: `Outcome: ${result.outcome.toUpperCase()}`
        });
      } else if (profitNum < 0) {
        toast.error(`You lost ${Math.abs(profitNum)} credits`, {
          description: `Outcome: ${result.outcome.toUpperCase()}`
        });
      } else {
        toast.info('Break even!', {
          description: `Outcome: ${result.outcome.toUpperCase()}`
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Spin failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  const balance = profile?.credits ? Number(profile.credits) : 0;
  const canSpin = balance >= 50 && !spinWheel.isPending;

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Balance Display */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Your Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BalanceTicker balance={balance} />
          {balance < 50 && (
            <p className="text-sm text-destructive mt-2">
              Insufficient balance. Minimum 50 credits required to spin.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Wheel */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle>Spin Wheel</CardTitle>
            <CardDescription>50 credits per spin</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <SpinWheel 
              isSpinning={spinWheel.isPending} 
              outcome={lastResult?.outcome}
            />
            <Button
              onClick={handleSpin}
              disabled={!canSpin}
              size="lg"
              className="w-full max-w-xs h-14 text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover-lift touch-friendly"
            >
              {spinWheel.isPending ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Spinning...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-5 w-5" />
                  Spin (50 Credits)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Game Info */}
        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
            <CardDescription>Multipliers for 50 credit bet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-4" />
                  <span className="font-medium">Dragon</span>
                </div>
                <div className="flex items-center gap-2 text-chart-4">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-bold">1.96x (+48)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-2" />
                  <span className="font-medium">Tiger</span>
                </div>
                <div className="flex items-center gap-2 text-chart-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-bold">1.4x (+20)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-5" />
                  <span className="font-medium">Crit</span>
                </div>
                <div className="flex items-center gap-2 text-chart-5">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-bold">0.5x (-25)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                  <span className="font-medium">Miss</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-bold">0x (-50)</span>
                </div>
              </div>
            </div>

            {lastResult && (
              <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
                <p className="text-sm font-medium mb-1">Last Result</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold capitalize">{lastResult.outcome}</span>
                  <span className={`text-lg font-bold ${Number(lastResult.profit) >= 0 ? 'text-chart-4' : 'text-destructive'}`}>
                    {Number(lastResult.profit) >= 0 ? '+' : ''}{Number(lastResult.profit)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
