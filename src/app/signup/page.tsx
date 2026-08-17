import { HairlineDivider } from "@/components/hairline-divider";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Create Account | ADEOLA Global Ltd" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-center font-display text-display-l text-deep-plum">Create Account</h1>
      <HairlineDivider className="mx-auto mt-4 max-w-32" />
      <div className="mt-8">
        <SignupForm />
      </div>
    </div>
  );
}
