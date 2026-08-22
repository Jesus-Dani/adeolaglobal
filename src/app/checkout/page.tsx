import { createClient } from "@/lib/supabase/server";
import { HairlineDivider } from "@/components/hairline-divider";
import { CheckoutForm } from "./checkout-form";

export const metadata = { title: "Checkout | ADEOLA Global Ltd" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = "";
  let phone = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, phone")
      .eq("id", user.id)
      .maybeSingle();
    name = profile?.name ?? "";
    phone = profile?.phone ?? "";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-display-l text-deep-plum">Checkout</h1>
      <HairlineDivider className="mt-4 max-w-40" />
      <div className="mt-8">
        <CheckoutForm initialEmail={user?.email ?? ""} initialName={name} initialPhone={phone} />
      </div>
    </div>
  );
}
