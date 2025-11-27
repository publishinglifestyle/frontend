"use client";

import React from 'react';
import { motion } from "framer-motion";
import Link from "next/link";

// Icons
const DocumentIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const SectionIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 text-purple-400 flex-shrink-0">
        {children}
    </div>
);

const CheckCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const CreditCardIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);

const RefundIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
);

const GlobeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);

const CopyrightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M14.83 14.83a4 4 0 110-5.66" />
    </svg>
);

const CoinsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1110.34 18" />
        <path d="M7 6h1v4" />
        <path d="M16.71 13.88l.7.71-2.82 2.82" />
    </svg>
);

const AlertIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const ScaleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="3" x2="12" y2="21" />
        <polyline points="3 12 6 9 9 12" />
        <polyline points="15 12 18 9 21 12" />
        <line x1="3" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="21" y2="12" />
    </svg>
);

const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

interface TermsSectionProps {
    number: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    delay?: number;
}

const TermsSection = ({ number, title, icon, children, delay = 0 }: TermsSectionProps) => (
    <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay }}
    >
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
            <SectionIcon>{icon}</SectionIcon>
            <div>
                <span className="text-purple-400 text-sm font-medium">Section {number}</span>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
        </div>
        <div className="p-5 text-white/70 leading-relaxed">
            {children}
        </div>
    </motion.div>
);

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4 py-8 md:px-6 overflow-auto">
            {/* Background Gradient Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                            <DocumentIcon />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Terms and Conditions
                            </h1>
                            <p className="text-white/60">
                                Please read these terms carefully before using our services
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm border border-purple-500/30">
                            Last updated: January 9, 2025
                        </span>
                    </div>
                </motion.div>

                {/* Introduction */}
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.1 }}
                >
                    <p className="text-white/70 leading-relaxed">
                        Welcome to <span className="text-purple-400 font-medium">LowContent.ai</span>. By using our website and services, you agree to comply with the following terms and conditions. Please read them carefully before using the platform.
                    </p>
                </motion.div>

                {/* Terms Sections */}
                <div className="space-y-4">
                    <TermsSection number="1" title="Acceptance of Terms" icon={<CheckCircleIcon />} delay={0.15}>
                        <p>By accessing LowContent.ai or subscribing to any of our services, you agree to be bound by these terms and conditions. If you do not agree, please do not use the site.</p>
                    </TermsSection>

                    <TermsSection number="2" title="Changes to Terms" icon={<EditIcon />} delay={0.2}>
                        <p>We reserve the right to modify these terms at any time. Changes will be published on this page, and continued use of the site after such updates will constitute implicit acceptance.</p>
                    </TermsSection>

                    <TermsSection number="3" title="Subscriptions and Automatic Renewal" icon={<CreditCardIcon />} delay={0.25}>
                        <p className="mb-4">By subscribing to a paid plan, you agree that the subscription will automatically renew at the end of each billing cycle (monthly or yearly, depending on the plan). The amount will be charged automatically to the payment method on file unless you cancel the subscription before the renewal date through your personal account area.</p>
                        <p>We reserve the right to adjust subscription prices. In case of changes, users will be notified by email at least 7 days in advance of the renewal.</p>
                    </TermsSection>

                    <TermsSection number="4" title="Right of Withdrawal (EU Consumers Only)" icon={<RefundIcon />} delay={0.3}>
                        <p className="mb-4">In accordance with European regulations, consumers residing in the EU have the right to withdraw from the purchase within 14 days from the subscription or automatic renewal date, provided that:</p>
                        <ul className="space-y-2 mb-4">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                                <span>the service has not been used (e.g., content generation after renewal);</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                                <span>the user has not explicitly waived the right of withdrawal during the purchase process.</span>
                            </li>
                        </ul>
                        <p className="mb-4">
                            To exercise the right of withdrawal, you must contact{' '}
                            <a href="mailto:support@lowcontent.ai" className="text-purple-400 hover:text-purple-300 underline">
                                support@lowcontent.ai
                            </a>{' '}
                            within the allowed period. If accepted, the amount will be refunded to the original payment method.
                        </p>
                        <div className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <div className="text-orange-400 mt-0.5">
                                <AlertIcon />
                            </div>
                            <p className="text-orange-300">
                                <strong>Please note:</strong> Once the subscription has been renewed and the service activated, no refunds will be issued, even in case of non-use.
                            </p>
                        </div>
                    </TermsSection>

                    <TermsSection number="5" title="Use of the Site" icon={<GlobeIcon />} delay={0.35}>
                        <p>Users agree to use the site lawfully and in compliance with applicable regulations. Any misuse, illegal or unauthorized activity may result in account suspension or termination.</p>
                    </TermsSection>

                    <TermsSection number="6" title="Intellectual Property and Content Ownership" icon={<CopyrightIcon />} delay={0.4}>
                        <p className="mb-4">All content on LowContent.ai (text, images, logos, graphics, software) is the property of LowContent.ai or its licensors and is protected by copyright laws.</p>
                        <p className="mb-4">With a paid subscription, users acquire full ownership of generated content, including text and images. Users have the exclusive right to use, modify, and distribute such content even after cancellation or downgrade of the subscription.</p>
                        <p>LowContent.ai does not claim any rights over content generated by the user during the subscription period but reserves the right to use it for promotional or service improvement purposes with the user&apos;s prior consent.</p>
                    </TermsSection>

                    <TermsSection number="7" title="Content Generation and Tokens" icon={<CoinsIcon />} delay={0.45}>
                        <p className="mb-4">Content generation (text and images) is based on a token system:</p>
                        <ul className="space-y-2 mb-4">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Each image costs 200,000 tokens
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Each generated word costs approximately 1.33 tokens
                            </li>
                        </ul>
                        <p className="mb-4">Token usage includes:</p>
                        <ul className="space-y-2 mb-4">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                User input (prompt)
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Internal processing (e.g., title generation, tool selection)
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                AI-generated output
                            </li>
                        </ul>
                        <p>Actual usage may vary based on the length and complexity of the content.</p>
                    </TermsSection>

                    <TermsSection number="8" title="Limitation of Liability" icon={<AlertIcon />} delay={0.5}>
                        <p>LowContent.ai shall not be liable for any direct or indirect damages resulting from the use or inability to use the platform, including data loss or business interruption.</p>
                    </TermsSection>

                    <TermsSection number="9" title="Privacy" icon={<ShieldIcon />} delay={0.55}>
                        <p className="mb-4">We respect your privacy. Please refer to our Privacy Policy to understand how we collect, use, and protect your personal data.</p>
                        <Link
                            href="/privacy"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-200"
                        >
                            <ShieldIcon />
                            View Privacy Policy
                        </Link>
                    </TermsSection>

                    <TermsSection number="10" title="Governing Law and Jurisdiction" icon={<ScaleIcon />} delay={0.6}>
                        <p>These terms are governed by Italian law. Any disputes will be subject to the exclusive jurisdiction of the Court of Milan (MI).</p>
                    </TermsSection>

                    <TermsSection number="11" title="Contact" icon={<MailIcon />} delay={0.65}>
                        <p className="mb-4">For any questions or information regarding these terms and conditions, please contact us at:</p>
                        <a
                            href="mailto:support@lowcontent.ai"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl text-white font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
                        >
                            <MailIcon />
                            support@lowcontent.ai
                        </a>
                    </TermsSection>
                </div>

                {/* Footer Link */}
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.7 }}
                >
                    <p className="text-white/50 mb-4">Also check out our</p>
                    <Link
                        href="/privacy"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-200"
                    >
                        Privacy Policy
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
