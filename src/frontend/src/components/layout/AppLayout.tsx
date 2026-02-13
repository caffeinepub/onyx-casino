import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Wallet, Receipt, User, CreditCard, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

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
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover-lift ${
          isActive
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover-lift">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <img 
                      src="/assets/generated/onyx-wordmark.dim_1024x256.png" 
                      alt="ONYX Casino" 
                      className="h-8"
                    />
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

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="hidden md:flex hover-lift"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border/40 animate-slide-up">
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
      <footer className="border-t border-border/40 mt-auto hidden md:block">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ONYX Casino. All rights reserved.</p>
            <p>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
