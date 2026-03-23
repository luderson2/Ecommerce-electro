import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function FrontOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">{children}</main>
      <Footer />
    </>
  );
}
