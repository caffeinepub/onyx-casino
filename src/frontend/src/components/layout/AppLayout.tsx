import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Wallet, Receipt, User, CreditCard, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const displayName = userProfile?.displayName || 'Unnamed User';

  const navItems = [
    { path: '/', label: 'Game', icon: Home },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/transactions', label: 'Transactions', icon: Receipt },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/buy-credits', label: 'Buy Credits', icon: CreditCard }
  ];

  if (!adminLoading && isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: Shield });
  }

  const NavLink = ({ path, label, icon: Icon, onClick }: any) => {
    const isActive = currentPath === path || (path === '/admin' && currentPath.startsWith('/admin'));
    return (
      <button
        onClick={() => {
          navigate({ to: path });
          onClick?.();
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover-lift ${
          isActive
            ? 'bg-primary text-primary-foreground shadow-premium'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  const MobileNavButton = ({ path, label, icon: Icon }: any) => {
    const isActive = currentPath === path || (path === '/admin' && currentPath.startsWith('/admin'));
    return (
      <button
        onClick={() => navigate({ to: path })}
        className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all ${
          isActive
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0 relative">
      {/* Animated Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30 animate-pulse-slow" 
             style={{ 
               background: 'radial-gradient(circle at 20% 50%, oklch(0.75 0.15 45 / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.75 0.15 45 / 0.1) 0%, transparent 50%)',
               animationDuration: '8s'
             }} 
        />
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <img 
            src="/assets/generated/onyx-background.dim_1920x1080.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 animate-slide-down shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover-lift">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 premium-surface">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <img 
                      src="/assets/generated/onyx-wordmark.dim_1024x256.png" 
                      alt="ONYX Casino" 
                      className="h-8"
                    />
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">Welcome,</p>
                      <p className="text-base font-semibold text-primary truncate">{displayName}</p>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                      <NavLink key={item.path} {...item} onClick={() => setMobileMenuOpen(false)} />
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full hover-lift"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <img 
              src="/assets/generated/onyx-wordmark.dim_1024x256.png" 
              alt="ONYX Casino" 
              className="h-8 hidden md:block cursor-pointer hover-lift"
              onClick={() => navigate({ to: '/' })}
            />
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="text-right mr-2">
              <p className="text-xs text-muted-foreground">Welcome,</p>
              <p className="text-sm font-semibold text-primary">{displayName}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="hover-lift"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8 relative z-10 mb-safe">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 animate-slide-up shadow-premium pb-safe">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.slice(0, 5).map((item) => (
            <MobileNavButton key={item.path} {...item} />
          ))}
          {!adminLoading && isAdmin && (
            <MobileNavButton path="/admin" label="Admin" icon={Shield} />
          )}
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-auto hidden md:block relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ONYX Casino. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
