import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Star, X } from "lucide-react";
import { CoffeeShop } from "@shared/schema";
import { Link } from "wouter";

interface MapPreviewProps {
  shop: CoffeeShop;
  onClose: () => void;
}

export default function MapPreview({ shop, onClose }: MapPreviewProps) {
  const starCount = Math.round(shop.coffeeQuality || 0);

  return (
    <Card className="w-80 shadow-lg absolute bottom-20 right-5 z-50 bg-[var(--background-secondary)] border border-[var(--primary-sage)]">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{shop.name}</h3>
          <button 
            onClick={onClose}
            className="text-[var(--text-primary)] hover:text-[var(--primary-sage)] transition-colors"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {shop.imageUrl && (
          <div className="mt-2 h-32 overflow-hidden rounded-md">
            <img 
              src={shop.imageUrl} 
              alt={shop.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="mt-2 flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i}
              className={`h-4 w-4 ${i < starCount ? 'fill-[var(--primary-sienna)] text-[var(--primary-sienna)]' : 'text-[var(--neutral-300)]'}`}
            />
          ))}
          <span className="ml-2 text-sm text-[var(--text-primary)]">
            {shop.coffeeQuality ? shop.coffeeQuality.toFixed(1) : 'No ratings'}
          </span>
        </div>
        
        <div className="mt-2 text-sm text-[var(--text-primary)]">
          <p>{shop.address}</p>
          {shop.openingHours && (
            <p className="mt-1">
              {typeof shop.openingHours === 'string' 
                ? JSON.parse(shop.openingHours).weekday_text?.[0] || 'Hours not available'
                : shop.openingHours.weekday_text?.[0] || 'Hours not available'
              }
            </p>
          )}
        </div>
        
        <Link href={`/shop/${shop.id}`}>
          <Button 
            className="mt-3 w-full bg-[var(--primary-sienna)] hover:bg-[var(--primary-sage)] text-white transition-colors"
          >
            See more
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}