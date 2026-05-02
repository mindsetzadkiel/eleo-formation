import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLayout } from "@/components/layout/admin-layout";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN" && user.role !== "FORMATEUR") {
    redirect("/learn");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
