import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CP Circle — Find Property. Find Brokers. All Mumbai.",
  description:
    "Mumbai's largest broker-to-broker real estate network. Search 40,000+ listings across 108 localities. Connect with verified RERA brokers instantly via WhatsApp.",
  keywords: "Mumbai real estate, property broker, Mumbai flats, BHK Mumbai, property for sale Mumbai, property for rent Mumbai",
  openGraph: {
    title: "CP Circle — Mumbai Real Estate Broker Network",
    description: "Search properties and connect with verified brokers across all 108 Mumbai localities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
