"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, body: body.trim() || null }),
    });
    const result = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
    router.refresh();
  }

  if (submitted) {
    return (
      <p className="rounded-xl border border-border bg-white p-4 text-body-m text-charcoal">
        Thanks! Your review is awaiting approval.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4">
      <p className="text-body-s font-medium text-charcoal">Your rating</p>
      <StarRating rating={rating} size="md" interactive onChange={setRating} />

      <label className="flex flex-col gap-1">
        <span className="text-body-s font-medium text-charcoal">Review (optional)</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="rounded-lg border border-border px-3 py-2 text-body-m text-charcoal"
        />
      </label>

      {error && (
        <p role="alert" className="text-body-s text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="self-start uppercase text-label tracking-wide">
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
