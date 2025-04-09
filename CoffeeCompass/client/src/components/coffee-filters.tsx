import { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, ChevronsUpDown, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CoffeeFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  priceRange: [number, number];
  openNow: boolean;
  coffeeStyle: string[];
  coffeeBrands: string[];
  machineBrands: string[];
  isIndependent: boolean | null;
  rating: number;
  coffeeQuality: number;
  ambience: number;
  service: number;
  workability: number;
  menuVariety: number;
  priceValue: number;
  dietaryOptions: string[];
  noiseLevel: string[];
  seatingOptions: string[];
  laptopFriendly: boolean | null;
}

const initialFilters: FilterOptions = {
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
};

const coffeeStyles = [
  'Espresso',
  'Cappuccino',
  'Latte',
  'Flat White',
  'Americano',
  'Macchiato',
  'Mocha',
  'Cold Brew'
];

const popularCoffeeBrands = [
  'Starbucks',
  'Costa Coffee',
  'Lavazza',
  'Blue Bottle',
  'Illy',
  'Peet\'s Coffee',
  'Dunkin\'',
  'Tim Hortons'
];

const machineBrands = [
  'La Marzocco',
  'Breville',
  'Rancilio',
  'Gaggia',
  'Jura',
  'De\'Longhi',
  'Rocket Espresso',
  'Slayer'
];

const dietaryOptions = [
  'Vegan Options',
  'Gluten-Free Options',
  'Dairy Alternatives'
];

const noiseLevels = [
  'Very Quiet (Library-like)',
  'Quiet (Background music)',
  'Moderate (Conversation friendly)',
  'Lively (Bustling atmosphere)',
  'Loud (Energetic environment)'
];

const seatingTypes = [
  'Bar Seating',
  'Communal Tables',
  'Individual Tables',
  'Lounge Seating',
  'Outdoor Seating',
  'Window Seating'
];

