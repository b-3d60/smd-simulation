import { ClimateData, SurfaceProperties, AnalysisResult, RiskAssessment } from '../types';

export class ClimateCalculations {
  // Calculate surface temperature using solar radiation and material properties
  static calculateSurfaceTemperature(
    airTemp: number,
    solarRadiation: number,
    properties: SurfaceProperties
  ): number {
    // Stefan-Boltzmann constant (W/m²K⁴)
    const sigma = 5.67e-8;
    
    // Absorbed solar radiation
    const absorgedRadiation = solarRadiation * (1 - properties.albedo);
    
    // Simplified model: Surface temp = Air temp + radiation heating effect
    const radiationEffect = absorgedRadiation / (properties.emissivity * sigma * 20); // Simplified
    
    return airTemp + radiationEffect * 0.1; // Scaling factor for realistic values
  }

  // Calculate Equilibrium Moisture Content using Kay's method (1951)
  static calculateEMC(temperature: number, humidity: number): { average: number; peak: number } {
    // Kay's formula approximation for wood EMC
    // EMC = (330 + 0.452 * RH + 0.00415 * RH²) / (100 + 1.27 * RH + 0.0135 * RH²)
    const rh = Math.min(humidity, 95); // Cap at 95% to avoid extreme values
    
    const average = (330 + 0.452 * rh + 0.00415 * rh * rh) / 
                   (100 + 1.27 * rh + 0.0135 * rh * rh);
    
    // Peak EMC considers temperature effect
    const tempFactor = 1 + (temperature - 20) * 0.02; // Temperature correction
    const peak = average * tempFactor;
    
    return {
      average: Math.max(0, average),
      peak: Math.max(0, peak)
    };
  }

  // Calculate cumulative UV exposure
  static calculateCumulativeUV(uvIndex: number, hours: number = 24): number {
    // Simplified cumulative UV calculation
    return uvIndex * hours * 0.1; // Scaling for daily accumulation
  }

  // Assess material risks based on environmental conditions
  static assessRisks(
    surfaceTemp: number,
    emcAverage: number,
    emcPeak: number,
    cumulativeUV: number
  ): RiskAssessment {
    // Cracking risk based on surface temperature
    let crackingRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (surfaceTemp > 60) crackingRisk = 'High';
    else if (surfaceTemp > 40) crackingRisk = 'Medium';

    // Moisture stress based on EMC variation
    const emcVariation = Math.abs(emcPeak - emcAverage);
    let moistureStress: 'Low' | 'Medium' | 'High' = 'Low';
    if (emcVariation > 5) moistureStress = 'High';
    else if (emcVariation > 3) moistureStress = 'Medium';

    // Aging rate based on UV and temperature
    const agingRate = 1 + (cumulativeUV / 100) + (surfaceTemp - 20) * 0.05;

    return {
      crackingRisk,
      agingRate: Math.max(1, agingRate),
      moistureStress
    };
  }

  // Process climate data into analysis results
  static processClimateData(
    climateData: ClimateData[],
    surfaceProperties: SurfaceProperties
  ): AnalysisResult[] {
    return climateData.map(data => {
      const surfaceTemperature = this.calculateSurfaceTemperature(
        data.temperature,
        data.solarRadiation,
        surfaceProperties
      );

      const emc = this.calculateEMC(data.temperature, data.humidity);
      const cumulativeUV = this.calculateCumulativeUV(data.uvIndex);
      
      const riskAssessment = this.assessRisks(
        surfaceTemperature,
        emc.average,
        emc.peak,
        cumulativeUV
      );

      return {
        date: data.date,
        latitude: data.latitude,
        longitude: data.longitude,
        surfaceTemperature,
        emcAverage: emc.average,
        emcPeak: emc.peak,
        cumulativeUV,
        riskAssessment,
        rawClimateData: data // Include raw NASA POWER data
      };
    });
  }
}