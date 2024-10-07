import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@nextui-org/link";
import clsx from "clsx";

import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

// Structured Data for SEO (JSON-LD)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Low Content AI",
  "url": "https://www.lowcontent.ai",
  "description": "AI-driven platform to create low-content books such as journals, planners, and activity books.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.lowcontent.ai/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["Low Content AI", "Low Content Books", "AI Book Creator", "KDP Tools", "Journal Design", "Activity Books"],
  openGraph: {
    title: "Low Content AI - AI-Powered Low-Content Book Creator",
    description: siteConfig.description,
    url: "https://www.lowcontent.ai",
    images: [{ url: "/og-image.jpg", width: 800, height: 600, alt: "Low Content AI Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@LowContentAI",
    title: "Low Content AI",
    description: siteConfig.description,
    images: "/og-image.jpg",
  },
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.lowcontentai.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <meta name="robots" content="index, follow" />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          "bg-cover bg-center",
          "bg-no-repeat",
          "relative"
        )}
        style={{
          backgroundImage: `url("/background.jpg")`,
        }}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col">
            <Navbar />
            <main className="w-full max-w-screen-4xl mx-auto pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="/terms"
                title="Terms of Service"
              >
                <span className="text-default-600">Copyright @</span>
                <p><span className="text-secondary">Wealthy Magnet LTD</span>, 27 Old Gloucester Street, London, United Kingdom, WC1N 3AX</p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
