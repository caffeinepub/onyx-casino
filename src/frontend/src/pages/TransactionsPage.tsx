import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Gamepad2 } from 'lucide-react';
import PremiumSpinner from '../components/common/PremiumSpinner';

export default function TransactionsPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <PremiumSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  const transactions = profile?.transactions || [];
  const reversedTransactions = [...transactions].reverse();

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-sm md:text-base text-muted-foreground">View all your account activity</p>
      </div>

      <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">All Transactions</CardTitle>
          <CardDescription className="text-xs md:text-sm">Complete history of your account</CardDescription>
        </CardHeader>
        <CardContent>
          {reversedTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm md:text-base">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {reversedTransactions.map((tx) => {
                const isDeposit = tx.transactionType === 'deposit';
                const isWithdrawal = tx.transactionType === 'withdrawal';
                const isGameSpin = tx.transactionType === 'gameSpin';
                const amount = Number(tx.amount);
                
                return (
                  <div
                    key={tx.id.toString()}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {isDeposit && <TrendingUp className="h-5 w-6 md:h-6 md:w-6 text-chart-4" />}
                        {isWithdrawal && <TrendingDown className="h-5 w-6 md:h-6 md:w-6 text-chart-5" />}
                        {isGameSpin && <Gamepad2 className="h-5 w-6 md:h-6 md:w-6 text-primary" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm md:text-base">
                            {isGameSpin ? 'Game Spin' : isDeposit ? 'Deposit' : 'Withdrawal'}
                          </p>
                          <Badge variant={isDeposit ? 'default' : 'secondary'} className="text-xs">
                            #{tx.id.toString()}
                          </Badge>
                        </div>
                        {tx.description && (
                          <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate">{tx.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-base md:text-lg font-bold ${isDeposit ? 'text-chart-4' : 'text-chart-5'}`}>
                        {isDeposit ? '+' : '-'}{amount}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">Credits</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
