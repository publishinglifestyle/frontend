"use client";

import React, { useState, useEffect } from "react";

export default function TermsLayout({
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
                    <title>Terms and Conditions - Low Content AI</title>
                    <meta
                        name="description"
                        content="Read the terms and conditions of use for Low Content AI. Understand your rights and obligations when using our website and services."
                    />
                    <meta
                        name="keywords"
                        content="Low Content AI, terms and conditions, user agreement, legal terms, site usage"
                    />
                    <meta name="robots" content="index, follow" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="canonical" href="https://www.lowcontent.ai/terms-and-conditions" />
                    <meta property="og:title" content="Terms and Conditions - Low Content AI" />
                    <meta
                        property="og:description"
                        content="Review the terms and conditions for using Low Content AI's website and services."
                    />
                    <meta property="og:url" content="https://www.lowcontent.ai/terms-and-conditions" />
                    <meta property="og:image" content="/og-image.jpg" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="Terms and Conditions - Low Content AI" />
                    <meta
                        name="twitter:description"
                        content="Understand the terms and conditions of using Low Content AI's platform and services."
                    />
                    <meta name="twitter:image" content="/og-image.jpg" />
                    {/* Structured Data for SEO */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "WebPage",
                                "name": "Terms and Conditions - Low Content AI",
                                "description": "Review the terms and conditions for using Low Content AI's services and website.",
                                "url": "https://www.lowcontent.ai/terms-and-conditions",
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
