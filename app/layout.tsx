import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Footer } from '@/components/Footer';

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Map Visualization Tool",
  description: "Interactive map visualization for location data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} flex flex-col min-h-screen bg-gray-900 text-white antialiased`}>
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
