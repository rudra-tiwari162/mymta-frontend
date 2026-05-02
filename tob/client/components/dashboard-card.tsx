import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  children?: React.ReactNode;
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  children,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {value !== undefined && (
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {value}
            </p>
          )}
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <div className="text-green-600 ml-3 flex-shrink-0">{icon}</div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      )}
      {children}
    </div>
  );
}
