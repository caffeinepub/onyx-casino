import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '../../components/common/PageHeader';
import { Users, Settings, ArrowDownToLine, QrCode } from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Manage casino settings and users"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card 
          className="premium-card border-primary/20 hover:border-primary/50 transition-all cursor-pointer hover-lift animate-fade-in" 
          onClick={() => navigate({ to: '/admin/users' })}
          style={{ animationDelay: '50ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Users
            </CardTitle>
            <CardDescription>Manage user accounts and balances</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full touch-friendly">
              View Users
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="premium-card border-primary/20 hover:border-primary/50 transition-all cursor-pointer hover-lift animate-fade-in" 
          onClick={() => navigate({ to: '/admin/wheel-config' })}
          style={{ animationDelay: '100ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Wheel Config
            </CardTitle>
            <CardDescription>Configure house edge and probabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full touch-friendly">
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="premium-card border-primary/20 hover:border-primary/50 transition-all cursor-pointer hover-lift animate-fade-in" 
          onClick={() => navigate({ to: '/admin/withdrawals' })}
          style={{ animationDelay: '150ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-primary" />
              Withdrawals
            </CardTitle>
            <CardDescription>Process withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full touch-friendly">
              Manage
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="premium-card border-primary/20 hover:border-primary/50 transition-all cursor-pointer hover-lift animate-fade-in" 
          onClick={() => navigate({ to: '/admin/manual-payments' })}
          style={{ animationDelay: '200ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Payment Requests
            </CardTitle>
            <CardDescription>Review and approve manual payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full touch-friendly">
              Manage Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
