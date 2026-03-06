import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayJoy Gaming Portal - Free Online Games",
  description: "Play free online games at PlayJoy Gaming Portal. Over 25,000+ games available including action, puzzle, racing, and more.",
  keywords: ["games", "online games", "free games", "play games", "gaming"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
