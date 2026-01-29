import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import { Providers } from "./providers";
import GlobalControls from "./components/global-controls";

const inter = Inter({
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
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <GlobalControls />
          {children}
        </Providers>
      </body>
    </html>
  );
}
