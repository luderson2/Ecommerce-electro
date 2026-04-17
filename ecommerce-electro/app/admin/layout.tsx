import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

const ROLES_AUTORISES = ["admin", "employee"] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profil || !ROLES_AUTORISES.includes(profil.role as (typeof ROLES_AUTORISES)[number])) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <main className="flex-1 min-w-0 px-8 py-8">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
