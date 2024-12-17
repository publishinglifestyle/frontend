"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../auth-context";
import Login from "../auth/login";
import SignUp from "../auth/signup";
import ForgotPassword from "../auth/forgot";

export default function Main() {
    const { isAuthenticated: isAuthenticatedClient } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [isForgot, setIsForgot] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (isAuthenticatedClient) {
            window.location.href = "/chat";
        }
    }, [isAuthenticatedClient]);

    const toggleToSignUp = () => {
        setIsSignUp(true);
        setIsLogin(false);
        setIsForgot(false);
    };

    const toggleToLogin = () => {
        setIsSignUp(false);
        setIsLogin(true);
        setIsForgot(false);
    };

    const toggleToForgotPassword = () => {
        setIsSignUp(false);
        setIsLogin(false);
        setIsForgot(true);
    };

    return (
        <>
            {isClient && (
                <head>
                    <title>
                        Login or Sign Up to Low Content AI - AI-Powered Book Creation
                        Platform
                    </title>
                    <meta
                        name="description"
                        content="Access Low Content AI to create low-content books like journals and planners using AI tools. Log in, sign up, or reset your password to get started."
                    />
                    <meta
                        name="keywords"
                        content="Low Content AI, AI book creator, login, sign up, forgot password, AI tools, low-content books"
                    />
                    <meta name="robots" content="index, follow" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    />
                    <link rel="canonical" href="https://www.lowcontent.ai" />
                    <meta
                        property="og:title"
                        content="Login or Sign Up to Low Content AI"
                    />
                    <meta
                        property="og:description"
                        content="Create low-content books with AI. Log in, sign up, or reset your password on Low Content AI."
                    />
                    <meta property="og:url" content="https://www.lowcontent.ai" />
                    <meta property="og:image" content="/og-image.jpg" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta
                        name="twitter:title"
                        content="Login or Sign Up to Low Content AI"
                    />
                    <meta
                        name="twitter:description"
                        content="Create low-content books with ease using AI tools. Log in, sign up, or reset your password on Low Content AI."
                    />
                    <meta name="twitter:image" content="/og-image.jpg" />
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "WebPage",
                                name: "Login or Sign Up to Low Content AI",
                                description:
                                    "Access Low Content AI to create low-content books using AI tools.",
                                url: "https://www.lowcontent.ai",
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
            <div className="flex flex-col text-center align-center items-center w-full">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Welcome to Low Content AI
                </h1>
            </div>
            <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:py-10">
                <div className="w-full md:w-1/2">
                    {isLogin && (
                        <Login
                            toggleToForgotPassword={toggleToForgotPassword}
                            toggleToSignUp={toggleToSignUp}
                        />
                    )}
                    {isSignUp && <SignUp toggleToLogin={toggleToLogin} />}
                    {isForgot && <ForgotPassword toggleToLogin={toggleToLogin} />}
                </div>
            </section>
        </>
    );
}
