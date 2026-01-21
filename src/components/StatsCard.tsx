import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'severe' | 'heavy' | 'moderate' | 'clear';
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) => {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    severe: 'bg-traffic-severe/20 text-traffic-severe',
    heavy: 'bg-traffic-heavy/20 text-traffic-heavy',
    moderate: 'bg-traffic-moderate/20 text-traffic-moderate',
    clear: 'bg-traffic-clear/20 text-traffic-clear',
  };

  return (
    <div className={cn('glass-card p-5 animate-fade-in-up', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-traffic-clear' : 'text-traffic-severe'
              )}
            >
              {trend.isPositive ? '↓' : '↑'} {Math.abs(trend.value)}% from last hour
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', variantStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
