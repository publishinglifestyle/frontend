"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Message, Agent } from "@/types/chat.types";
import { Button } from "@heroui/react";

interface MessageAreaProps {
  messages: Message[];
  currentUser: string;
  isGenerating: boolean;
  selectedAgent?: Agent;
  onCopyMessage: (text: string) => void;
  onImageAction?: (action: string, message: Message) => void;
  onButtonClick?: (button: any, message: Message) => void;
}

type ButtonClickHandler = (button: any) => void;

// Icons
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const RemixIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);

const UpscaleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

const DescribeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

// Check if message content is an image URL
const isImageUrl = (text: string) => {
  if (!text) return false;
  return (
    text.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) !== null ||
    text.includes("oaidalleapiprodscus") ||
    text.includes("cdn.midjourney") ||
    text.includes("ideogram.ai") ||
    text.includes("storage.googleapis.com")
  );
};

// Format message text with markdown support
const formatMessageText = (text: string): string => {
  if (!text) return "";

  // Convert bold markdown **text** to <strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert italic markdown *text* or _text_ to <em>
  formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  formatted = formatted.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>");

  // Convert code blocks ```code``` to <pre><code>
  formatted = formatted.replace(/```([^`]+)```/g, "<pre><code>$1</code></pre>");

  // Convert inline code `code` to <code>
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert newlines to <br>
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
};

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
    <span className="text-sm text-white/50 ml-2">AI is thinking...</span>
  </div>
);

// Image skeleton loader component
const ImageSkeletonLoader = () => (
  <div className="relative w-72 h-72 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
    {/* Animated gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

    {/* Placeholder content */}
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      {/* Image icon placeholder */}
      <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>

      {/* Loading text */}
      <span className="text-sm text-white/40">Generating image...</span>
    </div>

    {/* Corner accents */}
    <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-white/10 rounded-tl-lg" />
    <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-white/10 rounded-tr-lg" />
    <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-white/10 rounded-bl-lg" />
    <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-white/10 rounded-br-lg" />
  </div>
);

// Image Lightbox Component - Uses portal to render above navbar
const ImageLightbox: React.FC<{
  imageUrl: string;
  onClose: () => void;
}> = ({ imageUrl, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!mounted) return null;

  const lightboxContent = (
    <div className="fixed inset-0" style={{ zIndex: 99999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black"
        onClick={onClose}
      />

      {/* Fixed Toolbar - Always visible at top */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-end gap-3 p-4 bg-black/80 backdrop-blur-sm border-b border-white/10"
        style={{ zIndex: 100000 }}
      >
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 transition-colors text-white flex items-center gap-2 font-medium"
        >
          <DownloadIcon />
          <span className="text-sm">Download</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Image Container */}
      <div
        className="absolute inset-0 pt-16 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
        <img
          src={imageUrl}
          alt="Expanded view"
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
};

// Single message component
const MessageBubble: React.FC<{
  message: Message;
  isUser: boolean;
  onCopy: () => void;
  onImageAction?: (action: string) => void;
  onButtonClick?: ButtonClickHandler;
  onImageClick?: (imageUrl: string) => void;
}> = ({ message, isUser, onCopy, onImageAction, onButtonClick, onImageClick }) => {
  const [copied, setCopied] = React.useState(false);
  const isImage = isImageUrl(message.text);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`
        group flex flex-col gap-2 max-w-2xl
        ${isUser ? "ml-auto items-end" : "mr-auto items-start"}
      `}
    >
      {/* Sender label */}
      <span className="text-xs text-white/40 px-1">
        {isUser ? "You" : "Low Content AI"}
      </span>

      {/* Message content */}
      <div
        className={`
          relative rounded-2xl overflow-hidden
          ${isUser
            ? "bg-gradient-to-br from-purple-600 to-violet-700 text-white"
            : "bg-white/5 border border-white/10 text-white/90"
          }
          ${isImage ? "p-0" : "px-4 py-3"}
        `}
      >
        {isImage ? (
          <div className="relative cursor-pointer" onClick={() => onImageClick?.(message.text)}>
            <img
              src={message.text}
              alt="Generated"
              className="max-w-full max-h-96 object-contain rounded-2xl"
              loading="lazy"
            />
            {/* Image overlay with expand hint */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-end justify-center pb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
                <ExpandIcon />
                Click to expand
              </div>
            </div>
          </div>
        ) : (
          <div
            className="break-words text-sm leading-relaxed [&>strong]:font-bold [&>em]:italic [&>code]:bg-white/10 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-xs [&>pre]:bg-white/10 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-2"
            dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
          />
        )}

        {/* Copy button for text messages */}
        {!isImage && !isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
            title="Copy"
          >
            {copied ? (
              <CheckIcon />
            ) : (
              <CopyIcon />
            )}
          </button>
        )}
      </div>

      {/* Ideogram buttons - only show for actual images */}
      {isImage && message.ideogram_buttons && message.ideogram_buttons.length > 0 && onImageAction && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onImageAction("remix")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
          >
            <RemixIcon />
            Remix
          </button>
          <button
            onClick={() => onImageAction("upscale")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
          >
            <UpscaleIcon />
            Upscale
          </button>
          <button
            onClick={() => onImageAction("describe")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
          >
            <DescribeIcon />
            Describe
          </button>
        </div>
      )}

      {/* Midjourney action buttons */}
      {message.buttons && message.buttons.length > 0 && onButtonClick && (
        <div className="flex flex-wrap gap-2 mt-1 max-w-md">
          {message.buttons.map((button: any, index: number) => (
            <Button
              key={index}
              size="sm"
              variant="flat"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
              onPress={() => onButtonClick(button)}
            >
              {button.label || button.custom || `Option ${index + 1}`}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export const MessageArea: React.FC<MessageAreaProps> = ({
  messages,
  currentUser,
  isGenerating,
  selectedAgent,
  onCopyMessage,
  onImageAction,
  onButtonClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    // Small delay to ensure DOM is updated before scrolling
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isGenerating]);

  // Scroll to bottom immediately when messages array changes significantly (conversation switch)
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length]);

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-8 pb-52"
      >
        {/* Welcome message when no messages */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Start a conversation
            </h2>
            <p className="text-white/50 max-w-md">
              Select an agent and start creating amazing low-content books with AI assistance.
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages
            .filter((m) => !m.id?.startsWith("typing-"))
            .map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.username === currentUser}
                onCopy={() => onCopyMessage(message.text)}
                onImageAction={
                  onImageAction
                    ? (action) => onImageAction(action, message)
                    : undefined
                }
                onButtonClick={
                  onButtonClick
                    ? (button) => onButtonClick(button, message)
                    : undefined
                }
                onImageClick={(imageUrl) => setExpandedImage(imageUrl)}
              />
            ))}

          {/* Loading indicator - show image skeleton for image agents, typing indicator for text */}
          {isGenerating && (
            <div className="flex items-start gap-3 max-w-2xl">
              {selectedAgent?.type === "image" ? (
                <ImageSkeletonLoader />
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl">
                  <TypingIndicator />
                </div>
              )}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Image Lightbox */}
      {expandedImage && (
        <ImageLightbox
          imageUrl={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </>
  );
};

export default MessageArea;
