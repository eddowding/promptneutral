import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export interface TimeRange {
  value: number;
  label: string;
  shortLabel: string;
}

export const TIME_RANGES: TimeRange[] = [
  { value: 7, label: 'Last 7 days', shortLabel: '7D' },
  { value: 14, label: 'Last 14 days', shortLabel: '14D' },
  { value: 30, label: 'Last 30 days', shortLabel: '30D' },
  { value: 60, label: 'Last 60 days', shortLabel: '60D' },
  { value: 90, label: 'Last 90 days', shortLabel: '90D' },
];

interface TimeRangeSelectorProps {
  selectedRange: number;
  onRangeChange: (days: number) => void;
  className?: string;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedTimeRange = TIME_RANGES.find(r => r.value === selectedRange) || TIME_RANGES[2]; // Default to 30 days

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="font-medium text-gray-700">{selectedTimeRange.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => {
                  onRangeChange(range.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  selectedRange === range.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};