import React from 'react';
import { Leaf, Zap, DollarSign, Thermometer } from 'lucide-react';
import { EnvironmentalImpact as IEnvironmentalImpact } from '../types/environmental';
import { MetricCard } from './MetricCard';
import { formatCurrency, formatKWh, formatCO2 } from '../utils/environmentalCalculations';

interface EnvironmentalImpactProps {
  impact: IEnvironmentalImpact;
}

export const EnvironmentalImpact: React.FC<EnvironmentalImpactProps> = ({ impact }) => {
  // Check if we have any actual cost data
  const hasActualCosts = impact.modelBreakdown && Object.values(impact.modelBreakdown).some(model => 
    'cost_source' in model && model.cost_source === 'api'
  );

  const costSubtitle = hasActualCosts 
    ? "Includes actual costs from OpenAI API" 
    : "Estimated from model assumptions";

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Environmental Impact</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Cost"
          value={impact.totalCost}
          icon={<DollarSign />}
          formatter={formatCurrency}
          subtitle={costSubtitle}
        />
        <MetricCard
          title="Energy Usage"
          value={impact.totalKWh}
          icon={<Zap />}
          formatter={formatKWh}
        />
        <MetricCard
          title="Carbon Footprint"
          value={impact.totalCO2g}
          icon={<Thermometer />}
          formatter={formatCO2}
        />
        <MetricCard
          title="Tree Offset"
          value={Math.ceil(impact.totalCO2g / 21000)} // ~21kg CO2/tree/year
          icon={<Leaf />}
          formatter={(value) => `${value} trees`}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact by Model</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Model</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Tokens</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Cost</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Energy</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">CO₂</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(impact.modelBreakdown)
                .sort(([,a], [,b]) => b.co2g - a.co2g)
                .map(([model, data]) => (
                <tr key={model} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{model}</td>
                  <td className="text-right py-3 px-4 text-gray-600">
                    {data.tokens.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-600">
                    {formatCurrency(data.cost)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-600">
                    {formatKWh(data.kWh)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-600">
                    {formatCO2(data.co2g)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};