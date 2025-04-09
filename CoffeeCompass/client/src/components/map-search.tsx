import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { CoffeeShop } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Search, Coffee, MapPin } from 'lucide-react';
import CoffeeFilters, { FilterOptions } from './coffee-filters';
import MapPreview from './map-preview';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyD239EZTP6JAnyB9wgADoOuGpJU1sFDrLc';

// Coffee icon for markers
const COFFEE_ICON = {
  url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTcgOHY4YTEgMSAwIDAgMS0xIDFIN2ExIDEgMCAwIDEtMS0xVjhjMC0zLjcxNCAyLjkzNC01LjUgNS41LTUuNVM3LjQzOCA0LjI4NiAxNyA4WiIgZmlsbD0iI2M4YTI3YSIgc3Ryb2tlPSIjMzkyYzFlIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik04IDh2OGg4VjhjMC0zLjM3MS0xLjkzNC00LjUtNC40MzgtNC41UzggNC42MjkgOCA4WiIgZmlsbD0iI2U2ZDljOCIvPjxwYXRoIGQ9Ik0xOSA4VjljMCAxLjEwNS0xLjM0MyAyLTMgMnMtMy0uODk1LTMtMlY4TTEgMTloMjIiIHN0cm9rZT0iIzM5MmMxZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNCIgcj0iMTAiIGZpbGw9IiNjOGEyN2EiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PC9zdmc+',
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true
};

interface MapSearchProps {
  onShopSelect?: (shop: CoffeeShop) => void;
  defaultCenter?: [number, number];
  simplified?: boolean;
  height?: string;
}

export default function MapSearch({ 
  onShopSelect, 
  defaultCenter = [48.8566, 2.3522], // Paris coordinates by default
  simplified = false,
  height = '400px'
}: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('name');
  const [mapCenter, setMapCenter] = useState({ lat: defaultCenter[0], lng: defaultCenter[1] });
  const [isLocating, setIsLocating] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [1, 5],
    openNow: false,
    coffeeStyle: [],
    coffeeBrands: [],
    machineBrands: [],
    isIndependent: null,
    rating: 0,
    coffeeQuality: 0,
    ambience: 0,
    service: 0,
    workability: 0,
    menuVariety: 0,
    priceValue: 0,
    dietaryOptions: [],
    noiseLevel: [],
    seatingOptions: [],
    laptopFriendly: null
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });
  
  const { data: shops = [] } = useQuery<CoffeeShop[]>({
    queryKey: ["/api/coffee-shops"],
  });
  
  const filteredShops = shops.filter((shop) => {
    // Apply text search filter
    if (query) {
      const matchesQuery = 
        shop.name.toLowerCase().includes(query.toLowerCase()) ||
        shop.address.toLowerCase().includes(query.toLowerCase());
      
      if (!matchesQuery) return false;
    }
    
    // Apply additional filters if they exist
    if (filters) {
      // Filter by coffee brand
      if (filters.coffeeBrands.length > 0) {
        if (!shop.coffeeBrand || !filters.coffeeBrands.some(brand => 
          shop.coffeeBrand?.toLowerCase().includes(brand.toLowerCase()))) {
          return false;
        }
      }
      
      // In a real app, we would filter by other criteria here
      // For this demo, we'll assume these filters pass
    }
    
    return true;
  });
  
  const handleSearch = () => {
    // If we have filtered shops and they have coordinates, center on the first one
    if (filteredShops.length > 0 && filteredShops[0].latitude && filteredShops[0].longitude) {
      setMapCenter({ lat: filteredShops[0].latitude, lng: filteredShops[0].longitude });
      if (map) {
        map.panTo({ lat: filteredShops[0].latitude, lng: filteredShops[0].longitude });
        map.setZoom(13);
      }
    }
  };

  // Function to get user's current location
  const getUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(userLocation);
          if (map) {
            map.panTo(userLocation);
            map.setZoom(14);
          }
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          // Fall back to default center if there's an error
          setMapCenter({ lat: defaultCenter[0], lng: defaultCenter[1] });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setIsLocating(false);
      setMapCenter({ lat: defaultCenter[0], lng: defaultCenter[1] });
    }
  };

  useEffect(() => {
    // Try to get user location when component mounts
    getUserLocation();
  }, []);
  
  useEffect(() => {
    // If defaultCenter changes, update mapCenter
    if (!isLocating) {
      setMapCenter({ lat: defaultCenter[0], lng: defaultCenter[1] });
    }
  }, [defaultCenter, isLocating]);
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
  
  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);
  
  const handleMarkerClick = (shop: CoffeeShop) => {
    // Only set the selected shop to show the preview
    // Navigation will now happen from the preview component via the "See more" button
    setSelectedShop(shop);
  };
  
  const closeInfoWindow = () => {
    setSelectedShop(null);
  };
  
  // Render search filters
  const renderSearchControls = () => {
    if (!simplified) {
      return (
        <Tabs defaultValue="name" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="name">Search by Name</TabsTrigger>
            <TabsTrigger value="address">Search by Address</TabsTrigger>
          </TabsList>
          
          <TabsContent value="name" className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coffee shop name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              <Button 
                onClick={getUserLocation} 
                variant="outline"
                className="w-full"
                disabled={isLocating}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isLocating ? "Locating..." : "Use My Location"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="address" className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter address..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              <Button 
                onClick={getUserLocation}

                variant="outline"
                className="w-full"
                disabled={isLocating}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isLocating ? "Locating..." : "Use My Location"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="h-5 w-5 text-[var(--coffee-brown)]" />
            </div>
            <input
              type="text"
              placeholder="Search for a coffee place..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full py-4 px-14 border border-[var(--coffee-light)] bg-white text-stone-700 focus:outline-none focus:border-[var(--coffee-brown)] transition-colors rounded-none text-sm placeholder:text-stone-400 shadow-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button 
                onClick={handleSearch}
                className="bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] text-white p-2 rounded-sm transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <CoffeeFilters onFilterChange={handleFilterChange} />
        </div>
      );
    }
  };
  
  // Render map markers
  const renderMarkers = () => {
    return filteredShops.map((shop) => {
      if (shop.latitude && shop.longitude) {
        return (
          // @ts-ignore - Ignore TypeScript errors for Marker component
          <Marker 
            key={shop.id} 
            position={{ lat: shop.latitude, lng: shop.longitude }}
            icon={COFFEE_ICON}
            onClick={() => handleMarkerClick(shop)}
          />
        );
      }
      return null;
    });
  };
  
  // Render shop preview
  const renderShopPreview = () => {
    if (selectedShop) {
      return (
        <MapPreview shop={selectedShop} onClose={closeInfoWindow} />
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-4">
      {renderSearchControls()}
      
      <div className="overflow-hidden border border-[var(--coffee-light)]" style={{ height }}>
        {isLoaded ? (
          // @ts-ignore - Ignore TypeScript errors for GoogleMap component
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          >
            {renderMarkers()}
            {renderShopPreview()}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100">
            <p>Loading map...</p>
          </div>
        )}
      </div>
    </div>
  );
}