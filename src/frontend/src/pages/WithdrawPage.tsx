import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function WithdrawPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdraw</h1>
        <p className="text-muted-foreground">Request a withdrawal from your account</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Withdrawal functionality is currently being implemented. Please contact support for withdrawal requests.
        </AlertDescription>
      </Alert>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Withdrawal Information</CardTitle>
          <CardDescription>How withdrawals work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              • Withdrawals are processed manually by our admin team
            </p>
            <p className="text-muted-foreground">
              • Processing time: 1-3 business days
            </p>
            <p className="text-muted-foreground">
              • Minimum withdrawal: 1000 credits
            </p>
            <p className="text-muted-foreground">
              • Credits are converted at the same rate as purchases (2 credits = $1)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
