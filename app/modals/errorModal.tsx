"use client"

import { useEffect, useState } from "react";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

// Animated Error Icon
const ErrorIcon = () => (
    <div className="relative">
        {/* Pulsing background */}
        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
        {/* Icon container */}
        <div className="relative w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/30">
            <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-red-500"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        </div>
    </div>
);

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
    const [translations, setTranslations] = useState<Translations | null>(null);

    useEffect(() => {
        const detectLanguage = async () => {
            const browserLanguage = navigator.language;
            const translations = await getTranslations(browserLanguage);
            setTranslations(translations);
        };

        detectLanguage();
    }, []);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="
                        relative w-full max-w-md
                        bg-gradient-to-b from-zinc-800/95 to-zinc-900/95
                        backdrop-blur-xl
                        rounded-3xl
                        border border-white/10
                        shadow-2xl shadow-red-500/10
                        pointer-events-auto
                        overflow-hidden
                        animate-scale-in
                    "
                >
                    {/* Red glow effect at top */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors text-white/50 hover:text-white z-10"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content */}
                    <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
                        {/* Icon */}
                        <div className="mb-6">
                            <ErrorIcon />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {translations?.attention || "Oops!"}
                        </h2>

                        {/* Message */}
                        <p className="text-white/70 text-base leading-relaxed mb-8 max-w-sm">
                            {message || "Something went wrong. Please try again."}
                        </p>

                        {/* Button */}
                        <button
                            onClick={onClose}
                            className="
                                w-full max-w-xs px-8 py-3.5
                                bg-gradient-to-r from-red-500 to-red-600
                                hover:from-red-600 hover:to-red-700
                                text-white font-semibold
                                rounded-xl
                                transition-all duration-200
                                shadow-lg shadow-red-500/25
                                hover:shadow-red-500/40
                                hover:scale-[1.02]
                                active:scale-[0.98]
                            "
                        >
                            {translations?.understood || "Got it"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ErrorModal;
