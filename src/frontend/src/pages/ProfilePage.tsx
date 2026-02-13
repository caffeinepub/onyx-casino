import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Coins, Receipt } from 'lucide-react';

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const principalId = identity?.getPrincipal().toString() || '';
  const balance = profile?.credits ? Number(profile.credits) : 0;
  const transactionCount = profile?.transactions?.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Your account information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Principal ID
            </CardTitle>
            <CardDescription>Your unique identifier</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono break-all bg-accent/50 p-3 rounded-lg">
              {principalId}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Current Balance
            </CardTitle>
            <CardDescription>Available credits</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{balance.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Credits</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Total Transactions
            </CardTitle>
            <CardDescription>All-time activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{transactionCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Transactions</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Authentication status</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className="bg-chart-4 text-chart-4-foreground">
              Internet Identity Verified
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Your account is secured with Internet Identity
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
