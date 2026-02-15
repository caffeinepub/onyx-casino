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
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '../components/common/PageHeader';
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
    const inrAmount = parseInt(customAmount);
    if (isNaN(inrAmount) || inrAmount <= 0) {
      toast.error('Please enter a valid amount');
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

    const credits = computeCreditsFromINR(inrAmount, packages!);
    setCustomSelection({ inr: inrAmount, credits });
    setSelectedPackage(null);
    setShowQRDialog(true);
  };

  const handleConfirmPayment = async () => {
    try {
      const creditsToAdd = selectedPackage ? Number(selectedPackage.credits) : Number(customSelection!.credits);
      const requestId = await createRequest.mutateAsync(BigInt(creditsToAdd));
      toast.success('Payment request submitted!', {
        description: `Request ID: ${requestId}. Awaiting admin approval.`
      });
      setShowQRDialog(false);
      refetchRequests();
      navigate({ to: '/payment-success' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment request');
    }
  };

  const getStatusBadge = (status: ManualPaymentRequestStatus) => {
    if (status === ManualPaymentRequestStatus.pending) {
      return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
    if (status === ManualPaymentRequestStatus.approved) {
      return <Badge variant="default" className="gap-1 bg-chart-4 text-white"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
    }
    return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Declined</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <PageHeader
        title="Buy Credits"
        description="Choose a package or enter a custom amount"
        badge={
          <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/30">
            <Shield className="h-3 w-3" />
            Secure Payment
          </Badge>
        }
      />

      {/* Quick Offers */}
      <Card className="premium-card border-primary/20 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Zap className="h-5 w-5 text-primary" />
            Quick Offers
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Fast deposit options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_OFFERS.map((offer) => (
              <Button
                key={offer.amount}
                onClick={() => handleQuickOffer(offer.amount)}
                variant="outline"
                size="lg"
                className="hover-lift touch-friendly h-16 text-base font-bold"
                disabled={!paymentConfig || !packagesAvailable}
              >
                {offer.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Amount */}
      <Card className="premium-card border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Custom Amount</CardTitle>
          <CardDescription className="text-xs md:text-sm">Enter any amount in INR</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="custom-amount" className="sr-only">Amount in INR</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount (₹)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <Button
              onClick={handleCustomAmount}
              size="lg"
              className="hover-lift touch-friendly sm:w-auto"
              disabled={!paymentConfig || !packagesAvailable}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold">Credit Packages</h2>
        {packagesLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages?.map((pkg, index) => {
              const priceINR = Number(pkg.priceInrMultiplier);
              const credits = Number(pkg.credits);
              const isPopular = pkg.name === 'Premium';

              return (
                <Card
                  key={pkg.name}
                  className={`premium-card relative overflow-hidden hover-lift cursor-pointer transition-all animate-fade-in ${
                    isPopular ? 'border-primary shadow-premium-lg' : 'border-primary/20'
                  }`}
                  onClick={() => handleSelectPackage(pkg)}
                  style={{ animationDelay: `${150 + index * 50}ms` }}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                      <Sparkles className="h-3 w-3 inline mr-1" />
                      POPULAR
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription className="text-xs">Credit package</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">{credits.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Credits</p>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-2xl font-bold">{formatINR(priceINR)}</p>
                      <p className="text-xs text-muted-foreground">One-time payment</p>
                    </div>
                    <Button
                      className="w-full hover-lift touch-friendly"
                      variant={isPopular ? 'default' : 'outline'}
                      disabled={!paymentConfig}
                    >
                      Select Package
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Payment Requests */}
      {myRequests && myRequests.length > 0 && (
        <Card className="premium-card border-primary/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Recent Payment Requests</CardTitle>
            <CardDescription className="text-xs md:text-sm">Track your payment submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRequests.slice(-5).reverse().map((req) => (
                <div
                  key={req.id.toString()}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <div>
                    <p className="font-medium text-sm">Request #{req.id.toString()}</p>
                    <p className="text-xs text-muted-foreground">{Number(req.amount).toLocaleString()} credits</p>
                  </div>
                  {getStatusBadge(req.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Payment Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="premium-surface border-primary/30 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <QrCode className="h-5 w-5 text-primary" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              Scan the QR code and follow the instructions to complete your payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedPackage && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Package</p>
                <p className="text-2xl font-bold">{selectedPackage.name}</p>
                <p className="text-lg text-primary font-semibold">
                  {Number(selectedPackage.credits).toLocaleString()} Credits
                </p>
                <p className="text-xl font-bold">{formatINR(Number(selectedPackage.priceInrMultiplier))}</p>
              </div>
            )}

            {customSelection && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Custom Amount</p>
                <p className="text-lg text-primary font-semibold">
                  {Number(customSelection.credits).toLocaleString()} Credits
                </p>
                <p className="text-xl font-bold">{formatINR(customSelection.inr)}</p>
              </div>
            )}

            {paymentConfig && (
              <>
                <div className="flex justify-center">
                  <img
                    src={paymentConfig.qrImageReference}
                    alt="Payment QR Code"
                    className="w-64 h-64 object-contain rounded-lg border border-border"
                  />
                </div>

                <Alert className="bg-primary/5 border-primary/20">
                  <AlertDescription className="text-sm whitespace-pre-wrap">
                    {paymentConfig.instructions}
                  </AlertDescription>
                </Alert>
              </>
            )}

            <Button
              onClick={handleConfirmPayment}
              disabled={createRequest.isPending}
              className="w-full h-12 text-base font-bold hover-lift"
            >
              {createRequest.isPending ? (
                <>
                  <PremiumSpinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  I've Completed Payment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
