import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Activity } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RateMyAPI",
  description: "Rate and discover the best APIs",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
      >
        {/* Navbar */}
        <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="bg-teal-500 rounded-full p-2">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RateMyAPI</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white transition"
              >
                All APIs
              </Link>
              <Link 
                href="/submit" 
                className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition font-semibold"
              >
                Submit API
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}