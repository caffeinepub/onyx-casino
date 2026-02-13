import { useGetLeaderboard } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy } from 'lucide-react';

export default function AdminUsersPage() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">View all users ranked by balance</p>
      </div>

      <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Leaderboard
          </CardTitle>
          <CardDescription>Users ranked by credit balance</CardDescription>
        </CardHeader>
        <CardContent>
          {!leaderboard || leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No users yet</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map(([principal, credits], index) => (
                <div
                  key={principal.toString()}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {index < 3 ? (
                        <Trophy className={`h-6 w-6 ${
                          index === 0 ? 'text-primary' : 
                          index === 1 ? 'text-chart-2' : 
                          'text-chart-5'
                        }`} />
                      ) : (
                        <Badge variant="outline">#{index + 1}</Badge>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-mono truncate">
                        {principal.toString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {Number(credits).toLocaleString()}
                    </span>
                    <p className="text-xs text-muted-foreground">Credits</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
