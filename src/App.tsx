import React, { useState } from 'react';
import { Thermometer, MapPin, BarChart3, Download } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { DataVisualization } from './components/DataVisualization';
import { ResultsTable } from './components/ResultsTable';
import { DataProcessor } from './utils/dataProcessing';
import { ClimateCalculations } from './utils/climateCalculations';
import { GPSPoint, ClimateData, AnalysisResult, AnalysisConfig } from './types';

function App() {
  const [gpsData, setGpsData] = useState<GPSPoint[]>([]);
  const [climateData, setClimateData] = useState<ClimateData[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'table'>('overview');
  
  const [config, setConfig] = useState<AnalysisConfig>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    surfaceProperties: {
      materialType: 'wood',
      albedo: 0.25,
      emissivity: 0.90
    },
    aggregationLevel: 'daily'
  });

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      let gpsPoints: GPSPoint[];
      
      if (file.name.endsWith('.csv')) {
        gpsPoints = await DataProcessor.parseGPSData(file);
      } else if (file.name.endsWith('.json')) {
        gpsPoints = await DataProcessor.parseGPSDataFromJSON(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON.');
      }

      if (gpsPoints.length === 0) {
        throw new Error('No valid GPS data found in the file.');
      }

      // Aggregate data by day for better performance
      const aggregatedPoints = DataProcessor.aggregateByDay(gpsPoints);
      setGpsData(aggregatedPoints);

      // Fetch climate data
      const climate = await DataProcessor.fetchClimateData(aggregatedPoints);
      setClimateData(climate);

      // Perform analysis
      const results = ClimateCalculations.processClimateData(climate, config.surfaceProperties);
      setAnalysisResults(results);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (newConfig: AnalysisConfig) => {
    setConfig(newConfig);
    
    // Reanalyze if we have climate data
    if (climateData.length > 0) {
      const results = ClimateCalculations.processClimateData(climateData, newConfig.surfaceProperties);
      setAnalysisResults(results);
    }
  };

  const hasData = analysisResults.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Thermometer className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Climate Load Analysis System
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{gpsData.length} GPS points processed</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Configuration */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Input</h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                loading={loading}
                error={error}
              />
            </div>
            
            <ConfigurationPanel
              config={config}
              onConfigChange={handleConfigChange}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {hasData ? (
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-md">
                  <nav className="flex space-x-0 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'overview'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4 inline mr-2" />
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('charts')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'charts'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4 inline mr-2" />
                      Charts
                    </button>
                    <button
                      onClick={() => setActiveTab('table')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'table'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Download className="h-4 w-4 inline mr-2" />
                      Data Table
                    </button>
                  </nav>

                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Analysis Summary
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-blue-900">Route Analysis</h4>
                              <p className="text-blue-700 text-sm mt-1">
                                {analysisResults.length} data points analyzed along your route
                              </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-medium text-green-900">Material Properties</h4>
                              <p className="text-green-700 text-sm mt-1">
                                {config.surfaceProperties.materialType} surface with {(config.surfaceProperties.albedo * 100).toFixed(0)}% reflectivity
                              </p>
                            </div>
                          </div>
                        </div>
                        <DataVisualization data={analysisResults} />
                      </div>
                    )}
                    
                    {activeTab === 'charts' && (
                      <DataVisualization data={analysisResults} />
                    )}
                    
                    {activeTab === 'table' && (
                      <ResultsTable data={analysisResults} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready for Analysis
                  </h3>
                  <p className="text-gray-600">
                    Upload your GPS data file to begin climate load analysis along your route
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;