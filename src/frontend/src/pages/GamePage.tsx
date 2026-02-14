import { useState } from 'react';
import { useSpinWheel, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SpinWheel from '../components/game/SpinWheel';
import BalanceTicker from '../components/wallet/BalanceTicker';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { GameOutcome } from '../backend';
import PremiumSpinner from '../components/common/PremiumSpinner';

export default function GamePage() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const spinWheel = useSpinWheel();
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<GameOutcome | undefined>(undefined);

  const balance = profile?.credits ? Number(profile.credits) : 0;

  const handleSpin = async () => {
    if (balance < 50) {
      toast.error('Insufficient balance! Minimum 50 credits required.');
      return;
    }

    setIsSpinning(true);
    setLastOutcome(undefined);

    try {
      const result = await spinWheel.mutateAsync();
      setLastOutcome(result.outcome);

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
    } finally {
      setTimeout(() => setIsSpinning(false), 500);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <PremiumSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Spin & Win</h1>
        <p className="text-sm md:text-base text-muted-foreground">Test your luck on the wheel</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 animate-fade-in lg:col-span-2" style={{ animationDelay: '50ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Coins className="h-5 w-5 text-primary" />
              Current Balance
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Your available credits</CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceTicker balance={balance} />
          </CardContent>
        </Card>

        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Bet Amount</CardTitle>
            <CardDescription className="text-xs md:text-sm">Per spin</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl md:text-4xl font-bold text-primary">50</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Credits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card className="border-primary/20 premium-surface animate-fade-in" style={{ animationDelay: '150ms' }}>
            <CardContent className="p-4 md:p-6">
              <SpinWheel outcome={lastOutcome} isSpinning={isSpinning} />
            </CardContent>
          </Card>

          <Button
            onClick={handleSpin}
            disabled={isSpinning || balance < 50}
            size="lg"
            className="w-full h-14 md:h-16 text-base md:text-lg font-bold hover-lift touch-friendly shadow-premium-lg animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            {isSpinning ? (
              <>
                <PremiumSpinner size="sm" className="mr-2" />
                Spinning...
              </>
            ) : (
              'SPIN THE WHEEL'
            )}
          </Button>
        </div>

        <div className="space-y-4 md:space-y-6">
          <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '250ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <TrendingUp className="h-5 w-5 text-chart-4" />
                Payouts
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Win multipliers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-2 md:p-3 rounded-lg bg-accent/50">
                <span className="font-medium text-sm md:text-base">🐯 Tiger</span>
                <span className="text-chart-4 font-bold text-sm md:text-base">1.4x</span>
              </div>
              <div className="flex justify-between items-center p-2 md:p-3 rounded-lg bg-accent/50">
                <span className="font-medium text-sm md:text-base">🐉 Dragon</span>
                <span className="text-chart-4 font-bold text-sm md:text-base">1.96x</span>
              </div>
              <div className="flex justify-between items-center p-2 md:p-3 rounded-lg bg-accent/50">
                <span className="font-medium text-sm md:text-base">⚡ Crit</span>
                <span className="text-chart-5 font-bold text-sm md:text-base">0.5x</span>
              </div>
              <div className="flex justify-between items-center p-2 md:p-3 rounded-lg bg-accent/50">
                <span className="font-medium text-sm md:text-base">❌ Miss</span>
                <span className="text-chart-5 font-bold text-sm md:text-base">0x</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <TrendingDown className="h-5 w-5 text-primary" />
                How to Play
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <li>• Each spin costs 50 credits</li>
                <li>• Land on Tiger or Dragon to win</li>
                <li>• Crit returns half your bet</li>
                <li>• Miss loses your bet</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
