"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { HairlineDivider } from "@/components/hairline-divider";
import { formatNaira } from "@/lib/currency";
import { useCartStore, cartSubtotal } from "@/lib/store/cart";

interface CheckoutFormProps {
  initialEmail: string;
  initialName: string;
  initialPhone: string;
}

export function CheckoutForm({ initialEmail, initialName, initialPhone }: CheckoutFormProps) {
  const items = useCartStore((s) => s.items);

  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty."
        body="Add something you'll love before checking out."
        action={{ label: "Shop now", href: "/shop" }}
      />
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          email,
          delivery: { name, phone, address, notes: notes || undefined },
          termsAccepted: acceptedTerms,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = body.authorizationUrl;
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:order-1">
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-body-s text-destructive">
            {error}
          </p>
        )}

        <section>
          <h2 className="font-display text-display-m text-deep-plum">Delivery Information</h2>
          <HairlineDivider className="mt-3 max-w-32" />
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-body-s font-medium text-charcoal">Full name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-body-s font-medium text-charcoal">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-body-s font-medium text-charcoal">Phone</span>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-body-s font-medium text-charcoal">Delivery address</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-body-s font-medium text-charcoal">Delivery notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="font-display text-display-m text-deep-plum">Payment</h2>
          <HairlineDivider className="mt-3 max-w-32" />
          <p className="mt-4 text-body-s text-muted-foreground">
            You&apos;ll be redirected to Paystack to complete payment by card, bank transfer, or USSD.
            Delivery cost is arranged with you directly after checkout.
          </p>

          <label className="mt-4 flex items-start gap-2 text-body-s text-charcoal">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border accent-plum"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-plum hover:underline" target="_blank">
                Terms of Service
              </Link>
              .
            </span>
          </label>

          <Button type="submit" size="lg" disabled={loading} className="mt-4 w-full uppercase text-label tracking-wide">
            {loading ? "Redirecting to payment..." : `Pay ${formatNaira(cartSubtotal(items))}`}
          </Button>
        </section>
      </form>

      <aside className="lg:order-2">
        <h2 className="font-display text-display-m text-deep-plum">Your Order</h2>
        <HairlineDivider className="mt-3 max-w-32" />
        <ul className="mt-4 space-y-4">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-soft-lilac">
                {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-body-m text-charcoal">{item.productName}</p>
                {item.variantLabel && (
                  <p className="text-body-s text-muted-foreground">
                    {item.variantLabel} × {item.quantity}
                  </p>
                )}
              </div>
              <span className="text-body-m font-semibold tabular-nums text-plum">
                {formatNaira(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-body-l">
          <span className="text-charcoal">Subtotal</span>
          <span className="text-price font-bold tabular-nums text-plum">{formatNaira(cartSubtotal(items))}</span>
        </div>
      </aside>
    </div>
  );
}
