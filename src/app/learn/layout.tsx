import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {children}
    </div>
  );
}
