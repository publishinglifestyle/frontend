"use client";

import React, { useState, useEffect } from "react";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <>
            {isClient && (
                <head>
                    <title>Your Profile - Manage Your Account on Low Content AI</title>
                    <meta
                        content="Manage your Low Content AI account, update your profile, change your password, and manage your subscription. Stay updated with your credits and subscription status."
                        name="description"
                    />
                    <meta
                        content="Low Content AI, profile management, account settings, update profile, manage subscription, change password"
                        name="keywords"
                    />
                    <meta content="index, follow" name="robots" />
                    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                    <link href="https://www.lowcontent.ai/profile" rel="canonical" />
                    <meta content="Manage Your Account on Low Content AI" property="og:title" />
                    <meta
                        content="Access and manage your Low Content AI account settings, profile updates, and subscriptions with ease."
                        property="og:description"
                    />
                    <meta content="https://www.lowcontent.ai/profile" property="og:url" />
                    <meta content="/og-image.jpg" property="og:image" />
                    <meta content="summary_large_image" name="twitter:card" />
                    <meta content="Manage Your Account on Low Content AI" name="twitter:title" />
                    <meta
                        content="Manage your Low Content AI account, update profile information, manage subscriptions, and check your credits."
                        name="twitter:description"
                    />
                    <meta content="/og-image.jpg" name="twitter:image" />
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
            <section className="fixed inset-0 top-16 z-40 overflow-auto">
                {children}
            </section>
        </>
    );
}
