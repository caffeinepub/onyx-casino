import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowDownToLine, Info } from 'lucide-react';

export default function AdminWithdrawalsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Withdrawal Management</h1>
        <p className="text-muted-foreground">Process user withdrawal requests</p>
      </div>

      <Alert className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Withdrawal processing functionality is pending implementation. This feature will allow admins to review and approve withdrawal requests.
        </AlertDescription>
      </Alert>

      <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-primary" />
            Pending Withdrawals
          </CardTitle>
          <CardDescription>User withdrawal requests awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-12">
            No withdrawal requests at this time
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
