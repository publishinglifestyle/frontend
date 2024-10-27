"use client";

import React, { useState, useEffect } from "react";

export default function ProfileLayout({
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
                    <title>Your Profile - Manage Your Account on Low Content AI</title>
                    <meta
                        name="description"
                        content="Manage your Low Content AI account, update your profile, change your password, and manage your subscription. Stay updated with your credits and subscription status."
                    />
                    <meta
                        name="keywords"
                        content="Low Content AI, profile management, account settings, update profile, manage subscription, change password"
                    />
                    <meta name="robots" content="index, follow" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="canonical" href="https://www.lowcontent.ai/profile" />
                    <meta property="og:title" content="Manage Your Account on Low Content AI" />
                    <meta
                        property="og:description"
                        content="Access and manage your Low Content AI account settings, profile updates, and subscriptions with ease."
                    />
                    <meta property="og:url" content="https://www.lowcontent.ai/profile" />
                    <meta property="og:image" content="/og-image.jpg" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="Manage Your Account on Low Content AI" />
                    <meta
                        name="twitter:description"
                        content="Manage your Low Content AI account, update profile information, manage subscriptions, and check your credits."
                    />
                    <meta name="twitter:image" content="/og-image.jpg" />
                    {/* Structured Data for SEO */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "WebPage",
                                "name": "Manage Your Account on Low Content AI",
                                "description": "Manage your account settings and subscription on Low Content AI.",
                                "url": "https://www.lowcontent.ai/profile",
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
