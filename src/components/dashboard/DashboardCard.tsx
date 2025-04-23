
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  linkText?: string;
  linkUrl?: string;
  count?: number;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  icon,
  linkText,
  linkUrl,
  count,
  children,
  className = '',
}: DashboardCardProps) {
  return (
    <div className={`bg-white shadow-sm border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          {icon && <div className="text-platformBlue">{icon}</div>}
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          {count !== undefined && (
            <div className="ml-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full px-2 py-0.5">
              {count}
            </div>
          )}
        </div>
        {linkText && linkUrl && (
          <Link to={linkUrl}>
            <Button variant="ghost" size="sm" className="text-platformBlue hover:text-platformBlue-dark">
              {linkText}
            </Button>
          </Link>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
