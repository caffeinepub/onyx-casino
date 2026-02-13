import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BalanceTicker from '../components/wallet/BalanceTicker';
import { CreditCard, ArrowDownToLine, TrendingUp, TrendingDown } from 'lucide-react';

export default function WalletPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  const balance = profile?.credits ? Number(profile.credits) : 0;
  const transactions = profile?.transactions || [];
  const recentTransactions = transactions.slice(-5).reverse();

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your credits and transactions</p>
      </div>

      {/* Balance Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
          <CardDescription>Your available credits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <BalanceTicker balance={balance} />
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={() => navigate({ to: '/buy-credits' })}
              className="flex-1 hover-lift touch-friendly"
              size="lg"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Buy Credits
            </Button>
            <Button
              onClick={() => navigate({ to: '/withdraw' })}
              variant="outline"
              className="flex-1 hover-lift touch-friendly"
              size="lg"
            >
              <ArrowDownToLine className="mr-2 h-5 w-5" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => {
                const isDeposit = tx.transactionType === 'deposit';
                const isWithdrawal = tx.transactionType === 'withdrawal';
                const amount = Number(tx.amount);
                
                return (
                  <div
                    key={tx.id.toString()}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isDeposit ? (
                        <TrendingUp className="h-5 w-5 text-chart-4" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-chart-5" />
                      )}
                      <div>
                        <p className="font-medium capitalize">
                          {tx.transactionType === 'gameSpin' ? 'Game Spin' : tx.transactionType}
                        </p>
                        {tx.description && (
                          <p className="text-sm text-muted-foreground">{tx.description}</p>
                        )}
                      </div>
                    </div>
                    <span className={`font-bold ${isDeposit ? 'text-chart-4' : 'text-chart-5'}`}>
                      {isDeposit ? '+' : '-'}{amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <Button
            onClick={() => navigate({ to: '/transactions' })}
            variant="outline"
            className="w-full mt-4 hover-lift touch-friendly"
          >
            View All Transactions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
