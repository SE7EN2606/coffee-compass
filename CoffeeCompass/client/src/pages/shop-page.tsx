import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { CoffeeShop, Rating as RatingType, insertRatingSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Rating from "@/components/rating";
import { 
  ChevronLeft, Star, User, Calendar, CheckCircle, Coffee, 
  MapPin, Info, Cpu, Clock, Utensils, Wifi, AlertCircle, 
  CheckCircle2, Volume2, AlignLeft, Laptop, Leaf, Wheat, Milk
} from "lucide-react";
import { Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

function getRatingCounts(ratings: RatingType[]) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach(rating => {
    counts[rating.rating as keyof typeof counts]++;
  });
  return counts;
}

// Function to calculate average for a category (with fallback to 0)
function getCategoryAverage(shop: CoffeeShop, category: keyof CoffeeShop) {
  return shop[category] as number || 0;
}

export default function ShopPage() {
  const [, params] = useRoute("/shop/:id");
  const { toast } = useToast();
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('reviews');
  const [visitedCheckbox, setVisitedCheckbox] = useState(false);
  const [wantToGoCheckbox, setWantToGoCheckbox] = useState(false);

  const { data: shop, isLoading: isLoadingShop } = useQuery<CoffeeShop>({
    queryKey: [`/api/coffee-shops/${params?.id}`],
  });

  const { data: ratings = [], isLoading: isLoadingRatings } = useQuery<RatingType[]>({
    queryKey: [`/api/coffee-shops/${params?.id}/ratings`],
  });

  const form = useForm({
    resolver: zodResolver(insertRatingSchema),
    defaultValues: {
      rating: 5,
      review: "",
      visited: false,
      wantToGo: false,
      shopId: Number(params?.id),
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (data: RatingType) => {
      const res = await apiRequest("POST", `/api/coffee-shops/${params?.id}/ratings`, {
        ...data,
        visited: visitedCheckbox,
        wantToGo: wantToGoCheckbox
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/coffee-shops/${params?.id}/ratings`] });
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
      form.reset();
      setVisitedCheckbox(false);
      setWantToGoCheckbox(false);
    },
  });

  if (isLoadingShop || !shop) {
    return <div>Loading...</div>;
  }

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
      : 0;
      
  const ratingCounts = getRatingCounts(ratings);
  const maxRatingCount = Math.max(...Object.values(ratingCounts));
  
  // Parse seating options if they exist
  const seatingOptions = shop.seatingOptions ? shop.seatingOptions.split(',').map((opt: string) => opt.trim()) : [];

  return (
    <div className="min-h-screen bg-background">
      <div
        className="h-[350px] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${shop.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30">
          <div className="container mx-auto px-4 h-full flex items-end pb-8">
            <div className="text-white w-full">
              <Link href="/">
                <Button variant="ghost" className="text-white mb-4">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{shop.name}</h1>
                  <p className="text-lg opacity-90 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {shop.address}
                  </p>
                </div>
                <div className="flex items-center bg-black/30 px-4 py-2 rounded-lg">
                  <div className="text-center mr-4">
                    <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                    <div className="text-xs opacity-80">{ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}</div>
                  </div>
                  <Rating value={averageRating} readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="about" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="ratings">Ratings & Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-[var(--coffee-dark)]">About this coffee shop</h2>
                    <p className="text-stone-700 leading-relaxed">{shop.description}</p>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shop.isIndependent !== null && (
                        <div className="flex items-center">
                          <Badge variant={shop.isIndependent ? "default" : "outline"} className={shop.isIndependent ? "bg-[var(--coffee-brown)]" : ""}>
                            {shop.isIndependent ? "Independent Shop" : "Franchise"}
                          </Badge>
                        </div>
                      )}
                      
                      {shop.coffeeBrand && (
                        <div className="flex items-center">
                          <Coffee className="h-4 w-4 text-[var(--coffee-brown)] mr-2" />
                          <span className="text-sm font-medium">Coffee: {shop.coffeeBrand}</span>
                        </div>
                      )}
                      
                      {shop.machineBrand && (
                        <div className="flex items-center">
                          <Cpu className="h-4 w-4 text-[var(--coffee-brown)] mr-2" />
                          <span className="text-sm font-medium">Machine: {shop.machineBrand}</span>
                        </div>
                      )}
                      
                      {shop.noiseLevel && (
                        <div className="flex items-center">
                          <Volume2 className="h-4 w-4 text-[var(--coffee-brown)] mr-2" />
                          <span className="text-sm font-medium">Noise: {shop.noiseLevel}</span>
                        </div>
                      )}
                      
                      {shop.laptopFriendly !== null && (
                        <div className="flex items-center">
                          <Laptop className="h-4 w-4 text-[var(--coffee-brown)] mr-2" />
                          <span className="text-sm font-medium">
                            {shop.laptopFriendly ? "Laptop friendly" : "Not ideal for laptops"}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Dietary Options */}
                {(shop.hasVeganOptions || shop.hasGlutenFreeOptions || shop.hasDairyAlternatives) && (
                  <Card className="mt-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4 text-[var(--coffee-dark)]">Dietary Options</h3>
                      <div className="flex flex-wrap gap-3">
                        {shop.hasVeganOptions && (
                          <div className="flex items-center">
                            <Badge className="flex gap-1 items-center bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                              <Leaf className="h-3.5 w-3.5" />
                              Vegan Options
                            </Badge>
                          </div>
                        )}
                        
                        {shop.hasGlutenFreeOptions && (
                          <div className="flex items-center">
                            <Badge className="flex gap-1 items-center bg-amber-100 text-amber-800 hover:bg-amber-200">
                              <Wheat className="h-3.5 w-3.5" />
                              Gluten-Free Options
                            </Badge>
                          </div>
                        )}
                        
                        {shop.hasDairyAlternatives && (
                          <div className="flex items-center">
                            <Badge className="flex gap-1 items-center bg-blue-100 text-blue-800 hover:bg-blue-200">
                              <Milk className="h-3.5 w-3.5" />
                              Dairy Alternatives
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div>
                {/* Seating Options */}
                {seatingOptions.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4 text-[var(--coffee-dark)]">Seating Options</h3>
                      <div className="space-y-2">
                        {seatingOptions.map((option: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{option}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="mt-6">
                  <Button
                    className="w-full bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] text-white"
                    onClick={() => {
                      setActiveTab('reviews');
                      setTimeout(() => {
                        document.getElementById('submit-rating')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    Write a Review
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ratings" className="space-y-6">
            {/* Overall Rating Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">Overall Rating</h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left side - Summary */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-[var(--coffee-dark)]">{averageRating.toFixed(1)}</span>
                      <div className="flex items-center">
                        <Rating value={averageRating} readOnly />
                      </div>
                    </div>
                    <p className="text-sm text-stone-500 mt-1">{ratings.length} reviews</p>
                  </div>
                  
                  {/* Right side - Rating bars */}
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map(ratingValue => (
                      <div key={ratingValue} className="flex items-center gap-2 mb-2">
                        <div className="w-8 text-right text-sm text-stone-600 font-medium">{ratingValue}</div>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <div className="flex-grow h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[var(--coffee-brown)]" 
                            style={{ 
                              width: maxRatingCount > 0 ? `${(ratingCounts[ratingValue as keyof typeof ratingCounts] / maxRatingCount) * 100}%` : '0%'
                            }} 
                          />
                        </div>
                        <div className="w-8 text-sm text-stone-500">
                          {ratingCounts[ratingValue as keyof typeof ratingCounts]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Category Ratings Card */}
            {(shop.coffeeQuality || shop.ambience || shop.service || shop.workability || shop.menuVariety || shop.priceValue) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">Category Ratings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shop.coffeeQuality > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Coffee Quality</span>
                          <div className="flex items-center">
                            <span className="text-sm font-bold mr-2">{shop.coffeeQuality}.0</span>
                            <Coffee className="h-4 w-4 text-[var(--coffee-brown)]" />
                          </div>
                        </div>
                        <Progress value={shop.coffeeQuality * 20} className="h-2" />
                      </div>
                    )}
                    
                    {shop.ambience > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Ambience/Vibe</span>
                          <div className="flex items-center">
                            <span className="text-sm font-bold mr-2">{shop.ambience}.0</span>
                            <Info className="h-4 w-4 text-[var(--coffee-brown)]" />
                          </div>
                        </div>
                        <Progress value={shop.ambience * 20} className="h-2" />
                      </div>
                    )}
                    
                    {shop.service > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Service</span>
                          <div className="flex items-center">
                            <span className="text-sm font-bold mr-2">{shop.service}.0</span>
                            <User className="h-4 w-4 text-[var(--coffee-brown)]" />
                          </div>
                        </div>
                        <Progress value={shop.service * 20} className="h-2" />
                      </div>
                    )}
                    
                    {shop.workability > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Workability</span>
                          <div className="flex items-center">
                            <span className="text-sm font-bold mr-2">{shop.workability}.0</span>
                            <Laptop className="h-4 w-4 text-[var(--coffee-brown)]" />
                          </div>
                        </div>
                        <Progress value={shop.workability * 20} className="h-2" />
                      </div>
                    )}
                    
                    {shop.menuVariety > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Menu Variety</span>
                          <div className="flex items-center">
                            <span className="text-sm font-bold mr-2">{shop.menuVariety}.0</span>
                            <Utensils className="h-4 w-4 text-[var(--coffee-brown)]" />
                          </div>
                        </div>
                        <Progress value={shop.menuVariety * 20} className="h-2" />
                      </div>
                    )}
                    
                    {shop.priceValue > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Price-to-Value</span>
                          <div className="flex items-center">
                            <span className="text-sm font-bold mr-2">{shop.priceValue}.0</span>
                            <AlertCircle className="h-4 w-4 text-[var(--coffee-brown)]" />
                          </div>
                        </div>
                        <Progress value={shop.priceValue * 20} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="mt-6">
              <Button
                className="w-full bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] text-white"
                onClick={() => {
                  setActiveTab('reviews');
                  setTimeout(() => {
                    document.getElementById('submit-rating')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                Write a Review
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            {/* Individual Reviews */}
            <div className="space-y-6" id="reviews-list">
              <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">Customer Reviews</h2>
              
              {isLoadingRatings ? (
                <div>Loading reviews...</div>
              ) : ratings.length > 0 ? (
                ratings.map((rating, index) => (
                  <Card key={rating.id} className="mb-4 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                            <User className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">Reviewer #{rating.id}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Rating value={rating.rating} readOnly />
                                  {rating.visited && <span className="text-xs text-stone-500 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Visited</span>}
                                </div>
                              </div>
                              <div className="text-sm text-stone-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString() : 'Recently'}
                              </div>
                            </div>
                            
                            {rating.review && (
                              <div className="mt-3">
                                <p className="text-stone-700">
                                  {expandedReview === rating.id 
                                    ? rating.review 
                                    : rating.review.length > 150 
                                      ? `${rating.review.substring(0, 150)}...` 
                                      : rating.review}
                                </p>
                                {rating.review.length > 150 && (
                                  <button 
                                    className="text-[var(--coffee-brown)] text-sm mt-1 hover:underline"
                                    onClick={() => setExpandedReview(expandedReview === rating.id ? null : rating.id)}
                                  >
                                    {expandedReview === rating.id ? 'Read less' : 'Read more'}
                                  </button>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-4 flex items-center gap-4">
                              <div className="text-sm text-stone-500">Was this review helpful?</div>
                              <div className="flex gap-2">
                                <button className="text-sm px-3 py-1 border border-stone-300 rounded-full hover:bg-stone-100">Yes</button>
                                <button className="text-sm px-3 py-1 border border-stone-300 rounded-full hover:bg-stone-100">No</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-stone-500">
                      <Info className="h-10 w-10 mx-auto mb-2 text-stone-400" />
                      <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
                      <p>Be the first to share your experience at this coffee shop!</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Submit Rating Form */}
            <Card className="mt-10" id="submit-rating">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">Write a Review</h2>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => ratingMutation.mutate(data))}
                    className="space-y-6"
                  >
                    <div className="p-4 border border-stone-200 bg-white rounded-md">
                      <div className="flex items-center">
                        <p className="font-medium text-stone-800 mr-2">Overall Rating</p>
                        <p className="text-xs text-stone-500">(required)</p>
                      </div>
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Rating
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="review"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-stone-700 font-medium">Your Review</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              className="min-h-[150px] border-stone-300 focus:border-[var(--coffee-brown)]"
                              placeholder="What did you like or dislike about this coffee shop? How was the coffee quality? Would you recommend it to others?"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="visited" 
                          checked={visitedCheckbox}
                          onCheckedChange={(checked) => setVisitedCheckbox(checked === true)}
                          className="data-[state=checked]:bg-[var(--coffee-brown)] data-[state=checked]:border-[var(--coffee-brown)]"
                        />
                        <label
                          htmlFor="visited"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I've visited this place
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="wantToGo" 
                          checked={wantToGoCheckbox}
                          onCheckedChange={(checked) => setWantToGoCheckbox(checked === true)}
                          className="data-[state=checked]:bg-[var(--coffee-brown)] data-[state=checked]:border-[var(--coffee-brown)]"
                        />
                        <label
                          htmlFor="wantToGo"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I want to visit
                        </label>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] text-white"
                      disabled={ratingMutation.isPending}
                    >
                      {ratingMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
