import { CoffeeShop } from "@shared/schema";
import { MapPin, Coffee, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface CoffeeShopCardProps {
  shop: CoffeeShop;
}

export default function CoffeeShopCard({ shop }: CoffeeShopCardProps) {
  return (
    <div className="coffee-card group">
      <div className="relative">
        <img src={shop.imageUrl} alt={shop.name} className="coffee-card-image" />
        <div className="absolute top-0 left-0 w-full h-full bg-[var(--coffee-dark)] bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
        {shop.coffeeBrand && (
          <div className="absolute top-4 right-4 bg-[var(--coffee-brown)] text-white py-1 px-3 uppercase text-xs tracking-wider flex items-center">
            <Coffee className="h-3 w-3 mr-1" /> {shop.coffeeBrand}
          </div>
        )}
      </div>
      <div className="coffee-card-content">
        <h3 className="text-xl font-semibold mb-2 font-serif">{shop.name}</h3>
        <div className="flex items-center text-sm text-stone-600 mb-4">
          <MapPin className="h-3 w-3 mr-1 text-[var(--coffee-brown)]" />
          <span className="truncate">{shop.address}</span>
        </div>
        <p className="text-sm text-stone-700 mb-4 line-clamp-3">{shop.description}</p>
        <div className="flex justify-between items-center border-t border-stone-100 pt-4">
          <span className="text-[var(--coffee-brown)] text-sm font-medium uppercase tracking-wide">Explore</span>
          <Link href={`/shop/${shop.id}`}>
            <button className="text-[var(--coffee-brown)] flex items-center text-sm group-hover:underline transition-all">
              View Details <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
