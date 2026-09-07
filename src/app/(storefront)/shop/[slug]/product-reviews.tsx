import { createClient } from "@/lib/supabase/server";
import { getApprovedReviews, isEligibleToReview, hasReviewed } from "@/lib/reviews";
import { StarRating } from "@/components/star-rating";
import { ReviewForm } from "./review-form";

export async function ProductReviews({ productId }: { productId: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { reviews, averageRating, count } = await getApprovedReviews(productId);

  let canReview = false;
  if (user) {
    const [eligible, alreadyReviewed] = await Promise.all([
      isEligibleToReview(user.id, productId),
      hasReviewed(user.id, productId),
    ]);
    canReview = eligible && !alreadyReviewed;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-display-m text-deep-plum">Reviews</h2>
        {count > 0 && (
          <span className="flex items-center gap-2 text-body-s text-muted-foreground">
            <StarRating rating={averageRating} />
            {averageRating.toFixed(1)} ({count} review{count === 1 ? "" : "s"})
          </span>
        )}
      </div>

      {canReview && (
        <div className="mt-4">
          <ReviewForm productId={productId} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {reviews.length === 0 ? (
          <p className="text-body-m text-muted-foreground">
            No reviews yet. Be the first to review this product once you&apos;ve purchased it.
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                <span className="text-body-s font-medium text-charcoal">{review.authorName}</span>
              </div>
              {review.body && <p className="mt-1 text-body-m text-charcoal">{review.body}</p>}
              <p className="mt-1 text-body-s text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
