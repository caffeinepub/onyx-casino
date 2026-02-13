import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <Card className="max-w-md border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-6 w-6" />
            Payment Cancelled
          </CardTitle>
          <CardDescription>
            Your payment was not completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            No charges were made to your account. You can try again or return to the game.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate({ to: '/buy-credits' })}
              className="flex-1 touch-friendly"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              className="flex-1 touch-friendly"
            >
              Return to Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
