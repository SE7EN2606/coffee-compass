import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertCoffeeShop, insertCoffeeShopSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Coffee, MapPin, Star, Info, X, ChevronDown } from "lucide-react";
import Rating from "./rating";
import MapPicker from "./map-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Coffee brands list (multi-select)
const COFFEE_BRANDS = [
  "Starbucks", "Costa Coffee", "Dunkin'", "Tim Hortons", "Peet's Coffee", 
  "Blue Bottle", "Lavazza", "illy", "La Colombe", "Intelligentsia", 
  "Counter Culture", "Death Wish Coffee", "Stumptown", "Caribou Coffee",
  "Folgers", "Maxwell House", "Nescafé", "Local Roaster", "Other"
];

// Coffee styles list
const COFFEE_STYLES = [
  "Espresso", "Cappuccino", "Caffe Latte", "Flat White", "Mocha", 
  "Cold Brew", "Drip Coffee", "V60", "French Press", "Aeropress", "Turkish"
];

// Machine brands list (single-select)
const MACHINE_BRANDS = [
  "La Marzocco", "Slayer", "Rocket Espresso", "Nuova Simonelli", "Victoria Arduino",
  "Breville", "De'Longhi", "Gaggia", "Jura", "Rancilio", "Keurig", "Nespresso",
  "Philips", "Saeco", "Mr. Coffee", "Bunn", "Technivorm Moccamaster", "Chemex",
  "Hario", "AeroPress", "Other"
];

// Noise level options
const NOISE_LEVELS = [
  "Very Quiet (Library-like)",
  "Quiet (Background music)",
  "Moderate (Conversation friendly)",
  "Lively (Bustling atmosphere)",
  "Loud (Energetic environment)"
];

// Seating options
const SEATING_OPTIONS = [
  "Bar Seating",
  "Communal Tables",
  "Individual Tables",
  "Lounge Seating",
  "Outdoor Seating",
  "Window Seating"
];

// Dietary options
const DIETARY_OPTIONS = [
  "Vegan Options",
  "Vegetarian Friendly",
  "Gluten-Free Options",
  "Dairy Alternatives",
  "Sugar-Free Options",
  "Keto Friendly",
  "Low Carb Options"
];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1445510491599-c5fb6ca0c77a",
  "https://images.unsplash.com/photo-1481277542470-605612bd2d61",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85",
  "https://images.unsplash.com/photo-1446321423766-c339f030bd0a",
  "https://images.unsplash.com/photo-1525088553748-01d6e210e00b",
  "https://images.unsplash.com/photo-1495774856032-8b90bbb32b32",
];

interface PlaceSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

