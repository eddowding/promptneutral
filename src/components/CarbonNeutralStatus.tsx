import React from 'react';
import { Leaf, Shield, CheckCircle, Clock } from 'lucide-react';
import { EnvironmentalImpact } from '../types/environmental';
import { formatCO2, formatCurrency } from '../utils/environmentalCalculations';

interface CarbonNeutralStatusProps {
  impact: EnvironmentalImpact;
}

export const CarbonNeutralStatus: React.FC<CarbonNeutralStatusProps> = ({ impact }) => {
  // Simulate carbon credits pricing (in reality this would come from your API)
  const creditCost = impact.totalCO2g / 1000 * 15; // $15 per kg CO2
  const isNeutralized = true; // In reality, check if credits have been purchased

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-900">Carbon Neutral Status</h2>
            <p className="text-sm text-green-700">EU Green Claims Directive Compliant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isNeutralized ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Clock className="w-6 h-6 text-amber-500" />
          )}
          <span className={`font-medium ${isNeutralized ? 'text-green-600' : 'text-amber-600'}`}>
            {isNeutralized ? '100% Neutralized' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Emissions</span>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Generated</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCO2(impact.totalCO2g)}</div>
          <div className="text-xs text-gray-500 mt-1">
            From {Object.keys(impact.modelBreakdown).length} AI models
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Credits Retired</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCO2(impact.totalCO2g)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Gold Standard certified
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Credit Cost</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Automatic</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(creditCost)}</div>
          <div className="text-xs text-gray-500 mt-1">
            $15/kg CO₂ avg. price
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700">
            Blockchain verified • Audit ready • Real-time retirement
          </span>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
          View Certificate
        </button>
      </div>
    </div>
  );
};