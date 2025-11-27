"use client";

import React from "react";
import { Agent } from "@/types/chat.types";
import { getAgentConfig, ImageTypeIcon, TextTypeIcon } from "../agent-icons";

interface SelectedAgentBannerProps {
  selectedAgent?: Agent;
  onChangeAgent: () => void;
  translations?: {
    change?: string;
    no_agent?: string;
    using?: string;
  } | null;
}

export const SelectedAgentBanner: React.FC<SelectedAgentBannerProps> = ({
  selectedAgent,
  onChangeAgent,
  translations,
}) => {
  if (!selectedAgent) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
        <span className="text-sm text-white/50">
          {translations?.no_agent || "No agent selected"}
        </span>
        <button
          onClick={onChangeAgent}
          className="text-xs text-secondary hover:text-secondary/80 font-medium transition-colors"
        >
          {translations?.change || "Select"}
        </button>
      </div>
    );
  }

  const config = getAgentConfig(selectedAgent.model, selectedAgent.type);
  const { Icon, glowColor, label } = config;

  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition-all duration-200"
      style={{
        backgroundColor: `${glowColor}10`,
        borderColor: `${glowColor}30`,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Agent Icon */}
        <div
          className="p-1.5 rounded-md"
          style={{
            backgroundColor: `${glowColor}20`,
            color: glowColor,
          }}
        >
          <Icon size={18} />
        </div>

        {/* Agent Info */}
        <div className="flex flex-col">
          <span className="text-xs text-white/50">
            {translations?.using || "Using"}
          </span>
          <span className="text-sm font-medium text-white">
            {selectedAgent.name}
          </span>
        </div>

        {/* Type Badge */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
          style={{
            backgroundColor: `${glowColor}20`,
            color: glowColor,
          }}
        >
          {selectedAgent.type === "image" ? (
            <ImageTypeIcon size={10} />
          ) : (
            <TextTypeIcon size={10} />
          )}
          <span className="uppercase tracking-wide font-medium text-[10px]">
            {label}
          </span>
        </div>
      </div>

      {/* Change button */}
      <button
        onClick={onChangeAgent}
        className="text-xs px-2 py-1 rounded-md
                   bg-white/5 hover:bg-white/10
                   text-white/70 hover:text-white
                   transition-colors duration-200"
      >
        {translations?.change || "Change"}
      </button>
    </div>
  );
};

export default SelectedAgentBanner;
