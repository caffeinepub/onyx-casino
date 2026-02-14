import { cn } from '@/lib/utils';

interface PremiumSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function PremiumSpinner({ size = 'md', className }: PremiumSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" 
           style={{ 
             filter: 'drop-shadow(0 0 8px oklch(var(--primary) / 0.5))',
             animationDuration: '0.8s'
           }} 
      />
      <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" 
           style={{ animationDuration: '1.6s' }} 
      />
    </div>
  );
}
