"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";
import { describeImage, uploadImage } from "@/managers/conversationsManager";

interface IdeogramModalProps {
  agentId?: string;
  selectedAspectRatio: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    selectedTab: string,
    styleType: string,
    aspectRatio: string,
    negativePrompt: string,
    remixPrompt: string,
    remixSimilarity: number,
    uploadedImageUrl: string
  ) => void;
  conversationId?: string;
  initialTab?: string;
  initialImageUrl?: string;
  initialPrompt?: string;
}

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const IdeogramIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
  </svg>
);

const RemixIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

const DescribeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);

const styleTypes = [
  { key: "AUTO", label: "Automatic" },
  { key: "GENERAL", label: "General" },
  { key: "REALISTIC", label: "Realistic" },
  { key: "DESIGN", label: "Design" },
  { key: "RENDER_3D", label: "3D Render" },
  { key: "ANIME", label: "Anime" },
];

const aspectRatios = [
  { key: "ASPECT_1_1", label: "1:1 (Square)" },
  { key: "ASPECT_16_9", label: "16:9 (Landscape)" },
  { key: "ASPECT_9_16", label: "9:16 (Portrait)" },
  { key: "ASPECT_4_3", label: "4:3" },
  { key: "ASPECT_3_4", label: "3:4" },
  { key: "ASPECT_3_2", label: "3:2" },
  { key: "ASPECT_2_3", label: "2:3" },
  { key: "ASPECT_16_10", label: "16:10" },
  { key: "ASPECT_10_16", label: "10:16" },
  { key: "ASPECT_3_1", label: "3:1 (Wide)" },
  { key: "ASPECT_1_3", label: "1:3 (Tall)" },
];

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { key: string; label: string }[];
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-white/70">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
    >
      {options.map((opt) => (
        <option key={opt.key} value={opt.key} className="bg-zinc-900">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// Custom Input Component
const CustomInput = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-white/70">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200"
    />
  </div>
);

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-10 h-10 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
    <p className="text-white/50 text-sm">Processing image...</p>
  </div>
);

const IdeogramModal: React.FC<IdeogramModalProps> = ({
  agentId,
  selectedAspectRatio,
  isOpen,
  onClose,
  onSuccess,
  conversationId,
  initialTab,
  initialImageUrl,
  initialPrompt,
}) => {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [styleType, setStyleType] = useState<string>("AUTO");
  const [aspectRatio, setAspectRatio] = useState<string>(selectedAspectRatio || "ASPECT_1_1");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [remixPrompt, setRemixPrompt] = useState<string>("");
  const [remixSimilarity, setRemixSimilarity] = useState<number>(70);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<string>("configuration");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [descriptionText, setDescriptionText] = useState<string>("");
  const prevConversationId = useRef<string | undefined>(conversationId);

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };
    detectLanguage();

    // Set default negative prompts for specific agents
    if (agentId) {
      const agentIds = [
        "88ab4ff2-dca1-4753-b3f4-2f34b564e4a5",
        "10280eaa-370c-4456-a6f6-a182f3605d67",
        "e2c5ee2c-3130-4603-85ab-e2a2f88d9470",
        "73afdc60-c72f-458d-a5fa-af9ceeeeb761",
        "35563d6e-da4c-4042-a793-ec68e1812dbe",
        "644d46a0-33eb-4c37-ab04-d58fd3d5ea6b",
        "6eabf9e5-79b3-4aff-9325-52d4305f95f5",
        "20a151e9-1853-48ba-b888-6a59d9cbda5c"
      ];
      if (agentIds.includes(agentId)) {
        let negative_prompt = agentId === "88ab4ff2-dca1-4753-b3f4-2f34b564e4a5"
          ? "No thin lines. No fine details. No intricate textures. No delicate strokes. No light or faint outlines. No shading. No complex patterns. No background elements. No realism. No soft edges."
          : "no details";
        if (agentId === "20a151e9-1853-48ba-b888-6a59d9cbda5c") {
          negative_prompt = "No shading, gradients, or greyscale effects.";
          setStyleType("GENERAL");
        }
        setNegativePrompt(negative_prompt);
      }
    }
  }, [agentId]);

  // Reset state when conversation changes (not on initial mount)
  useEffect(() => {
    if (prevConversationId.current !== conversationId && prevConversationId.current !== undefined) {
      setStyleType("AUTO");
      setAspectRatio("ASPECT_1_1");
      setNegativePrompt("");
      setRemixPrompt("");
      setRemixSimilarity(70);
      setSelectedImage(null);
      setActiveTab("configuration");
      setUploadedImageUrl("");
      setDescriptionText("");
    }
    prevConversationId.current = conversationId;
  }, [conversationId]);

  // Set initial values when modal opens with remix/describe action from image buttons
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      if (initialImageUrl) {
        setUploadedImageUrl(initialImageUrl);
      }
      if (initialPrompt) {
        setRemixPrompt(initialPrompt);
      }
    }
  }, [isOpen, initialTab, initialImageUrl, initialPrompt]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Only reset tab-specific temporary fields, not configuration settings
    if (tab === "remix") {
      setRemixPrompt("");
      setSelectedImage(null);
      setUploadedImageUrl("");
    } else if (tab === "describe") {
      setSelectedImage(null);
      setUploadedImageUrl("");
      setDescriptionText("");
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);

      try {
        setIsLoading(true);
        const uploadedUrl = await uploadImage(file);
        const description = await describeImage("", uploadedUrl, "", true);

        // Store description in appropriate state based on active tab
        if (activeTab === "describe") {
          setDescriptionText(description.response);
        } else {
          setRemixPrompt(description.response);
        }

        setUploadedImageUrl(uploadedUrl);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleConfirm = () => {
    // For describe tab, pass descriptionText as remixPrompt so ChatModals can use it
    const promptToPass = activeTab === "describe" ? descriptionText : remixPrompt;

    onSuccess(
      activeTab,
      styleType,
      aspectRatio,
      negativePrompt,
      promptToPass,
      remixSimilarity,
      uploadedImageUrl
    );

    // Only reset remix/describe specific fields, keep configuration settings
    setRemixPrompt("");
    setDescriptionText("");
    setSelectedImage(null);
    setUploadedImageUrl("");
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { key: "configuration", label: "Configuration", icon: <SettingsIcon /> },
    { key: "remix", label: "Remix", icon: <RemixIcon /> },
    { key: "describe", label: "Describe", icon: <DescribeIcon /> },
  ];

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
            relative w-full max-w-2xl max-h-[85vh]
            bg-gradient-to-b from-zinc-800/95 to-zinc-900/95
            backdrop-blur-xl
            rounded-3xl
            border border-white/10
            shadow-2xl shadow-purple-500/10
            pointer-events-auto
            overflow-hidden
            animate-scale-in
            flex flex-col
          "
        >
          {/* Purple glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                <IdeogramIcon />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {translations?.commands || "Ideogram Settings"}
                </h2>
                <p className="text-sm text-white/50">
                  Configure your image generation
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

          {/* Tabs */}
          <div className="px-6 pt-4">
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${activeTab === tab.key
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {/* Configuration Tab */}
                {activeTab === "configuration" && (
                  <div className="space-y-4">
                    <CustomSelect
                      label="Style Type"
                      value={styleType}
                      onChange={setStyleType}
                      options={styleTypes}
                    />

                    <CustomSelect
                      label="Aspect Ratio"
                      value={aspectRatio}
                      onChange={setAspectRatio}
                      options={aspectRatios}
                    />

                    <CustomInput
                      label="Negative Prompt"
                      placeholder="Elements to exclude from the image..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                    />
                  </div>
                )}

                {/* Remix Tab */}
                {activeTab === "remix" && (
                  <div className="space-y-4">
                    <CustomInput
                      label="Remix Prompt"
                      placeholder="Describe how to remix the image..."
                      value={remixPrompt}
                      onChange={(e) => setRemixPrompt(e.target.value)}
                    />

                    <CustomInput
                      label="Similarity (%)"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="70"
                      value={remixSimilarity.toString()}
                      onChange={(e) => setRemixSimilarity(Number(e.target.value))}
                    />

                    {/* File Upload or Image Preview */}
                    <div className="space-y-2">
                      <p className="block text-sm font-medium text-white/70">
                        Reference Image
                      </p>
                      {uploadedImageUrl ? (
                        <div className="relative">
                          <img
                            src={uploadedImageUrl}
                            alt="Reference"
                            className="w-full max-h-48 object-contain rounded-xl border border-white/10"
                          />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setUploadedImageUrl("");
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-red-400 transition-colors"
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all duration-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadIcon />
                          <p className="mt-2 text-sm text-white/50">
                            {selectedImage ? selectedImage.name : "Click to upload image"}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Describe Tab */}
                {activeTab === "describe" && (
                  <div className="space-y-4">
                    <p className="text-white/60 text-sm mb-4">
                      Upload an image to get an AI-generated description that you can use as a prompt.
                    </p>

                    {/* File Upload or Image Preview */}
                    <div className="space-y-2">
                      <p className="block text-sm font-medium text-white/70">
                        Image to Describe
                      </p>
                      {uploadedImageUrl ? (
                        <div className="relative">
                          <img
                            src={uploadedImageUrl}
                            alt="Uploaded"
                            className="w-full max-h-48 object-contain rounded-xl border border-white/10"
                          />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setUploadedImageUrl("");
                              setDescriptionText("");
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-red-400 transition-colors"
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all duration-200">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon />
                            <p className="mt-2 text-sm text-white/50">
                              Click to upload image
                            </p>
                            <p className="text-xs text-white/30 mt-1">
                              PNG, JPG, WEBP up to 10MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>

                    {/* Description Result */}
                    {descriptionText && (
                      <div className="space-y-2">
                        <p className="block text-sm font-medium text-white/70">
                          Generated Description
                        </p>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                          <p className="text-white/80 text-sm whitespace-pre-wrap">
                            {descriptionText}
                          </p>
                        </div>
                        <p className="text-xs text-white/40">
                          Click &quot;Use Description&quot; to copy this to your chat input
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
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
              disabled={activeTab === "describe" && !descriptionText}
              className="
                flex-1 px-6 py-3 rounded-xl
                bg-gradient-to-r from-purple-600 to-violet-600
                hover:from-purple-500 hover:to-violet-500
                disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold
                transition-all duration-200
                shadow-lg shadow-purple-500/25
              "
            >
              {activeTab === "describe"
                ? "Use Description"
                : translations?.confirm || "Apply Settings"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default IdeogramModal;
