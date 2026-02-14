import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, Coins, Receipt, Copy, Calendar, Gift } from 'lucide-react';
import { toast } from 'sonner';
import PremiumSpinner from '../components/common/PremiumSpinner';

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <PremiumSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const principalId = identity?.getPrincipal().toString() || '';
  const displayName = profile?.displayName || 'Unnamed User';
  const dateOfBirth = profile?.dateOfBirth || 'Not set';
  const balance = profile?.credits ? Number(profile.credits) : 0;
  const transactionCount = profile?.transactions?.length || 0;
  const bonusGranted = profile?.bonusGranted || false;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Profile</h1>
        <p className="text-sm md:text-base text-muted-foreground">Your account information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-primary/20 animate-fade-in md:col-span-2 premium-surface" style={{ animationDelay: '50ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <User className="h-5 w-6 md:h-6 md:w-6 text-primary" />
              {displayName}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Your public display name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs md:text-sm">
                Active Player
              </Badge>
              {bonusGranted && (
                <Badge variant="outline" className="text-xs md:text-sm bg-primary/10 text-primary border-primary/20">
                  <Gift className="h-3 w-3 mr-1" />
                  Welcome Bonus Received
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Calendar className="h-4 w-5 md:h-5 md:w-5 text-primary" />
              Date of Birth
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Your registered date of birth</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base md:text-lg font-medium">{dateOfBirth}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Coins className="h-4 w-5 md:h-5 md:w-5 text-primary" />
              Current Balance
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Available credits</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-primary">{balance.toLocaleString()}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Credits</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 animate-fade-in md:col-span-2" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Receipt className="h-4 w-5 md:h-5 md:w-5 text-primary" />
              Transaction History
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Total transactions made</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl md:text-2xl font-bold">{transactionCount}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Total transactions</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 animate-fade-in md:col-span-2" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Shield className="h-4 w-5 md:h-5 md:w-5 text-primary" />
              Principal ID
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Your unique identifier for referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <code className="flex-1 px-3 py-2 bg-muted rounded text-xs md:text-sm break-all font-mono w-full">
                {principalId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(principalId, 'Principal ID')}
                className="hover-lift shrink-0 w-full sm:w-auto touch-friendly"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this ID with friends to earn referral bonuses
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
