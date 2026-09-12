"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { HairlineDivider } from "@/components/hairline-divider";
import { BankTransferDetails } from "@/components/bank-transfer-details";
import { formatNaira } from "@/lib/currency";
import { useCartStore, cartSubtotal } from "@/lib/store/cart";
import { clearCartInDb } from "@/lib/store/cart-sync";
import { createClient } from "@/lib/supabase/client";

interface CheckoutFormProps {
  isSignedIn: boolean;
  initialEmail: string;
  initialName: string;
  initialPhone: string;
}

export function CheckoutForm({ isSignedIn, initialEmail, initialName, initialPhone }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
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
      const supabase = createClient();
      let userId: string | null = null;

      if (!isSignedIn) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
        if (!data.session) {
          setError("Your account was created, but needs email verification before you can check out. Check your inbox.");
          setLoading(false);
          return;
        }
        userId = data.session.user.id;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
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

      clearCart();
      if (userId) {
        clearCartInDb(userId).catch((err) => console.error("Failed to clear synced cart:", err));
      }
      router.push(`/account/orders/${body.orderId}`);
      router.refresh();
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

        {!isSignedIn && (
          <section>
            <h2 className="font-display text-display-m text-deep-plum">Create Your Account</h2>
            <HairlineDivider className="mt-3 max-w-32" />
            <p className="mt-3 text-body-s text-muted-foreground">
              An account lets you track this order and check out faster next time.
            </p>
            <div className="mt-4 flex flex-col gap-4">
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
                <span className="text-body-s font-medium text-charcoal">Password</span>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>
            </div>
          </section>
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
            Delivery cost isn&apos;t included below. We&apos;ll arrange that with you directly after checkout.
          </p>
          <div className="mt-4">
            <BankTransferDetails amount={cartSubtotal(items)} />
          </div>

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
            {loading ? "Placing order..." : `Place Order: ${formatNaira(cartSubtotal(items))}`}
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
