"use client";

import React, { useState, useEffect } from "react";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";
import { Conversation } from "@/types/chat.types";

interface ConversationNameModalProps {
  isOpen: boolean;
  onClose: (name?: string) => void;
  conversation: Conversation | null;
}

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const EditIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ConversationNameModal: React.FC<ConversationNameModalProps> = ({
  isOpen,
  onClose,
  conversation,
}) => {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (conversation) {
      setName(conversation.name ?? "");
    }

    return () => {
      setName("");
    };
  }, [conversation]);

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };

    detectLanguage();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      onClose(name);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
        onClick={() => onClose()}
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
            onClick={() => onClose()}
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
                  <EditIcon />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white text-center mb-2">
              {translations?.change_conversation_name || "Change Conversation Name"}
            </h2>

            {/* Subtitle */}
            <p className="text-white/60 text-center text-sm mb-6">
              Give your conversation a memorable name
            </p>

            {/* Input */}
            <div className="mb-6">
              <label className="block text-white/70 text-sm font-medium mb-2">
                {translations?.new_name || "New Name"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={translations?.name || "Enter name..."}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className="
                  w-full px-4 py-3
                  bg-white/5 border border-white/10
                  rounded-xl
                  text-white placeholder-white/40
                  focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50
                  transition-all duration-200
                "
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onClose()}
                className="
                  flex-1 px-4 py-3 rounded-xl
                  bg-white/5 hover:bg-white/10
                  border border-white/10
                  text-white/80 hover:text-white
                  font-medium
                  transition-all duration-200
                "
              >
                {translations?.cancel || "Cancel"}
              </button>

              <button
                onClick={() => name.trim() && onClose(name)}
                disabled={!name.trim()}
                className={`
                  flex-1 px-6 py-3 rounded-xl
                  font-semibold
                  transition-all duration-200
                  ${name.trim()
                    ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                  }
                `}
              >
                {translations?.confirm || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationNameModal;
