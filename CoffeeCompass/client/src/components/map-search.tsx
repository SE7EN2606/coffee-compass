import { useCallback, useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import type { Location } from "@/lib/apiConfig";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoffeeShop } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Search, Coffee, MapPin } from 'lucide-react';
import CoffeeFilters, { FilterOptions } from './coffee-filters';
import MapPreview from './map-preview';

const libraries = ["places"];

interface MapSearchProps {
  onShopSelect?: (shop: CoffeeShop) => void;
  defaultCenter?: [number, number];
  simplified?: boolean;
  height?: string;
}

export default function CoffeeMapSearch({
  onShopSelect,
  defaultCenter = [48.8566, 2.3522],
  simplified = false,
  height = '400px'
}: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('name');
  const [mapCenter, setMapCenter] = useState({ lat: defaultCenter[0], lng: defaultCenter[1] });
  const [isLocating, setIsLocating] = useState(false);
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
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

  const { data: shops = [] } = useQuery<CoffeeShop[]>({
    queryKey: ["/api/coffee-shops"],
  });

  const filteredShops = shops.filter((shop) => {
    if (query) {
      const matchesQuery =
        shop.name.toLowerCase().includes(query.toLowerCase()) ||
        shop.address.toLowerCase().includes(query.toLowerCase());

      if (!matchesQuery) return false;
    }

    if (filters.coffeeBrands.length > 0) {
      if (!shop.coffeeBrand || !filters.coffeeBrands.some(brand =>
        shop.coffeeBrand?.toLowerCase().includes(brand.toLowerCase()))) {
        return false;
      }
    }

    return true;
  });

  const handleSearch = () => {
    if (filteredShops.length > 0 && filteredShops[0].latitude && filteredShops[0].longitude) {
      setMapCenter({ lat: filteredShops[0].latitude, lng: filteredShops[0].longitude });
    }
  };

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
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
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
    getUserLocation();
  }, []);

  useEffect(() => {
    if (!isLocating) {
      setMapCenter({ lat: defaultCenter[0], lng: defaultCenter[1] });
    }
  }, [defaultCenter, isLocating]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleMarkerClick = (shop: CoffeeShop) => {
    setSelectedShop(shop);
    onShopSelect?.(shop);
  };

  const closeInfoWindow = () => {
    setSelectedShop(null);
  };

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
    }

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
  };

  return (
    <div className="space-y-4">
      {renderSearchControls()}

      <div className="overflow-hidden border border-[var(--coffee-light)]" style={{ height }}>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={13}
          >
            {filteredShops.map((shop) => (
              shop.latitude && shop.longitude && (
                <Marker
                  key={shop.id}
                  position={{ lat: shop.latitude, lng: shop.longitude }}
                  onClick={() => handleMarkerClick(shop)}
                />
              )
            ))}
          </GoogleMap>
        </LoadScript>
      </div>

      {selectedShop && (
        <MapPreview shop={selectedShop} onClose={closeInfoWindow} />
      )}
    </div>
  );
}