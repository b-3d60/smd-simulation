import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle, Info } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  loading = false, 
  error 
}) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const file = files.find(f => f.name.endsWith('.csv') || f.name.endsWith('.json'));
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${loading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {loading ? 'Processing GPS data and fetching climate data...' : 'Upload GPS Data'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drop your CSV or JSON file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Required columns: timestamp, latitude, longitude
            </p>
          </div>

          {!loading && (
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              <FileText className="h-4 w-4 mr-2" />
              Select File
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* NASA POWER API Info */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">Climate Data Source</h4>
            <p className="text-blue-700 text-sm">
              Climate data is fetched in real-time from NASA's POWER API, providing accurate meteorological 
              and solar irradiance data for your route analysis. This includes temperature, humidity, 
              solar radiation, and UV measurements.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Processing Error</h4>
            <p className="text-red-700">{error}</p>
            <p className="text-red-600 text-sm mt-1">
              If NASA POWER API is unavailable, the system will use fallback data for demonstration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};