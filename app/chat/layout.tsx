"use client";

import React, { useState, useEffect, Suspense } from "react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false); // State to track if we're on the client

  useEffect(() => {
    setIsClient(true); // Set to true once the component mounts on the client
  }, []);

  return (
    <Suspense>
      {/* Conditionally render SEO meta tags only on the client side */}
      {isClient && (
        <head>
          <title>
            Chat with Low Content AI - Interactive AI-Powered Book Creation
          </title>
          <meta
            name="description"
            content="Engage with Low Content AI to create interactive, low-content books like journals, planners, and activity books using advanced AI tools. Join a conversation or start a new one now!"
          />
          <meta
            name="keywords"
            content="Low Content AI, AI book creator, chat, interactive content, create low-content books, AI tools, book creation"
          />
          <meta name="robots" content="index, follow" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="canonical" href="https://www.lowcontent.ai/chat" />
          <meta
            property="og:title"
            content="Chat with Low Content AI - Interactive Book Creation"
          />
          <meta
            property="og:description"
            content="Chat with AI to create low-content books. Join conversations and create interactive content effortlessly."
          />
          <meta property="og:url" content="https://www.lowcontent.ai/chat" />
          <meta property="og:image" content="/og-image.jpg" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Chat with Low Content AI - Interactive Book Creation"
          />
          <meta
            name="twitter:description"
            content="Create low-content books with ease using AI. Engage in interactive chats to enhance your content creation."
          />
          <meta name="twitter:image" content="/og-image.jpg" />
          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: "Chat with Low Content AI",
                description:
                  "Engage with Low Content AI to create interactive, low-content books.",
                url: "https://www.lowcontent.ai/chat",
                potentialAction: {
                  "@type": "SearchAction",
                  target:
                    "https://www.lowcontent.ai/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
        </head>
      )}
      <section className="gap-4">
        <div>{children}</div>
      </section>
    </Suspense>
  );
}
