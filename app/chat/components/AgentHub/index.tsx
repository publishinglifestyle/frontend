"use client";

import React from "react";
import { Agent } from "@/types/chat.types";
import { AgentCard } from "./AgentCard";
import { ChevronUpIcon, ChevronDownIcon } from "../agent-icons";

interface AgentHubProps {
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (agent: Agent) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  translations?: {
    select_agent?: string;
    agents?: string;
    collapse?: string;
    expand?: string;
  } | null;
}

export const AgentHub: React.FC<AgentHubProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  isExpanded,
  onToggleExpanded,
  translations,
}) => {
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Group agents by type
  const textAgents = agents.filter((a) => a.type === "text");
  const imageAgents = agents.filter((a) => a.type === "image");

  return (
    <div
      className={`
        agent-hub glass-panel
        w-full rounded-2xl mb-4
        transition-all duration-300 ease-in-out
        overflow-hidden
        ${isExpanded ? "max-h-[200px]" : "max-h-[56px]"}
      `}
    >
      {/* Header bar - always visible */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white/90">
            {translations?.agents || "Agents"}
          </h3>
          {!isExpanded && selectedAgent && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30">
              <span className="text-sm text-secondary font-medium">
                {selectedAgent.name}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleExpanded}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                     bg-white/5 hover:bg-white/10
                     transition-colors duration-200
                     text-white/70 hover:text-white"
        >
          <span className="text-xs">
            {isExpanded
              ? translations?.collapse || "Collapse"
              : translations?.expand || "Expand"}
          </span>
          {isExpanded ? (
            <ChevronUpIcon size={16} />
          ) : (
            <ChevronDownIcon size={16} />
          )}
        </button>
      </div>

      {/* Agent cards container - scrollable */}
      <div
        className={`
          px-4 pb-4
          transition-all duration-300 ease-in-out
          ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Scrollable container */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* Text Agents Section */}
          {textAgents.length > 0 && (
            <>
              {textAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgentId === agent.id}
                  onSelect={() => onSelectAgent(agent)}
                />
              ))}
            </>
          )}

          {/* Divider between text and image agents */}
          {textAgents.length > 0 && imageAgents.length > 0 && (
            <div className="flex items-center px-2">
              <div className="w-px h-20 bg-white/10" />
            </div>
          )}

          {/* Image Agents Section */}
          {imageAgents.length > 0 && (
            <>
              {imageAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgentId === agent.id}
                  onSelect={() => onSelectAgent(agent)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentHub;
