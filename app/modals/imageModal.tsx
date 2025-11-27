"use client"

import { useEffect, useState } from "react";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
}

// Icons
const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const ImageIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const CopyIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, isOpen, onClose }) => {
    const [translations, setTranslations] = useState<Translations | null>(null);
    const [copied, setCopied] = useState(false);

    // URL already has unique timestamp from upload
    const displayImageUrl = imageUrl || '';

    useEffect(() => {
        const detectLanguage = async () => {
            const browserLanguage = navigator.language;
            const translations = await getTranslations(browserLanguage);
            setTranslations(translations);
        };
        detectLanguage();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setCopied(false);
        }
    }, [isOpen]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(imageUrl)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error('Failed to copy:', err);
            });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="
                        relative w-full max-w-lg
                        bg-gradient-to-b from-zinc-800/95 to-zinc-900/95
                        backdrop-blur-xl
                        rounded-3xl
                        border border-white/10
                        shadow-2xl shadow-purple-500/10
                        pointer-events-auto
                        overflow-hidden
                        animate-scale-in
                    "
                >
                    {/* Purple glow effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors text-white/50 hover:text-white z-10"
                    >
                        <CloseIcon />
                    </button>

                    {/* Content */}
                    <div className="relative px-8 pt-8 pb-6">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                                <div className="text-purple-400">
                                    <ImageIcon />
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-white text-center mb-2">
                            Image Ready!
                        </h2>

                        {/* Subtitle */}
                        <p className="text-white/60 text-center text-sm mb-6">
                            Your image has been uploaded and attached to your message
                        </p>

                        {/* Preview */}
                        <div className="bg-black/30 rounded-2xl p-3 mb-6 border border-white/5">
                            <img
                                key={imageUrl}
                                src={displayImageUrl}
                                alt="Uploaded content"
                                className="w-full max-h-48 object-contain rounded-xl"
                                crossOrigin="anonymous"
                            />
                        </div>

                        {/* Info text */}
                        <p className="text-white/50 text-xs text-center mb-6">
                            Type your message and send to use this image as a reference
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyToClipboard}
                                className="
                                    flex-1 flex items-center justify-center gap-2
                                    px-4 py-3 rounded-xl
                                    bg-white/5 hover:bg-white/10
                                    border border-white/10
                                    text-white/80 hover:text-white
                                    transition-all duration-200
                                "
                            >
                                {copied ? <CheckIcon /> : <CopyIcon />}
                                <span className="text-sm font-medium">
                                    {copied ? "Copied!" : "Copy URL"}
                                </span>
                            </button>

                            <button
                                onClick={onClose}
                                className="
                                    flex-[2] px-6 py-3 rounded-xl
                                    bg-gradient-to-r from-purple-600 to-violet-600
                                    hover:from-purple-500 hover:to-violet-500
                                    text-white font-semibold
                                    transition-all duration-200
                                    shadow-lg shadow-purple-500/25
                                    hover:shadow-purple-500/40
                                "
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImageModal;
