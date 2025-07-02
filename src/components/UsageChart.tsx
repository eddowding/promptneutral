import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DailySummary } from '../types/usage';
import { formatDate, formatNumber } from '../utils/dataProcessing';

interface UsageChartProps {
  data: DailySummary[];
  dataKey: keyof Omit<DailySummary, 'date' | 'unique_models'>;
  title: string;
  color?: string;
}

export const UsageChart: React.FC<UsageChartProps> = ({
  data,
  dataKey,
  title,
  color = '#3b82f6',
}) => {
  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={formatNumber}
          />
          <Tooltip
            formatter={(value: number) => [formatNumber(value), title]}
            labelStyle={{ color: '#1e293b' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};