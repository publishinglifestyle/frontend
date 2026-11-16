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
                        content="Read the terms and conditions of use for Low Content AI. Understand your rights and obligations when using our website and services."
                        name="description"
                    />
                    <meta
                        content="Low Content AI, terms and conditions, user agreement, legal terms, site usage"
                        name="keywords"
                    />
                    <meta content="index, follow" name="robots" />
                    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                    <link href="https://www.lowcontent.ai/terms-and-conditions" rel="canonical" />
                    <meta content="Terms and Conditions - Low Content AI" property="og:title" />
                    <meta
                        content="Review the terms and conditions for using Low Content AI's website and services."
                        property="og:description"
                    />
                    <meta content="https://www.lowcontent.ai/terms-and-conditions" property="og:url" />
                    <meta content="/og-image.jpg" property="og:image" />
                    <meta content="summary_large_image" name="twitter:card" />
                    <meta content="Terms and Conditions - Low Content AI" name="twitter:title" />
                    <meta
                        content="Understand the terms and conditions of using Low Content AI's platform and services."
                        name="twitter:description"
                    />
                    <meta content="/og-image.jpg" name="twitter:image" />
                    {/* Structured Data for SEO */}
                    <script
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
