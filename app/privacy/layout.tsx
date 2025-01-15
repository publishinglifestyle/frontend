"use client";

import React, { useState, useEffect } from "react";

export default function PrivacyLayout({
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
            {/* Conditionally render SEO meta tags only on the client side */}
            {isClient && (
                <head>
                    <title>Privacy Policy - Low Content AI</title>
                    <meta
                        name="description"
                        content="Read the privacy policy of Low Content AI to understand how we collect, use, and protect your personal data. Learn about your rights and how to contact us."
                    />
                    <meta
                        name="keywords"
                        content="Low Content AI, privacy policy, data protection, personal data, user rights, data security"
                    />
                    <meta name="robots" content="index, follow" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="canonical" href="https://www.lowcontent.ai/privacy-policy" />
                    <meta property="og:title" content="Privacy Policy - Low Content AI" />
                    <meta
                        property="og:description"
                        content="Learn about the privacy policy of Low Content AI, including data collection, usage, and user rights."
                    />
                    <meta property="og:url" content="https://www.lowcontent.ai/privacy-policy" />
                    <meta property="og:image" content="/og-image.jpg" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="Privacy Policy - Low Content AI" />
                    <meta
                        name="twitter:description"
                        content="Understand how Low Content AI collects and protects your data. Read our privacy policy for more details."
                    />
                    <meta name="twitter:image" content="/og-image.jpg" />
                    {/* Structured Data for SEO */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "WebPage",
                                "name": "Privacy Policy - Low Content AI",
                                "description": "Learn about Low Content AI's privacy practices, including data collection and user rights.",
                                "url": "https://www.lowcontent.ai/privacy-policy",
                                "potentialAction": {
                                    "@type": "SearchAction",
                                    "target": "https://www.lowcontent.ai/search?q={search_term_string}",
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
        </>
    );
}
