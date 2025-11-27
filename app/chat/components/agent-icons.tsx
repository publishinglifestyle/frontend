"use client";

import * as React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

// DALL-E / OpenAI Icon
export const DalleIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill="currentColor"
    />
    <path
      d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
      fill="currentColor"
      opacity={0.6}
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

// Midjourney Icon
export const MidjourneyIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L2 7l10 5 10-5-10-5z"
      fill="currentColor"
    />
    <path
      d="M2 17l10 5 10-5M2 12l10 5 10-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Ideogram Icon
export const IdeogramIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
    <path
      d="M7 12h10M12 7v10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    <circle cx="17" cy="7" r="1.5" fill="currentColor" />
    <circle cx="7" cy="17" r="1.5" fill="currentColor" />
    <circle cx="17" cy="17" r="1.5" fill="currentColor" />
  </svg>
);

// Gemini Icon
export const GeminiIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C12 2 14.5 5.5 14.5 12C14.5 18.5 12 22 12 22C12 22 9.5 18.5 9.5 12C9.5 5.5 12 2 12 2Z"
      fill="currentColor"
    />
    <path
      d="M2 12C2 12 5.5 9.5 12 9.5C18.5 9.5 22 12 22 12C22 12 18.5 14.5 12 14.5C5.5 14.5 2 12 2 12Z"
      fill="currentColor"
      opacity={0.7}
    />
  </svg>
);

// GPT Image Icon
export const GptImageIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path
      d="M21 15l-5-5L5 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Text/Chat Agent Icon
export const TextAgentIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      fill="currentColor"
    />
    <path
      d="M8 10h8M8 14h5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Image type badge icon
export const ImageTypeIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path
      d="M21 15l-5-5L5 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Text type badge icon
export const TextTypeIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 7V4h16v3M9 20h6M12 4v16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Chevron icons for collapse/expand
export const ChevronUpIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 15l-6-6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Check icon for selected state
export const CheckIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Model config with icons and colors
export const getAgentConfig = (model: string, type: string) => {
  if (type === "text") {
    return {
      Icon: TextAgentIcon,
      glowColor: "#9353D3",
      bgGradient: "from-purple-500/20 to-violet-500/20",
      label: "Text",
    };
  }

  switch (model?.toLowerCase()) {
    case "dall-e":
      return {
        Icon: DalleIcon,
        glowColor: "#10A37F",
        bgGradient: "from-green-500/20 to-emerald-500/20",
        label: "DALL-E",
      };
    case "midjourney":
      return {
        Icon: MidjourneyIcon,
        glowColor: "#FF6B35",
        bgGradient: "from-orange-500/20 to-amber-500/20",
        label: "Midjourney",
      };
    case "ideogram":
      return {
        Icon: IdeogramIcon,
        glowColor: "#7C3AED",
        bgGradient: "from-purple-500/20 to-indigo-500/20",
        label: "Ideogram",
      };
    case "gemini":
      return {
        Icon: GeminiIcon,
        glowColor: "#4285F4",
        bgGradient: "from-blue-500/20 to-cyan-500/20",
        label: "Gemini",
      };
    case "gpt-image":
      return {
        Icon: GptImageIcon,
        glowColor: "#00A67E",
        bgGradient: "from-emerald-500/20 to-teal-500/20",
        label: "GPT Image",
      };
    default:
      return {
        Icon: TextAgentIcon,
        glowColor: "#9353D3",
        bgGradient: "from-purple-500/20 to-violet-500/20",
        label: type === "image" ? "Image" : "Text",
      };
  }
};
