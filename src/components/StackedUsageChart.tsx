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
import { StackedChartData } from '../types/environmental';
import { formatDate, formatNumber } from '../utils/dataProcessing';

interface StackedUsageChartProps {
  data: StackedChartData[];
  title: string;
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

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
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