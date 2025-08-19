import React from 'react';
import { Settings, Calendar, Layers } from 'lucide-react';
import { AnalysisConfig, SurfaceProperties } from '../types';

interface ConfigurationPanelProps {
  config: AnalysisConfig;
  onConfigChange: (config: AnalysisConfig) => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onConfigChange
}) => {
  const materialTypes = [
    { value: 'wood', label: 'Wood', albedo: 0.25, emissivity: 0.90 },
    { value: 'concrete', label: 'Concrete', albedo: 0.40, emissivity: 0.95 },
    { value: 'asphalt', label: 'Asphalt', albedo: 0.05, emissivity: 0.95 },
    { value: 'metal', label: 'Metal', albedo: 0.60, emissivity: 0.20 },
    { value: 'plastic', label: 'Plastic', albedo: 0.30, emissivity: 0.85 }
  ];

  const handleMaterialChange = (materialType: string) => {
    const material = materialTypes.find(m => m.value === materialType);
    if (material) {
      const newSurfaceProperties: SurfaceProperties = {
        materialType: material.value,
        albedo: material.albedo,
        emissivity: material.emissivity
      };
      
      onConfigChange({
        ...config,
        surfaceProperties: newSurfaceProperties
      });
    }
  };

  const handlePropertyChange = (property: keyof SurfaceProperties, value: number) => {
    onConfigChange({
      ...config,
      surfaceProperties: {
        ...config.surfaceProperties,
        [property]: value
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Analysis Configuration</h2>
      </div>

      <div className="space-y-6">
        {/* Date Range */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Analysis Period</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => onConfigChange({ ...config, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={config.endDate}
                onChange={(e) => onConfigChange({ ...config, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Material Properties */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Layers className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Surface Material</label>
          </div>
          
          <div className="space-y-4">
            <select
              value={config.surfaceProperties.materialType}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {materialTypes.map(material => (
                <option key={material.value} value={material.value}>
                  {material.label}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Albedo (Reflectivity)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.surfaceProperties.albedo}
                  onChange={(e) => handlePropertyChange('albedo', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {config.surfaceProperties.albedo.toFixed(2)}
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Emissivity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.surfaceProperties.emissivity}
                  onChange={(e) => handlePropertyChange('emissivity', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {config.surfaceProperties.emissivity.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregation Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Aggregation
          </label>
          <select
            value={config.aggregationLevel}
            onChange={(e) => onConfigChange({ 
              ...config, 
              aggregationLevel: e.target.value as 'daily' | 'weekly' | 'monthly' 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  );
};