import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, size = "sm", interactive = false, onChange }: StarRatingProps) {
  const starSize = size === "sm" ? "size-4" : "size-6";

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "Rating" : `Rated ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) =>
        interactive ? (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            aria-pressed={n <= rating}
            onClick={() => onChange?.(n)}
            className="p-0.5"
          >
            <Star
              className={cn(starSize, n <= rating ? "fill-plum text-plum" : "text-charcoal/30")}
              strokeWidth={1.5}
            />
          </button>
        ) : (
          <Star
            key={n}
            className={cn(starSize, n <= Math.round(rating) ? "fill-plum text-plum" : "text-charcoal/30")}
            strokeWidth={1.5}
          />
        ),
      )}
    </div>
  );
}
