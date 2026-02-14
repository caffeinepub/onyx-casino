import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCompleteInitialProfileSetup } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Gift } from 'lucide-react';
import PremiumSpinner from '../common/PremiumSpinner';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const completeSetup = useCompleteInitialProfileSetup();
  const { identity } = useInternetIdentity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }

    let referrerPrincipal: Principal | undefined = undefined;
    if (referralCode.trim()) {
      try {
        referrerPrincipal = Principal.fromText(referralCode.trim());
        
        if (identity && referrerPrincipal.toString() === identity.getPrincipal().toString()) {
          toast.error('You cannot refer yourself');
          return;
        }
      } catch (error) {
        toast.error('Invalid referral code format');
        return;
      }
    }

    try {
      await completeSetup.mutateAsync({
        displayName: displayName.trim(),
        dateOfBirth,
        referrer: referrerPrincipal
      });
      toast.success('Profile created successfully! You received 100 welcome credits!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Welcome to ONYX Casino</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Complete your profile to get started
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-primary/20 bg-primary/5">
          <Gift className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs md:text-sm">
            <strong>Welcome Bonus:</strong> Get 100 free credits when you complete your profile!
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-xs md:text-sm">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={completeSetup.isPending}
              required
              className="text-sm md:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-xs md:text-sm">
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={completeSetup.isPending}
              required
              className="text-sm md:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-xs md:text-sm">
              Referral Code (Optional)
            </Label>
            <Input
              id="referralCode"
              placeholder="Enter referrer's principal ID"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              disabled={completeSetup.isPending}
              className="text-sm md:text-base"
            />
            <p className="text-xs text-muted-foreground">
              If someone referred you, they'll receive 200 bonus credits
            </p>
          </div>

          <Button
            type="submit"
            className="w-full touch-friendly"
            disabled={completeSetup.isPending}
            size="lg"
          >
            {completeSetup.isPending ? (
              <>
                <PremiumSpinner size="sm" className="mr-2" />
                Creating Profile...
              </>
            ) : (
              'Complete Setup & Claim Bonus'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
