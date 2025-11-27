"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Agent } from "@/types/chat.types";
import { getAgentConfig } from "./agent-icons";

interface FloatingInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttachImage: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStopGeneration: () => void;
  onOpenAgentSelector: () => void;
  onOpenCommands?: () => void;
  selectedAgent?: Agent;
  isGenerating: boolean;
  isRecording: boolean;
  pendingImageUrl?: string;
  onRemoveImage?: () => void;
  disabled?: boolean;
  translations?: {
    type_message?: string;
    send?: string;
  } | null;
}

// Icons
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const AttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

const MicIcon = ({ isRecording }: { isRecording: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={isRecording ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    className={isRecording ? "text-red-500 animate-pulse" : ""}
  >
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
  </svg>
);

const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const CommandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// Format message text with markdown support for preview
const formatMessageText = (text: string): string => {
  if (!text) return "";

  // Convert bold markdown **text** to <strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert italic markdown *text* or _text_ to <em>
  formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  formatted = formatted.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>");

  // Convert inline code `code` to <code>
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert newlines to <br>
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
};

// Check if text contains any markdown syntax
const hasMarkdown = (text: string): boolean => {
  if (!text) return false;
  return /\*\*.*?\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`/.test(text);
};

export const FloatingInputBar: React.FC<FloatingInputBarProps> = ({
  value,
  onChange,
  onSend,
  onAttachImage,
  onStartRecording,
  onStopRecording,
  onStopGeneration,
  onOpenAgentSelector,
  onOpenCommands,
  selectedAgent,
  isGenerating,
  isRecording,
  pendingImageUrl,
  onRemoveImage,
  disabled,
  translations,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const MIN_HEIGHT = 40;
  const MAX_HEIGHT = 200;

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate new height, clamped between min and max
    const newHeight = Math.min(Math.max(textarea.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Adjust height when value changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  const agentConfig = selectedAgent
    ? getAgentConfig(selectedAgent.model, selectedAgent.type)
    : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && (value.trim() || pendingImageUrl)) {
      e.preventDefault();
      onSend();
    }
  };

  const showCommands =
    selectedAgent?.model === "midjourney" ||
    selectedAgent?.model === "ideogram" ||
    selectedAgent?.model === "gpt-image" ||
    selectedAgent?.model === "gemini";

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-30">
      {/* Main Input Container */}
      <div
        className={`
          relative rounded-2xl
          bg-gradient-to-b from-zinc-800/90 to-zinc-900/90
          backdrop-blur-xl
          border transition-all duration-300
          shadow-2xl shadow-black/50
          ${isFocused ? "border-purple-500/50 shadow-purple-500/20" : "border-white/10"}
        `}
      >
        {/* Pending Image Preview - Inside container */}
        {pendingImageUrl && (
          <div className="px-4 pt-3 pb-2 border-b border-white/5">
            <div className="inline-flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              <img
                key={pendingImageUrl}
                src={pendingImageUrl}
                alt="Attached reference"
                className="h-12 w-auto rounded-lg border border-white/20"
              />
              <div className="flex flex-col">
                <span className="text-xs text-white/50">Reference Image</span>
                <span className="text-xs text-purple-400">Ready to send</span>
              </div>
              <button
                onClick={onRemoveImage}
                className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                title="Remove"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}

        {/* Agent Selector Button */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-white/5">
          <button
            onClick={onOpenAgentSelector}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              transition-all duration-200
              ${selectedAgent
                ? "bg-white/5 hover:bg-white/10"
                : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400"
              }
            `}
          >
            {selectedAgent ? (
              <>
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${agentConfig?.glowColor}30`, color: agentConfig?.glowColor }}
                >
                  {agentConfig && <agentConfig.Icon size={14} />}
                </div>
                <span className="text-sm text-white/90">{selectedAgent.name}</span>
                <ChevronIcon />
              </>
            ) : (
              <>
                <span className="text-sm">Select Agent</span>
                <ChevronIcon />
              </>
            )}
          </button>

          {showCommands && onOpenCommands && (
            <button
              onClick={onOpenCommands}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <CommandIcon />
              <span className="text-sm">Commands</span>
            </button>
          )}

          {selectedAgent?.model === "ideogram" && (
            <button
              onClick={() => window.open("https://low-content-ai-parameter-list.gitbook.io/low-content-ai/ideator-commands/ideator-prompt", "_blank")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-purple-400 hover:text-purple-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="text-sm">Prompts</span>
            </button>
          )}
        </div>

        {/* Live Markdown Preview - Shows when markdown is detected */}
        {hasMarkdown(value) && (
          <div className="px-4 py-2 border-b border-white/5">
            <div className="text-xs text-white/40 mb-1">Preview:</div>
            <div
              className="text-sm text-white/90 [&>strong]:font-bold [&>em]:italic [&>code]:bg-white/10 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-xs"
              dangerouslySetInnerHTML={{ __html: formatMessageText(value) }}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-3 p-3">
          {/* Left Actions */}
          <div className="flex gap-1">
            <button
              onClick={onAttachImage}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title="Attach image"
            >
              <AttachIcon />
            </button>
            <button
              onClick={isRecording ? onStopRecording : onStartRecording}
              className={`
                p-2.5 rounded-xl transition-colors
                ${isRecording
                  ? "bg-red-500/20 text-red-500"
                  : "hover:bg-white/10 text-white/60 hover:text-white"
                }
              `}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              <MicIcon isRecording={isRecording} />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={translations?.type_message || "Type your message..."}
            disabled={disabled}
            rows={1}
            className={`
              flex-1 bg-transparent text-white placeholder-white/40
              resize-none outline-none
              text-base leading-6 py-2
              overflow-y-auto
              scrollbar-thin scrollbar-thumb-white/10
            `}
            style={{ minHeight: `${MIN_HEIGHT}px`, maxHeight: `${MAX_HEIGHT}px` }}
          />

          {/* Send / Stop Button */}
          {isGenerating ? (
            <button
              onClick={onStopGeneration}
              className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="Stop generating"
            >
              <StopIcon />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={(!value.trim() && !pendingImageUrl) || disabled}
              className={`
                p-3 rounded-xl transition-all duration-200
                ${value.trim() || pendingImageUrl
                  ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                  : "bg-white/5 text-white/30 cursor-not-allowed"
                }
              `}
              title={translations?.send || "Send"}
            >
              <SendIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingInputBar;
