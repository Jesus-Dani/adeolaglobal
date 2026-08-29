import { HairlineDivider } from "@/components/hairline-divider";
import { AdminLoginForm } from "./login-form";

export const metadata = { title: "Admin Login | ADEOLA Global Ltd" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh_-_4rem)] items-center justify-center bg-soft-lilac px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-8">
        <h1 className="text-center font-display text-display-m text-deep-plum">Admin</h1>
        <HairlineDivider className="mx-auto mt-3 max-w-32" />
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