export default function CoffeeFilters({ onFilterChange }: CoffeeFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  
  // Effect to handle clicks outside of the filter container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node) && expanded) {
        setExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Count active filters
    let count = 0;
    if (updatedFilters.priceRange[0] > 1 || updatedFilters.priceRange[1] < 5) count++;
    if (updatedFilters.openNow) count++;
    if (updatedFilters.coffeeStyle.length > 0) count++;
    if (updatedFilters.coffeeBrands.length > 0) count++;
    if (updatedFilters.machineBrands.length > 0) count++;
    if (updatedFilters.isIndependent !== null) count++;
    if (updatedFilters.rating > 0) count++;
    if (updatedFilters.coffeeQuality > 0) count++;
    if (updatedFilters.ambience > 0) count++;
    if (updatedFilters.service > 0) count++;
    if (updatedFilters.workability > 0) count++;
    if (updatedFilters.menuVariety > 0) count++;
    if (updatedFilters.priceValue > 0) count++;
    if (updatedFilters.dietaryOptions.length > 0) count++;
    if (updatedFilters.noiseLevel.length > 0) count++;
    if (updatedFilters.seatingOptions.length > 0) count++;
    if (updatedFilters.laptopFriendly !== null) count++;
    
    setActiveFilterCount(count);
    onFilterChange(updatedFilters);
  };

  const toggleCoffeeStyle = (style: string) => {
    const updatedStyles = filters.coffeeStyle.includes(style)
      ? filters.coffeeStyle.filter(s => s !== style)
      : [...filters.coffeeStyle, style];
    
    handleFilterChange({ coffeeStyle: updatedStyles });
  };

  const toggleCoffeeBrand = (brand: string) => {
    const updatedBrands = filters.coffeeBrands.includes(brand)
      ? filters.coffeeBrands.filter(b => b !== brand)
      : [...filters.coffeeBrands, brand];
    
    handleFilterChange({ coffeeBrands: updatedBrands });
  };

  const toggleMachineBrand = (brand: string) => {
    const updatedBrands = filters.machineBrands.includes(brand)
      ? filters.machineBrands.filter(b => b !== brand)
      : [...filters.machineBrands, brand];
    
    handleFilterChange({ machineBrands: updatedBrands });
  };
  
  const toggleDietaryOption = (option: string) => {
    const updatedOptions = filters.dietaryOptions.includes(option)
      ? filters.dietaryOptions.filter(o => o !== option)
      : [...filters.dietaryOptions, option];
    
    handleFilterChange({ dietaryOptions: updatedOptions });
  };
  
  const toggleNoiseLevel = (level: string) => {
    const updatedLevels = filters.noiseLevel.includes(level)
      ? filters.noiseLevel.filter(l => l !== level)
      : [...filters.noiseLevel, level];
    
    handleFilterChange({ noiseLevel: updatedLevels });
  };
  
  const toggleSeatingOption = (option: string) => {
    const updatedOptions = filters.seatingOptions.includes(option)
      ? filters.seatingOptions.filter(o => o !== option)
      : [...filters.seatingOptions, option];
    
    handleFilterChange({ seatingOptions: updatedOptions });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setActiveFilterCount(0);
    onFilterChange(initialFilters);
  };

  return (
    <div className="bg-white border border-[var(--coffee-light)] rounded-sm" ref={filterContainerRef}>
      <div className="p-4">
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[var(--coffee-brown)]" />
                <h3 className="font-medium text-lg text-[var(--coffee-dark)]">Filter Options</h3>
                {activeFilterCount > 0 && (
                  <Badge className="bg-[var(--coffee-brown)]">{activeFilterCount}</Badge>
                )}
              </div>
              <div className="text-[var(--coffee-dark)] hover:text-[var(--coffee-brown)]">
                {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-6">
            {/* Price Range Filter */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Price Range</h4>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((price) => (
                  <label 
                    key={price} 
                    className={`flex items-center justify-center px-3 py-1 rounded-md cursor-pointer border 
                      ${filters.priceRange[0] === price && filters.priceRange[1] === price 
                        ? "bg-[var(--coffee-brown)] text-white border-[var(--coffee-brown)]" 
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"}`}
                  >
                    <input 
                      type="radio" 
                      name="priceRange" 
                      className="sr-only"
                      checked={filters.priceRange[0] === price && filters.priceRange[1] === price}
                      onChange={() => handleFilterChange({ priceRange: [price, price] as [number, number] })}
                    />
                    {"$".repeat(price)}
                  </label>
                ))}
                <label 
                  className={`flex items-center justify-center px-3 py-1 rounded-md cursor-pointer border 
                    ${filters.priceRange[0] === 1 && filters.priceRange[1] === 5 
                      ? "bg-[var(--coffee-brown)] text-white border-[var(--coffee-brown)]" 
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"}`}
                >
                  <input 
                    type="radio" 
                    name="priceRange" 
                    className="sr-only"
                    checked={filters.priceRange[0] === 1 && filters.priceRange[1] === 5}
                    onChange={() => handleFilterChange({ priceRange: [1, 5] as [number, number] })}
                  />
                  Any
                </label>
              </div>
            </div>
            
            {/* Open Now Switch */}
            <div className="flex items-center justify-between">
              <Label htmlFor="open-now" className="font-medium text-[var(--coffee-dark)]">Open Now</Label>
              <Switch 
                id="open-now" 
                checked={filters.openNow}
                onCheckedChange={(checked) => handleFilterChange({ openNow: checked })}
              />
            </div>
            
            {/* Coffee Style Selection */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Coffee Style</h4>
              <div className="flex flex-wrap gap-2">
                {coffeeStyles.map((style) => (
                  <Badge 
                    key={style}
                    className={filters.coffeeStyle.includes(style) 
                      ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] cursor-pointer" 
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"}
                    onClick={() => toggleCoffeeStyle(style)}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Coffee Brands */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Coffee Brands</h4>
              <div className="flex flex-wrap gap-2">
                {popularCoffeeBrands.map((brand) => (
                  <Badge 
                    key={brand}
                    className={filters.coffeeBrands.includes(brand) 
                      ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] cursor-pointer" 
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"}
                    onClick={() => toggleCoffeeBrand(brand)}
                  >
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Machine Brands */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Machine Brands</h4>
              <div className="flex flex-wrap gap-2">
                {machineBrands.map((brand) => (
                  <Badge 
                    key={brand}
                    className={filters.machineBrands.includes(brand) 
                      ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] cursor-pointer" 
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"}
                    onClick={() => toggleMachineBrand(brand)}
                  >
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Franchise/Independent */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Establishment Type</h4>
              <div className="flex flex-wrap gap-2">
                <label 
                  className={`flex items-center justify-center px-3 py-1 rounded-md cursor-pointer border 
                    ${filters.isIndependent === null 
                      ? "bg-[var(--coffee-brown)] text-white border-[var(--coffee-brown)]" 
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"}`}
                >
                  <input 
                    type="radio" 
                    name="establishmentType" 
                    className="sr-only"
                    checked={filters.isIndependent === null}
                    onChange={() => handleFilterChange({ isIndependent: null })}
                  />
                  Any type
                </label>
                <label 
                  className={`flex items-center justify-center px-3 py-1 rounded-md cursor-pointer border 
                    ${filters.isIndependent === true 
                      ? "bg-[var(--coffee-brown)] text-white border-[var(--coffee-brown)]" 
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"}`}
                >
                  <input 
                    type="radio" 
                    name="establishmentType" 
                    className="sr-only"
                    checked={filters.isIndependent === true}
                    onChange={() => handleFilterChange({ isIndependent: true })}
                  />
                  Independent
                </label>
                <label 
                  className={`flex items-center justify-center px-3 py-1 rounded-md cursor-pointer border 
                    ${filters.isIndependent === false 
                      ? "bg-[var(--coffee-brown)] text-white border-[var(--coffee-brown)]" 
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"}`}
                >
                  <input 
                    type="radio" 
                    name="establishmentType" 
                    className="sr-only"
                    checked={filters.isIndependent === false}
                    onChange={() => handleFilterChange({ isIndependent: false })}
                  />
                  Franchise
                </label>
              </div>
            </div>
            
            {/* Rating */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Minimum Rating</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                      filters.rating >= star
                        ? "bg-[var(--coffee-brown)] text-white"
                        : "bg-stone-200 text-stone-500 hover:bg-stone-300"
                    }`}
                    onClick={() => handleFilterChange({ rating: star })}
                  >
                    {star}
                  </button>
                ))}
                {filters.rating > 0 && (
                  <button
                    className="text-xs text-[var(--coffee-brown)] hover:underline ml-2"
                    onClick={() => handleFilterChange({ rating: 0 })}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Category Ratings */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Category Ratings</h4>
              
              <div className="space-y-3">
                {/* Coffee Quality */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-stone-700">Coffee Quality</span>
                    <span className="text-sm text-stone-500">{filters.coffeeQuality > 0 ? `${filters.coffeeQuality}+` : 'Any'}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        className={`w-6 h-6 text-xs flex items-center justify-center rounded-full transition-colors ${
                          filters.coffeeQuality >= value
                            ? "bg-[var(--coffee-brown)] text-white"
                            : "bg-stone-200 text-stone-500 hover:bg-stone-300"
                        }`}
                        onClick={() => handleFilterChange({ coffeeQuality: value })}
                      >
                        {value}
                      </button>
                    ))}
                    {filters.coffeeQuality > 0 && (
                      <button
                        className="text-xs text-[var(--coffee-brown)] hover:underline"
                        onClick={() => handleFilterChange({ coffeeQuality: 0 })}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Ambience */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-stone-700">Ambience/Vibe</span>
                    <span className="text-sm text-stone-500">{filters.ambience > 0 ? `${filters.ambience}+` : 'Any'}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        className={`w-6 h-6 text-xs flex items-center justify-center rounded-full transition-colors ${
                          filters.ambience >= value
                            ? "bg-[var(--coffee-brown)] text-white"
                            : "bg-stone-200 text-stone-500 hover:bg-stone-300"
                        }`}
                        onClick={() => handleFilterChange({ ambience: value })}
                      >
                        {value}
                      </button>
                    ))}
                    {filters.ambience > 0 && (
                      <button
                        className="text-xs text-[var(--coffee-brown)] hover:underline"
                        onClick={() => handleFilterChange({ ambience: 0 })}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Workability */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-stone-700">Workability</span>
                    <span className="text-sm text-stone-500">{filters.workability > 0 ? `${filters.workability}+` : 'Any'}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        className={`w-6 h-6 text-xs flex items-center justify-center rounded-full transition-colors ${
                          filters.workability >= value
                            ? "bg-[var(--coffee-brown)] text-white"
                            : "bg-stone-200 text-stone-500 hover:bg-stone-300"
                        }`}
                        onClick={() => handleFilterChange({ workability: value })}
                      >
                        {value}
                      </button>
                    ))}
                    {filters.workability > 0 && (
                      <button
                        className="text-xs text-[var(--coffee-brown)] hover:underline"
                        onClick={() => handleFilterChange({ workability: 0 })}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dietary Options */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Dietary Options</h4>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <Badge 
                    key={option}
                    className={filters.dietaryOptions.includes(option) 
                      ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] cursor-pointer" 
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"}
                    onClick={() => toggleDietaryOption(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Noise Level */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Noise Level</h4>
              <div className="flex flex-wrap gap-2">
                {noiseLevels.map((level) => (
                  <Badge 
                    key={level}
                    className={filters.noiseLevel.includes(level) 
                      ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] cursor-pointer" 
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"}
                    onClick={() => toggleNoiseLevel(level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Seating Options */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Seating Options</h4>
              <div className="flex flex-wrap gap-2">
                {seatingTypes.map((option) => (
                  <Badge 
                    key={option}
                    className={filters.seatingOptions.includes(option) 
                      ? "bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] cursor-pointer" 
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"}
                    onClick={() => toggleSeatingOption(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Laptop Friendly */}
            <div>
              <h4 className="font-medium mb-2 text-[var(--coffee-dark)]">Laptop Friendly</h4>
              <div className="flex flex-wrap gap-2">
                <label 
                  className={`flex items-center justify-center px-3 py-1 rounded-md cursor-pointer border 
                    ${filters.laptopFriendly === null 
                      ? "bg-[var(--coffee-brown)] text-white border-[var(--coffee-brown)]" 
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"}`}
                >
                  <input 
                    type="radio" 
                    name="laptopFriendly" 
                    className="sr-only"
                    checked={filters.laptopFriendly === null}
                    onChange={() => handleFilterChange({ laptopFriendly: null })}
                  />
                  Any
                </label>
                <label 
                  className={`flex items-center justify-center px-3 py-1 rounded-md cursor-pointer border 
                    ${filters.laptopFriendly === true 
                      ? "bg-[var(--coffee-brown)] text-white border-[var(--coffee-brown)]" 
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"}`}
                >
                  <input 
                    type="radio" 
                    name="laptopFriendly" 
                    className="sr-only"
                    checked={filters.laptopFriendly === true}
                    onChange={() => handleFilterChange({ laptopFriendly: true })}
                  />
                  Yes
                </label>
                <label 
                  className={`flex items-center justify-center px-3 py-1 rounded-md cursor-pointer border 
                    ${filters.laptopFriendly === false 
                      ? "bg-[var(--coffee-brown)] text-white border-[var(--coffee-brown)]" 
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"}`}
                >
                  <input 
                    type="radio" 
                    name="laptopFriendly" 
                    className="sr-only"
                    checked={filters.laptopFriendly === false}
                    onChange={() => handleFilterChange({ laptopFriendly: false })}
                  />
                  No
                </label>
              </div>
            </div>
            
            {/* Reset Button */}
            {activeFilterCount > 0 && (
              <div className="pt-4 border-t border-stone-200">
                <button
                  className="text-sm text-[var(--coffee-brown)] hover:text-[var(--coffee-dark)] font-medium"
                  onClick={resetFilters}
                >
                  Reset all filters
                </button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}