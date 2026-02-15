import React, { useState } from 'react';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import PremiumSpinner from '../common/PremiumSpinner';

export default function PaymentSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();
  
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!secretKey.trim()) {
      setError('Secret key is required');
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length === 2);

    if (allowedCountries.length === 0) {
      setError('At least one valid country code is required (e.g., US, CA, GB)');
      return;
    }

    try {
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      setSecretKey('');
    } catch (err: any) {
      setError(err.message || 'Failed to configure Stripe');
    }
  };

  if (isLoading) {
    return (
      <Card className="premium-surface">
        <CardContent className="flex items-center justify-center py-12">
          <PremiumSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (isConfigured) {
    return (
      <Card className="premium-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Stripe Payment Configured
          </CardTitle>
          <CardDescription>
            Stripe payment gateway is active and ready to process transactions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="premium-surface">
      <CardHeader>
        <CardTitle>Configure Stripe Payment</CardTitle>
        <CardDescription>
          Set up Stripe to enable credit card payments for your application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              disabled={setStripeConfig.isPending}
            />
            <p className="text-sm text-muted-foreground">
              Your Stripe secret key (starts with sk_test_ or sk_live_)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries</Label>
            <Input
              id="countries"
              type="text"
              placeholder="US,CA,GB"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              disabled={setStripeConfig.isPending}
            />
            <p className="text-sm text-muted-foreground">
              Comma-separated list of 2-letter country codes (e.g., US, CA, GB, AU)
            </p>
          </div>

          <Button
            type="submit"
            disabled={setStripeConfig.isPending}
            className="w-full"
          >
            {setStripeConfig.isPending ? (
              <>
                <PremiumSpinner size="sm" />
                <span className="ml-2">Configuring...</span>
              </>
            ) : (
              'Configure Stripe'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
