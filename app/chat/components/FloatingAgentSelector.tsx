"use client";

import React, { useState } from "react";
import { Agent } from "@/types/chat.types";
import { getAgentConfig, CheckIcon } from "./agent-icons";

interface FloatingAgentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (agent: Agent | null) => void;
  translations?: {
    select_agent?: string;
    agents?: string;
  } | null;
}

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const TextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const FloatingAgentSelector: React.FC<FloatingAgentSelectorProps> = ({
  isOpen,
  onClose,
  agents,
  selectedAgentId,
  onSelectAgent,
  translations,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "text" | "image">("all");

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "text" && agent.type === "text") ||
      (activeTab === "image" && agent.type === "image");
    return matchesSearch && matchesTab;
  });

  const handleSelect = (agent: Agent) => {
    // If clicking on already selected agent, deselect it
    if (selectedAgentId === agent.id) {
      onSelectAgent(null);
    } else {
      onSelectAgent(agent);
    }
    onClose();
  };

  const handleNoAgent = () => {
    onSelectAgent(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="
            w-full max-w-2xl max-h-[80vh]
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
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">
              {translations?.select_agent || "Select Agent"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Search and Tabs */}
          <div className="p-4 border-b border-white/10 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="
                  w-full pl-10 pr-4 py-3
                  bg-white/5 border border-white/10
                  rounded-xl
                  text-white placeholder-white/40
                  focus:outline-none focus:border-purple-500/50
                  transition-colors
                "
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <SearchIcon />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {[
                { key: "all", label: "All", icon: null },
                { key: "text", label: "Text", icon: <TextIcon /> },
                { key: "image", label: "Image", icon: <ImageIcon /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "all" | "text" | "image")}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl
                    transition-all duration-200
                    ${activeTab === tab.key
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
                    }
                  `}
                >
                  {tab.icon}
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Agent Grid */}
          <div className="p-4 overflow-y-auto max-h-[50vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* No Agent Option */}
              <button
                onClick={handleNoAgent}
                className={`
                  relative p-4 rounded-2xl
                  transition-all duration-200
                  text-left
                  ${!selectedAgentId
                    ? "bg-zinc-500/20 border-2 border-zinc-500/50"
                    : "bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/10"
                  }
                `}
              >
                {/* Selected Checkmark */}
                {!selectedAgentId && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-zinc-500">
                    <CheckIcon size={14} className="text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-zinc-500/20 text-zinc-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                  </svg>
                </div>

                {/* Name */}
                <h3 className="font-medium text-white mb-1 text-sm leading-tight">
                  No Agent
                </h3>

                {/* Type Badge */}
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-zinc-500/20 text-zinc-400">
                  Default Chat
                </span>
              </button>

              {filteredAgents.map((agent) => {
                const config = getAgentConfig(agent.model, agent.type);
                const isSelected = selectedAgentId === agent.id;

                return (
                  <button
                    key={agent.id}
                    onClick={() => handleSelect(agent)}
                    className={`
                      relative p-4 rounded-2xl
                      transition-all duration-200
                      text-left
                      ${isSelected
                        ? "bg-purple-500/20 border-2 border-purple-500/50"
                        : "bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/10"
                      }
                    `}
                    style={{
                      boxShadow: isSelected
                        ? `0 0 30px ${config.glowColor}30`
                        : undefined,
                    }}
                  >
                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div
                        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: config.glowColor }}
                      >
                        <CheckIcon size={14} className="text-white" />
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        backgroundColor: `${config.glowColor}20`,
                        color: config.glowColor,
                      }}
                    >
                      <config.Icon size={24} />
                    </div>

                    {/* Agent Name */}
                    <h3 className="font-medium text-white mb-1 pr-8 text-sm leading-tight">
                      {agent.name}
                    </h3>

                    {/* Type Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`
                          text-xs px-2.5 py-1 rounded-full font-medium capitalize
                          ${agent.type === "image"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                          }
                        `}
                      >
                        {agent.type}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-12 text-white/40">
                <p>No agents found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingAgentSelector;
