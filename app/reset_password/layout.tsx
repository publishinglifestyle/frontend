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
                        content="Reset your password for Low Content AI. Enter your new password to regain access to your account and continue creating with AI tools."
                        name="description"
                    />
                    <meta
                        content="Low Content AI, reset password, account recovery, secure password change"
                        name="keywords"
                    />
                    <meta content="index, follow" name="robots" />
                    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                    <link href="https://www.lowcontent.ai/reset-password" rel="canonical" />
                    <meta content="Reset Your Password - Low Content AI" property="og:title" />
                    <meta
                        content="Reset your password for Low Content AI to regain access to your account and continue your work."
                        property="og:description"
                    />
                    <meta content="https://www.lowcontent.ai/reset-password" property="og:url" />
                    <meta content="/og-image.jpg" property="og:image" />
                    <meta content="summary_large_image" name="twitter:card" />
                    <meta content="Reset Your Password - Low Content AI" name="twitter:title" />
                    <meta
                        content="Recover your Low Content AI account by resetting your password."
                        name="twitter:description"
                    />
                    <meta content="/og-image.jpg" name="twitter:image" />
                    {/* Structured Data for SEO */}
                    <script
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
                        type="application/ld+json"
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
