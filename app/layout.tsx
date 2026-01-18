import type { Metadata } from "next";
import { Oswald } from "next/font/google"; 
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap", 
  style: "normal",
});

export const metadata: Metadata = {
  title: "Bus Station",
  description: "Service d'agence de voyage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${oswald.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
