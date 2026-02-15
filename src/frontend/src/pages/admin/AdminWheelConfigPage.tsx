import { useState, useEffect } from 'react';
import { useGetHouseEdgeValue, useSetHouseEdgeValue } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../../components/common/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminWheelConfigPage() {
  const { data: currentHouseEdge, isLoading } = useGetHouseEdgeValue();
  const setHouseEdge = useSetHouseEdgeValue();
  const [houseEdgeInput, setHouseEdgeInput] = useState('');

  useEffect(() => {
    if (currentHouseEdge !== undefined) {
      setHouseEdgeInput((Number(currentHouseEdge) / 100).toFixed(2));
    }
  }, [currentHouseEdge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseFloat(houseEdgeInput);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error('Please enter a valid house edge between 0 and 100');
      return;
    }

    try {
      await setHouseEdge.mutateAsync(BigInt(Math.round(value * 100)));
      toast.success('House edge updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update house edge');
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Wheel Configuration"
        description="Manage game settings and house edge"
        badge={<Badge variant="outline" className="border-primary/50 text-primary">Admin</Badge>}
      />

      <Alert className="border-primary/20 bg-primary/5">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertDescription>
          Current house edge: <strong>{currentHouseEdge ? (Number(currentHouseEdge) / 100).toFixed(2) : '0.00'}%</strong>
        </AlertDescription>
      </Alert>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle>House Edge Settings</CardTitle>
          <CardDescription>
            Adjust the house edge percentage (0-100%). This affects the overall probability distribution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="houseEdge">House Edge (%)</Label>
              <Input
                id="houseEdge"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="8.00"
                value={houseEdgeInput}
                onChange={(e) => setHouseEdgeInput(e.target.value)}
                disabled={setHouseEdge.isPending}
              />
              <p className="text-sm text-muted-foreground">
                Enter a value between 0 and 100. For example, 8.00 means 8% house edge.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Note:</strong> Changing the house edge will affect future spins. 
                Higher values favor the house, lower values favor players.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={setHouseEdge.isPending}
              className="w-full sm:w-auto"
            >
              {setHouseEdge.isPending ? 'Updating...' : 'Update House Edge'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle>Payout Information</CardTitle>
          <CardDescription>Current payout multipliers for each outcome</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-muted-foreground">Tiger</p>
              <p className="text-2xl font-bold text-primary">1.4x</p>
              <p className="text-xs text-muted-foreground mt-1">Net: +20 credits (on 50 bet)</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-muted-foreground">Dragon</p>
              <p className="text-2xl font-bold text-primary">1.96x</p>
              <p className="text-xs text-muted-foreground mt-1">Net: +48 credits (on 50 bet)</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">Miss</p>
              <p className="text-2xl font-bold text-muted-foreground">0x</p>
              <p className="text-xs text-muted-foreground mt-1">Net: -50 credits (on 50 bet)</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-muted-foreground">Crit</p>
              <p className="text-2xl font-bold text-destructive">-0.5x</p>
              <p className="text-xs text-muted-foreground mt-1">Net: -75 credits (on 50 bet)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
