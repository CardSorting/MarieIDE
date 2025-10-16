import React from 'react';
import { APP_NAME } from '../constants';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg
              className="animate-spin text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{APP_NAME}</h1>
          <p className="text-gray-400">Loading your development environment...</p>
        </div>
        
        <div className="w-64 bg-gray-700 rounded-full h-1 mx-auto">
          <div className="bg-primary-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
};
