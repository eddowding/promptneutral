import React from 'react';
import { Download } from 'lucide-react';
import { UsageReport } from '../types/usage';

interface ExportButtonProps {
  data: UsageReport;
  data30Days: UsageReport;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, data30Days }) => {
  const exportData = () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = `openai_usage_export_${today}.json`;
    
    const exportObj = {
      exportDate: new Date().toISOString(),
      summary: {
        totalDays7: Object.keys(data).length,
        totalDays30: Object.keys(data30Days).length,
      },
      data7Days: data,
      data30Days: data30Days,
    };
    
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportData}
      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
    >
      <Download className="w-4 h-4 mr-2" />
      Export JSON
    </button>
  );
};