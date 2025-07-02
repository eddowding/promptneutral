import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { MODEL_ASSUMPTIONS } from '../data/modelAssumptions';
import { formatCurrency, formatKWh, formatCO2 } from '../utils/environmentalCalculations';

export const ModelAssumptions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Model Assumptions & Methodology</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Methodology */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Calculation Methodology</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Cost:</strong> Based on OpenAI's official pricing per 1,000 tokens</li>
              <li>• <strong>Energy:</strong> Estimated from model size, compute requirements, and academic research</li>
              <li>• <strong>Carbon:</strong> Uses global average grid intensity of 475g CO₂/kWh (IEA 2023)</li>
              <li>• <strong>Tree Offset:</strong> Based on average tree absorption of ~21kg CO₂/year</li>
            </ul>
          </div>

          {/* Assumptions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Model</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Cost/1k Tokens</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Energy/1k Tokens</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">CO₂/1k Tokens</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_ASSUMPTIONS.map((assumption) => (
                  <tr key={assumption.model} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{assumption.model}</td>
                    <td className="text-right py-3 px-4 text-gray-600">
                      {formatCurrency(assumption.costPer1kTokens)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">
                      {formatKWh(assumption.kWhPer1kTokens)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">
                      {formatCO2(assumption.co2gPer1kTokens)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sources */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Pricing:</strong> OpenAI official pricing (openai.com/pricing)</li>
              <li>• <strong>Energy estimates:</strong> Academic research on LLM energy consumption</li>
              <li>• <strong>Grid intensity:</strong> IEA Global Energy Review 2023</li>
              <li>• <strong>Carbon calculations:</strong> Based on datacenter PUE of 1.2 and cooling overhead</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">Important Notes</h4>
            <p className="text-sm text-amber-800">
              These are estimates based on available research and may not reflect actual values. 
              Energy and carbon calculations vary significantly based on datacenter efficiency, 
              grid composition, and model optimization. Use these figures as approximate indicators only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};