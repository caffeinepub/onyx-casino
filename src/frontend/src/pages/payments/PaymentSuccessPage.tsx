import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useGetManualPaymentRequest, useGetMyManualPaymentRequests } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { ManualPaymentRequestStatus } from '../../backend';
import PremiumSpinner from '../../components/common/PremiumSpinner';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ strict: false }) as { requestId?: string };
  const requestId = search.requestId ? BigInt(search.requestId) : null;
  
  const { data: request, isLoading } = useGetManualPaymentRequest(requestId);
  const { refetch: refetchMyRequests } = useGetMyManualPaymentRequests();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    queryClient.invalidateQueries({ queryKey: ['myManualPaymentRequests'] });
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['manualPaymentRequest', requestId?.toString()] });
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    refetchMyRequests();
  };

  const getStatusIcon = (status: ManualPaymentRequestStatus) => {
    switch (status) {
      case ManualPaymentRequestStatus.pending:
        return <Clock className="h-8 w-8 text-yellow-500" />;
      case ManualPaymentRequestStatus.approved:
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case ManualPaymentRequestStatus.declined:
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusText = (status: ManualPaymentRequestStatus) => {
    switch (status) {
      case ManualPaymentRequestStatus.pending:
        return 'Payment Under Review';
      case ManualPaymentRequestStatus.approved:
        return 'Payment Approved';
      case ManualPaymentRequestStatus.declined:
        return 'Payment Declined';
    }
  };

  const getStatusDescription = (status: ManualPaymentRequestStatus) => {
    switch (status) {
      case ManualPaymentRequestStatus.pending:
        return 'Your payment request has been submitted and is awaiting admin verification. Credits will be added to your account once approved.';
      case ManualPaymentRequestStatus.approved:
        return 'Your payment has been verified and approved. Credits have been added to your account.';
      case ManualPaymentRequestStatus.declined:
        return 'Your payment request was declined. Please contact support for more information.';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <PremiumSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading request status...</p>
        </div>
      </div>
    );
  }

  const status = request?.status || ManualPaymentRequestStatus.pending;
  const isApproved = status === ManualPaymentRequestStatus.approved;
  const isPending = status === ManualPaymentRequestStatus.pending;

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <Card className={`max-w-md ${isApproved ? 'border-green-500/20' : 'border-yellow-500/20'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
            {getStatusIcon(status)}
            {getStatusText(status)}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {getStatusDescription(status)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {request && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Request ID:</span>
                <span className="font-mono text-sm">{request.id.toString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Credits Requested:</span>
                <span className="font-medium">{Number(request.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="outline" className={
                  status === ManualPaymentRequestStatus.approved ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  status === ManualPaymentRequestStatus.declined ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }>
                  {status === ManualPaymentRequestStatus.pending ? 'Pending' : 
                   status === ManualPaymentRequestStatus.approved ? 'Approved' : 'Declined'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Submitted:</span>
                <span className="text-sm">{new Date(Number(request.timestamp) / 1000000).toLocaleString()}</span>
              </div>
            </div>
          )}
          
          {isPending && (
            <div className="text-sm text-muted-foreground p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="font-medium text-yellow-600 dark:text-yellow-500 mb-1">What happens next?</p>
              <ul className="space-y-1 text-xs">
                <li>• Admin will verify your payment within 24 hours</li>
                <li>• You'll see your credits update once approved</li>
                <li>• Check back here or refresh to see status updates</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {isPending && (
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex-1 touch-friendly"
              >
                Refresh Status
              </Button>
            )}
            <Button
              onClick={() => navigate({ to: isApproved ? '/wallet' : '/buy-credits' })}
              className="flex-1 touch-friendly"
            >
              {isApproved ? 'View Wallet' : 'Back to Buy Credits'}
            </Button>
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              className="flex-1 touch-friendly"
            >
              Start Playing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
