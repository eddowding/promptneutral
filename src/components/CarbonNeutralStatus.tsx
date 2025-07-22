import React from 'react';
import { Leaf, Shield, CheckCircle, Clock, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EnvironmentalImpact } from '../types/environmental';
import { formatCO2, formatCurrency } from '../utils/environmentalCalculations';

interface CarbonNeutralStatusProps {
  impact: EnvironmentalImpact;
}

export const CarbonNeutralStatus: React.FC<CarbonNeutralStatusProps> = ({ impact }) => {
  const navigate = useNavigate();
  // Calculate carbon credits pricing based on default project (Indus Delta at 40 EUR/tonne)
  const creditCost = (impact.totalCO2g / 1000000) * 40; // 40 EUR per tonne CO2 (converting g to tonnes)
  const isNeutralized = false; // In reality, check if credits have been purchased

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-900">Carbon Neutral Status</h2>
          </div>
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
            €40/tonne CO₂ (Indus Delta project)
          </div>
        </div>
      </div>

      {!isNeutralized && creditCost > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/offset-order', { 
              state: { 
                offsetAmount: impact.totalCO2g / 1000000, // Convert g to tonnes
                offsetCost: creditCost,
                fromDashboard: true
              } 
            })}
            className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Offset Your Carbon Impact for ${creditCost.toFixed(2)}
          </button>
          <p className="mt-2 text-sm text-gray-600">
            Support verified carbon offset projects
          </p>
        </div>
      )}
    </div>
  );
};