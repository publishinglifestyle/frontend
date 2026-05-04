"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";
import { uploadImage } from "@/managers/conversationsManager";

interface DalleImageSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imageSize: string, referenceImages: string[]) => void;
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

const OpenAIIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
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

const imageSizeOptions = [
  { value: "1024x1024", label: "1:1 (Square)", ratio: "1:1", description: "Best for social media posts" },
  { value: "1536x1024", label: "3:2 (Landscape)", ratio: "3:2", description: "Standard landscape orientation" },
  { value: "1024x1536", label: "2:3 (Portrait)", ratio: "2:3", description: "Standard portrait orientation" },
];

// gpt-image-2 supports up to 16 reference images via the images.edit endpoint.
const MAX_REFERENCE_IMAGES = 16;

// Aspect Ratio Visual Preview Component
const AspectRatioPreview = ({ ratio, isSelected }: { ratio: string; isSelected: boolean }) => {
  const getPreviewDimensions = (ratio: string) => {
    const [w, h] = ratio.split(":").map(Number);
    const maxSize = 40;
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
      style={{ width: 48, height: 48 }}
    >
      <div
        className={`
          rounded-sm border-2 transition-all duration-200
          ${isSelected
            ? "border-purple-500 bg-purple-500/20"
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

const DalleImageSizeModal: React.FC<DalleImageSizeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  conversationId,
}) => {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [selectedSize, setSelectedSize] = useState("1024x1024");
  const [referenceImages, setReferenceImages] = useState<{ id: string; url: string }[]>([]);
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
    setSelectedSize("1024x1024");
    setReferenceImages([]);
  }, [conversationId]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const remainingSlots = MAX_REFERENCE_IMAGES - referenceImages.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        if (file.type.startsWith("image/")) {
          const imageUrl = await uploadImage(file);
          return imageUrl;
        }
        return null;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);

      const newImages = validUrls.map((url) => ({
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
      }));

      setReferenceImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllImages = () => {
    setReferenceImages([]);
  };

  const handleConfirm = () => {
    const imageUrls = referenceImages.map((img) => img.url);
    onConfirm(selectedSize, imageUrls);
    onClose();
  };

  const selectedOption = imageSizeOptions.find(opt => opt.value === selectedSize);

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
                <OpenAIIcon />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  OpenAI Settings
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Reference Images Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon />
                  <label className="block text-sm font-medium text-white/70">
                    Reference Images
                  </label>
                  <span className="text-xs text-white/40">
                    ({referenceImages.length}/{MAX_REFERENCE_IMAGES})
                  </span>
                </div>
                {referenceImages.length > 0 && (
                  <button
                    onClick={handleClearAllImages}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <p className="text-xs text-white/40">
                Upload up to {MAX_REFERENCE_IMAGES} reference images for style guidance or image editing
              </p>

              {/* Image Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {referenceImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group"
                  >
                    <img
                      src={`${img.url}${img.url.includes('?') ? '&' : '?'}cb=${img.id}`}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="
                        absolute top-1 right-1 p-1 rounded-full
                        bg-black/60 text-white/70 hover:text-red-400
                        opacity-0 group-hover:opacity-100
                        transition-all duration-200
                      "
                    >
                      <SmallCloseIcon />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/70 text-xs text-center py-0.5">
                      {index + 1}
                    </div>
                  </div>
                ))}

                {referenceImages.length < MAX_REFERENCE_IMAGES && (
                  <label
                    className={`
                      aspect-square rounded-lg border-2 border-dashed
                      flex flex-col items-center justify-center gap-1
                      cursor-pointer transition-all duration-200
                      ${isUploading
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
                      }
                    `}
                  >
                    {isUploading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <UploadIcon />
                        <span className="text-xs text-white/50">Add</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Image Size Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/70">
                Image Size
              </label>
              <div className="grid grid-cols-3 gap-3">
                {imageSizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedSize(option.value)}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl
                      border transition-all duration-200
                      ${selectedSize === option.value
                        ? "bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }
                    `}
                  >
                    <AspectRatioPreview ratio={option.ratio} isSelected={selectedSize === option.value} />
                    <span className={`text-sm font-medium ${selectedSize === option.value ? "text-purple-300" : "text-white/70"}`}>
                      {option.label}
                    </span>
                    <span className="text-xs text-white/40">
                      {option.value}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/40 mt-1">
                {selectedOption?.description}
              </p>
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
              {translations?.confirm || "Apply Settings"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DalleImageSizeModal;
