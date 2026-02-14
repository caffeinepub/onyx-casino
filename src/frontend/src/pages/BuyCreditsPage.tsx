import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetCreditPackages, useGetManualPaymentConfig, useCreateManualPaymentRequest, useGetMyManualPaymentRequests } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Shield, Gift, QrCode, Clock, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '../utils/currency';
import { computeCreditsFromINR, arePackagesAvailable } from '../utils/creditPricing';
import { ManualPaymentRequestStatus } from '../backend';
import PremiumSpinner from '../components/common/PremiumSpinner';

const QUICK_OFFERS = [
  { label: '₹100', amount: 100 },
  { label: '₹200', amount: 200 },
  { label: '₹1000', amount: 1000 },
];

export default function BuyCreditsPage() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();
  const { data: packages, isLoading: packagesLoading } = useGetCreditPackages();
  const { data: paymentConfig, isLoading: configLoading } = useGetManualPaymentConfig();
  const { data: myRequests, refetch: refetchRequests } = useGetMyManualPaymentRequests();
  const createRequest = useCreateManualPaymentRequest();
  
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; credits: bigint; priceInrMultiplier: bigint } | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [customSelection, setCustomSelection] = useState<{ inr: number; credits: bigint } | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  const packagesAvailable = arePackagesAvailable(packages);

  const handleSelectPackage = (pkg: { name: string; credits: bigint; priceInrMultiplier: bigint }) => {
    if (!paymentConfig) {
      toast.error('Payment system is temporarily unavailable. Please try again later.');
      return;
    }
    setSelectedPackage(pkg);
    setCustomSelection(null);
    setShowQRDialog(true);
  };

  const handleQuickOffer = (inrAmount: number) => {
    if (!paymentConfig) {
      toast.error('Payment system is temporarily unavailable. Please try again later.');
      return;
    }
    if (!packagesAvailable) {
      toast.error('Unable to calculate credits. Please try again later.');
      return;
    }

    const credits = computeCreditsFromINR(inrAmount, packages!);
    setCustomSelection({ inr: inrAmount, credits });
    setSelectedPackage(null);
    setShowQRDialog(true);
  };

  const handleCustomAmount = () => {
    const amount = parseFloat(customAmount);
    
    if (!customAmount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (!paymentConfig) {
      toast.error('Payment system is temporarily unavailable. Please try again later.');
      return;
    }

    if (!packagesAvailable) {
      toast.error('Unable to calculate credits. Please try again later.');
      return;
    }

    const credits = computeCreditsFromINR(amount, packages!);
    if (credits === BigInt(0)) {
      toast.error('Amount too small. Please enter a larger amount.');
      return;
    }

    setCustomSelection({ inr: amount, credits });
    setSelectedPackage(null);
    setShowQRDialog(true);
  };

  const handleSubmitPayment = async () => {
    const creditsToRequest = selectedPackage ? selectedPackage.credits : customSelection?.credits;
    
    if (!creditsToRequest) return;

    try {
      const requestId = await createRequest.mutateAsync(creditsToRequest);
      toast.success('Payment request submitted! Awaiting admin approval.');
      setShowQRDialog(false);
      setSelectedPackage(null);
      setCustomSelection(null);
      setCustomAmount('');
      await refetchRequests();
      navigate({ to: '/payment-success', search: { requestId: requestId.toString() } });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payment request');
    }
  };

  const getStatusIcon = (status: ManualPaymentRequestStatus) => {
    switch (status) {
      case ManualPaymentRequestStatus.pending:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case ManualPaymentRequestStatus.approved:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case ManualPaymentRequestStatus.declined:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: ManualPaymentRequestStatus) => {
    switch (status) {
      case ManualPaymentRequestStatus.pending:
        return 'Pending';
      case ManualPaymentRequestStatus.approved:
        return 'Approved';
      case ManualPaymentRequestStatus.declined:
        return 'Declined';
    }
  };

  const getStatusColor = (status: ManualPaymentRequestStatus) => {
    switch (status) {
      case ManualPaymentRequestStatus.pending:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case ManualPaymentRequestStatus.approved:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case ManualPaymentRequestStatus.declined:
        return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  if (packagesLoading || configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <PremiumSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Buy Credits</h1>
        <p className="text-sm md:text-base text-muted-foreground">Choose a package to add credits to your account</p>
      </div>

      {!paymentConfig && (
        <Alert className="border-destructive/50 animate-fade-in">
          <AlertDescription>
            Payment system is temporarily unavailable. Please check back later or contact support.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Offers Section */}
      <Card className="border-primary/30 animate-fade-in premium-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Zap className="h-5 w-5 text-primary" />
            Quick Offers
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Fast and easy credit top-ups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {QUICK_OFFERS.map((offer, index) => (
              <Button
                key={offer.amount}
                onClick={() => handleQuickOffer(offer.amount)}
                disabled={!paymentConfig || !packagesAvailable}
                variant="outline"
                size="lg"
                className="quick-offer-btn hover-lift touch-friendly h-auto py-4 flex flex-col gap-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xl md:text-2xl font-bold">{offer.label}</span>
                {packagesAvailable && (
                  <span className="text-xs text-muted-foreground">
                    ~{Number(computeCreditsFromINR(offer.amount, packages!)).toLocaleString()} credits
                  </span>
                )}
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t border-border/50">
            <Label htmlFor="custom-amount" className="text-sm font-medium mb-2 block">
              Custom Amount (INR)
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                disabled={!paymentConfig || !packagesAvailable}
                min="1"
                step="1"
                className="flex-1"
              />
              <Button
                onClick={handleCustomAmount}
                disabled={!paymentConfig || !packagesAvailable || !customAmount}
                className="hover-lift touch-friendly"
                size="lg"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Buy
              </Button>
            </div>
            {!packagesAvailable && (
              <p className="text-xs text-destructive mt-2">
                Unable to calculate credits. Please try again later.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Package Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Credit Packages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {packages?.map((pkg, index) => {
            const priceInr = Number(pkg.priceInrMultiplier);
            const credits = Number(pkg.credits);
            
            return (
              <Card 
                key={pkg.name} 
                className="border-primary/20 hover:border-primary/40 transition-all hover-lift animate-fade-in premium-surface"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                    {pkg.name}
                    {pkg.name === 'Premium' && <Sparkles className="h-5 w-5 text-primary" />}
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {pkg.name === 'Basic' && 'Perfect for starters'}
                    {pkg.name === 'Premium' && 'Best value package'}
                    {pkg.name === 'Special' && 'Limited time offer'}
                    {pkg.name === 'High Roller' && 'For serious players'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl md:text-4xl font-bold text-primary">{credits.toLocaleString()}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Credits</p>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xl md:text-2xl font-bold">{formatINR(priceInr)}</p>
                  </div>
                  <Button
                    onClick={() => handleSelectPackage(pkg)}
                    className="w-full hover-lift touch-friendly"
                    disabled={!paymentConfig}
                    size="lg"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Secure Payment
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Your transactions are safe and secure</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All payments are processed securely. After payment, your credits will be added to your account once verified by our admin team.
          </p>
        </CardContent>
      </Card>

      {myRequests && myRequests.length > 0 && (
        <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Gift className="h-5 w-5 text-primary" />
              Your Payment Requests
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Track your payment submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div
                  key={request.id.toString()}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg bg-accent/50 gap-3"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium text-sm md:text-base">{Number(request.amount).toLocaleString()} Credits</p>
                      <p className="text-xs text-muted-foreground">
                        Request #{request.id.toString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(request.status)} shrink-0 text-xs`}>
                    {getStatusText(request.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Complete Payment</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Scan the QR code to complete your payment
            </DialogDescription>
          </DialogHeader>
          {paymentConfig && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={`/assets/${paymentConfig.qrImageReference}`}
                  alt="Payment QR Code"
                  className="w-full max-w-xs mx-auto"
                />
              </div>
              <div className="space-y-2 text-sm">
                {selectedPackage ? (
                  <>
                    <p className="font-semibold">Package: {selectedPackage.name}</p>
                    <p className="font-semibold">Credits: {Number(selectedPackage.credits).toLocaleString()}</p>
                    <p className="font-semibold text-lg text-primary">
                      Amount: {formatINR(Number(selectedPackage.priceInrMultiplier))}
                    </p>
                  </>
                ) : customSelection ? (
                  <>
                    <p className="font-semibold">Custom Amount</p>
                    <p className="font-semibold">Credits: {Number(customSelection.credits).toLocaleString()}</p>
                    <p className="font-semibold text-lg text-primary">
                      Amount: {formatINR(customSelection.inr)}
                    </p>
                  </>
                ) : null}
              </div>
              <Alert>
                <AlertDescription className="text-xs md:text-sm whitespace-pre-wrap">
                  {paymentConfig.instructions}
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleSubmitPayment}
                className="w-full hover-lift touch-friendly"
                disabled={createRequest.isPending}
                size="lg"
              >
                {createRequest.isPending ? (
                  <>
                    <PremiumSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'I Have Completed Payment'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
