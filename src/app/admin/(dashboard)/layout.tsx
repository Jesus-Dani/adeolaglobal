import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
