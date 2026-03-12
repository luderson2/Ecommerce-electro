export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* <Navbar /> */}
      <div className="container mx-auto flex flex-1 gap-8 px-4 py-8">
        {/* <AccountSidebar /> */}
        <main className="flex-1">{children}</main>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
