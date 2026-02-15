import { useState, useRef } from 'react';
import { useGetAllManualPaymentRequests, useApproveManualPayment, useDeclineManualPayment, useGetManualPaymentConfig, useSetManualPaymentConfig } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle2, XCircle, Settings, Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when config loads
  if (config && !configInitialized) {
    setQrImageReference(config.qrImageReference);
    setInstructions(config.instructions);
    setQrPreview(config.qrImageReference);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setQrImageReference(dataUrl);
      setQrPreview(dataUrl);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
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
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{new Date(Number(request.timestamp) / 1000000).toLocaleDateString()}</p>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleApprove(request.id)}
              disabled={approvePayment.isPending}
              className="flex-1"
              variant="default"
            >
              {approvePayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span className="ml-2">Approve</span>
            </Button>
            <Button
              onClick={() => handleDecline(request.id)}
              disabled={declinePayment.isPending}
              className="flex-1"
              variant="destructive"
            >
              {declinePayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              <span className="ml-2">Decline</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Manual Payment Requests</h1>
        <p className="text-muted-foreground">Manage user payment submissions and configure QR payment settings</p>
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
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <Alert>
              <AlertDescription>No pending payment requests</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map(req => renderRequestCard(req, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : approvedRequests.length === 0 ? (
            <Alert>
              <AlertDescription>No approved payment requests</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {approvedRequests.map(req => renderRequestCard(req, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="declined" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : declinedRequests.length === 0 ? (
            <Alert>
              <AlertDescription>No declined payment requests</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {declinedRequests.map(req => renderRequestCard(req, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Payment Configuration
              </CardTitle>
              <CardDescription>
                Configure the QR code and instructions shown to users during payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {configLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="qr-image">QR Code Image</Label>
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="qr-file-input"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose QR Image from Device
                      </Button>
                      {qrPreview && (
                        <div className="border border-border rounded-lg p-4 bg-muted/20">
                          <div className="flex items-center gap-3 mb-3">
                            <ImageIcon className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">QR Code Preview</span>
                          </div>
                          <div className="flex justify-center">
                            <img
                              src={qrPreview}
                              alt="QR Code Preview"
                              className="max-w-xs w-full h-auto object-contain rounded border border-border"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a QR code image from your device (max 5MB). This will be shown to users during payment.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="instructions">Payment Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Enter payment instructions for users..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Instructions will be displayed below the QR code
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveConfig}
                    disabled={updateConfig.isPending || !qrImageReference.trim() || !instructions.trim()}
                    className="w-full"
                  >
                    {updateConfig.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
