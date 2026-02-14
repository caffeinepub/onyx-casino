import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/generated/onyx-background.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <img 
            src="/assets/generated/onyx-wordmark.dim_1024x256.png" 
            alt="ONYX Casino" 
            className="h-16 mx-auto mb-6 drop-shadow-2xl"
          />
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">SECURE & TRUSTED</span>
            <Shield className="h-5 w-5" />
          </div>
        </div>

        <Card className="premium-surface shadow-premium-lg backdrop-blur-sm animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Welcome to ONYX</CardTitle>
            <CardDescription className="text-base">
              Experience premium gaming with secure authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-premium hover:shadow-premium-lg transition-all duration-200 hover-lift"
              >
                {isLoggingIn ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Sign In with Internet Identity
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Premium</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Trusted</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          By signing in, you agree to our terms of service and privacy policy
        </p>
      </div>
    </div>
  );
}
