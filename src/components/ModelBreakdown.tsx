import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ModelUsage } from '../types/usage';
import { formatNumber } from '../utils/dataProcessing';

interface ModelBreakdownProps {
  modelTotals: Record<string, ModelUsage>;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const ModelBreakdown: React.FC<ModelBreakdownProps> = ({ modelTotals }) => {
  const barData = Object.entries(modelTotals).map(([model, usage]) => ({
    model,
    requests: usage.requests,
    total_tokens: usage.context_tokens + usage.generated_tokens,
  }));

  const pieData = Object.entries(modelTotals).map(([model, usage]) => ({
    name: model,
    value: usage.requests,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests by Model</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatNumber(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Usage by Model</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="model" 
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
                name === 'total_tokens' ? 'Total Tokens' : 'Requests'
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="total_tokens" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};