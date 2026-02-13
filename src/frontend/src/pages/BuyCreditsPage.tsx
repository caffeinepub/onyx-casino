import { useState } from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { loadRazorpayScript } from '../utils/razorpay';
import { formatINR, rupeesToPaise } from '../utils/currency';

const creditPackages = [
  { amount: 100, credits: 200, discount: 0, popular: false },
  { amount: 500, credits: 1000, discount: 0, popular: true },
  { amount: 1000, credits: 2200, discount: 10, popular: false },
  { amount: 5000, credits: 12000, discount: 20, popular: false }
];

export default function BuyCreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const { data: profile } = useGetCallerUserProfile();

  const handlePurchase = async (pkg: typeof creditPackages[0]) => {
    setSelectedPackage(pkg.amount);
    
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection.');
      }

      toast.info('Razorpay integration coming soon', {
        description: 'Payment processing will be available shortly'
      });
      
      setSelectedPackage(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
      setSelectedPackage(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Buy Credits</h1>
        <p className="text-muted-foreground">All purchases are 2x value - {formatINR(1)} = 2 credits</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {creditPackages.map((pkg, index) => (
          <Card
            key={pkg.amount}
            className={`relative border-2 transition-all hover-lift animate-fade-in ${
              pkg.popular
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">{formatINR(pkg.amount)}</CardTitle>
              <CardDescription className="text-lg font-semibold text-primary">
                {pkg.credits} Credits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-chart-4" />
                  <span>2x Value</span>
                </div>
                {pkg.discount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      +{pkg.discount}% Bonus
                    </Badge>
                  </div>
                )}
              </div>
              <Button
                onClick={() => handlePurchase(pkg)}
                disabled={selectedPackage === pkg.amount}
                className={`w-full touch-friendly ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                    : ''
                }`}
                size="lg"
              >
                {selectedPackage === pkg.amount ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Buy Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Secure Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>✓ Powered by Razorpay - India's leading payment gateway</p>
          <p>✓ Support for UPI, Cards, Net Banking, and Wallets</p>
          <p>✓ Instant credit delivery after successful payment</p>
          <p>✓ 100% secure and encrypted transactions</p>
        </CardContent>
      </Card>
    </div>
  );
}
