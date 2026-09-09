"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    // Email confirmation is off for this project, so signUp returns an
    // active session immediately — the customer is signed in on account
    // creation, not stuck verifying email before they can check out. The
    // "check your email" branch below only matters if that setting is ever
    // switched back on in the Supabase dashboard.
    if (data.session) {
      router.push(searchParams.get("next") ?? "/account");
      router.refresh();
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg bg-soft-lilac px-4 py-6 text-center">
        <p className="text-body-l text-charcoal">Check your email to verify your account.</p>
        <p className="mt-1 text-body-s text-muted-foreground">
          We sent a confirmation link to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-body-s text-destructive">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-body-s font-medium text-charcoal">Name</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-body-s font-medium text-charcoal">Email</span>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-body-s font-medium text-charcoal">Password</span>
        <Input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </label>

      <label className="flex items-start gap-2 text-body-s text-charcoal">
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
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-plum hover:underline" target="_blank">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <Button type="submit" disabled={loading} className="mt-2 uppercase text-label tracking-wide">
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-body-s text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-plum hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
