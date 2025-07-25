// src/components/LoadingSpinner.tsx
import React from 'react';
import { FiLoader, FiActivity } from 'react-icons/fi';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
  overlay = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const SpinnerContent = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}>
        <FiLoader />
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center ${
        overlay ? 'bg-black bg-opacity-50 z-50' : 'bg-white z-40'
      }`}>
        <SpinnerContent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <SpinnerContent />
    </div>
  );
};

// Specialized loading components
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <LoadingSpinner size="lg" text={text} fullScreen overlay />
);

export const ButtonLoader: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => (
  <FiLoader className={`animate-spin ${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />
);

export const InlineLoader: React.FC<{ text?: string; size?: 'sm' | 'md' }> = ({ 
  text, 
  size = 'sm' 
}) => (
  <div className="flex items-center space-x-2">
    <FiActivity className={`animate-pulse ${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
    {text && <span className="text-sm text-gray-600">{text}</span>}
  </div>
);

export const CardLoader: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

export const TableLoader: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-gray-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ChartLoader: React.FC<{ height?: string }> = ({ height = 'h-64' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${height}`}>
    <div className="animate-pulse h-full">
      <div className="flex items-end justify-between h-full space-x-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-t"
            style={{ 
              height: `${Math.random() * 60 + 20}%`,
              width: '100%'
            }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

export const MetricCardLoader: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export const ListLoader: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse flex items-center space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

// Loading states for specific components
export const DashboardLoader: React.FC = () => (
  <div className="space-y-6">
    {/* Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardLoader key={i} />
      ))}
    </div>
    
    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartLoader />
      <ChartLoader />
    </div>
    
    {/* Table */}
    <TableLoader />
  </div>
);

export const OrderLoader: React.FC = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <ListLoader items={8} />
  </div>
);

export default LoadingSpinner;
