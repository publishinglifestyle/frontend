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
            content="Create and play a variety of interactive games like Sudoku, Crossword, and Word Search with Low Content AI. Customize and generate games with ease using advanced AI tools."
            name="description"
          />
          <meta
            content="Low Content AI, AI game creator, interactive games, Sudoku, Crossword, Word Search, Hangman, game creation tools"
            name="keywords"
          />
          <meta content="index, follow" name="robots" />
          <meta
            content="width=device-width, initial-scale=1.0"
            name="viewport"
          />
          <link href="https://www.lowcontent.ai/games" rel="canonical" />
          <meta
            content="Play and Create Games with Low Content AI"
            property="og:title"
          />
          <meta
            content="Create and play a variety of games with AI. Customize your game experience with Low Content AI's interactive tools."
            property="og:description"
          />
          <meta content="https://www.lowcontent.ai/games" property="og:url" />
          <meta content="/og-image.jpg" property="og:image" />
          <meta content="summary_large_image" name="twitter:card" />
          <meta
            content="Play and Create Games with Low Content AI"
            name="twitter:title"
          />
          <meta
            content="Explore interactive game creation and play with Low Content AI. Generate Sudoku, Crossword, and more using AI tools."
            name="twitter:description"
          />
          <meta content="/og-image.jpg" name="twitter:image" />
          {/* Structured Data for SEO */}
          <script
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
            type="application/ld+json"
          />
        </head>
      )}
      <section className="fixed inset-0 top-16 z-40 overflow-auto">
        {children}
      </section>
    </>
  );
}
