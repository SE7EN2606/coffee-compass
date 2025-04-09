import { useEffect, useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Make sure the scaledSize and anchor are created correctly for Google Maps API
const COFFEE_ICON = {
  url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTcgOHY4YTEgMSAwIDAgMS0xIDFIN2ExIDEgMCAwIDEtMS0xVjhjMC0zLjcxNCAyLjkzNC01LjUgNS41LTUuNVM3LjQzOCA0LjI4NiAxNyA4WiIgZmlsbD0iI2M4YTI3YSIgc3Ryb2tlPSIjMzkyYzFlIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik04IDh2OGg4VjhjMC0zLjM3MS0xLjkzNC00LjUtNC40MzgtNC41UzggNC42MjkgOCA4WiIgZmlsbD0iI2U2ZDljOCIvPjxwYXRoIGQ9Ik0xOSA4VjljMCAxLjEwNS0xLjM0MyAyLTMgMnMtMy0uODk1LTMtMlY4TTEgMTloMjIiIHN0cm9rZT0iIzM5MmMxZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNCIgcj0iMTAiIGZpbGw9IiNjOGEyN2EiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PC9zdmc+',
};

const containerStyle = {
  width: '100%',
  height: '300px'
};

const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyD239EZTP6JAnyB9wgADoOuGpJU1sFDrLc';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onPositionChange?: (lat: number, lng: number) => void;
}

export default function MapPicker({ latitude, longitude, onPositionChange }: MapPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const center = { lat: latitude ?? 20, lng: longitude ?? 0 };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(function callback(e: google.maps.MapMouseEvent) {
    if (e.latLng && onPositionChange) {
      onPositionChange(e.latLng.lat(), e.latLng.lng());
    }
  }, [onPositionChange]);

  useEffect(() => {
    if (map && latitude && longitude) {
      map.panTo({ lat: latitude, lng: longitude });
      map.setZoom(13);
    }
  }, [latitude, longitude, map]);

  return isLoaded ? (
    // @ts-ignore - Ignore TypeScript errors for GoogleMap component
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={latitude && longitude ? 13 : 2}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={defaultOptions}
    >
      {latitude && longitude && (
        // @ts-ignore - Ignore TypeScript errors for Marker component
        <Marker 
          position={{ lat: latitude, lng: longitude }}
          icon={COFFEE_ICON}
        />
      )}
    </GoogleMap>
  ) : <div>Loading map...</div>;
}