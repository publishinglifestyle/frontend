"use client";

import React, { useState, useEffect } from "react";

export default function ResetPasswordLayout({
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
                    <title>Reset Your Password - Low Content AI</title>
                    <meta
                        name="description"
                        content="Reset your password for Low Content AI. Enter your new password to regain access to your account and continue creating with AI tools."
                    />
                    <meta
                        name="keywords"
                        content="Low Content AI, reset password, account recovery, secure password change"
                    />
                    <meta name="robots" content="index, follow" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="canonical" href="https://www.lowcontent.ai/reset-password" />
                    <meta property="og:title" content="Reset Your Password - Low Content AI" />
                    <meta
                        property="og:description"
                        content="Reset your password for Low Content AI to regain access to your account and continue your work."
                    />
                    <meta property="og:url" content="https://www.lowcontent.ai/reset-password" />
                    <meta property="og:image" content="/og-image.jpg" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="Reset Your Password - Low Content AI" />
                    <meta
                        name="twitter:description"
                        content="Recover your Low Content AI account by resetting your password."
                    />
                    <meta name="twitter:image" content="/og-image.jpg" />
                    {/* Structured Data for SEO */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "WebPage",
                                "name": "Reset Your Password - Low Content AI",
                                "description": "Reset your password to regain access to your Low Content AI account.",
                                "url": "https://www.lowcontent.ai/reset-password",
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
            <section className="flex items-center justify-center gap-4 py-8 md:py-10">
                <div className="text-center">
                    {children}
                </div>
            </section>
        </>
    );
}
