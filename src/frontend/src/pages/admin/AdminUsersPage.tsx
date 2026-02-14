import { useState } from 'react';
import { useGetLeaderboard, useAdminUpdateCredits } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Trophy, Copy, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import PremiumSpinner from '../../components/common/PremiumSpinner';

export default function AdminUsersPage() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  const updateCredits = useAdminUpdateCredits();
  const [editingUser, setEditingUser] = useState<{ principal: Principal; currentBalance: number } | null>(null);
  const [newBalance, setNewBalance] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Principal ID copied to clipboard');
  };

  const handleEditCredits = (principal: Principal, currentBalance: number) => {
    setEditingUser({ principal, currentBalance });
    setNewBalance(currentBalance.toString());
  };

  const handleUpdateCredits = async () => {
    if (!editingUser) return;

    const balance = parseInt(newBalance);
    if (isNaN(balance) || balance < 0) {
      toast.error('Please enter a valid balance');
      return;
    }

    try {
      await updateCredits.mutateAsync({
        user: editingUser.principal,
        newBalance: BigInt(balance)
      });
      toast.success('Credits updated successfully');
      setEditingUser(null);
      setNewBalance('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update credits');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <PremiumSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">User Management</h1>
        <p className="text-sm md:text-base text-muted-foreground">View and manage all users</p>
      </div>

      <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Users className="h-5 w-5 text-primary" />
            All Users
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Leaderboard sorted by balance</CardDescription>
        </CardHeader>
        <CardContent>
          {!leaderboard || leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm md:text-base">No users yet</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map(([principal, balance], index) => {
                const principalText = principal.toString();
                const balanceNum = Number(balance);
                
                return (
                  <div
                    key={principalText}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {index < 3 && (
                        <Trophy className={`h-5 w-5 shrink-0 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-amber-700'
                        }`} />
                      )}
                      {index >= 3 && (
                        <Badge variant="outline" className="shrink-0 text-xs">
                          #{index + 1}
                        </Badge>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{principalText}</p>
                        <p className="text-xs text-muted-foreground">Principal ID</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div className="text-right">
                        <p className="text-lg md:text-xl font-bold text-primary">{balanceNum.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Credits</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCredits(principal, balanceNum)}
                        className="hover-lift shrink-0"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(principalText)}
                        className="hover-lift shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Credits</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Update the credit balance for this user
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Principal ID</Label>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {editingUser.principal.toString()}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Current Balance</Label>
                <p className="text-lg font-bold text-primary">
                  {editingUser.currentBalance.toLocaleString()} Credits
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newBalance" className="text-xs md:text-sm">New Balance</Label>
                <Input
                  id="newBalance"
                  type="number"
                  min="0"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="Enter new balance"
                  disabled={updateCredits.isPending}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
              disabled={updateCredits.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCredits}
              disabled={updateCredits.isPending}
              className="w-full sm:w-auto"
            >
              {updateCredits.isPending ? (
                <>
                  <PremiumSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Credits'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
