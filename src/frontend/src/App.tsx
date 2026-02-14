import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/layout/AppLayout';
import GamePage from './pages/GamePage';
import WalletPage from './pages/WalletPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import BuyCreditsPage from './pages/BuyCreditsPage';
import WithdrawPage from './pages/WithdrawPage';
import PaymentSuccessPage from './pages/payments/PaymentSuccessPage';
import PaymentFailurePage from './pages/payments/PaymentFailurePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminWheelConfigPage from './pages/admin/AdminWheelConfigPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
import AdminManualPaymentRequestsPage from './pages/admin/AdminManualPaymentRequestsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import AdminRouteGuard from './components/auth/AdminRouteGuard';
import PremiumSpinner from './components/common/PremiumSpinner';

const rootRoute = createRootRoute({
  component: AppLayout
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: GamePage
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallet',
  component: WalletPage
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: TransactionsPage
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage
});

const buyCreditsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/buy-credits',
  component: BuyCreditsPage
});

const withdrawRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/withdraw',
  component: WithdrawPage
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage
});

const unauthorizedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unauthorized',
  component: UnauthorizedPage
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminRouteGuard>
      <AdminDashboardPage />
    </AdminRouteGuard>
  )
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: () => (
    <AdminRouteGuard>
      <AdminUsersPage />
    </AdminRouteGuard>
  )
});

const adminWheelConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/wheel-config',
  component: () => (
    <AdminRouteGuard>
      <AdminWheelConfigPage />
    </AdminRouteGuard>
  )
});

const adminWithdrawalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/withdrawals',
  component: () => (
    <AdminRouteGuard>
      <AdminWithdrawalsPage />
    </AdminRouteGuard>
  )
});

const adminManualPaymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/manual-payments',
  component: () => (
    <AdminRouteGuard>
      <AdminManualPaymentRequestsPage />
    </AdminRouteGuard>
  )
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  walletRoute,
  transactionsRoute,
  profileRoute,
  buyCreditsRoute,
  withdrawRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  unauthorizedRoute,
  adminDashboardRoute,
  adminUsersRoute,
  adminWheelConfigRoute,
  adminWithdrawalsRoute,
  adminManualPaymentsRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AuthenticatedApp() {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  // Show profile setup modal only for new users (when profile is null)
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal open={showProfileSetup} />}
    </>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <PremiumSpinner size="xl" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <LoginPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthenticatedApp />
      <Toaster />
    </ThemeProvider>
  );
}
