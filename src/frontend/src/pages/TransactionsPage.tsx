import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '../components/common/PageHeader';
import { TrendingUp, TrendingDown, Gamepad2 } from 'lucide-react';

export default function TransactionsPage() {
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();

  const transactions = profile?.transactions || [];
  const reversedTransactions = [...transactions].reverse();

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <PageHeader
        title="Transaction History"
        description="View all your account activity"
      />

      <Card className="premium-card border-primary/20 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">All Transactions</CardTitle>
          <CardDescription className="text-xs md:text-sm">Complete history of your account</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !isFetched ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : reversedTransactions.length === 0 ? (
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
                      <div className="shrink-0">
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
