import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin-ext"],
  display: "auto",
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "BusStation - MarketPlace de voyages en ligne au Cameroun",
  description:
    "Réservez vos billets de bus en ligne auprès des meilleures agences de transport du Cameroun. Paiement sécurisé et confirmation immédiate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            /* Liaison avec la police Inter */
            --font-inter: ${inter.style.fontFamily};
            
            /* Font Sizes */
            --font-size-xs: 0.75rem;
            --font-size-sm: 0.875rem;
            --font-size-base: 1rem;
            --font-size-lg: 1.125rem;
            --font-size-xl: 1.25rem;
            --font-size-2xl: 1.5rem;
            --font-size-3xl: 1.875rem;
            --font-size-4xl: 2.25rem;
            --font-size-5xl: 3rem;
            
            /* Font Weights */
            --font-weight-normal: 400;
            --font-weight-medium: 500;
            --font-weight-semibold: 600;
            --font-weight-bold: 700;
            
            /* Line Heights */
            --line-height-tight: 1.2;
            --line-height-snug: 1.375;
            --line-height-normal: 1.5;
            --line-height-relaxed: 1.6;
            --line-height-loose: 1.75;
            
            /* Letter Spacing */
            --letter-spacing-tight: -0.025em;
            --letter-spacing-normal: 0;
            --letter-spacing-wide: 0.025em;
          }
          
          /* Application globale avec Inter */
          body {
            font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: var(--font-size-base);
            font-weight: var(--font-weight-normal);
            line-height: var(--line-height-normal);
          }
          
          /* Typographie des titres */
          h1, h2, h3, h4, h5, h6 {
            font-weight: var(--font-weight-bold);
            line-height: var(--line-height-tight);
            letter-spacing: var(--letter-spacing-tight);
          }
          
          h1 { font-size: var(--font-size-5xl); }
          h2 { font-size: var(--font-size-4xl); }
          h3 { font-size: var(--font-size-2xl); }
          h4 { font-size: var(--font-size-xl); }
          
          p { line-height: var(--line-height-relaxed); }
          
          strong, b { font-weight: var(--font-weight-semibold); }
          
          small { font-size: var(--font-size-sm); }
          
          button, input, select, textarea {
            font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            :root {
              --font-size-4xl: 2rem;
              --font-size-5xl: 2.5rem;
            }
          }
        `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}