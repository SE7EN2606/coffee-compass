import { Star, MapPin, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  showVisited?: boolean;
  showWantToGo?: boolean;
  visited?: boolean;
  wantToGo?: boolean;
  onVisitedChange?: (checked: boolean) => void;
  onWantToGoChange?: (checked: boolean) => void;
}

export default function Rating({
  value,
  onChange,
  readOnly = false,
  showVisited = false,
  showWantToGo = false,
  visited = false,
  wantToGo = false,
  onVisitedChange,
  onWantToGoChange,
}: RatingProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type={onChange ? "button" : "submit"}
            className={cn(
              "focus:outline-none transition-transform hover:scale-110",
              readOnly ? "cursor-default" : "cursor-pointer"
            )}
            onClick={() => onChange?.(rating)}
            disabled={readOnly}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                rating <= value
                  ? "fill-[var(--coffee-brown)] text-[var(--coffee-brown)]"
                  : "fill-stone-200 text-stone-200"
              )}
            />
          </button>
        ))}
        <span className="ml-3 text-sm font-medium text-stone-600">
          {value > 0 ? (
            <span className="flex items-center">
              <span className="text-[var(--coffee-brown)] mr-1">{value}.0</span> 
              rating
            </span>
          ) : (
            "Not rated yet"
          )}
        </span>
      </div>

      {(showVisited || showWantToGo) && (
        <div className="flex gap-6">
          {showVisited && (
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <Checkbox
                  id="visited"
                  checked={visited}
                  onCheckedChange={onVisitedChange}
                  disabled={readOnly}
                  className="h-5 w-5 rounded-none border-stone-300 data-[state=checked]:border-[var(--coffee-brown)] data-[state=checked]:bg-[var(--coffee-brown)]"
                />
              </div>
              <Label 
                htmlFor="visited" 
                className="text-sm cursor-pointer text-stone-700 group-hover:text-[var(--coffee-brown)] transition-colors"
              >
                <MapPin className="h-4 w-4 inline-block mr-1.5 text-[var(--coffee-brown)]" />
                Visited
              </Label>
            </div>
          )}

          {showWantToGo && (
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <Checkbox
                  id="wantToGo"
                  checked={wantToGo}
                  onCheckedChange={onWantToGoChange}
                  disabled={readOnly}
                  className="h-5 w-5 rounded-none border-stone-300 data-[state=checked]:border-[var(--coffee-brown)] data-[state=checked]:bg-[var(--coffee-brown)]"
                />
              </div>
              <Label 
                htmlFor="wantToGo" 
                className="text-sm cursor-pointer text-stone-700 group-hover:text-[var(--coffee-brown)] transition-colors"
              >
                <Coffee className="h-4 w-4 inline-block mr-1.5 text-[var(--coffee-brown)]" />
                Want to visit
              </Label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}