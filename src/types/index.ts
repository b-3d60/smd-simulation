export interface GPSPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
}

export interface ClimateData {
  date: string;
  latitude: number;
  longitude: number;
  temperature: number; // T2M - Air temperature at 2m
  maxTemperature: number; // Tmax - Daily maximum temperature
  solarRadiation: number; // ALLSKY_SFC_SW_DWN - Global solar radiation
  humidity: number; // RH2M - Relative humidity at 2m
  uvIndex: number;
}

export interface SurfaceProperties {
  albedo: number;
  emissivity: number;
  materialType: string;
}

export interface AnalysisResult {
  date: string;
  latitude: number;
  longitude: number;
  surfaceTemperature: number;
  emcAverage: number; // Equilibrium Moisture Content - Average
  emcPeak: number; // Equilibrium Moisture Content - Peak
  cumulativeUV: number;
  riskAssessment: RiskAssessment;
  // Raw NASA POWER API data
  rawClimateData: ClimateData;
}

export interface RiskAssessment {
  crackingRisk: 'Low' | 'Medium' | 'High';
  agingRate: number; // Relative aging factor
  moistureStress: 'Low' | 'Medium' | 'High';
}

export interface AnalysisConfig {
  startDate: string;
  endDate: string;
  surfaceProperties: SurfaceProperties;
  aggregationLevel: 'daily' | 'weekly' | 'monthly';
}