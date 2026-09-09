import { Suspense } from "react";
import { HairlineDivider } from "@/components/hairline-divider";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign In | ADEOLA Global Ltd" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-center font-display text-display-l text-deep-plum">Welcome Back</h1>
      <HairlineDivider className="mx-auto mt-4 max-w-32" />
      <div className="mt-8">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
