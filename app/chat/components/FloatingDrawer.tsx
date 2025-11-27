"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { Conversation } from "@/types/chat.types";

interface FloatingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversation: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onEditConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  selectedConversations: Set<string>;
  onToggleSelect: (conversationId: string) => void;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  translations?: {
    conversations?: string;
    new_conversation?: string;
  } | null;
}

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckboxIcon = ({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" className={checked || indeterminate ? "fill-purple-500 stroke-purple-500" : ""} />
    {checked && <path d="M9 12l2 2 4-4" className="stroke-white" strokeWidth="2" />}
    {indeterminate && !checked && <path d="M8 12h8" className="stroke-white" strokeWidth="2" />}
  </svg>
);

export const FloatingDrawer: React.FC<FloatingDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
  onEditConversation,
  onDeleteConversation,
  selectedConversations,
  onToggleSelect,
  onSelectAll,
  onBulkDelete,
  translations,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAllSelected = conversations.length > 0 && selectedConversations.size === conversations.length;
  const isPartiallySelected = selectedConversations.size > 0 && selectedConversations.size < conversations.length;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await onBulkDelete();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/50 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          absolute left-0 top-0 h-full w-80 z-50
          bg-gradient-to-b from-zinc-900/95 to-black/95
          backdrop-blur-xl
          border-r border-white/10
          shadow-2xl shadow-purple-500/10
          transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ChatIcon />
            {translations?.conversations || "Conversations"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Select All & Delete Selected - Only show when items are selected */}
        {conversations.length > 0 && selectedConversations.size > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <button
              onClick={onSelectAll}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <CheckboxIcon checked={isAllSelected} indeterminate={isPartiallySelected} />
              <span>Select All</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              <TrashIcon />
              Delete ({selectedConversations.size})
            </button>
          </div>
        )}

        {/* New Conversation Button */}
        <div className="p-4">
          <Button
            fullWidth
            className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium"
            startContent={<PlusIcon />}
            onPress={onNewConversation}
          >
            {translations?.new_conversation || "New Conversation"}
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`
                group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer
                transition-all duration-200
                ${currentConversation === conversation.id
                  ? "bg-purple-500/20"
                  : "hover:bg-white/5"
                }
              `}
              onClick={() => onSelectConversation(conversation)}
            >
              {/* Checkbox - Show on hover or when any item is selected */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(conversation.id);
                }}
                className={`
                  flex-shrink-0 p-0.5 hover:bg-white/10 rounded transition-all
                  ${selectedConversations.size > 0 || selectedConversations.has(conversation.id)
                    ? "opacity-100 w-5"
                    : "opacity-0 group-hover:opacity-100 w-0 group-hover:w-5 overflow-hidden"}
                `}
              >
                <CheckboxIcon checked={selectedConversations.has(conversation.id)} />
              </button>

              {/* Chat Icon */}
              <div
                className={`
                  w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0
                  ${currentConversation === conversation.id
                    ? "bg-purple-500/30 text-purple-400"
                    : "bg-white/5 text-white/50"
                  }
                `}
              >
                <ChatIcon />
              </div>

              {/* Title & Date */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {conversation.name || "Untitled"}
                </p>
                <p className="text-xs text-white/40">
                  {formatDate(conversation.last_activity)}
                </p>
              </div>

              {/* Action Buttons - Always visible */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditConversation(conversation);
                  }}
                  className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="Rename"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="p-1.5 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-8 text-white/40">
              <ChatIcon />
              <p className="mt-2 text-sm">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Conversations</h3>
            <p className="text-white/60 mb-6">
              Are you sure you want to delete {selectedConversations.size} conversation{selectedConversations.size > 1 ? "s" : ""}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="flat"
                className="bg-white/10 text-white"
                onPress={() => setShowDeleteConfirm(false)}
                isDisabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white min-w-[100px]"
                onPress={handleConfirmDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingDrawer;
