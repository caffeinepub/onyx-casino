import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCreditPackages, useGetManualPaymentConfig, useCreateManualPaymentRequest, useGetMyManualPaymentRequests } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, CreditCard, AlertCircle, CheckCircle2, Clock, XCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '../components/common/PageHeader';
import { ManualPaymentRequestStatus } from '../backend';

export default function BuyCreditsPage() {
  const navigate = useNavigate();
  const { data: packages, isLoading: packagesLoading } = useGetCreditPackages();
  const { data: paymentConfig, isLoading: configLoading } = useGetManualPaymentConfig();
  const { data: myRequests } = useGetMyManualPaymentRequests();
  const createRequest = useCreateManualPaymentRequest();
  const [customAmount, setCustomAmount] = useState('');
  const [showQRDialog, setShowQRDialog] = useState(false);

  const handleQuickBuy = async (credits: number) => {
    if (!paymentConfig) {
      toast.error('Payment system not configured. Please contact support.');
      return;
    }

    try {
      const requestId = await createRequest.mutateAsync(BigInt(credits));
      toast.success('Payment request created! Please complete the payment.', {
        description: `Request ID: ${requestId.toString()}`
      });
      setShowQRDialog(true);
      navigate({ to: '/payment-success', search: { requestId: requestId.toString() } });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment request');
    }
  };

  const handleCustomBuy = async () => {
    const creditsToAdd = parseInt(customAmount);
    if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!paymentConfig) {
      toast.error('Payment system not configured. Please contact support.');
      return;
    }

    try {
      const requestId = await createRequest.mutateAsync(BigInt(creditsToAdd));
      toast.success('Payment request created! Please complete the payment.', {
        description: `Request ID: ${requestId.toString()}`
      });
      setCustomAmount('');
      setShowQRDialog(true);
      navigate({ to: '/payment-success', search: { requestId: requestId.toString() } });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment request');
    }
  };

  const getStatusIcon = (status: ManualPaymentRequestStatus) => {
    if (status === ManualPaymentRequestStatus.pending) return <Clock className="h-4 w-4 text-warning" />;
    if (status === ManualPaymentRequestStatus.approved) return <CheckCircle2 className="h-4 w-4 text-success" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadge = (status: ManualPaymentRequestStatus) => {
    if (status === ManualPaymentRequestStatus.pending) return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
    if (status === ManualPaymentRequestStatus.approved) return <Badge variant="outline" className="border-success text-success">Approved</Badge>;
    return <Badge variant="destructive">Declined</Badge>;
  };

  const resolveQRImageUrl = (qrImageReference: string): string => {
    // If it's already a data URL, return as-is
    if (qrImageReference.startsWith('data:')) {
      return qrImageReference;
    }
    // Otherwise, treat it as a public asset path
    return `/assets/generated/${qrImageReference}`;
  };

  if (packagesLoading || configLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-32 w-full" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!paymentConfig) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <PageHeader
          title="Buy Credits"
          description="Add credits to your account"
        />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Payment system is not configured yet. Please contact the administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      <PageHeader
        title="Buy Credits"
        description="Choose a package or enter a custom amount"
      />

      {/* Quick Buy Packages */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Quick Buy Packages
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages?.map((pkg) => {
            const credits = Number(pkg.credits);
            const priceInr = Number(pkg.priceInrMultiplier);
            return (
              <Card key={pkg.name} className="premium-card hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-primary">{credits.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground"> credits</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-xl font-bold">₹{priceInr.toLocaleString()}</p>
                  </div>
                  <Button
                    onClick={() => handleQuickBuy(credits)}
                    disabled={createRequest.isPending}
                    className="w-full"
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Amount */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle>Custom Amount</CardTitle>
          <CardDescription>Enter any amount of credits you want to purchase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customAmount">Credits Amount</Label>
            <Input
              id="customAmount"
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              disabled={createRequest.isPending}
            />
          </div>
          <Button
            onClick={handleCustomBuy}
            disabled={createRequest.isPending || !customAmount}
            className="w-full"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Create Payment Request
          </Button>
        </CardContent>
      </Card>

      {/* Recent Payment Requests */}
      {myRequests && myRequests.length > 0 && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle>Recent Payment Requests</CardTitle>
            <CardDescription>Track your payment request status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRequests.slice(0, 5).map((request) => (
                <div
                  key={Number(request.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-semibold">{Number(request.amount).toLocaleString()} credits</p>
                      <p className="text-xs text-muted-foreground">
                        Request #{request.id.toString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md premium-surface">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              Scan the QR code below to complete your payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {paymentConfig.qrImageReference && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img
                  src={resolveQRImageUrl(paymentConfig.qrImageReference)}
                  alt="Payment QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
            )}
            <Alert>
              <AlertDescription className="text-sm whitespace-pre-wrap">
                {paymentConfig.instructions}
              </AlertDescription>
            </Alert>
            <Button onClick={() => setShowQRDialog(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
