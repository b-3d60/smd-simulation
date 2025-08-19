import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { AnalysisResult } from '../types';
import { TrendingUp, Thermometer, Droplets, Sun } from 'lucide-react';

interface DataVisualizationProps {
  data: AnalysisResult[];
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No data available for visualization</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: item.date,
    surfaceTemp: item.surfaceTemperature,
    emcAverage: item.emcAverage,
    emcPeak: item.emcPeak,
    cumulativeUV: item.cumulativeUV,
    agingRate: item.riskAssessment.agingRate,
    latitude: item.latitude,
    longitude: item.longitude
  }));

  const formatTooltipValue = (value: number, name: string) => {
    const units = {
      surfaceTemp: '°C',
      emcAverage: '%',
      emcPeak: '%',
      cumulativeUV: 'units',
      agingRate: 'factor'
    };
    return [`${value.toFixed(2)} ${units[name as keyof typeof units] || ''}`, name];
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Max Surface Temp</p>
              <p className="text-2xl font-bold text-red-600">
                {Math.max(...data.map(d => d.surfaceTemperature)).toFixed(1)}°C
              </p>
            </div>
            <Thermometer className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg EMC Peak</p>
              <p className="text-2xl font-bold text-blue-600">
                {(data.reduce((sum, d) => sum + d.emcPeak, 0) / data.length).toFixed(1)}%
              </p>
            </div>
            <Droplets className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total UV Exposure</p>
              <p className="text-2xl font-bold text-yellow-600">
                {data.reduce((sum, d) => sum + d.cumulativeUV, 0).toFixed(0)}
              </p>
            </div>
            <Sun className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Max Aging Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.max(...data.map(d => d.riskAssessment.agingRate)).toFixed(2)}x
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Surface Temperature Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Surface Temperature Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={formatTooltipValue} />
            <Line 
              type="monotone" 
              dataKey="surfaceTemp" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Surface Temperature"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Moisture Content Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equilibrium Moisture Content</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="emcAverage" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="EMC Average"
            />
            <Line 
              type="monotone" 
              dataKey="emcPeak" 
              stroke="#1d4ed8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="EMC Peak"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* UV and Aging Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cumulative UV Exposure</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              <Bar dataKey="cumulativeUV" fill="#fbbf24" name="Cumulative UV" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Aging Factor</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              <Line 
                type="monotone" 
                dataKey="agingRate" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Aging Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Route Heatmap (Scatter Plot) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Temperature Heatmap</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="longitude" name="Longitude" />
            <YAxis dataKey="latitude" name="Latitude" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [
                name === 'surfaceTemp' ? `${value}°C` : value,
                name === 'surfaceTemp' ? 'Surface Temperature' : name
              ]}
            />
            <Scatter 
              dataKey="surfaceTemp" 
              fill="#ef4444"
              name="Surface Temperature"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};