import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/admin-session";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-soft-lilac">
      <AdminNav />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
