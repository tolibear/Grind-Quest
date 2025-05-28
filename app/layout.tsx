import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Grind Quest - Earn $GRIND",
  description: "Complete quests, earn points, and climb the leaderboard in the $GRIND token community",
  keywords: ["GRIND", "crypto", "quests", "leaderboard", "social", "Twitter"],
  authors: [{ name: "Grind Quest" }],
  openGraph: {
    title: "Grind Quest - Earn $GRIND",
    description: "Complete quests, earn points, and climb the leaderboard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grind Quest - Earn $GRIND",
    description: "Complete quests, earn points, and climb the leaderboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
