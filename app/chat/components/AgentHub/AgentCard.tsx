"use client";

import React from "react";
import { Agent } from "@/types/chat.types";
import { getAgentConfig, CheckIcon, ImageTypeIcon, TextTypeIcon } from "../agent-icons";

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isSelected,
  onSelect,
}) => {
  const config = getAgentConfig(agent.model, agent.type);
  const { Icon, glowColor, bgGradient, label } = config;

  return (
    <button
      onClick={onSelect}
      className={`
        agent-card relative flex flex-col items-center justify-center
        w-28 h-28 rounded-xl cursor-pointer
        transition-all duration-300 ease-out
        bg-gradient-to-br ${bgGradient}
        backdrop-blur-md
        border border-white/10
        hover:scale-105 hover:border-white/20
        focus:outline-none focus:ring-2 focus:ring-secondary/50
        ${isSelected ? "agent-card-selected" : ""}
      `}
      style={{
        boxShadow: isSelected
          ? `0 0 25px ${glowColor}40, 0 0 50px ${glowColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`
          : "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        ["--glow-color" as string]: glowColor,
      }}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm" />

      {/* Selected checkmark */}
      {isSelected && (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: glowColor }}
        >
          <CheckIcon size={12} className="text-white" />
        </div>
      )}

      {/* Icon */}
      <div
        className="relative z-10 mb-2 p-2 rounded-lg"
        style={{
          backgroundColor: `${glowColor}20`,
          color: glowColor,
        }}
      >
        <Icon size={28} />
      </div>

      {/* Agent name */}
      <span className="relative z-10 text-sm font-medium text-white text-center px-2 truncate max-w-full">
        {agent.name}
      </span>

      {/* Type badge */}
      <div
        className="relative z-10 mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
        style={{
          backgroundColor: `${glowColor}30`,
          color: glowColor,
        }}
      >
        {agent.type === "image" ? (
          <ImageTypeIcon size={10} className="opacity-80" />
        ) : (
          <TextTypeIcon size={10} className="opacity-80" />
        )}
        <span className="uppercase tracking-wide font-medium">{label}</span>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}15 0%, transparent 70%)`,
        }}
      />

      {/* Selected glow ring animation */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-xl animate-pulse-glow pointer-events-none"
          style={{
            boxShadow: `0 0 15px ${glowColor}50`,
          }}
        />
      )}
    </button>
  );
};

export default AgentCard;
