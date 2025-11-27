"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';
import { uploadImage } from "@/managers/conversationsManager";

interface CommandsModalProps {
    agentId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (selectedCommands: Array<{ command: string, value: string }>) => void;
    conversationId?: string;
}

// Icons
const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const SmallCloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const CommandIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z" />
    </svg>
);

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
);

const ImageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

// Aspect ratios for Midjourney
const aspectRatios = [
    { key: "1:1", label: "1:1 (Square)", description: "Perfect square format" },
    { key: "16:9", label: "16:9 (Wide)", description: "YouTube, presentations" },
    { key: "9:16", label: "9:16 (Vertical)", description: "Stories, Reels, TikTok" },
    { key: "4:3", label: "4:3", description: "Classic photo ratio" },
    { key: "3:4", label: "3:4", description: "Portrait photos" },
    { key: "3:2", label: "3:2", description: "Standard landscape" },
    { key: "2:3", label: "2:3", description: "Standard portrait" },
];

// Aspect Ratio Visual Preview Component
const AspectRatioPreview = ({ ratio, isSelected, isPurple }: { ratio: string; isSelected: boolean; isPurple?: boolean }) => {
    const getPreviewDimensions = (ratio: string) => {
        const [w, h] = ratio.split(":").map(Number);
        const maxSize = 32;
        if (w > h) {
            return { width: maxSize, height: (maxSize * h) / w };
        } else if (h > w) {
            return { width: (maxSize * w) / h, height: maxSize };
        }
        return { width: maxSize, height: maxSize };
    };

    const { width, height } = getPreviewDimensions(ratio);

    return (
        <div
            className={`
                flex items-center justify-center
                transition-all duration-200
                ${isSelected ? "opacity-100" : "opacity-60"}
            `}
            style={{ width: 40, height: 40 }}
        >
            <div
                className={`
                    rounded-sm border-2 transition-all duration-200
                    ${isSelected
                        ? isPurple
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-orange-500 bg-orange-500/20"
                        : "border-white/30 bg-white/5"
                    }
                `}
                style={{ width, height }}
            />
        </div>
    );
};

// Loading Spinner
const LoadingSpinner = () => (
    <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
);

// Commands (excluding --aspect and --cref which are handled separately)
const commands = [
    {
        value: '--chaos',
        description: 'Change how varied the results will be.',
        has_parameter: true,
        placeholder: '0-100'
    },
    {
        value: '--iw',
        description: 'Image prompt weight relative to text.',
        has_parameter: true,
        placeholder: '0-2 (default: 1)'
    },
    {
        value: '--no',
        description: 'Negative prompting - exclude elements.',
        has_parameter: true,
        placeholder: 'Elements to exclude'
    },
    {
        value: '--quality',
        description: 'Rendering quality time.',
        has_parameter: true,
        placeholder: '0.25, 0.5, 1'
    },
    {
        value: '--style random',
        description: 'Add random 32 base styles Style Tuner code.',
        has_parameter: false,
        placeholder: ''
    },
    {
        value: '--repeat',
        description: 'Create multiple jobs from a single prompt.',
        has_parameter: true,
        placeholder: '2-40'
    },
    {
        value: '--style',
        description: 'Switch between Midjourney and Niji versions.',
        has_parameter: true,
        placeholder: 'raw, cute, scenic, etc.'
    },
    {
        value: '--stylize',
        description: 'Influence aesthetic style strength.',
        has_parameter: true,
        placeholder: '0-1000 (default: 100)'
    },
    {
        value: '--tile',
        description: 'Generate seamless repeating patterns.',
        has_parameter: false,
        placeholder: ''
    },
    {
        value: '--weird',
        description: 'Explore unusual aesthetics.',
        has_parameter: true,
        placeholder: '0-3000'
    }
];

