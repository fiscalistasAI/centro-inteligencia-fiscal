import { redirect } from "next/navigation";

import { AppSidebar, MobileHeader } from "@/components/app-sidebar";
import { listCompanyOptions } from "@/lib/data/companies";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const companies = await listCompanyOptions();
  const userLabel =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Mi cuenta";

  return (
    <div className="flex min-h-dvh w-full">
      <AppSidebar companies={companies} userLabel={userLabel} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader companies={companies} userLabel={userLabel} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
