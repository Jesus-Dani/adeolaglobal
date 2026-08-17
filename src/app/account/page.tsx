import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HairlineDivider } from "@/components/hairline-divider";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata = { title: "My Account | ADEOLA Global Ltd" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-display-l text-deep-plum">My Account</h1>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-8 rounded-xl border border-border bg-white p-6">
        <dl className="space-y-3">
          <div className="flex justify-between text-body-m">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-charcoal">{profile?.name || "Not provided"}</dd>
          </div>
          <div className="flex justify-between text-body-m">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-charcoal">{user.email}</dd>
          </div>
          <div className="flex justify-between text-body-m">
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="text-charcoal">{profile?.phone || "Not provided"}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/account/orders"
            className="text-body-s text-plum hover:underline"
          >
            View order history
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
