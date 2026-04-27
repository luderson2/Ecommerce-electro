import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ÉlectroMétropolitain - Électroménagers au Québec",
    template: "%s | ÉlectroMétropolitain",
  },
  description:
    "Achetez vos électroménagers en ligne : réfrigérateurs, laveuses, cuisinières et plus. Livraison rapide au Québec.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  applicationName: "ÉlectroMétropolitain",
  keywords: [
    "électroménagers",
    "électroménagers Montréal",
    "réfrigérateurs",
    "laveuses",
    "cuisinières",
    "livraison électroménagers Québec",
  ],
  authors: [{ name: "ÉlectroMétropolitain" }],
  creator: "ÉlectroMétropolitain",
  publisher: "ÉlectroMétropolitain",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    siteName: "ÉlectroMétropolitain",
    title: "ÉlectroMétropolitain - Électroménagers au Québec",
    description:
      "Magasinez des électroménagers de qualité avec livraison rapide au Québec.",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "ÉlectroMétropolitain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ÉlectroMétropolitain - Électroménagers au Québec",
    description:
      "Magasinez des électroménagers de qualité avec livraison rapide au Québec.",
    images: ["/og-default.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
