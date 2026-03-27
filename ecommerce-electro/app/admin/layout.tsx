import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <main className="flex-1 min-w-0 px-8 py-8">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