// This function uses the Google Places API to search for places
async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  try {
    console.log("Searching for places with query:", query);
    // Use Google Places API via server endpoint
    const response = await fetch(
      `/api/places/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Search places API error:", errorData);
      throw new Error(`Failed to fetch place suggestions: ${errorData.error || ''}`);
    }

    const data = await response.json();
    console.log("Received place suggestions:", data);
    return data.map((prediction: any) => ({
      description: prediction.description || '',
      placeId: prediction.place_id || '',
      mainText: prediction.structured_formatting?.main_text || prediction.description,
      secondaryText: prediction.structured_formatting?.secondary_text || ''
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

// Function to get place details from Google Places API
async function getPlaceDetails(placeId: string) {
  try {
    // This is the server endpoint that proxies the request to Google
    const response = await fetch(`/api/places/details?placeId=${placeId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

export default function AddShopDialog() {
  const [open, setOpen] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basics');
  
  // Selected options for multi-select fields
  const [selectedCoffeeStyles, setSelectedCoffeeStyles] = useState<string[]>([]);
  const [selectedCoffeeBrands, setSelectedCoffeeBrands] = useState<string[]>([]);
  const [selectedMachineBrands, setSelectedMachineBrands] = useState<string[]>([]);
  const [selectedSeatingOptions, setSelectedSeatingOptions] = useState<string[]>([]);
  const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 5]);

  // Define a custom type that extends InsertCoffeeShop with rating, visited, and wantToGo
  type ShopFormData = InsertCoffeeShop & {
    rating: number,
    visited: boolean,
    wantToGo: boolean,
    googleUrl?: string
  };

  const form = useForm<ShopFormData>({
    resolver: zodResolver(insertCoffeeShopSchema.extend({
      rating: z.number().min(1).max(5).optional(),
      visited: z.boolean().default(false),
      wantToGo: z.boolean().default(false),
      googleUrl: z.string().url().optional()
    })),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      imageUrl: SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
      coffeeBrands: "[]",
      machineBrands: "[]",
      coffeeStyles: "[]",
      priceRange: "[1, 5]",
      openNow: false,
      isIndependent: false,
      coffeeQuality: 3,
      ambience: 3,
      service: 3,
      workability: 3,
      menuVariety: 3,
      priceValue: 3,
      dietaryOptions: "[]",
      noiseLevel: NOISE_LEVELS[2], // Default to "Moderate"
      seatingOptions: "[]",
      laptopFriendly: false,
      latitude: undefined,
      longitude: undefined,
      website: "",
      phone: "",
      googleUrl: "",
      openingHours: "{}",
      rating: 0,
      visited: false,
      wantToGo: false,
    },
  });

  const handlePlaceSearch = async (value: string) => {
    if (value.length < 3) {
      setPlaceSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const suggestions = await searchPlaces(value);
      setPlaceSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting place suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to get place suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce the place search
  useEffect(() => {
    const name = form.getValues("name");
    if (!name) {
      setPlaceSuggestions([]);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      handlePlaceSearch(name);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.watch("name")]);

  const selectPlace = async (suggestion: PlaceSuggestion) => {
    // Set the coffee shop name from the suggestion
    form.setValue("name", suggestion.mainText);
    setPlaceSuggestions([]);

    // Fetch additional details using the place ID
    if (suggestion.placeId) {
      try {
        const details = await getPlaceDetails(suggestion.placeId);
        if (details) {
          // Populate additional fields from place details
          if (details.formatted_address) {
            form.setValue("address", details.formatted_address);
          }
          
          if (details.geometry?.location) {
            form.setValue("latitude", details.geometry.location.lat);
            form.setValue("longitude", details.geometry.location.lng);
          }
          
          if (details.website) {
            form.setValue("website", details.website);
          }
          
          if (details.url) {
            form.setValue("googleUrl", details.url);
          }
          
          if (details.formatted_phone_number) {
            form.setValue("phone", details.formatted_phone_number);
          }
          
          if (details.photoUrl) {
            form.setValue("imageUrl", details.photoUrl);
          }
          
          if (details.opening_hours) {
            form.setValue("openingHours", JSON.stringify(details.opening_hours));
            form.setValue("openNow", details.opening_hours.open_now || false);
          }
        }
      } catch (error) {
        console.error('Error getting place details:', error);
      }
    }
  };

  // Toggle selection for multi-select fields
  const toggleCoffeeStyle = (style: string) => {
    if (selectedCoffeeStyles.includes(style)) {
      setSelectedCoffeeStyles(selectedCoffeeStyles.filter(s => s !== style));
    } else {
      setSelectedCoffeeStyles([...selectedCoffeeStyles, style]);
    }
    form.setValue("coffeeStyles", JSON.stringify(
      selectedCoffeeStyles.includes(style) 
        ? selectedCoffeeStyles.filter(s => s !== style)
        : [...selectedCoffeeStyles, style]
    ));
  };

  const toggleCoffeeBrand = (brand: string) => {
    if (selectedCoffeeBrands.includes(brand)) {
      setSelectedCoffeeBrands(selectedCoffeeBrands.filter(b => b !== brand));
    } else {
      setSelectedCoffeeBrands([...selectedCoffeeBrands, brand]);
    }
    form.setValue("coffeeBrands", JSON.stringify(
      selectedCoffeeBrands.includes(brand)
        ? selectedCoffeeBrands.filter(b => b !== brand)
        : [...selectedCoffeeBrands, brand]
    ));
  };

  const toggleMachineBrand = (brand: string) => {
    if (selectedMachineBrands.includes(brand)) {
      setSelectedMachineBrands(selectedMachineBrands.filter(b => b !== brand));
    } else {
      setSelectedMachineBrands([...selectedMachineBrands, brand]);
    }
    form.setValue("machineBrands", JSON.stringify(
      selectedMachineBrands.includes(brand)
        ? selectedMachineBrands.filter(b => b !== brand)
        : [...selectedMachineBrands, brand]
    ));
  };

  const toggleSeatingOption = (option: string) => {
    if (selectedSeatingOptions.includes(option)) {
      setSelectedSeatingOptions(selectedSeatingOptions.filter(o => o !== option));
    } else {
      setSelectedSeatingOptions([...selectedSeatingOptions, option]);
    }
    form.setValue("seatingOptions", JSON.stringify(
      selectedSeatingOptions.includes(option)
        ? selectedSeatingOptions.filter(o => o !== option)
        : [...selectedSeatingOptions, option]
    ));
  };

  const toggleDietaryOption = (option: string) => {
    if (selectedDietaryOptions.includes(option)) {
      setSelectedDietaryOptions(selectedDietaryOptions.filter(o => o !== option));
    } else {
      setSelectedDietaryOptions([...selectedDietaryOptions, option]);
    }
    form.setValue("dietaryOptions", JSON.stringify(
      selectedDietaryOptions.includes(option)
        ? selectedDietaryOptions.filter(o => o !== option)
        : [...selectedDietaryOptions, option]
    ));
  };

  const updatePriceRange = (min: number, max: number) => {
    setPriceRange([min, max]);
    form.setValue("priceRange", JSON.stringify([min, max]));
  };

  const mutation = useMutation({
    mutationFn: async (formData: ShopFormData) => {
      console.log("Submitting form data:", formData);
      
      // Create the coffee shop with all the new fields
      const shopData = {
        name: formData.name,
        address: formData.address,
        description: formData.description || "A cozy coffee shop", // Provide default if missing
        imageUrl: formData.imageUrl,
        coffeeBrands: JSON.stringify(selectedCoffeeBrands),
        machineBrands: JSON.stringify(selectedMachineBrands),
        coffeeStyles: JSON.stringify(selectedCoffeeStyles),
        priceRange: JSON.stringify(priceRange),
        openNow: formData.openNow,
        isIndependent: formData.isIndependent,
        coffeeQuality: formData.coffeeQuality,
        ambience: formData.ambience,
        service: formData.service,
        workability: formData.workability,
        menuVariety: formData.menuVariety,
        priceValue: formData.priceValue,
        dietaryOptions: JSON.stringify(selectedDietaryOptions),
        noiseLevel: formData.noiseLevel,
        seatingOptions: JSON.stringify(selectedSeatingOptions),
        laptopFriendly: formData.laptopFriendly,
        latitude: formData.latitude || 48.8566, // Default Paris latitude
        longitude: formData.longitude || 2.3522, // Default Paris longitude
        website: formData.website || "",
        phone: formData.phone || "",
        googleUrl: formData.googleUrl || "",
        openingHours: formData.openingHours || "{}"
      };
      
      console.log("Sending shop data to API:", shopData);
      
      try {
        const res = await apiRequest("POST", "/api/coffee-shops", shopData);
        const shop = await res.json();
        console.log("API response:", shop);
        
        // If the user provided a rating, submit it
        if (formData.rating > 0 || formData.visited || formData.wantToGo) {
          try {
            await apiRequest("POST", `/api/coffee-shops/${shop.id}/ratings`, {
              rating: formData.rating || 0,
              visited: formData.visited,
              wantToGo: formData.wantToGo
            });
          } catch (error) {
            console.error("Error submitting rating:", error);
            // Continue anyway, since the shop was created
          }
        }
        
        return shop;
      } catch (error) {
        console.error("Error creating coffee shop:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coffee-shops"] });
      toast({
        title: "Coffee shop added",
        description: "Your coffee shop has been successfully added.",
      });
      setOpen(false);
      form.reset();
      setSelectedCoffeeStyles([]);
      setSelectedCoffeeBrands([]);
      setSelectedMachineBrands([]);
      setSelectedSeatingOptions([]);
      setSelectedDietaryOptions([]);
      setPriceRange([1, 5]);
      setActiveTab('basics');
    },
    onError: (error) => {
      console.error('Error adding coffee shop:', error);
      toast({
        title: "Error",
        description: "Failed to add coffee shop. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Render rating control for category
  const renderRatingControl = (name: keyof ShopFormData, label: string, description: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <div className="flex items-center justify-between">
            <FormLabel className="text-sm font-medium text-stone-700">{label}</FormLabel>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    Number(field.value) >= value
                      ? 'text-yellow-500'
                      : 'text-stone-300'
                  }`}
                  onClick={() => field.onChange(value)}
                >
                  <Star className={`h-6 w-6 ${Number(field.value) >= value ? 'fill-yellow-400' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          <FormDescription className="text-xs text-stone-500">{description}</FormDescription>
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="barista-button flex items-center px-6 py-3 text-base"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          ADD NEW PLACE
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-none z-[9999] bg-white">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Coffee className="h-8 w-8 text-[var(--coffee-brown)]" />
          </div>
          <DialogTitle className="text-center text-2xl font-serif text-[var(--text-primary)]">
            ADD NEW PLACE
          </DialogTitle>
          <DialogDescription className="text-center text-[var(--text-secondary)]">
            Share your favorite place with the community.
          </DialogDescription>
          <div className="mt-2 text-center text-sm text-red-500">
            Fields marked with <span className="text-red-500">*</span> are required
          </div>
        </DialogHeader>

        <Tabs defaultValue="basics" className="w-full mt-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="basics">Basic Info</TabsTrigger>
            <TabsTrigger value="ratings">Rating & Experience</TabsTrigger>
            <TabsTrigger value="details">Additional Details</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit((data) => {
                  console.log("Form submitted with data:", data);
                  mutation.mutate(data);
                })();
              }}
              className="space-y-6"
            >
              <TabsContent value="basics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-[var(--coffee-dark)] font-medium">
                          Coffee Shop Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="Type to search for coffee shops..."
                              className="rounded-sm border-stone-300 focus:border-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)] transition-colors pl-10"
                              autoComplete="off" // Disable browser autocomplete to avoid conflicts
                            />
                            {isSearching && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-[var(--coffee-brown)] border-t-transparent rounded-full"></div>
                              </div>
                            )}
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          </div>
                        </FormControl>
                        {placeSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full bg-white shadow-lg rounded-sm mt-1 max-h-60 overflow-auto border border-stone-200">
                            {placeSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="p-3 hover:bg-stone-100 cursor-pointer flex items-start border-b border-stone-100 last:border-b-0"
                                onClick={() => selectPlace(suggestion)}
                              >
                                <MapPin className="h-5 w-5 text-[var(--coffee-brown)] mt-1 mr-3 flex-shrink-0" />
                                <div>
                                  <span className="text-sm font-semibold text-[var(--coffee-dark)]">{suggestion.mainText}</span>
                                  {suggestion.secondaryText && (
                                    <p className="text-xs text-gray-500 mt-0.5">{suggestion.secondaryText}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  {/* Address Field with Suggestions */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-[var(--coffee-dark)] font-medium">
                          Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="Search for address..."
                              className="rounded-sm border-stone-300 focus:border-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)] transition-colors pl-10"
                            />
                            {isSearching && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-[var(--coffee-brown)] border-t-transparent rounded-full"></div>
                              </div>
                            )}
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          </div>
                        </FormControl>
                        {/* Address doesn't need suggestions, since they come from selecting a place */}
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>



                <div className="space-y-6">
                  {/* Map Picker Component */}
                  <div className="rounded-md overflow-hidden border border-stone-300 h-60">
                    <MapPicker
                      latitude={form.watch("latitude")}
                      longitude={form.watch("longitude")}
                      onPositionChange={(lat, lng) => {
                        form.setValue("latitude", lat);
                        form.setValue("longitude", lng);
                      }}
                    />
                  </div>

                  {/* Google URL Field */}
                  <FormField
                    control={form.control}
                    name="googleUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--coffee-dark)] font-medium">Google Maps URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Google Maps URL"
                            className="rounded-sm border-stone-300 focus:border-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)] transition-colors"
                          />
                        </FormControl>
                        <FormDescription>
                          Google Maps link to this coffee shop. This will be populated automatically if you search for the shop.
                        </FormDescription>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                  
                  {/* Image URL Field */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--coffee-dark)] font-medium">Shop Image URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter image URL"
                            className="rounded-sm border-stone-300 focus:border-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)] transition-colors"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a URL to an image of the coffee shop. If you don't have one, a sample image is provided.
                        </FormDescription>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Website */}
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--coffee-dark)] font-medium">Website</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://website.com"
                            className="rounded-sm border-stone-300 focus:border-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)] transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--coffee-dark)] font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="+1 (555) 123-4567"
                            className="rounded-sm border-stone-300 focus:border-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)] transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)]"
                    onClick={() => setActiveTab("ratings")}
                  >
                    Next: Rating & Experience
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="ratings" className="space-y-6">
                <div className="space-y-4">
                  {/* Overall Rating */}
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-lg font-medium text-[var(--coffee-dark)]">Overall Rating</FormLabel>
                        <FormControl>
                          <Rating
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            showVisited
                            showWantToGo
                            visited={form.watch("visited")}
                            wantToGo={form.watch("wantToGo")}
                            onVisitedChange={(val) => form.setValue("visited", val)}
                            onWantToGoChange={(val) => form.setValue("wantToGo", val)}
                          />
                        </FormControl>
                        <FormDescription>
                          Rate your overall experience at this coffee shop
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price Range Slider - Moved from "details" tab */}
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-[var(--coffee-dark)]">Price Range</FormLabel>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-mono">$</span>
                      <div className="flex flex-1 gap-2">
                        {[1, 2, 3, 4, 5].map((price) => (
                          <Button
                            key={price}
                            type="button"
                            variant={priceRange[0] <= price && price <= priceRange[1] ? "default" : "outline"}
                            className={`flex-1 ${
                              priceRange[0] <= price && price <= priceRange[1]
                                ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)]"
                                : ""
                            }`}
                            onClick={() => {
                              if (price < priceRange[0]) {
                                updatePriceRange(price, priceRange[1]);
                              } else if (price > priceRange[1]) {
                                updatePriceRange(priceRange[0], price);
                              } else if (price === priceRange[0] && price === priceRange[1]) {
                                // Do nothing if it's the only selected price point
                              } else if (price === priceRange[0]) {
                                updatePriceRange(price + 1, priceRange[1]);
                              } else if (price === priceRange[1]) {
                                updatePriceRange(priceRange[0], price - 1);
                              } else {
                                // Clicking in the middle - reset to just this price
                                updatePriceRange(price, price);
                              }
                            }}
                          >
                            {price}
                          </Button>
                        ))}
                      </div>
                      <span className="text-xl font-mono">$$$$$</span>
                    </div>
                    <FormDescription>
                      Select the price range (min to max) for this coffee shop
                    </FormDescription>
                    <FormField
                      control={form.control}
                      name="priceRange"
                      render={() => <input type="hidden" />}
                    />
                  </FormItem>
                  
                  {/* Coffee Styles Multiple Selection */}
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-[var(--coffee-dark)]">Coffee Styles</FormLabel>
                    <FormDescription>
                      Select all coffee styles available at this shop
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {COFFEE_STYLES.map((style) => (
                        <Badge
                          key={style}
                          variant={selectedCoffeeStyles.includes(style) ? "default" : "outline"}
                          className={`cursor-pointer px-3 py-1 ${
                            selectedCoffeeStyles.includes(style) 
                              ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)]" 
                              : "hover:bg-stone-100"
                          }`}
                          onClick={() => toggleCoffeeStyle(style)}
                        >
                          {style}
                        </Badge>
                      ))}
                    </div>
                    <FormField
                      control={form.control}
                      name="coffeeStyles"
                      render={() => <input type="hidden" />}
                    />
                  </FormItem>

                  {/* Coffee Brands and Machine Brands in 2-column layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coffee Brands Dropdown */}
                    <FormField
                      control={form.control}
                      name="coffeeBrands"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-[var(--coffee-dark)] font-medium">Coffee Brands</FormLabel>
                          <FormDescription>
                            Select all coffee brands served
                          </FormDescription>
                          <div className="relative">
                            <select 
                              className="w-full h-10 rounded-sm border border-stone-300 focus:border-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)] transition-colors pl-3 pr-10 py-2 appearance-none bg-white"
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const value = e.target.value;
                                if (value && !selectedCoffeeBrands.includes(value)) {
                                  const newBrands = [...selectedCoffeeBrands, value];
                                  setSelectedCoffeeBrands(newBrands);
                                  form.setValue("coffeeBrands", JSON.stringify(newBrands));
                                  e.target.value = ""; // Reset to default after selection
                                }
                              }}
                              value=""
                            >
                              <option value="" disabled>Select coffee brands</option>
                              {COFFEE_BRANDS.map((brand) => (
                                <option key={brand} value={brand}>{brand}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 h-4 w-4" />
                          </div>
                          
                          {/* Display selected brands */}
                          {selectedCoffeeBrands.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedCoffeeBrands.map((brand) => (
                                <Badge
                                  key={brand}
                                  variant="default"
                                  className="bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] cursor-pointer"
                                >
                                  {brand}
                                  <X 
                                    className="h-3 w-3 ml-1" 
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      const newBrands = selectedCoffeeBrands.filter(b => b !== brand);
                                      setSelectedCoffeeBrands(newBrands);
                                      form.setValue("coffeeBrands", JSON.stringify(newBrands));
                                    }} 
                                  />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                    
                    {/* Machine Brands Dropdown */}
                    <FormField
                      control={form.control}
                      name="machineBrands"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-[var(--coffee-dark)] font-medium">Espresso Machine Brands</FormLabel>
                          <FormDescription>
                            Select machine brands used
                          </FormDescription>
                          <div className="relative">
                            <select 
                              className="w-full h-10 rounded-sm border border-stone-300 focus:border-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)] transition-colors pl-3 pr-10 py-2 appearance-none bg-white"
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const value = e.target.value;
                                if (value && !selectedMachineBrands.includes(value)) {
                                  const newBrands = [...selectedMachineBrands, value];
                                  setSelectedMachineBrands(newBrands);
                                  form.setValue("machineBrands", JSON.stringify(newBrands));
                                  e.target.value = ""; // Reset to default after selection
                                }
                              }}
                              value=""
                            >
                              <option value="" disabled>Select machine brands</option>
                              {MACHINE_BRANDS.map((brand) => (
                                <option key={brand} value={brand}>{brand}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 h-4 w-4" />
                          </div>
                          
                          {/* Display selected brands */}
                          {selectedMachineBrands.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedMachineBrands.map((brand) => (
                                <Badge
                                  key={brand}
                                  variant="default"
                                  className="bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] cursor-pointer"
                                >
                                  {brand}
                                  <X 
                                    className="h-3 w-3 ml-1" 
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      const newBrands = selectedMachineBrands.filter(b => b !== brand);
                                      setSelectedMachineBrands(newBrands);
                                      form.setValue("machineBrands", JSON.stringify(newBrands));
                                    }} 
                                  />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Categories Ratings */}
                  <div className="bg-white p-6 rounded-md border border-stone-200 space-y-4 mt-6">
                    <h3 className="text-lg font-medium text-[var(--coffee-dark)] mb-4">Detailed Ratings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderRatingControl(
                        "coffeeQuality",
                        "Coffee Quality",
                        "How good was the coffee itself?"
                      )}
                      {renderRatingControl(
                        "ambience",
                        "Ambience",
                        "How was the atmosphere and vibe?"
                      )}
                      {renderRatingControl(
                        "service",
                        "Service",
                        "How was the customer service?"
                      )}
                      {renderRatingControl(
                        "workability",
                        "Workability",
                        "How suitable is it for working/studying?"
                      )}
                      {renderRatingControl(
                        "menuVariety",
                        "Menu Variety",
                        "How diverse is the food/drink menu?"
                      )}
                      {renderRatingControl(
                        "priceValue",
                        "Price Value",
                        "How would you rate the price versus value?"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("basics")}
                  >
                    Back: Basic Info
                  </Button>
                  <Button
                    type="button"
                    className="bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)]"
                    onClick={() => setActiveTab("details")}
                  >
                    Next: Additional Details
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">

                {/* Dietary Options */}
                <FormItem>
                  <FormLabel className="text-[var(--coffee-dark)] font-medium">Dietary Options</FormLabel>
                  <FormDescription>
                    Select all dietary options available at this shop
                  </FormDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DIETARY_OPTIONS.map((option) => (
                      <Badge
                        key={option}
                        variant={selectedDietaryOptions.includes(option) ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1 ${
                          selectedDietaryOptions.includes(option) 
                            ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)]" 
                            : "hover:bg-stone-100"
                        }`}
                        onClick={() => toggleDietaryOption(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                  <FormField
                    control={form.control}
                    name="dietaryOptions"
                    render={() => <input type="hidden" />}
                  />
                </FormItem>

                {/* Noise Level */}
                <FormField
                  control={form.control}
                  name="noiseLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--coffee-dark)] font-medium">Noise Level</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <select 
                            className="w-full h-10 rounded-sm border border-stone-300 focus:border-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)] transition-colors pl-3 pr-10 py-2 appearance-none bg-white"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="" disabled>Select noise level</option>
                            {NOISE_LEVELS.map((level) => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 h-4 w-4" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        How would you describe the noise level?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Seating Options */}
                <FormItem>
                  <FormLabel className="text-[var(--coffee-dark)] font-medium">Seating Options</FormLabel>
                  <FormDescription>
                    Select all seating options available at this shop
                  </FormDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SEATING_OPTIONS.map((option) => (
                      <Badge
                        key={option}
                        variant={selectedSeatingOptions.includes(option) ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1 ${
                          selectedSeatingOptions.includes(option) 
                            ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)]" 
                            : "hover:bg-stone-100"
                        }`}
                        onClick={() => toggleSeatingOption(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                  <FormField
                    control={form.control}
                    name="seatingOptions"
                    render={() => <input type="hidden" />}
                  />
                </FormItem>

                {/* Laptop Friendly */}
                <FormField
                  control={form.control}
                  name="laptopFriendly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[var(--coffee-brown)] data-[state=checked]:border-[var(--coffee-brown)]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-base">Laptop Friendly</FormLabel>
                        <FormDescription>
                          Does this place have good Wi-Fi and power outlets for laptops?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />



                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("ratings")}
                  >
                    Back: Rating & Experience
                  </Button>
                  <Button
                    type="submit" 
                    className="bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)]"
                    disabled={mutation.isPending}
                    onClick={async (e) => {
                      e.preventDefault(); // Prevent default form submission
                      console.log("Add button clicked, submitting form manually");
                      
                      // Make sure all hidden fields are properly set from the selections
                      form.setValue("coffeeStyles", JSON.stringify(selectedCoffeeStyles));
                      form.setValue("coffeeBrands", JSON.stringify(selectedCoffeeBrands));
                      form.setValue("dietaryOptions", JSON.stringify(selectedDietaryOptions));
                      form.setValue("seatingOptions", JSON.stringify(selectedSeatingOptions));
                      
                      const isValid = await form.trigger();
                      console.log("Form validation result:", isValid);
                      if (isValid) {
                        const data = form.getValues();
                        console.log("Form data:", data);
                        mutation.mutate(data);
                      }
                    }}
                  >
                    {mutation.isPending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      "Add Coffee Shop"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}