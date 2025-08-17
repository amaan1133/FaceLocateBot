export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface LocationError {
  name: string;
  message: string;
}

export class LocationService {
  getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          name: 'Not Supported',
          message: 'Geolocation is not supported by this browser.'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(this.handleLocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  private handleLocationError(error: GeolocationPositionError): LocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          name: 'Permission Denied',
          message: 'Location access was denied. Please allow location permissions and try again.'
        };
      case error.POSITION_UNAVAILABLE:
        return {
          name: 'Position Unavailable',
          message: 'Location information is unavailable. Please check your device settings.'
        };
      case error.TIMEOUT:
        return {
          name: 'Timeout',
          message: 'Location request timed out. Please try again.'
        };
      default:
        return {
          name: 'Location Error',
          message: error.message || 'An unknown location error occurred.'
        };
    }
  }
}

export const locationService = new LocationService();
