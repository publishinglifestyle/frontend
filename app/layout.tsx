import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

// Structured Data for SEO (JSON-LD)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Low Content AI",
  url: "https://www.lowcontent.ai",
  description:
    "AI-driven platform to create low-content books such as journals, planners, and activity books.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.lowcontent.ai/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
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
  keywords: [
    "Low Content AI",
    "Low Content Books",
    "AI Book Creator",
    "KDP Tools",
    "Journal Design",
    "Activity Books",
  ],
  openGraph: {
    title: "Low Content AI - AI-Powered Low-Content Book Creator",
    description: siteConfig.description,
    url: "https://www.lowcontent.ai",
    images: [
      {
        url: "/og-image.jpg",
        width: 800,
        height: 600,
        alt: "Low Content AI Platform",
      },
    ],
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
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <link href="https://www.lowcontentai.com" rel="canonical" />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          type="application/ld+json"
        />
        <meta content="index, follow" name="robots" />
        
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1242583274036702');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1242583274036702&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
        
        {/* Endorsely Script */}
        <script 
          async 
          src="https://assets.endorsely.com/endorsely.js" 
          data-endorsely="2f92e228-4ddb-44e0-921b-11fb35bd7a39"
        />
        {/* End Endorsely Script */}
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          "bg-cover bg-center",
          "bg-no-repeat"
        )}
        style={{
          backgroundImage: `url("/background.jpg")`,
        }}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {/* Flex container to ensure the footer sticks to the bottom */}
          <div className="flex flex-col min-h-screen">
            <Navbar />
            {/* Main Content */}
            <main className="w-full flex-grow pt-16">
              {children}
            </main>

            {/* Footer inside a black div */}
            <footer className="w-full bg-black text-white text-center">
              <div className="container mx-auto flex items-center justify-center py-4">
                <Link
                  isExternal
                  className="flex flex-col md:flex-row items-center gap-1 text-current"
                  href="/terms"
                  title="Terms of Service"
                >
                  <span className="text-default-600">Copyright @</span>
                  <p>
                    <span className="text-secondary">Wealthy Magnet LTD</span>, 27
                    Old Gloucester Street, London, United Kingdom, WC1N 3AX
                  </p>
                </Link>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
