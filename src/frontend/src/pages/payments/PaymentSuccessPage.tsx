import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  }, [queryClient]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <Card className="max-w-md border-chart-4/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-chart-4">
            <CheckCircle2 className="h-6 w-6" />
            Payment Successful
          </CardTitle>
          <CardDescription>
            Your credits have been added to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for your purchase! Your credits are now available and ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate({ to: '/wallet' })}
              className="flex-1 touch-friendly"
            >
              View Wallet
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
