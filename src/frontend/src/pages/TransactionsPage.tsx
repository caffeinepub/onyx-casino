import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Gamepad2 } from 'lucide-react';

export default function TransactionsPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
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
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">View all your account activity</p>
      </div>

      <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Complete history of your account</CardDescription>
        </CardHeader>
        <CardContent>
          {reversedTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No transactions yet</p>
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
                    className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {isDeposit && <TrendingUp className="h-6 w-6 text-chart-4" />}
                        {isWithdrawal && <TrendingDown className="h-6 w-6 text-chart-5" />}
                        {isGameSpin && <Gamepad2 className="h-6 w-6 text-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {isGameSpin ? 'Game Spin' : isDeposit ? 'Deposit' : 'Withdrawal'}
                          </p>
                          <Badge variant={isDeposit ? 'default' : 'secondary'} className="text-xs">
                            #{tx.id.toString()}
                          </Badge>
                        </div>
                        {tx.description && (
                          <p className="text-sm text-muted-foreground mt-1">{tx.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${isDeposit ? 'text-chart-4' : 'text-chart-5'}`}>
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