const CommandsModal: React.FC<CommandsModalProps> = ({ agentId, isOpen, onClose, onSuccess, conversationId }) => {
    const [translations, setTranslations] = useState<Translations | null>(null);
    const [selectedCommands, setSelectedCommands] = useState<{ [key: string]: boolean }>({});
    const [commandValues, setCommandValues] = useState<{ [key: string]: string }>({});

    // Always use purple theme for all agents
    const isImagineAgent = true;

    // New state for visual selectors
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("1:1");
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    useEffect(() => {
        const detectLanguage = async () => {
            const browserLanguage = navigator.language;
            const translations = await getTranslations(browserLanguage);
            setTranslations(translations);
        };
        detectLanguage();
    }, []);

    // Reset state when conversation changes
    useEffect(() => {
        setSelectedCommands({});
        setCommandValues({});
        setSelectedAspectRatio("1:1");
        setReferenceImage(null);
    }, [conversationId]);

    useEffect(() => {
        if (agentId === "041acc6b-18df-4567-91f0-0f3684e1188c") {
            setSelectedAspectRatio('3:4');
            setSelectedCommands(prev => ({
                ...prev,
                '--style': true,
            }));
            setCommandValues(prev => ({
                ...prev,
                '--style': 'raw',
            }));
        }
    }, [agentId]);

    const handleCheckboxChange = (commandValue: string) => {
        setSelectedCommands(prevState => ({
            ...prevState,
            [commandValue]: !prevState[commandValue]
        }));
    };

    const handleValueChange = (commandValue: string, newValue: string) => {
        setCommandValues(prevState => ({
            ...prevState,
            [commandValue]: newValue
        }));
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) return;

        setIsUploading(true);

        try {
            const imageUrl = await uploadImage(file);
            setReferenceImage(imageUrl);
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    const handleRemoveImage = () => {
        setReferenceImage(null);
    };

    const handleConfirm = () => {
        // Build commands array starting with aspect ratio
        const selected: Array<{ command: string, value: string }> = [
            { command: '--aspect', value: selectedAspectRatio }
        ];

        // Add reference image if uploaded
        if (referenceImage) {
            selected.push({ command: '--cref', value: referenceImage });
        }

        // Add other selected commands
        commands
            .filter(cmd => selectedCommands[cmd.value])
            .forEach(cmd => {
                selected.push({ command: cmd.value, value: commandValues[cmd.value] || '' });
            });

        onSuccess(selected);
        onClose();
    };

    const selectedCount = Object.values(selectedCommands).filter(Boolean).length;

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
                    className={`
                        relative w-full max-w-2xl max-h-[85vh]
                        bg-gradient-to-b from-zinc-800/95 to-zinc-900/95
                        backdrop-blur-xl
                        rounded-3xl
                        border border-white/10
                        ${isImagineAgent ? "shadow-2xl shadow-purple-500/10" : "shadow-2xl shadow-orange-500/10"}
                        pointer-events-auto
                        overflow-hidden
                        animate-scale-in
                        flex flex-col
                    `}
                >
                    {/* Glow effect */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 ${isImagineAgent ? "bg-purple-500/20" : "bg-orange-500/20"} rounded-full blur-3xl`} />

                    {/* Header */}
                    <div className="relative flex items-center justify-between p-6 border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${isImagineAgent ? "from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400" : "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400"} rounded-2xl flex items-center justify-center border`}>
                                <CommandIcon />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {translations?.commands || "Midjourney Settings"}
                                </h2>
                                <p className="text-sm text-white/50">
                                    {selectedCount > 0 ? `${selectedCount} command${selectedCount > 1 ? 's' : ''} selected` : 'Configure your generation'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Aspect Ratio Section */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-white/70">
                                Aspect Ratio
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                {aspectRatios.map((ratio) => (
                                    <button
                                        key={ratio.key}
                                        onClick={() => setSelectedAspectRatio(ratio.key)}
                                        className={`
                                            relative flex flex-col items-center gap-1 p-2 rounded-xl
                                            border transition-all duration-200
                                            ${selectedAspectRatio === ratio.key
                                                ? isImagineAgent
                                                    ? "bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20"
                                                    : "bg-orange-500/20 border-orange-500/50 shadow-lg shadow-orange-500/20"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                            }
                                        `}
                                    >
                                        <AspectRatioPreview ratio={ratio.key} isSelected={selectedAspectRatio === ratio.key} isPurple={isImagineAgent} />
                                        <span className={`text-xs font-medium ${selectedAspectRatio === ratio.key ? (isImagineAgent ? "text-purple-300" : "text-orange-300") : "text-white/70"}`}>
                                            {ratio.key}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-white/40 mt-1">
                                {aspectRatios.find(r => r.key === selectedAspectRatio)?.description}
                            </p>
                        </div>

                        {/* Reference Image Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ImageIcon />
                                    <label className="block text-sm font-medium text-white/70">
                                        Character Reference
                                    </label>
                                    <span className="text-xs text-white/40">
                                        (--cref)
                                    </span>
                                </div>
                                {referenceImage && (
                                    <button
                                        onClick={handleRemoveImage}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <p className="text-xs text-white/40">
                                Upload a character reference image for consistent character generation
                            </p>

                            {/* Image Upload Area */}
                            <div className="flex gap-3">
                                {referenceImage ? (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 group">
                                        <img
                                            src={referenceImage}
                                            alt="Reference"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={handleRemoveImage}
                                            className="
                                                absolute top-1 right-1 p-1 rounded-full
                                                bg-black/60 text-white/70 hover:text-red-400
                                                opacity-0 group-hover:opacity-100
                                                transition-all duration-200
                                            "
                                        >
                                            <SmallCloseIcon />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        className={`
                                            w-24 h-24 rounded-lg border-2 border-dashed
                                            flex flex-col items-center justify-center gap-1
                                            cursor-pointer transition-all duration-200
                                            ${isUploading
                                                ? isImagineAgent
                                                    ? "border-purple-500/50 bg-purple-500/10"
                                                    : "border-orange-500/50 bg-orange-500/10"
                                                : isImagineAgent
                                                    ? "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
                                                    : "border-white/20 hover:border-orange-500/50 hover:bg-white/5"
                                            }
                                        `}
                                    >
                                        {isUploading ? (
                                            <LoadingSpinner />
                                        ) : (
                                            <>
                                                <UploadIcon />
                                                <span className="text-xs text-white/50">Upload</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10" />

                        {/* Additional Commands Section */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-white/70">
                                Additional Commands
                            </label>
                            <div className="space-y-2">
                                {commands.map((command) => {
                                    const isSelected = !!selectedCommands[command.value];

                                    return (
                                        <div
                                            key={command.value}
                                            className={`
                                                p-3 rounded-xl border transition-all duration-200 cursor-pointer
                                                ${isSelected
                                                    ? isImagineAgent
                                                        ? 'bg-purple-500/10 border-purple-500/30'
                                                        : 'bg-orange-500/10 border-orange-500/30'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                }
                                            `}
                                            onClick={() => handleCheckboxChange(command.value)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox */}
                                                <div
                                                    className={`
                                                        w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                                                        ${isSelected
                                                            ? isImagineAgent
                                                                ? 'bg-purple-500 border-purple-500'
                                                                : 'bg-orange-500 border-orange-500'
                                                            : 'border-white/30 hover:border-white/50'
                                                        }
                                                    `}
                                                >
                                                    {isSelected && <CheckIcon />}
                                                </div>

                                                {/* Command Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <code className={`text-sm font-mono font-semibold ${isSelected ? (isImagineAgent ? 'text-purple-400' : 'text-orange-400') : 'text-white'}`}>
                                                            {command.value}
                                                        </code>
                                                        {!command.has_parameter && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                                                                No value needed
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-white/50 mb-2">
                                                        {command.description}
                                                    </p>

                                                    {/* Value Input */}
                                                    {command.has_parameter && (
                                                        <input
                                                            type="text"
                                                            value={commandValues[command.value] || ''}
                                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                                e.stopPropagation();
                                                                handleValueChange(command.value, e.target.value);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            disabled={!isSelected}
                                                            placeholder={command.placeholder}
                                                            className={`
                                                                w-full px-3 py-2 rounded-lg text-sm
                                                                transition-all duration-200
                                                                ${isSelected
                                                                    ? isImagineAgent
                                                                        ? 'bg-white/10 border border-purple-500/30 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50'
                                                                        : 'bg-white/10 border border-orange-500/30 text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50'
                                                                    : 'bg-white/5 border border-white/10 text-white/30 placeholder-white/20 cursor-not-allowed'
                                                                }
                                                            `}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative p-6 border-t border-white/10 flex gap-4">
                        <button
                            onClick={onClose}
                            className="
                                flex-1 px-6 py-3 rounded-xl
                                bg-white/5 hover:bg-white/10
                                border border-white/10
                                text-white font-medium
                                transition-all duration-200
                            "
                        >
                            {translations?.cancel || "Cancel"}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isUploading}
                            className={`
                                flex-1 px-6 py-3 rounded-xl
                                ${isImagineAgent
                                    ? "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 shadow-lg shadow-purple-500/25"
                                    : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/25"
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                                text-white font-semibold
                                transition-all duration-200
                            `}
                        >
                            {translations?.confirm || "Apply Settings"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommandsModal;
