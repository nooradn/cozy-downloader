import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { AppError } from '../types';

interface ErrorNotificationsProps {
  errors: AppError[];
  onClearError: (id: string) => void;
  onClearAll: () => void;
}

export const ErrorNotifications: React.FC<ErrorNotificationsProps> = ({
  errors,
  onClearError,
  onClearAll
}) => {
  if (errors.length === 0) return null;

  const getErrorIcon = (type: AppError['type']) => {
    return <AlertCircle className="w-4 h-4 flex-shrink-0" />;
  };

  const getErrorColor = (type: AppError['type']) => {
    switch (type) {
      case 'network':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'validation':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'storage':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {errors.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 underline"
          >
            Clear all ({errors.length})
          </button>
        </div>
      )}
      
      {errors.map((error) => (
        <div
          key={error.id}
          className={`p-4 rounded-lg border shadow-lg backdrop-blur-sm ${getErrorColor(error.type)} animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-start gap-3">
            {getErrorIcon(error.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{error.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(error.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => onClearError(error.id)}
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};