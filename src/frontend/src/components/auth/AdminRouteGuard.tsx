import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading, isFetched } = useIsCallerAdmin();

  useEffect(() => {
    if (isFetched && !isAdmin) {
      navigate({ to: '/unauthorized' });
    }
  }, [isAdmin, isFetched, navigate]);

  if (isLoading && !isFetched) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
