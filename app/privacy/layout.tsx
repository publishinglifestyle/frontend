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
                        content="Read the privacy policy of Low Content AI to understand how we collect, use, and protect your personal data. Learn about your rights and how to contact us."
                        name="description"
                    />
                    <meta
                        content="Low Content AI, privacy policy, data protection, personal data, user rights, data security"
                        name="keywords"
                    />
                    <meta content="index, follow" name="robots" />
                    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                    <link href="https://www.lowcontent.ai/privacy-policy" rel="canonical" />
                    <meta content="Privacy Policy - Low Content AI" property="og:title" />
                    <meta
                        content="Learn about the privacy policy of Low Content AI, including data collection, usage, and user rights."
                        property="og:description"
                    />
                    <meta content="https://www.lowcontent.ai/privacy-policy" property="og:url" />
                    <meta content="/og-image.jpg" property="og:image" />
                    <meta content="summary_large_image" name="twitter:card" />
                    <meta content="Privacy Policy - Low Content AI" name="twitter:title" />
                    <meta
                        content="Understand how Low Content AI collects and protects your data. Read our privacy policy for more details."
                        name="twitter:description"
                    />
                    <meta content="/og-image.jpg" name="twitter:image" />
                    {/* Structured Data for SEO */}
                    <script
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
                        type="application/ld+json"
                    />
                </head>
            )}
            <section className="gap-4">
                <div>{children}</div>
            </section>
        </>
    );
}
