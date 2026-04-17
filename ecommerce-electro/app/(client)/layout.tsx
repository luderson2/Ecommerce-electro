export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* On enlève le "container" et le "flex-1" d'ici pour laisser les pages respirer */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}