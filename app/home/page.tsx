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
    const [initialEmail, setInitialEmail] = useState("");

    useEffect(() => {
        setIsClient(true);
        const params = new URLSearchParams(window.location.search);
        const signupRequested = params.get("mode") === "signup" || params.get("signup") === "1";

        if (signupRequested) {
            setIsSignUp(true);
            setIsLogin(false);
            setIsForgot(false);
        }
        setInitialEmail(params.get("email") || "");
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
                        content="Access Low Content AI to create low-content books like journals and planners using AI tools. Log in, sign up, or reset your password to get started."
                        name="description"
                    />
                    <meta
                        content="Low Content AI, AI book creator, login, sign up, forgot password, AI tools, low-content books"
                        name="keywords"
                    />
                    <meta content="index, follow" name="robots" />
                    <meta
                        content="width=device-width, initial-scale=1.0"
                        name="viewport"
                    />
                    <link href="https://www.lowcontent.ai" rel="canonical" />
                    <meta
                        content="Login or Sign Up to Low Content AI"
                        property="og:title"
                    />
                    <meta
                        content="Create low-content books with AI. Log in, sign up, or reset your password on Low Content AI."
                        property="og:description"
                    />
                    <meta content="https://www.lowcontent.ai" property="og:url" />
                    <meta content="/og-image.jpg" property="og:image" />
                    <meta content="summary_large_image" name="twitter:card" />
                    <meta
                        content="Login or Sign Up to Low Content AI"
                        name="twitter:title"
                    />
                    <meta
                        content="Create low-content books with ease using AI tools. Log in, sign up, or reset your password on Low Content AI."
                        name="twitter:description"
                    />
                    <meta content="/og-image.jpg" name="twitter:image" />
                    <script
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
                        type="application/ld+json"
                    />
                </head>
            )}
            <div className="w-full max-w-4xl px-4">
                {/* Logo and Welcome */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl border border-purple-500/30 mb-4">
                        <svg className="text-purple-400" fill="none" height="32" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="32">
                            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Welcome to Low Content AI
                    </h1>
                    <p className="text-white/50">
                        Create amazing low-content books with AI
                    </p>
                </div>

                {/* Auth Forms */}
                <div className="flex justify-center">
                    {isLogin && (
                        <div className="w-full max-w-md">
                            <Login
                                toggleToForgotPassword={toggleToForgotPassword}
                                toggleToSignUp={toggleToSignUp}
                            />
                        </div>
                    )}
                    {isSignUp && <SignUp initialEmail={initialEmail} toggleToLogin={toggleToLogin} />}
                    {isForgot && (
                        <div className="w-full max-w-md">
                            <ForgotPassword toggleToLogin={toggleToLogin} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
