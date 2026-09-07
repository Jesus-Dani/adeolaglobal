import { HairlineDivider } from "@/components/hairline-divider";
import { listReviews, REVIEW_STATUSES } from "@/lib/admin/reviews";
import { StarRating } from "@/components/star-rating";
import { ReviewStatusBadge } from "./review-status-badge";
import { ReviewFilters } from "./review-filters";
import { ReviewActions } from "./review-actions";

export const metadata = { title: "Reviews | Admin | ADEOLA Global Ltd" };

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = REVIEW_STATUSES.find((s) => s === params.status);
  const reviews = await listReviews({ status });

  return (
    <div>
      <h1 className="font-display text-display-l text-deep-plum">Reviews</h1>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-6">
        <ReviewFilters initialStatus={params.status ?? ""} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-left text-body-m">
          <thead className="border-b border-border text-body-s text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-body-s text-muted-foreground">
                  No reviews match these filters.
                </td>
              </tr>
            )}
            {reviews.map((review) => (
              <tr key={review.id} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-3 text-charcoal">{review.productName}</td>
                <td className="px-4 py-3 text-muted-foreground">{review.customerName}</td>
                <td className="px-4 py-3">
                  <StarRating rating={review.rating} />
                </td>
                <td className="px-4 py-3 max-w-xs text-charcoal">{review.body ?? "—"}</td>
                <td className="px-4 py-3">
                  <ReviewStatusBadge status={review.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </td>
                <td className="px-4 py-3">
                  <ReviewActions reviewId={review.id} currentStatus={review.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
