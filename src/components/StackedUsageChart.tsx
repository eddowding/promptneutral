import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar } from 'lucide-react';
import { StackedChartData } from '../types/environmental';
import { formatDate, formatNumber } from '../utils/dataProcessing';

interface StackedUsageChartProps {
  data: StackedChartData[];
  title: string;
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | 'all') => void;
  currentRange?: '7d' | '30d' | '90d' | 'all';
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

export const StackedUsageChart: React.FC<StackedUsageChartProps> = ({
  data,
  title,
  onTimeRangeChange,
  currentRange = '30d',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  // Get all unique models from the data
  const models = Array.from(
    new Set(
      data.flatMap(item => 
        Object.keys(item).filter(key => key !== 'date')
      )
    )
  );

  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date as string),
  }));

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' },
  ];

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onTimeRangeChange && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={currentRange}
              onChange={(e) => onTimeRangeChange(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={formatNumber}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatNumber(value),
              name
            ]}
            labelStyle={{ color: '#1e293b' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          {models.map((model, index) => (
            <Bar
              key={model}
              dataKey={model}
              stackId="tokens"
              fill={COLORS[index % COLORS.length]}
              radius={index === models.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};