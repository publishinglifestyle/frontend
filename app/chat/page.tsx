"use client";

import Cookies from "js-cookie";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useSearchParams } from "next/navigation";
import { useClipboard } from "@heroui/use-clipboard";

import { Translations } from "../../translations.d";
import { getTranslations } from "../../managers/languageManager";
import { useAuth } from "../auth-context";
import ChatModals from "../modals/ChatModals";
import SubscriptionModal from "../modals/subscriptionModal";

import LoadingSpinner from "./spinner";
import FloatingDrawer from "./components/FloatingDrawer";
import FloatingInputBar from "./components/FloatingInputBar";
import MessageArea from "./components/MessageArea";
import FloatingAgentSelector from "./components/FloatingAgentSelector";

import {
  Agent,
  Command,
  Conversation,
  Message,
} from "@/types/chat.types";
import { getSubscription } from "@/managers/subscriptionManager";
import { baseURL } from "@/constant/urls";
import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  saveMjImage,
  uploadImage,
  generateImage,
  sendAction,
  describeImage,
  upscaleImage,
} from "@/managers/conversationsManager";
import { getAgentsPerLevel } from "@/managers/agentsManager";
import { transcribeAudio } from "@/managers/audioManager";

let GREETING_MESSAGE = "";
let socket: Socket | null = null;

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user } = useAuth();
  const { copy } = useClipboard();

  const pageLoadedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentConversationRef = useRef<string>("");
  const streamingBufferRef = useRef<Map<string, { id: string; text: string }>>(new Map());
  const generatingConversationsRef = useRef<Map<string, string>>(new Map());
  const pendingImageUserMessagesRef = useRef<Map<string, Message[]>>(new Map());
  const selectedAgentRef = useRef<Agent | undefined>(undefined);

  // UI State
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isCommandsModalOpen, setIsCommandsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDalleImageSizeModalOpen, setIsDalleImageSizeModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isIdeogramModalOpen, setIsIdeogramModalOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isConversationNameModalOpen, setIsConversationNameModalOpen] = useState<null | Conversation>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Chat State
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [messageText, setMessageText] = useState<string>("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<Agent>();
  const [currentConversation, setCurrentConversation] = useState<string>("");
  const [conversations, setConversations] = useState<Array<Conversation>>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [generatingAgentType, setGeneratingAgentType] = useState<string | undefined>(undefined);
  const [promptCommands, setPromptCommands] = useState<Command[]>([]);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [ideogramInitialPrompt, setIdeogramInitialPrompt] = useState("");
  const [ideogramImageUrl, setIdeogramImageUrl] = useState("");
  const [ideogramInitialTab, setIdeogramInitialTab] = useState("");
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  const userId = user?.id;
  const fullName = user?.first_name + " " + user?.last_name;

  // Keep ref in sync with currentConversation state and persist to localStorage
  useEffect(() => {
    currentConversationRef.current = currentConversation;
    if (currentConversation) {
      localStorage.setItem("currentConversationId", currentConversation);
    } else {
      localStorage.removeItem("currentConversationId");
    }
  }, [currentConversation]);

  // Keep selectedAgentRef in sync
  useEffect(() => {
    selectedAgentRef.current = selectedAgent;
  }, [selectedAgent]);

  // Message Listener for Socket
  const messageListener = (message: Message) => {
    // Always accumulate streaming text in buffer for ALL conversations
    if (message.conversation_id) {
      if (!message.complete) {
        const buffer = streamingBufferRef.current;
        const existing = buffer.get(message.conversation_id);
        if (existing) {
          existing.text += message.text;
        } else {
          buffer.set(message.conversation_id, { id: message.id, text: message.text });
        }
      } else {
        // Stream completed — clear buffer (full response saved to DB)
        streamingBufferRef.current.delete(message.conversation_id);
        generatingConversationsRef.current.delete(message.conversation_id);
        pendingImageUserMessagesRef.current.delete(message.conversation_id);
      }
    }

    // Only update UI for current conversation
    if (message.conversation_id && currentConversationRef.current &&
        message.conversation_id !== currentConversationRef.current) {
      return;
    }

    setMessages((prevMessages): Message[] => {
      const existingMessageIndex = prevMessages.findIndex((m) => m.id === message.id);
      const updatedMessages = prevMessages.filter((m) => !m?.id?.startsWith("typing-"));

      if (existingMessageIndex !== -1) {
        updatedMessages[existingMessageIndex] = {
          ...updatedMessages[existingMessageIndex],
          text: updatedMessages[existingMessageIndex].text + message.text,
        };
        return updatedMessages;
      } else {
        return [...updatedMessages, message];
      }
    });

    if (message.complete) {
      // Only clear generating state if no image generation is in-flight for this conversation
      if (!generatingConversationsRef.current.has(currentConversationRef.current)) {
        setIsGeneratingResponse(false);
      }
    }

    if (message.title) {
      setConversations((prevConversations) =>
        prevConversations.map((conversation) =>
          conversation.id === message.conversation_id
            ? { ...conversation, name: message.title }
            : conversation
        )
      );
    }
  };

  // Image Response Handler (conversation-scoped)
  function setImageResponse(image_response: any, targetConversationId?: string) {
    if (!image_response) return;

    const convId = targetConversationId || currentConversationRef.current;

    // Clean up generation tracking for this conversation
    generatingConversationsRef.current.delete(convId);

    // If user switched away, skip UI update — image is already saved to DB
    // Keep pendingImageUserMessages so they can be restored on conversation switch-back
    if (convId !== currentConversationRef.current) {
      // Still show errors even if on a different conversation
      if (image_response.error) {
        setErrorMessage(image_response.error);
        setIsErrorModalOpen(true);
      }
      return;
    }

    // User is on this conversation — safe to clear pending messages
    pendingImageUserMessagesRef.current.delete(convId);

    if (Array.isArray(image_response)) {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter((m) => !m?.id?.startsWith("typing-"));
        const newMessages = image_response.map((imgResponse) => ({
          id: imgResponse.messageId,
          username: "LowContent AI",
          text: imgResponse.response,
          conversation_id: convId,
          title: imgResponse.conversation_name,
          complete: true,
          buttons: [],
          ideogram_buttons: imgResponse.ideogram_buttons ?? [],
          messageId: imgResponse.messageId,
          flags: 0,
          prompt: imgResponse.prompt || "",
          role: "assistant",
        }));
        return [...updatedMessages, ...newMessages];
      });
      setIsGeneratingResponse(false);
      return;
    }

    if (image_response.error || image_response.image_ready) {
      const message = {
        id: image_response.messageId,
        username: "LowContent AI",
        text: image_response.response,
        conversation_id: convId,
        title: image_response.conversation_name,
        complete: true,
        buttons: [],
        ideogram_buttons: image_response.ideogram_buttons || [],
        messageId: "",
        flags: 0,
        prompt: image_response.prompt || "",
        role: "assistant",
      };

      setMessages((prevMessages) => {
        const existingMessageIndex = prevMessages.findIndex((m) => m.id === message.id);
        const updatedMessages = prevMessages.filter((m) => !m?.id?.startsWith("typing-"));

        if (existingMessageIndex !== -1) {
          updatedMessages[existingMessageIndex] = {
            ...updatedMessages[existingMessageIndex],
            text: updatedMessages[existingMessageIndex].text + message.text,
            id: message.id,
          };
          return updatedMessages;
        } else {
          return [...updatedMessages, message];
        }
      });
      setIsGeneratingResponse(false);
    }

    if (image_response.error) {
      setErrorMessage(image_response.error);
      setIsErrorModalOpen(true);
    }
  }

  // Handle Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        try {
          setIsLoading(true);
          // Clear previous image first to ensure fresh state
          setPendingImageUrl("");
          setUploadedImageUrl("");

          const imageUrl = await uploadImage(file);
          // Add unique timestamp to prevent any caching issues
          const uniqueImageUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}uploaded=${Date.now()}`;

          setUploadedImageUrl(uniqueImageUrl);
          setPendingImageUrl(uniqueImageUrl);
          setIsLoading(false);
          setIsImageModalOpen(true);
          if (e.target) e.target.value = '';
        } catch (error) {
          setIsLoading(false);
          const err = error as any;
          setErrorMessage(err.response?.data || err.message || "Failed to upload image");
          setIsErrorModalOpen(true);
          if (e.target) e.target.value = '';
        }
      }
    }
  };

  // Send Message Handler
  const handleSendMessage = async () => {
    if (!messageText.trim() && !pendingImageUrl && pendingImages.length === 0) return;

    // Capture current values before clearing
    const text = messageText;
    const referenceImageUrl = pendingImageUrl;
    const referenceImages = [...pendingImages];

    // Clear inputs immediately
    setMessageText("");
    setPendingImageUrl("");
    setPendingImages([]);

    // Create conversation if needed
    let conversationId = currentConversation;
    if (!conversationId) {
      const newConversation = await createConversation();
      conversationId = newConversation.id;
      setCurrentConversation(conversationId);
      setConversations((prev) => [newConversation, ...prev]);
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      text: text,
      username: fullName,
      conversation_id: conversationId,
      complete: true,
      title: "",
      buttons: [],
      ideogram_buttons: [],
      messageId: "",
      flags: 0,
      prompt: "",
      role: "user",
      image_urls: referenceImageUrl
        ? [referenceImageUrl, ...referenceImages]
        : referenceImages.length > 0
        ? referenceImages
        : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsGeneratingResponse(true);
    setGeneratingAgentType(selectedAgent?.type);

    // Handle based on agent type
    if (selectedAgent?.type === "image") {
      // Buffer user message so it persists when switching conversations
      pendingImageUserMessagesRef.current.set(conversationId, [userMessage]);
      generatingConversationsRef.current.set(conversationId, "image");
      try {
        // Get size from promptCommands if available
        let size;
        const sizeCommand = promptCommands.find(cmd => cmd.command === "size");
        if (sizeCommand) {
          size = sizeCommand.value;
        }

        // Get reference image - from promptCommands (DalleModal) or pendingImageUrl (attachment)
        let finalReferenceImage = referenceImageUrl;
        const refImageCommand = promptCommands.find(cmd => cmd.command === "referenceImage");
        if (refImageCommand && refImageCommand.value) {
          finalReferenceImage = refImageCommand.value;
          console.log("Using reference image from modal:", finalReferenceImage);
        }

        const response = await generateImage(
          text,                           // msg
          selectedAgent.id,               // agent_id
          conversationId,                 // conversation_id
          true,                           // save_user_prompt
          promptCommands,                 // prompt_commands
          socket?.id,                     // socket_id
          1,                              // n_images
          size,                           // size
          finalReferenceImage || undefined  // reference_image_url
        );
        setImageResponse(response, conversationId);
      } catch (error: any) {
        generatingConversationsRef.current.delete(conversationId);
        pendingImageUserMessagesRef.current.delete(conversationId);
        if (currentConversationRef.current === conversationId) {
          setIsGeneratingResponse(false);
        }
        const msg = error?.response?.data?.error || "Failed to generate image. Please try again.";
        setErrorMessage(msg);
        setIsErrorModalOpen(true);
      }
    } else {
      // Text agent or no agent - send via socket
      generatingConversationsRef.current.set(conversationId, selectedAgent?.type || "text");
      pendingImageUserMessagesRef.current.set(conversationId, [userMessage]);
      socket?.emit("sendMessage", {
        senderId: userId,
        message: text,
        conversation_id: conversationId,
        agent_id: selectedAgent?.id || undefined,
        image_url: referenceImageUrl || undefined,
      });
    }
  };

  // Handle New Conversation
  const handleNewConversation = async () => {
    const newConversation = await createConversation();
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversation(newConversation.id);
    currentConversationRef.current = newConversation.id;
    setMessages([]);
    setIsGeneratingResponse(false);
    setIsDrawerOpen(false);
    // Reset agent to "No Agent" for new conversations
    setSelectedAgentId("");
    setSelectedAgent(undefined);
    setPromptCommands([]);
  };

  // Handle Select Conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation.id);
    currentConversationRef.current = conversation.id;
    // Check if this conversation has an active generation
    const generatingType = generatingConversationsRef.current.get(conversation.id);
    const targetIsGenerating = generatingType !== undefined;
    setIsGeneratingResponse(targetIsGenerating);
    if (targetIsGenerating) {
      setGeneratingAgentType(generatingType);
    }
    setIsDrawerOpen(false);

    // Snapshot pending user messages before async call — protects against
    // setImageResponse clearing the ref while getConversation is in-flight
    const pendingMsgsSnapshot = pendingImageUserMessagesRef.current.has(conversation.id)
      ? [...pendingImageUserMessagesRef.current.get(conversation.id)!]
      : null;

    try {
      // Fetch fresh conversation data from the API
      const freshConversation = await getConversation(conversation.id);

      if (!freshConversation) {
        setMessages([]);
        return;
      }

      // Set agent from the fresh data
      const agent = agents.find((a) => a.id === freshConversation.agent_id);
      if (agent) {
        setSelectedAgent(agent);
        setSelectedAgentId(agent.id);
      } else {
        setSelectedAgent(undefined);
        setSelectedAgentId("");
      }

      // Update the conversation in local state with fresh data
      setConversations((prev) =>
        prev.map((c) => (c.id === freshConversation.id ? freshConversation : c))
      );

      // Build messages from fresh context
      const context = freshConversation.context || [];
      const conversationMessages = context
        .map((ctx: any, i: number) => {
          const textMessage = i === 0 ? GREETING_MESSAGE : ctx.content;
          if (!textMessage || textMessage === "NaN") return null;

          return {
            id: uuidv4(),
            text: textMessage,
            username: ctx.role === "user" ? fullName : "LowContent AI",
            conversation_id: freshConversation.id,
            complete: true,
            title: "",
            buttons: ctx.buttons || [],
            ideogram_buttons: ctx.ideogram_buttons || [],
            messageId: ctx.messageId || "",
            flags: ctx.flags || 0,
            prompt: ctx.prompt || "",
            role: ctx.role,
          } as Message;
        })
        .filter(Boolean) as Message[];

      // Restore pending user messages that aren't in the API context yet
      const pendingMsgs = pendingImageUserMessagesRef.current.get(conversation.id) || pendingMsgsSnapshot;
      if (pendingMsgs) {
        const contextUserTexts = new Set(
          conversationMessages.filter(m => m.role === "user").map(m => m.text)
        );
        for (const msg of pendingMsgs) {
          if (!contextUserTexts.has(msg.text)) {
            conversationMessages.push(msg);
          }
        }
        // Clean up if generation already completed (snapshot case)
        if (!generatingConversationsRef.current.has(conversation.id)) {
          pendingImageUserMessagesRef.current.delete(conversation.id);
        }
      }

      // If there's buffered streaming content for this conversation, append it
      const buffer = streamingBufferRef.current.get(conversation.id);
      if (buffer) {
        conversationMessages.push({
          id: buffer.id,
          text: buffer.text,
          username: "LowContent AI",
          conversation_id: conversation.id,
          complete: false,
          role: "assistant",
          title: "",
          buttons: [],
          ideogram_buttons: [],
          messageId: "",
          flags: 0,
          prompt: "",
        } as Message);
        setIsGeneratingResponse(true);
        setGeneratingAgentType(generatingConversationsRef.current.get(conversation.id));
      } else if (generatingConversationsRef.current.has(conversation.id)) {
        setIsGeneratingResponse(true);
        setGeneratingAgentType(generatingConversationsRef.current.get(conversation.id));
      }

      setMessages(conversationMessages);
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      // Fallback to local data if API fails
      const context = conversation.context || [];
      const agent = agents.find((a) => a.id === conversation.agent_id);
      if (agent) {
        setSelectedAgent(agent);
        setSelectedAgentId(agent.id);
      } else {
        setSelectedAgent(undefined);
        setSelectedAgentId("");
      }

      const conversationMessages = context
        .map((ctx: any, i: number) => {
          const textMessage = i === 0 ? GREETING_MESSAGE : ctx.content;
          if (!textMessage || textMessage === "NaN") return null;

          return {
            id: uuidv4(),
            text: textMessage,
            username: ctx.role === "user" ? fullName : "LowContent AI",
            conversation_id: conversation.id,
            complete: true,
            title: "",
            buttons: ctx.buttons || [],
            ideogram_buttons: ctx.ideogram_buttons || [],
            messageId: ctx.messageId || "",
            flags: ctx.flags || 0,
            prompt: ctx.prompt || "",
            role: ctx.role,
          } as Message;
        })
        .filter(Boolean) as Message[];

      // Restore pending user messages that aren't in the API context yet
      const pendingMsgsFallback = pendingImageUserMessagesRef.current.get(conversation.id) || pendingMsgsSnapshot;
      if (pendingMsgsFallback) {
        const contextUserTexts = new Set(
          conversationMessages.filter(m => m.role === "user").map(m => m.text)
        );
        for (const msg of pendingMsgsFallback) {
          if (!contextUserTexts.has(msg.text)) {
            conversationMessages.push(msg);
          }
        }
        if (!generatingConversationsRef.current.has(conversation.id)) {
          pendingImageUserMessagesRef.current.delete(conversation.id);
        }
      }

      // If there's buffered streaming content for this conversation, append it
      const bufferFallback = streamingBufferRef.current.get(conversation.id);
      if (bufferFallback) {
        conversationMessages.push({
          id: bufferFallback.id,
          text: bufferFallback.text,
          username: "LowContent AI",
          conversation_id: conversation.id,
          complete: false,
          role: "assistant",
          title: "",
          buttons: [],
          ideogram_buttons: [],
          messageId: "",
          flags: 0,
          prompt: "",
        } as Message);
        setIsGeneratingResponse(true);
        setGeneratingAgentType(generatingConversationsRef.current.get(conversation.id));
      } else if (generatingConversationsRef.current.has(conversation.id)) {
        setIsGeneratingResponse(true);
        setGeneratingAgentType(generatingConversationsRef.current.get(conversation.id));
      }

      setMessages(conversationMessages);
    }
  };

  // Handle Delete Conversation
  const handleDeleteConversation = async (conversationId: string) => {
    generatingConversationsRef.current.delete(conversationId);
    pendingImageUserMessagesRef.current.delete(conversationId);
    await deleteConversation(conversationId);
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (currentConversation === conversationId) {
      setCurrentConversation("");
      setMessages([]);
    }
  };

  // Handle Toggle Select Conversation
  const handleToggleSelect = (conversationId: string) => {
    setSelectedConversations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  // Handle Select All Conversations
  const handleSelectAll = () => {
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set());
    } else {
      setSelectedConversations(new Set(conversations.map((c) => c.id)));
    }
  };

  // Handle Bulk Delete Conversations
  const handleBulkDelete = async () => {
    await Promise.all([...selectedConversations].map((id) => deleteConversation(id)));
    setConversations((prev) => prev.filter((c) => !selectedConversations.has(c.id)));
    if (selectedConversations.has(currentConversation)) {
      setCurrentConversation("");
      setMessages([]);
    }
    setSelectedConversations(new Set());
  };

  // Handle Copy Message
  const handleCopyMessage = (text: string) => {
    copy(text);
  };

  // Handle Image Actions (Ideogram)
  const handleImageAction = async (action: string, message: Message) => {
    const convId = currentConversationRef.current;
    if (action === "remix") {
      setIdeogramInitialPrompt(message.prompt || "");
      setIdeogramImageUrl(message.text);
      setIdeogramInitialTab("remix");
      setIsIdeogramModalOpen(true);
    } else if (action === "upscale") {
      setIsGeneratingResponse(true);
      setGeneratingAgentType("image");
      generatingConversationsRef.current.set(convId, "image");
      try {
        const response = await upscaleImage(convId, message.text, message.prompt || "");
        setImageResponse(response, convId);
      } catch {
        generatingConversationsRef.current.delete(convId);
        if (currentConversationRef.current === convId) {
          setIsGeneratingResponse(false);
        }
      }
    } else if (action === "describe") {
      setIsGeneratingResponse(true);
      setGeneratingAgentType(selectedAgent?.type);
      generatingConversationsRef.current.set(convId, selectedAgent?.type || "image");
      try {
        const response = await describeImage(convId, message.text, selectedAgent?.id || "");
        setImageResponse(response, convId);
      } catch {
        generatingConversationsRef.current.delete(convId);
        if (currentConversationRef.current === convId) {
          setIsGeneratingResponse(false);
        }
      }
    }
  };

  // Handle Midjourney Button Click
  const handleButtonClick = async (button: any, message: Message) => {
    const convId = currentConversationRef.current;
    setIsGeneratingResponse(true);
    setGeneratingAgentType("image");
    generatingConversationsRef.current.set(convId, "image");
    try {
      await sendAction(
        convId,                   // conversation_id
        message.messageId,        // message_id
        button.custom,            // custom_id
        message.prompt || "",     // prompt
        promptCommands,           // prompt_commands
        message.flags,            // flags
        socket?.id                // socket_id
      );
    } catch {
      generatingConversationsRef.current.delete(convId);
      if (currentConversationRef.current === convId) {
        setIsGeneratingResponse(false);
      }
    }
  };

  // Recording Handlers
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        try {
          const data = await transcribeAudio(formData);
          if (data?.text) {
            setMessageText((prev) => (prev ? prev + " " + data.text : data.text));
          }
        } catch (error) {
          console.error("Transcription failed:", error);
          setErrorMessage("Failed to transcribe audio");
          setIsErrorModalOpen(true);
        }
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setErrorMessage("Failed to access microphone");
      setIsErrorModalOpen(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  // Open Commands Modal
  const handleOpenCommands = () => {
    if (selectedAgent?.model === "midjourney") {
      setIsCommandsModalOpen(true);
    } else if (selectedAgent?.model === "ideogram") {
      setIsIdeogramModalOpen(true);
    } else if (selectedAgent?.model === "gpt-image") {
      setIsDalleImageSizeModalOpen(true);
    } else if (selectedAgent?.model === "gemini") {
      setIsGeminiModalOpen(true);
    }
  };

  // Effects
  useEffect(() => {
    if (!pageLoadedRef.current) {
      pageLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (pageLoadedRef.current) {
      const hasToken = !!Cookies.get("authToken");
      if (!hasToken) {
        window.location.href = "/";
      }
    }
  }, [pageLoadedRef]);

  // Socket Setup
  useEffect(() => {
    if (!pageLoadedRef.current || !userId || socket) return;

    socket = io(baseURL, {
      query: { user_id: userId },
      reconnection: false,
    });

    socket.on("connect", () => console.log("Socket connected:", socket?.id));
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      socket?.connect();
    });
    socket.on("connect_error", (error) => console.error("Connection error:", error));

    if (!socket.hasListeners("message")) {
      socket.on("message", messageListener);
    }

    if (!socket.hasListeners("conversationTitleUpdate")) {
      socket.on("conversationTitleUpdate", ({ conversation_id, title }) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversation_id
              ? { ...c, name: title, last_activity: new Date().toISOString() }
              : c
          )
        );
      });
    }

    if (!socket.hasListeners("midjourneyCallback")) {
      socket.on("midjourneyCallback", async (response) => {
        const responseConvId = response.conversation_id;

        if (response?.status === "failed" || !response.result) {
          const msg = response?.failMessage || "Failed to generate image";
          generatingConversationsRef.current.delete(responseConvId);

          // Only update UI if still on the same conversation
          if (responseConvId === currentConversationRef.current) {
            pendingImageUserMessagesRef.current.delete(responseConvId);
            setMessages((prev) => [
              ...prev.filter((m) => !m?.id?.startsWith("typing-")),
              {
                id: uuidv4(),
                username: "LowContent AI",
                text: msg,
                conversation_id: responseConvId,
                complete: true,
                buttons: [],
                ideogram_buttons: [],
                messageId: "",
                flags: 0,
                prompt: "",
                role: "assistant",
                title: "",
              },
            ]);
            setIsGeneratingResponse(false);
          }
          return;
        }

        const save_image_response = await saveMjImage(
          response.result.prompt,
          response.result.message_id,
          responseConvId,
          true,
          response.result.url,
          response.result.options,
          response.result.flags,
          selectedAgentRef.current?.id
        );

        generatingConversationsRef.current.delete(responseConvId);

        // Only update UI if still on the same conversation (image is saved to DB regardless)
        if (responseConvId !== currentConversationRef.current) {
          return;
        }

        pendingImageUserMessagesRef.current.delete(responseConvId);
        setMessages((prev) => [
          ...prev.filter((m) => !m?.id?.startsWith("typing-")),
          {
            id: uuidv4(),
            username: "LowContent AI",
            text: save_image_response.imageUrl,
            conversation_id: responseConvId,
            complete: true,
            buttons: response.result.options || [],
            ideogram_buttons: [],
            messageId: response.result.message_id,
            flags: response.result.flags,
            prompt: response.result.prompt,
            role: "assistant",
            title: "",
          },
        ]);
        setIsGeneratingResponse(false);
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("message", messageListener);
        socket.off("conversationTitleUpdate");
        socket.off("midjourneyCallback");
        socket.close();
        socket = null;
      }
    };
  }, [user?.id, pageLoadedRef]);

  // Subscription Check
  useEffect(() => {
    if (pageLoadedRef.current && userId) {
      if (sessionId) {
        setIsSuccessModalOpen(true);
      } else if (user?.role !== "owner") {
        getSubscription().then((sub) => {
          if (!sub?.is_active) setShowSubscriptionModal(true);
        });
      }
    }
  }, [sessionId, pageLoadedRef, userId]);

  // Data Fetching
  useEffect(() => {
    if (!pageLoadedRef.current || !user?.id) return;

    let browserLanguage = navigator.language.slice(0, 2);

    const init = async () => {
      const trans = await getTranslations(browserLanguage);
      setTranslations(trans);
      GREETING_MESSAGE = trans?.greeting || "";

      const allAgents = await getAgentsPerLevel(browserLanguage);
      if (allAgents) {
        setAgents(allAgents);
        const allConversations = await getConversations();
        setConversations(allConversations);

        if (allConversations.length > 0) {
          const savedId = localStorage.getItem("currentConversationId");
          const conv = (savedId && allConversations.find((c: Conversation) => c.id === savedId)) || allConversations[0];
          setCurrentConversation(conv.id);

          const agent = allAgents.find((a: Agent) => a.id === conv.agent_id);
          if (agent) {
            setSelectedAgent(agent);
            setSelectedAgentId(conv.agent_id);
          }

          const msgs = conv.context
            .map((ctx: any, i: number) => {
              const text = i === 0 ? GREETING_MESSAGE : ctx.content;
              if (!text || text === "NaN") return null;
              return {
                id: uuidv4(),
                text,
                username: ctx.role === "user" ? fullName : "LowContent AI",
                conversation_id: conv.id,
                complete: true,
                title: "",
                buttons: (ctx as any).buttons || [],
                ideogram_buttons: (ctx as any).ideogram_buttons || [],
                messageId: (ctx as any).messageId || "",
                flags: (ctx as any).flags || 0,
                prompt: (ctx as any).prompt || "",
                role: ctx.role,
              } as Message;
            })
            .filter(Boolean) as Message[];
          setMessages(msgs);
        }

        Cookies.set("user_name", fullName);
      }
    };

    init();
  }, [pageLoadedRef, user?.id]);

  return (
    <div className="relative h-full flex flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-black overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5">
        {/* Menu Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        {/* Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-lg font-semibold text-white">Low Content AI</h1>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewConversation}
          className="p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </header>

      {/* Message Area */}
      <MessageArea
        messages={messages}
        currentUser={fullName}
        isGenerating={isGeneratingResponse}
        generatingAgentType={generatingAgentType}
        selectedAgent={selectedAgent}
        onCopyMessage={handleCopyMessage}
        onImageAction={handleImageAction}
        onButtonClick={handleButtonClick}
      />

      {/* Floating Input Bar */}
      <FloatingInputBar
        value={messageText}
        onChange={setMessageText}
        onSend={handleSendMessage}
        onAttachImage={() => fileInputRef.current?.click()}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onStopGeneration={() => {
          generatingConversationsRef.current.delete(currentConversationRef.current);
          pendingImageUserMessagesRef.current.delete(currentConversationRef.current);
          setIsGeneratingResponse(false);
          socket?.disconnect();
        }}
        onOpenAgentSelector={() => setIsAgentSelectorOpen(true)}
        onOpenCommands={handleOpenCommands}
        selectedAgent={selectedAgent}
        isGenerating={isGeneratingResponse}
        isRecording={isRecording}
        pendingImageUrl={pendingImageUrl}
        pendingImages={pendingImages}
        onRemoveImage={(index) => {
          if (index === undefined || index === 0 && pendingImageUrl) {
            // If no index or index 0 with pendingImageUrl, clear the single image
            setPendingImageUrl("");
          } else {
            // Adjust index to account for pendingImageUrl being at index 0
            const adjustedIndex = pendingImageUrl ? index - 1 : index;
            setPendingImages(prev => prev.filter((_, i) => i !== adjustedIndex));
          }
        }}
        translations={translations}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
        onClick={(e) => {
          // Reset value to allow selecting the same file again
          (e.target as HTMLInputElement).value = '';
        }}
      />

      {/* Floating Drawer */}
      <FloatingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onEditConversation={(conv) => setIsConversationNameModalOpen(conv)}
        onDeleteConversation={handleDeleteConversation}
        selectedConversations={selectedConversations}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onBulkDelete={handleBulkDelete}
        translations={translations}
      />

      {/* Agent Selector */}
      <FloatingAgentSelector
        isOpen={isAgentSelectorOpen}
        onClose={() => setIsAgentSelectorOpen(false)}
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={(agent) => {
          if (agent) {
            setSelectedAgentId(agent.id);
            setSelectedAgent(agent);
          } else {
            setSelectedAgentId("");
            setSelectedAgent(undefined);
          }
        }}
        translations={translations}
      />

      {/* Subscription Modal */}
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => {}} />

      {/* Chat Modals */}
      <ChatModals
        conversations={conversations}
        currentConversation={currentConversation}
        errorMessage={errorMessage}
        fullName={fullName}
        ideogramImageUrl={ideogramImageUrl}
        ideogramInitialPrompt={ideogramInitialPrompt}
        ideogramInitialTab={ideogramInitialTab}
        setIdeogramInitialTab={setIdeogramInitialTab}
        isActiveMessage={translations?.subscription_is_active || ""}
        isCommandsModalOpen={isCommandsModalOpen}
        isConversationNameModalOpen={isConversationNameModalOpen}
        isErrorModalOpen={isErrorModalOpen}
        isIdeogramModalOpen={isIdeogramModalOpen}
        isGeminiModalOpen={isGeminiModalOpen}
        isDalleImageSizeModalOpen={isDalleImageSizeModalOpen}
        isImageModalOpen={isImageModalOpen}
        isPromptModalOpen={isPromptModalOpen}
        isSuccessModalOpen={isSuccessModalOpen}
        messageListener={messageListener}
        messages={messages}
        promptCommands={promptCommands}
        selectedAgent={selectedAgent}
        setConversations={setConversations}
        setIdeogramImageUrl={setIdeogramImageUrl}
        setIdeogramInitialPrompt={setIdeogramInitialPrompt}
        setImageResponse={setImageResponse}
        setIsCommandsModalOpen={setIsCommandsModalOpen}
        setIsConversationNameModalOpen={setIsConversationNameModalOpen}
        setIsErrorModalOpen={setIsErrorModalOpen}
        setIsGeneratingResponse={setIsGeneratingResponse}
        setIsIdeogramModalOpen={setIsIdeogramModalOpen}
        setIsGeminiModalOpen={setIsGeminiModalOpen}
        setIsDalleImageSizeModalOpen={setIsDalleImageSizeModalOpen}
        setIsImageModalOpen={setIsImageModalOpen}
        setIsLoading={setIsLoading}
        setIsPromptModalOpen={setIsPromptModalOpen}
        setIsSuccessModalOpen={setIsSuccessModalOpen}
        setMessageText={setMessageText}
        setMessages={setMessages}
        setPromptCommands={setPromptCommands}
        setUploadedImageUrl={setUploadedImageUrl}
        uploadedImageUrl={uploadedImageUrl}
        setPendingImageUrl={setPendingImageUrl}
        setPendingImages={setPendingImages}
      />
    </div>
  );
}
