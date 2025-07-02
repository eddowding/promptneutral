import React from 'react';
import { Database, TestTube } from 'lucide-react';

interface DataSourceToggleProps {
  useLiveData: boolean;
  onToggle: (useLiveData: boolean) => void;
  usingSampleData: boolean;
}

export const DataSourceToggle: React.FC<DataSourceToggleProps> = ({
  useLiveData,
  onToggle,
  usingSampleData,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Data Source</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onToggle(false)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                !useLiveData
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TestTube className="w-4 h-4 inline mr-1" />
              Sample Data
            </button>
            <button
              onClick={() => onToggle(true)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                useLiveData
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database className="w-4 h-4 inline mr-1" />
              Live Data
            </button>
          </div>
        </div>
        
        {usingSampleData && useLiveData && (
          <div className="flex items-center space-x-2 text-sm text-amber-600">
            <span>⚠️ Using sample data (API failed)</span>
          </div>
        )}
      </div>
    </div>
  );
};