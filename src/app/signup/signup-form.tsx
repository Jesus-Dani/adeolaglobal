"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";

export function SignupForm() {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
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

      <div className="flex items-center gap-3 text-body-s text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />

      <p className="text-center text-body-s text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-plum hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
