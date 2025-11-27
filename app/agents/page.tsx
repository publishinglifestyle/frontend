"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/auth-context";
import { useRouter } from "next/navigation";
import ErrorModal from "@/app/modals/errorModal";
import {
  getAllAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
} from "@/managers/agentsManager";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";

interface Agent {
  id: string;
  name: string;
  type: string;
  prompt: string;
  temperature: number;
  level: number;
  model: string;
  n_buttons: number;
  buttons: Button[];
}

interface Button {
  id: string;
  name: string;
  prompt: string;
}

const n_buttons = [0, 1, 2, 3, 4];

const agent_languages = [
  { value: "both", label: "Both" },
  { value: "en", label: "English" },
  { value: "it", label: "Italian" },
];

const agent_types = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
];

const agent_models = [
  { value: "dall-e", label: "Dall-E" },
  { value: "gpt-image", label: "GPT Image" },
  { value: "midjourney", label: "Midjourney" },
  { value: "gemini", label: "Google Gemini" },
  { value: "ideogram", label: "Ideogram" },
];

const agent_levels = [
  { value: "1", label: "Basic" },
  { value: "2", label: "Pro" },
  { value: "3", label: "Advanced" },
];

// Icons
const AgentsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
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

// Custom Textarea Component
const CustomTextarea = ({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-white/70">{label}</label>
    <textarea
      {...props}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 min-h-[120px] resize-y"
    />
  </div>
);

// Custom Select Component
const CustomSelect = ({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-white/70">{label}</label>
    <select
      {...props}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
    >
      {children}
    </select>
  </div>
);

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
    </div>
  </div>
);

export default function AgentsPage() {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const router = useRouter();

  const { isAuthenticated: isAuthenticatedClient } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentTemperature, setAgentTemperature] = useState(0);
  const [agentModel, setAgentModel] = useState("");
  const [agentLevel, setAgentLevel] = useState(1);
  const [agentNButtons, setAgentNButtons] = useState(0);
  const [agentButtons, setAgentButtons] = useState<Button[]>([]);
  const [agentLanguage, setAgentLanguage] = useState("");

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };
    detectLanguage();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const all_agents = await getAllAgents();
        setAgents(all_agents);
        setIsLoading(false);
      } catch (e) {
        setIsLoading(false);
      }
    };

    if (!isAuthenticatedClient) {
      router.push("/");
    } else {
      fetchData();
    }
  }, [isAuthenticatedClient]);

  const handleRowClick = async (item: Agent) => {
    setSelectedAgentId("");
    setIsLoading(true);
    try {
      const current_agent = await getAgent(item.id);
      setSelectedAgentId(item.id);
      setAgentName(current_agent.name);
      setAgentLevel(current_agent.level);
      setAgentPrompt(current_agent.prompt);
      setAgentTemperature(current_agent.temperature);
      setAgentModel(current_agent.model);
      setAgentType(current_agent.type);
      setAgentNButtons(current_agent.n_buttons);
      setAgentButtons(current_agent.buttons || []);
      setAgentLanguage(current_agent.language);
    } catch (error) {
      console.error("Failed to load agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation();
    setIsLoading(true);
    await deleteAgent(agentId);
    setAgents((currentAgents) => currentAgents.filter((w) => w.id !== agentId));
    setIsLoading(false);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (agentButtons.length > 0) {
        while (agentButtons.length != agentNButtons) {
          agentButtons.pop();
        }
      }

      if (selectedAgentId == "new") {
        await createAgent(
          agentName,
          agentType,
          agentPrompt,
          agentTemperature,
          agentLevel,
          agentModel,
          agentNButtons,
          agentButtons,
          agentLanguage
        );
      } else {
        await updateAgent(
          selectedAgentId,
          agentName,
          agentTemperature,
          agentType,
          agentLevel,
          agentPrompt,
          agentModel,
          agentNButtons,
          agentButtons,
          agentLanguage
        );
      }
      const all_agents = await getAllAgents();
      setAgents(all_agents);
      setSelectedAgentId("");
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedAgentId("");
    setAgentName("");
    setAgentLevel(0);
    setAgentPrompt("");
    setAgentTemperature(0);
    setAgentType("");
  };

  const handleNewAgent = () => {
    setSelectedAgentId("new");
    setAgentName("");
    setAgentType("");
    setAgentPrompt("");
    setAgentTemperature(0);
    setAgentModel("");
    setAgentLevel(1);
    setAgentNButtons(0);
    setAgentButtons([]);
    setAgentLanguage("both");
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4 py-4 md:px-6 overflow-auto">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 text-purple-400 flex-shrink-0">
                <AgentsIcon />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {translations?.agents || "Agents"}
                </h1>
                <p className="text-white/60 text-sm sm:text-base">
                  Manage and configure your AI agents
                </p>
              </div>
            </div>

            {!selectedAgentId && (
              <button
                onClick={handleNewAgent}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium hover:from-purple-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-purple-500/25 flex-shrink-0 w-full sm:w-auto"
              >
                <PlusIcon />
                {translations?.new_agent || "New Agent"}
              </button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {selectedAgentId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <BackIcon />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {selectedAgentId === "new" ? (translations?.new_agent || "New Agent") : agentName}
                </h2>
                <p className="text-sm text-white/50">
                  {selectedAgentId === "new" ? "Create a new agent" : "Edit agent configuration"}
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect
                  label="Language"
                  value={agentLanguage}
                  onChange={(e) => setAgentLanguage(e.target.value)}
                >
                  <option value="" className="bg-zinc-900">Select language</option>
                  {agent_languages.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-zinc-900">
                      {lang.label}
                    </option>
                  ))}
                </CustomSelect>

                <CustomInput
                  label={translations?.name || "Name"}
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect
                  label={translations?.type || "Type"}
                  value={agentType}
                  onChange={(e) => setAgentType(e.target.value)}
                >
                  <option value="" className="bg-zinc-900">Select type</option>
                  {agent_types.map((type) => (
                    <option key={type.value} value={type.value} className="bg-zinc-900">
                      {type.label}
                    </option>
                  ))}
                </CustomSelect>

                <CustomSelect
                  label={translations?.level || "Level"}
                  value={agentLevel.toString()}
                  onChange={(e) => setAgentLevel(parseInt(e.target.value))}
                >
                  {agent_levels.map((level) => (
                    <option key={level.value} value={level.value} className="bg-zinc-900">
                      {level.label}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentType === "image" ? (
                  <CustomSelect
                    label={translations?.model || "Model"}
                    value={agentModel}
                    onChange={(e) => setAgentModel(e.target.value)}
                  >
                    <option value="" className="bg-zinc-900">Select model</option>
                    {agent_models.map((model) => (
                      <option key={model.value} value={model.value} className="bg-zinc-900">
                        {model.label}
                      </option>
                    ))}
                  </CustomSelect>
                ) : (
                  <CustomInput
                    label={translations?.temperature || "Temperature"}
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={agentTemperature?.toString()}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value);
                      setAgentTemperature(isNaN(newValue) ? 0 : newValue);
                    }}
                    placeholder="0.0 - 2.0"
                  />
                )}
              </div>

              {/* Prompt */}
              <CustomTextarea
                label="Prompt"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder="Enter the system prompt for this agent..."
              />

              {/* Number of Buttons */}
              <div>
                <p className="block text-sm font-medium text-white/70 mb-3">
                  Number of Buttons
                </p>
                <div className="flex gap-3">
                  {n_buttons.map((btn) => (
                    <button
                      key={btn}
                      onClick={() => setAgentNButtons(btn)}
                      className={`
                        flex-1 py-4 rounded-xl border-2 transition-all duration-200
                        flex flex-col items-center justify-center gap-1
                        ${agentNButtons === btn
                          ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                        }
                      `}
                    >
                      <span className={`text-2xl font-bold ${agentNButtons === btn ? "text-purple-400" : "text-white"}`}>
                        {btn}
                      </span>
                      <span className="text-xs text-white/50">Buttons</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Configuration */}
              {agentNButtons > 0 && (
                <div className="space-y-4">
                  <p className="block text-sm font-medium text-white/70">
                    Button Configuration
                  </p>
                  {Array.from({ length: agentNButtons }).map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <CustomInput
                        label={`Button ${index + 1} Name`}
                        value={agentButtons[index]?.name || ""}
                        onChange={(e) => {
                          const newButtons = [...agentButtons];
                          if (!newButtons[index]) {
                            newButtons[index] = { id: `${index}`, name: "", prompt: "" };
                          }
                          newButtons[index].name = e.target.value;
                          setAgentButtons(newButtons);
                        }}
                        placeholder="Button label"
                      />
                      <CustomInput
                        label={`Button ${index + 1} Prompt`}
                        value={agentButtons[index]?.prompt || ""}
                        onChange={(e) => {
                          const newButtons = [...agentButtons];
                          if (!newButtons[index]) {
                            newButtons[index] = { id: `${index}`, name: "", prompt: "" };
                          }
                          newButtons[index].prompt = e.target.value;
                          setAgentButtons(newButtons);
                        }}
                        placeholder="Button action prompt"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200"
              >
                {translations?.cancel || "Cancel"}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium hover:from-purple-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                {selectedAgentId === "new" ? (translations?.new_agent || "Create Agent") : (translations?.update_agent || "Update Agent")}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Agents List */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                {translations?.name || "Name"}
              </h3>
            </div>

            {/* Agents List */}
            <div className="divide-y divide-white/5">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleRowClick(agent)}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center border border-purple-500/30 text-purple-400">
                      <span className="text-sm font-bold">
                        {agent.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{agent.name}</p>
                      <p className="text-sm text-white/50 capitalize">{agent.type} Agent</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(agent);
                      }}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all text-white/50 hover:text-white"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, agent.id)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all text-white/50 hover:text-red-400"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </motion.div>
              ))}

              {agents.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                    <AgentsIcon />
                  </div>
                  <p className="text-white/50">No agents yet</p>
                  <p className="text-sm text-white/30 mt-1">Create your first agent to get started</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorModalMessage}
      />
    </div>
  );
}
