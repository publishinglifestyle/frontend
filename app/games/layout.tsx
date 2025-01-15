"use client";

import React, { useState, useEffect } from "react";

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false); // State to track if we're on the client

  useEffect(() => {
    setIsClient(true); // Set to true once the component mounts on the client
  }, []);

  return (
    <>
      {isClient && (
        <head>
          <title>
            Play and Create Games with Low Content AI - Interactive Game
            Generation
          </title>
          <meta
            name="description"
            content="Create and play a variety of interactive games like Sudoku, Crossword, and Word Search with Low Content AI. Customize and generate games with ease using advanced AI tools."
          />
          <meta
            name="keywords"
            content="Low Content AI, AI game creator, interactive games, Sudoku, Crossword, Word Search, Hangman, game creation tools"
          />
          <meta name="robots" content="index, follow" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="canonical" href="https://www.lowcontent.ai/games" />
          <meta
            property="og:title"
            content="Play and Create Games with Low Content AI"
          />
          <meta
            property="og:description"
            content="Create and play a variety of games with AI. Customize your game experience with Low Content AI's interactive tools."
          />
          <meta property="og:url" content="https://www.lowcontent.ai/games" />
          <meta property="og:image" content="/og-image.jpg" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Play and Create Games with Low Content AI"
          />
          <meta
            name="twitter:description"
            content="Explore interactive game creation and play with Low Content AI. Generate Sudoku, Crossword, and more using AI tools."
          />
          <meta name="twitter:image" content="/og-image.jpg" />
          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: "Play and Create Games with Low Content AI",
                description:
                  "Create and play a variety of interactive games using AI.",
                url: "https://www.lowcontent.ai/games",
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
      <section className="gap-4 py-8 md:py-10">
        <div>{children}</div>
      </section>
    </>
  );
}
