import { useState } from 'react';
import { useGetHouseEdge, useSetHouseEdge } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminWheelConfigPage() {
  const { data: currentEdge, isLoading } = useGetHouseEdge();
  const setEdge = useSetHouseEdge();
  const [edgeValue, setEdgeValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseInt(edgeValue);
    if (isNaN(value) || value < 0 || value > 10000) {
      toast.error('Please enter a valid house edge (0-10000)');
      return;
    }

    try {
      await setEdge.mutateAsync(BigInt(value));
      toast.success('House edge updated successfully');
      setEdgeValue('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update house edge');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const currentEdgePercent = currentEdge ? Number(currentEdge) / 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Wheel Configuration</h1>
        <p className="text-muted-foreground">Adjust house edge and game settings</p>
      </div>

      <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            House Edge
          </CardTitle>
          <CardDescription>
            Current: {currentEdgePercent}% (basis points: {currentEdge?.toString()})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="houseEdge">House Edge (basis points, 1000 = 10%)</Label>
              <Input
                id="houseEdge"
                type="number"
                placeholder="1000"
                value={edgeValue}
                onChange={(e) => setEdgeValue(e.target.value)}
                disabled={setEdge.isPending}
                min="0"
                max="10000"
              />
              <p className="text-sm text-muted-foreground">
                Enter value in basis points (100 = 1%, 1000 = 10%)
              </p>
            </div>

            <Button
              type="submit"
              disabled={setEdge.isPending}
              className="w-full touch-friendly"
            >
              {setEdge.isPending ? 'Updating...' : 'Update House Edge'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle>Current Probabilities</CardTitle>
          <CardDescription>Wheel segment distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between p-3 rounded-lg bg-accent/50">
            <span className="font-medium">Tiger (1.4x)</span>
            <span className="text-primary">35%</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-accent/50">
            <span className="font-medium">Dragon (1.96x)</span>
            <span className="text-primary">14%</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-accent/50">
            <span className="font-medium">Miss (0x)</span>
            <span className="text-primary">30.8%</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-accent/50">
            <span className="font-medium">Crit (0.5x)</span>
            <span className="text-primary">20.3%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
