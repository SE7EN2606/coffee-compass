import { useQuery } from "@tanstack/react-query";
import { Coffee, MapPin } from "lucide-react";
import { CoffeeShop } from "@shared/schema";
import AddShopDialog from "@/components/add-shop-dialog";
import MapSearch from "@/components/map-search";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Track window size for mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const { data: shops = [] } = useQuery<CoffeeShop[]>({
    queryKey: ["/api/coffee-shops"],
  });

  const handleShopSelect = (shop: CoffeeShop) => {
    setLocation(`/shop/${shop.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <Coffee className="h-8 w-8 text-[var(--coffee-brown)]" />
            <h1 className="ml-2 text-2xl font-bold text-[var(--coffee-dark)] font-serif">Coffee Critic</h1>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-[var(--coffee-dark)] hover:text-[var(--coffee-brown)] transition-colors text-sm font-medium">Register</a>
            <a href="#" className="text-white bg-[var(--coffee-brown)] hover:bg-[var(--coffee-dark)] transition-colors px-4 py-2 text-sm font-medium">Sign in</a>
          </div>
        </div>
      </header>

      <main className="flex-grow py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--coffee-dark)] font-serif">Find your best Coffee</h2>
              <p className="text-stone-600 max-w-2xl mx-auto mb-6">
                Discover exceptional coffee spots in your area. Add your favorite coffee shops to help others find great coffee!
              </p>
              <div className="mb-8">
                <AddShopDialog />
              </div>
            </div>
            
            <div className="bg-white shadow-xl rounded-sm overflow-hidden">
              <MapSearch 
                onShopSelect={handleShopSelect} 
                defaultCenter={[48.8566, 2.3522]} 
                simplified={true}
                height={isMobile ? "500px" : "700px"}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[var(--coffee-black)] text-white py-16 mt-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center mb-6">
                <Coffee className="h-6 w-6 text-[var(--coffee-brown)]" />
                <h3 className="ml-2 text-xl font-bold font-serif">Coffee Critic</h3>
              </div>
              <p className="text-stone-400 text-sm">
                Connecting coffee lovers with exceptional coffee shops worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 font-serif">Quick Links</h4>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-[var(--coffee-brown)] transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-[var(--coffee-brown)] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[var(--coffee-brown)] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 font-serif">Contact</h4>
              <ul className="space-y-2 text-stone-400">
                <li>info@coffeecriticapp.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Brew Street, Seattle, WA</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 font-serif">Opening Hours</h4>
              <ul className="space-y-2 text-stone-400">
                <li className="flex justify-between"><span>Monday - Friday:</span> <span>9am - 10pm</span></li>
                <li className="flex justify-between"><span>Saturday:</span> <span>10am - 10pm</span></li>
                <li className="flex justify-between"><span>Sunday:</span> <span>10am - 8pm</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-12 pt-6 text-center text-stone-500 text-sm">
            <p>© {new Date().getFullYear()} Coffee Critic App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}