import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PageHeader from '../components/common/PageHeader';
import { AlertCircle } from 'lucide-react';

export default function WithdrawPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <PageHeader
        title="Withdraw Funds"
        description="Request a withdrawal from your account"
      />

      <Card className="premium-card border-primary/20 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Withdrawal Information</CardTitle>
          <CardDescription className="text-xs md:text-sm">Important details about withdrawals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Withdrawal functionality is currently under development. Please check back soon.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex justify-between py-2 border-b border-border">
              <span>Minimum Withdrawal:</span>
              <span className="font-medium text-foreground">1,000 credits</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span>Processing Time:</span>
              <span className="font-medium text-foreground">1-3 business days</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span>Conversion Rate:</span>
              <span className="font-medium text-foreground">1 credit = ₹0.25</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
