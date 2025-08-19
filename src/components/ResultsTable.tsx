import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Download, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff, Satellite } from 'lucide-react';
import { DataProcessor } from '../utils/dataProcessing';

interface ResultsTableProps {
  data: AnalysisResult[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [showRawData, setShowRawData] = useState(false);

  const handleExport = () => {
    const exportData = data.map(item => ({
      Date: item.date,
      Latitude: item.latitude.toFixed(6),
      Longitude: item.longitude.toFixed(6),
      'Surface Temperature (°C)': item.surfaceTemperature.toFixed(2),
      'EMC Average (%)': item.emcAverage.toFixed(2),
      'EMC Peak (%)': item.emcPeak.toFixed(2),
      'Cumulative UV': item.cumulativeUV.toFixed(2),
      'Aging Rate': item.riskAssessment.agingRate.toFixed(2),
      'Cracking Risk': item.riskAssessment.crackingRisk,
      'Moisture Stress': item.riskAssessment.moistureStress,
      // NASA POWER raw data
      'NASA Air Temp (°C)': item.rawClimateData.temperature.toFixed(2),
      'NASA Max Temp (°C)': item.rawClimateData.maxTemperature.toFixed(2),
      'NASA Humidity (%)': item.rawClimateData.humidity.toFixed(2),
      'NASA Solar Radiation (W/m²)': item.rawClimateData.solarRadiation.toFixed(2),
      'NASA UV Index': item.rawClimateData.uvIndex.toFixed(2)
    }));

    DataProcessor.exportAsCSV(exportData, 'climate-analysis-results-with-nasa-data.csv');
  };

  const getRiskIcon = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'High':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getRiskColor = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low':
        return 'text-green-700 bg-green-100';
      case 'Medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'High':
        return 'text-red-700 bg-red-100';
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No analysis results available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showRawData 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showRawData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showRawData ? 'Hide' : 'Show'} NASA Data
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
        
        {showRawData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Satellite className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">NASA POWER API Data</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Raw meteorological data from NASA's satellite and reanalysis models used for calculations
            </p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coordinates
              </th>
              {showRawData && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">
                    NASA Air Temp (°C)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">
                    NASA Max Temp (°C)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">
                    NASA Humidity (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">
                    NASA Solar (W/m²)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">
                    NASA UV Index
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Surface Temp (°C)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EMC Avg/Peak (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UV Exposure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aging Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Assessment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    <div>{item.latitude.toFixed(4)}°</div>
                    <div>{item.longitude.toFixed(4)}°</div>
                  </div>
                </td>
                {showRawData && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 bg-blue-50">
                      <span className="font-medium">
                        {item.rawClimateData.temperature.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 bg-blue-50">
                      <span className="font-medium">
                        {item.rawClimateData.maxTemperature.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 bg-blue-50">
                      <span className="font-medium">
                        {item.rawClimateData.humidity.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 bg-blue-50">
                      <span className="font-medium">
                        {item.rawClimateData.solarRadiation.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 bg-blue-50">
                      <span className="font-medium">
                        {item.rawClimateData.uvIndex.toFixed(1)}
                      </span>
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`font-medium ${
                    item.surfaceTemperature > 50 ? 'text-red-600' : 
                    item.surfaceTemperature > 35 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {item.surfaceTemperature.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1">
                    <div>{item.emcAverage.toFixed(1)}</div>
                    <div className="text-gray-500">{item.emcPeak.toFixed(1)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.cumulativeUV.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`font-medium ${
                    item.riskAssessment.agingRate > 2 ? 'text-red-600' : 
                    item.riskAssessment.agingRate > 1.5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {item.riskAssessment.agingRate.toFixed(2)}x
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(item.riskAssessment.crackingRisk)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(item.riskAssessment.crackingRisk)}`}>
                        Crack: {item.riskAssessment.crackingRisk}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(item.riskAssessment.moistureStress)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(item.riskAssessment.moistureStress)}`}>
                        Moisture: {item.riskAssessment.moistureStress}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data Source Information */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Satellite className="h-4 w-4" />
            <span>Data sourced from NASA POWER API</span>
          </div>
          <div>
            {data.length} data points • Real-time meteorological data
          </div>
        </div>
      </div>
    </div>
  );
};