import React from 'react';
import { TrendingDown, Lightbulb, Target, AlertTriangle } from 'lucide-react';
import { EnvironmentalImpact } from '../types/environmental';
import { formatCO2, formatCurrency } from '../utils/environmentalCalculations';

interface OptimizationRecommendationsProps {
  impact: EnvironmentalImpact;
}

interface Recommendation {
  type: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSaving: {
    co2: number;
    cost: number;
  };
  icon: React.ReactNode;
}

export const OptimizationRecommendations: React.FC<OptimizationRecommendationsProps> = ({ impact }) => {
  // Generate recommendations based on usage patterns
  const recommendations: Recommendation[] = [];

  // Find highest impact model
  const sortedModels = Object.entries(impact.modelBreakdown)
    .sort(([,a], [,b]) => b.co2g - a.co2g);
  
  if (sortedModels.length > 0) {
    const [highestModel, data] = sortedModels[0];
    if (data.co2g > impact.totalCO2g * 0.5) {
      recommendations.push({
        type: 'high',
        title: `Optimize ${highestModel} Usage`,
        description: `${highestModel} accounts for ${Math.round(data.co2g / impact.totalCO2g * 100)}% of your carbon footprint. Consider using more efficient models for simpler tasks.`,
        potentialSaving: {
          co2: data.co2g * 0.3,
          cost: data.cost * 0.3,
        },
        icon: <AlertTriangle className="w-5 h-5" />,
      });
    }
  }

  // Check for inefficient token usage
  const avgTokensPerRequest = Object.values(impact.modelBreakdown)
    .reduce((sum, model) => sum + model.tokens, 0) / 
    Object.values(impact.modelBreakdown)
    .reduce((sum, model) => sum + (model.tokens / 1000), 0); // rough estimate

  if (avgTokensPerRequest > 2000) {
    recommendations.push({
      type: 'medium',
      title: 'Optimize Prompt Length',
      description: 'Your average prompt uses more tokens than typical. Consider shortening prompts or using more specific instructions.',
      potentialSaving: {
        co2: impact.totalCO2g * 0.2,
        cost: impact.totalCost * 0.2,
      },
      icon: <Target className="w-5 h-5" />,
    });
  }

  // General efficiency recommendation
  recommendations.push({
    type: 'low',
    title: 'Implement Caching Strategy',
    description: 'Cache frequently used responses to reduce redundant API calls and lower your carbon footprint.',
    potentialSaving: {
      co2: impact.totalCO2g * 0.15,
      cost: impact.totalCost * 0.15,
    },
    icon: <TrendingDown className="w-5 h-5" />,
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-amber-200 bg-amber-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className={`border rounded-lg p-4 ${getTypeColor(rec.type)}`}>
            <div className="flex items-start space-x-3">
              <div className={`mt-0.5 ${getIconColor(rec.type)}`}>
                {rec.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded capitalize ${
                    rec.type === 'high' ? 'bg-red-100 text-red-800' :
                    rec.type === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.type} impact
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="text-green-600 font-medium">
                    Potential savings: {formatCO2(rec.potentialSaving.co2)}
                  </span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(rec.potentialSaving.cost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-900">Total Optimization Potential</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-green-700">Carbon Reduction:</span>
            <span className="ml-2 font-medium text-green-900">
              {formatCO2(recommendations.reduce((sum, rec) => sum + rec.potentialSaving.co2, 0))}
            </span>
          </div>
          <div>
            <span className="text-green-700">Cost Savings:</span>
            <span className="ml-2 font-medium text-green-900">
              {formatCurrency(recommendations.reduce((sum, rec) => sum + rec.potentialSaving.cost, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};