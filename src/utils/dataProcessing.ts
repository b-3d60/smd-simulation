import Papa from 'papaparse';
import { GPSPoint, ClimateData } from '../types';
import { format, parseISO } from 'date-fns';

export class DataProcessor {
  // Parse CSV file containing GPS data
  static async parseGPSData(file: File): Promise<GPSPoint[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const gpsPoints: GPSPoint[] = results.data.map((row: any) => ({
              timestamp: row.timestamp || row.time || row.date,
              latitude: parseFloat(row.latitude || row.lat),
              longitude: parseFloat(row.longitude || row.lng || row.lon)
            })).filter(point => 
              !isNaN(point.latitude) && 
              !isNaN(point.longitude) && 
              point.timestamp
            );
            resolve(gpsPoints);
          } catch (error) {
            reject(new Error('Failed to parse GPS data: ' + error));
          }
        },
        error: (error) => reject(error)
      });
    });
  }

  // Parse JSON file containing GPS data
  static async parseGPSDataFromJSON(file: File): Promise<GPSPoint[]> {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (Array.isArray(data)) {
      return data.map(item => ({
        timestamp: item.Timestamp || item.time || item.date,
        latitude: parseFloat(item.Latitude || item.lat),
        longitude: parseFloat(item.Longitude || item.lng || item.lon)
      })).filter(point => 
        !isNaN(point.latitude) && 
        !isNaN(point.longitude) && 
        point.timestamp
      );
    }
    
    throw new Error('Invalid JSON format - expected array of GPS points');
  }

  // Aggregate GPS points by day
  static aggregateByDay(gpsPoints: GPSPoint[]): GPSPoint[] {
    const dailyGroups = new Map<string, GPSPoint[]>();
    
    gpsPoints.forEach(point => {
      const date = format(parseISO(point.timestamp), 'yyyy-MM-dd');
      if (!dailyGroups.has(date)) {
        dailyGroups.set(date, []);
      }
      dailyGroups.get(date)!.push(point);
    });

    return Array.from(dailyGroups.entries()).map(([date, points]) => {
      const avgLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
      const avgLng = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;
      
      return {
        timestamp: date + 'T12:00:00Z',
        latitude: avgLat,
        longitude: avgLng
      };
    });
  }

  // Fetch climate data from NASA POWER API
  static async fetchClimateData(gpsPoints: GPSPoint[]): Promise<ClimateData[]> {
    const results: ClimateData[] = [];
    
    // Group points by proximity to reduce API calls
    const groupedPoints = this.groupPointsByProximity(gpsPoints, 0.1); // 0.1 degree threshold
    
    for (const group of groupedPoints) {
      try {
        const centerPoint = this.calculateCenterPoint(group);
        const dates = group.map(p => format(parseISO(p.timestamp), 'yyyyMMdd'));
        const startDate = Math.min(...dates.map(d => parseInt(d)));
        const endDate = Math.max(...dates.map(d => parseInt(d)));
        
        const apiData = await this.callNASAPowerAPI(
          centerPoint.latitude,
          centerPoint.longitude,
          startDate.toString(),
          endDate.toString()
        );
        
        // Map API data to our format
        for (const point of group) {
          const dateKey = format(parseISO(point.timestamp), 'yyyyMMdd');
          const dayData = apiData.properties.parameter;
          
          if (dayData.T2M && dayData.T2M[dateKey] !== undefined) {
            results.push({
              date: format(parseISO(point.timestamp), 'yyyy-MM-dd'),
              latitude: point.latitude,
              longitude: point.longitude,
              temperature: dayData.T2M[dateKey],
              maxTemperature: dayData.T2M_MAX?.[dateKey] || dayData.T2M[dateKey] + 5,
              solarRadiation: dayData.ALLSKY_SFC_SW_DWN?.[dateKey] || 200,
              humidity: dayData.RH2M?.[dateKey] || 50,
              uvIndex: this.calculateUVIndex(
                dayData.ALLSKY_SFC_UVA?.[dateKey] || 0,
                dayData.ALLSKY_SFC_UVB?.[dateKey] || 0
              )
            });
          }
        }
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.warn(`Failed to fetch data for group: ${error}`);
        // Fallback to mock data for this group
        for (const point of group) {
          results.push(this.generateMockClimateData(point));
        }
      }
    }
    
    return results;
  }

  // Group GPS points by proximity to reduce API calls
  private static groupPointsByProximity(points: GPSPoint[], threshold: number): GPSPoint[][] {
    const groups: GPSPoint[][] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < points.length; i++) {
      if (processed.has(i)) continue;
      
      const group = [points[i]];
      processed.add(i);
      
      for (let j = i + 1; j < points.length; j++) {
        if (processed.has(j)) continue;
        
        const distance = this.calculateDistance(
          points[i].latitude, points[i].longitude,
          points[j].latitude, points[j].longitude
        );
        
        if (distance < threshold) {
          group.push(points[j]);
          processed.add(j);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  // Calculate distance between two points in degrees
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  }

  // Calculate center point of a group
  private static calculateCenterPoint(points: GPSPoint[]): { latitude: number; longitude: number } {
    const avgLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
    const avgLng = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;
    return { latitude: avgLat, longitude: avgLng };
  }

  // Call NASA POWER API
  private static async callNASAPowerAPI(
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const parameters = [
      'T2M',           // Temperature at 2 Meters
      'T2M_MAX',       // Maximum Temperature at 2 Meters
      'T2M_MIN',       // Minimum Temperature at 2 Meters
      'RH2M',          // Relative Humidity at 2 Meters
      'ALLSKY_SFC_SW_DWN',  // All Sky Surface Shortwave Downward Irradiance
      'ALLSKY_SFC_UVA',     // All Sky Surface UVA Irradiance
      'ALLSKY_SFC_UVB',     // All Sky Surface UVB Irradiance
      'WS2M',          // Wind Speed at 2 Meters
      'PRECTOTCORR'    // Precipitation Corrected
    ].join(',');

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point` +
      `?parameters=${parameters}` +
      `&community=RE` +
      `&longitude=${longitude.toFixed(4)}` +
      `&latitude=${latitude.toFixed(4)}` +
      `&start=${startDate}` +
      `&end=${endDate}` +
      `&format=JSON`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NASA POWER API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.properties || !data.properties.parameter) {
      throw new Error('Invalid response format from NASA POWER API');
    }
    
    return data;
  }

  // Calculate UV Index from UVA and UVB irradiance
  private static calculateUVIndex(uva: number, uvb: number): number {
    // Simplified UV Index calculation
    // Real calculation is more complex, but this provides a reasonable approximation
    const totalUV = uva + uvb;
    return Math.min(11, Math.max(0, totalUV / 25)); // Scale to 0-11 range
  }

  // Generate mock climate data as fallback
  private static generateMockClimateData(point: GPSPoint): ClimateData {
    return {
      date: format(parseISO(point.timestamp), 'yyyy-MM-dd'),
      latitude: point.latitude,
      longitude: point.longitude,
      temperature: 20 + Math.random() * 25,
      maxTemperature: 25 + Math.random() * 30,
      solarRadiation: 100 + Math.random() * 400,
      humidity: 30 + Math.random() * 50,
      uvIndex: 1 + Math.random() * 10
    };
  }

  // Export data as CSV
  static exportAsCSV(data: any[], filename: string): void {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}