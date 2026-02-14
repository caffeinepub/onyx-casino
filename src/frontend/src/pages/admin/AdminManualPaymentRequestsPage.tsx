import { useState } from 'react';
import { useGetAllManualPaymentRequests, useApproveManualPayment, useDeclineManualPayment, useGetManualPaymentConfig, useSetManualPaymentConfig } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle2, XCircle, Settings, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ManualPaymentRequestStatus } from '../../backend';

export default function AdminManualPaymentRequestsPage() {
  const { data: requests, isLoading, refetch } = useGetAllManualPaymentRequests();
  const { data: config, isLoading: configLoading } = useGetManualPaymentConfig();
  const approvePayment = useApproveManualPayment();
  const declinePayment = useDeclineManualPayment();
  const updateConfig = useSetManualPaymentConfig();

  const [qrImageReference, setQrImageReference] = useState('');
  const [instructions, setInstructions] = useState('');
  const [configInitialized, setConfigInitialized] = useState(false);

  // Initialize form when config loads
  if (config && !configInitialized) {
    setQrImageReference(config.qrImageReference);
    setInstructions(config.instructions);
    setConfigInitialized(true);
  }

  const handleApprove = async (requestId: bigint) => {
    try {
      await approvePayment.mutateAsync(requestId);
      toast.success('Payment request approved successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve payment');
    }
  };

  const handleDecline = async (requestId: bigint) => {
    try {
      await declinePayment.mutateAsync(requestId);
      toast.success('Payment request declined');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline payment');
    }
  };

  const handleSaveConfig = async () => {
    if (!qrImageReference.trim() || !instructions.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await updateConfig.mutateAsync({
        qrImageReference: qrImageReference.trim(),
        instructions: instructions.trim()
      });
      toast.success('Payment configuration updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update configuration');
    }
  };

  const pendingRequests = requests?.filter(r => r.status === ManualPaymentRequestStatus.pending) || [];
  const approvedRequests = requests?.filter(r => r.status === ManualPaymentRequestStatus.approved) || [];
  const declinedRequests = requests?.filter(r => r.status === ManualPaymentRequestStatus.declined) || [];

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

  const renderRequestCard = (request: any, showActions: boolean = false) => (
    <Card key={request.id.toString()} className="border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(request.status)}
              Request #{request.id.toString()}
            </CardTitle>
            <CardDescription className="mt-1">
              User: {request.user.toString().slice(0, 20)}...
            </CardDescription>
          </div>
          <Badge variant="outline" className={
            request.status === ManualPaymentRequestStatus.approved ? 'bg-green-500/10 text-green-500 border-green-500/20' :
            request.status === ManualPaymentRequestStatus.declined ? 'bg-red-500/10 text-red-500 border-red-500/20' :
            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
          }>
            {request.status === ManualPaymentRequestStatus.pending ? 'Pending' : 
             request.status === ManualPaymentRequestStatus.approved ? 'Approved' : 'Declined'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Credits</p>
            <p className="font-medium">{Number(request.amount).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium">{new Date(Number(request.timestamp) / 1000000).toLocaleDateString()}</p>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleApprove(request.id)}
              disabled={approvePayment.isPending || declinePayment.isPending}
              className="flex-1"
              size="sm"
            >
              {approvePayment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
            <Button
              onClick={() => handleDecline(request.id)}
              disabled={approvePayment.isPending || declinePayment.isPending}
              variant="destructive"
              className="flex-1"
              size="sm"
            >
              {declinePayment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading || configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Manual Payment Requests</h1>
        <p className="text-muted-foreground">Review and manage user payment requests</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="declined">
            Declined ({declinedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending payment requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {pendingRequests.map(request => renderRequestCard(request, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No approved payment requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {approvedRequests.slice().reverse().map(request => renderRequestCard(request, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="declined" className="space-y-4">
          {declinedRequests.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No declined payment requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {declinedRequests.slice().reverse().map(request => renderRequestCard(request, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Payment Configuration
              </CardTitle>
              <CardDescription>
                Configure QR code and payment instructions for users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!config && (
                <Alert className="border-yellow-500/50">
                  <AlertDescription>
                    Payment configuration is not set. Users cannot make payment requests until you configure the system.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="qrImageReference">QR Code Image Filename</Label>
                <Input
                  id="qrImageReference"
                  placeholder="manual-payment-qr.dim_1024x1024.png"
                  value={qrImageReference}
                  onChange={(e) => setQrImageReference(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Filename of the QR code image in /assets/generated/ directory
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Payment Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="1. Scan the QR code with your UPI app&#10;2. Enter the amount shown&#10;3. Complete the payment&#10;4. Click Submit Request below"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Instructions shown to users when making a payment
                </p>
              </div>

              <Button
                onClick={handleSaveConfig}
                disabled={updateConfig.isPending}
                className="w-full"
              >
                {updateConfig.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
