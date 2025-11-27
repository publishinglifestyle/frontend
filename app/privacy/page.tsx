"use client";

import React from 'react';
import { motion } from "framer-motion";
import Link from "next/link";

// Icons
const ShieldIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const SectionIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 text-purple-400 flex-shrink-0">
        {children}
    </div>
);

const DataIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    </svg>
);

const CollectIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M2 12h20" />
    </svg>
);

const UseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </svg>
);

const ShareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const LockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);

const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

interface PolicySectionProps {
    number: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    delay?: number;
}

const PolicySection = ({ number, title, icon, children, delay = 0 }: PolicySectionProps) => (
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

export default function PrivacyPage() {
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
                            <ShieldIcon />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Privacy Policy
                            </h1>
                            <p className="text-white/60">
                                How we collect, use, and protect your data
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm border border-purple-500/30">
                            Last updated: August 16, 2024
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
                        This privacy policy describes how <span className="text-purple-400 font-medium">LowContent.ai</span> (hereinafter &quot;we&quot; or &quot;the site&quot;) collects, uses, and protects the personal data of users (hereinafter &quot;you&quot; or &quot;the user&quot;) who visit and use our site.
                    </p>
                </motion.div>

                {/* Policy Sections */}
                <div className="space-y-4">
                    <PolicySection number="1" title="Types of Data Collected" icon={<DataIcon />} delay={0.15}>
                        <p className="mb-4">We collect the following personal data:</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Name
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Address
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Email address
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Payment information
                            </li>
                        </ul>
                    </PolicySection>

                    <PolicySection number="2" title="Methods of Data Collection" icon={<CollectIcon />} delay={0.2}>
                        <p className="mb-4">Personal data is collected through:</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Online forms
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Site registration
                            </li>
                        </ul>
                    </PolicySection>

                    <PolicySection number="3" title="Use of Data" icon={<UseIcon />} delay={0.25}>
                        <p className="mb-4">The collected data is used for:</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Subscribing to memberships
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                Improving our site and services
                            </li>
                        </ul>
                    </PolicySection>

                    <PolicySection number="4" title="Data Sharing" icon={<ShareIcon />} delay={0.3}>
                        <p>We do not share users&apos; personal data with third parties.</p>
                    </PolicySection>

                    <PolicySection number="5" title="Data Retention" icon={<ClockIcon />} delay={0.35}>
                        <p>We retain personal data until the customer unsubscribes.</p>
                    </PolicySection>

                    <PolicySection number="6" title="User Rights" icon={<UserIcon />} delay={0.4}>
                        <p>You have the right to request the deletion of your personal data at any time. To exercise this right, you can contact us using the information provided in the contact section.</p>
                    </PolicySection>

                    <PolicySection number="7" title="Data Security" icon={<LockIcon />} delay={0.45}>
                        <p>We implement appropriate security measures to protect users&apos; personal data from unauthorized access, alterations, or disclosures.</p>
                    </PolicySection>

                    <PolicySection number="8" title="Contact Information" icon={<MailIcon />} delay={0.5}>
                        <p className="mb-4">For questions regarding this privacy policy or to exercise your rights, please contact us through the dedicated form on our site or by sending an email to:</p>
                        <a
                            href="mailto:support@lowcontent.ai"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl text-white font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
                        >
                            <MailIcon />
                            support@lowcontent.ai
                        </a>
                    </PolicySection>

                    <PolicySection number="9" title="Changes to the Privacy Policy" icon={<EditIcon />} delay={0.55}>
                        <p>We reserve the right to modify this privacy policy at any time. Changes will be posted on this page, and we encourage you to review this policy periodically for any updates.</p>
                    </PolicySection>
                </div>

                {/* Footer Link */}
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.6 }}
                >
                    <p className="text-white/50 mb-4">Also check out our</p>
                    <Link
                        href="/terms"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-200"
                    >
                        Terms and Conditions
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
