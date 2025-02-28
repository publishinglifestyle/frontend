"use client";

import Cookies from "js-cookie";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useSearchParams } from "next/navigation";

import { Translations } from "../../translations.d";
import { getTranslations } from "../../managers/languageManager";
import { useAuth } from "../auth-context";
import ChatModals from "../modals/ChatModals";
import SubscriptionModal from "../modals/subscriptionModal";

import ChatMessageList from "./chat-msg-list";
import ChatSidebar from "./sidebar";
import LoadingSpinner from "./spinner";

import {
  Agent,
  Column,
  Command,
  Conversation,
  Message,
} from "@/types/chat.types";
import { getSubscription } from "@/managers/subscriptionManager";
import { baseURL } from "@/constant/urls";
import {
  getConversations,
  saveMjImage,
  uploadImage,
} from "@/managers/conversationsManager";
import { getAgentsPerLevel } from "@/managers/agentsManager";

let GREETING_MESSAGE = "";

let columns: Column[] = [{ key: "id", name: "Conversations" }];

let socket: Socket | null = null;
const aiPic = "./ai.png";

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

  const pageLoadedRef = useRef(false);
  const [translations, setTranslations] = useState<Translations | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isCommandsModalOpen, setIsCommandsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [messageText, setMessageText] = useState<string>("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<Agent>();
  const [currentConversation, setCurrentConversation] = useState<string>("");
  const [conversations, setConversations] = useState<Array<Conversation>>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isConversationNameModalOpen, setIsConversationNameModalOpen] =
    useState<null | Conversation>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [promptCommands, setPromptCommands] = useState<Command[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isIdeogramModalOpen, setIsIdeogramModalOpen] = useState(false);
  const [ideogramInitialPrompt, setIdeogramInitialPrompt] = useState("");
  const [ideogramImageUrl, setIdeogramImageUrl] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const userId = user?.id;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        try {
          setIsLoading(true);
          const imageUrl = await uploadImage(file);

          setUploadedImageUrl(imageUrl);
          setIsLoading(false);
          setIsImageModalOpen(true);
        } catch (error) {
          setIsLoading(false);
          const err = error as any;

          if (err.response) {
            setErrorMessage(err.response.data);
            setIsErrorModalOpen(true);
          }
        }
      }
    }
  };

  const messageListener = (message: Message) => {
    setMessages((prevMessages): Message[] => {
      const existingMessageIndex = prevMessages.findIndex(
        (m) => m.id === message.id
      );

      const updatedMessages = prevMessages.filter(
        (m) => !m?.id?.startsWith("typing-")
      );

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
      setIsGeneratingResponse(false);
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

  function setImageResponse(image_response: any) {
    if (!image_response) return;

    if (Array.isArray(image_response)) {
      // Handle multiple images (Ideogram case)
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter(
          (m) => !m?.id?.startsWith("typing-")
        );

        const newMessages = image_response.map((imgResponse) => ({
          id: imgResponse.messageId,
          username: "LowContent AI",
          text: imgResponse.response, // Image URL
          conversation_id: currentConversation,
          title: imgResponse.conversation_name,
          complete: true,
          buttons: [],
          ideogram_buttons: imgResponse.ideogram_buttons ?? [],
          messageId: imgResponse.messageId,
          flags: 0,
          prompt: imgResponse.prompt || "",
        }));

        return [...updatedMessages, ...newMessages];
      });

      setIsGeneratingResponse(false);
      return;
    }

    if (image_response.error || image_response.image_ready) {
      // Handle single image response (DALL-E, Midjourney, etc.)
      const message = {
        id: image_response.messageId,
        username: "LowContent AI",
        text: image_response.response,
        conversation_id: currentConversation,
        title: image_response.conversation_name,
        complete: true,
        buttons: [],
        ideogram_buttons: image_response.ideogram_buttons || [],
        messageId: "",
        flags: 0,
        prompt: image_response.prompt || "",
      };

      setMessages((prevMessages) => {
        const existingMessageIndex = prevMessages.findIndex(
          (m) => m.id === message.id
        );
        const updatedMessages = prevMessages.filter(
          (m) => !m?.id?.startsWith("typing-")
        );

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

  useEffect(() => {
    if (!pageLoadedRef.current || !userId || socket) return;
    socket = io(baseURL, {
      query: { user_id: userId },
      reconnection: false,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      socket?.connect();
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    // Ensure only one messageListener is attached
    if (!socket.hasListeners("message")) {
      socket.on("message", messageListener);
    }

    // Listen for the midjourneyCallback event
    socket.on("midjourneyCallback", async (response) => {
      if (response?.status === "failed" || !response.result) {
        const messageText = response?.failMessage
          ? response.failMessage
          : "Failed to generate image";
        const message = {
          id: uuidv4(),
          username: "LowContent AI",
          text: messageText,
          conversation_id: currentConversation,
          complete: true,
          buttons: [],
          ideogram_buttons: [],
          messageId: "",
          flags: 0,
          prompt: "",
        };

        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.filter(
            (m) => !m?.id?.startsWith("typing-")
          );

          return [
            ...updatedMessages,
            {
              ...message,
              title: "",
            },
          ];
        });

        setIsGeneratingResponse(false); // Stop the loading bubble

        return;
      }

      // Store conversation context
      const save_image_response = await saveMjImage(
        response.result.prompt,
        response.result.message_id,
        response.conversation_id,
        true,
        response.result.url,
        response.result.options,
        response.result.flags,
        selectedAgent?.id
      );

      const message = {
        id: uuidv4(),
        username: "LowContent AI",
        text: save_image_response.imageUrl,
        conversation_id: response.conversation_id,
        complete: true,
        buttons: response.result.options || [],
        ideogram_buttons: [],
        messageId: response.result.message_id,
        flags: response.result.flags,
        prompt: response.result.prompt,
      };

      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter(
          (m) => !m?.id?.startsWith("typing-")
        );

        // Ensure the new message conforms to the Message type
        return [
          ...updatedMessages,
          {
            ...message,
            title: "",
          },
        ];
      });

      setIsGeneratingResponse(false); // Stop the loading bubble
    });

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("message", messageListener);
        socket.off("midjourneyCallback");
        socket.close();
        socket = null;
      }
    };
  }, [user?.id, pageLoadedRef]);

  useEffect(() => {
    if (pageLoadedRef.current && userId) {
      if (sessionId) {
        setIsSuccessModalOpen(true);
      } else if (user?.role !== "owner") {
        showModalIfNoActiveSubscription();
      }
    }
  }, [sessionId, pageLoadedRef, userId]);

  useEffect(() => {
    if (!pageLoadedRef.current || !user?.id) return;

    let browserLanguage = "";

    const detectLanguage = async () => {
      browserLanguage = navigator.language;
      browserLanguage = browserLanguage.slice(0, 2);

      const translations = await getTranslations(browserLanguage);

      setTranslations(translations);

      columns = [{ key: "id", name: translations?.conversations || "" }];

      GREETING_MESSAGE = translations?.greeting || "";
    };

    detectLanguage();

    async function fetchData() {
      const all_agents = await getAgentsPerLevel(browserLanguage);

      if (all_agents) {
        setAgents(all_agents);

        const all_conversations = await getConversations();

        setConversations(all_conversations);

        if (all_conversations.length > 0) {
          const current_conversation = all_conversations[0];

          setCurrentConversation(current_conversation.id);
          const current_agent = all_agents.find(
            (agent: any) => agent.id === current_conversation.agent_id
          );

          setSelectedAgent(current_agent);
          setSelectedAgentId(current_conversation.agent_id);

          let conversation_messages = [];

          for (let i = 0; i < current_conversation.context.length; i++) {
            const textMessage =
              i === 0
                ? GREETING_MESSAGE
                : current_conversation.context[i].content;

            if (textMessage && textMessage !== "NaN") {
              const conversation_message: Message = {
                id: uuidv4(),
                text: textMessage,
                username:
                  current_conversation.context[i].role === "user"
                    ? fullName
                    : "LowContent AI",
                conversation_id: current_conversation.id,
                complete: false,
                title: "",
                buttons: current_conversation.context[i].buttons,
                ideogram_buttons:
                  current_conversation.context[i].ideogram_buttons,
                messageId: current_conversation.context[i].messageId,
                flags: current_conversation.context[i].flags,
                prompt: current_conversation.context[i].prompt,
              };

              conversation_messages.push(conversation_message);
            }
          }

          setMessages(conversation_messages.map((message) => ({ ...message })));
        }

        Cookies.set("user_name", fullName);
      }
    }

    fetchData();
  }, [pageLoadedRef, user?.id]);

  const showModalIfNoActiveSubscription = async () => {
    const currentSubscription = await getSubscription();

    if (!currentSubscription?.is_active) {
      setShowSubscriptionModal(true);
    }
  };

  const fullName = user?.first_name + " " + user?.last_name;

  return (
    <>
      {isLoading && (
        <div className="fixed bg-black/50 top-0 left-0 h-screen w-screen z-[9999]">
          <LoadingSpinner />
        </div>
      )}

      <div className="flex flex-col text-center">
        <h1 className="text-4xl font-bold text-center">
          Chat with Low Content AI
        </h1>
        <h2 className="text-lg font-semibold text-center mb-4">
          Start a Conversation and Create Low-Content Books with AI
        </h2>

        <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => {}} />

        <div className="flex flex-col md:flex-row justify-between gap-2 px-2 md:px-4 lg:px-8">
          <ChatSidebar
            agents={agents}
            columns={columns}
            conversations={conversations}
            currentConversation={currentConversation}
            fullName={fullName}
            greeting={GREETING_MESSAGE}
            setConversations={setConversations}
            setCurrentConversation={setCurrentConversation}
            setIsConversationNameModalOpen={setIsConversationNameModalOpen}
            setIsLoading={setIsLoading}
            setMessages={setMessages}
            setSelectedAgent={setSelectedAgent}
            setSelectedAgentId={setSelectedAgentId}
            translations={translations}
          />

          <ChatMessageList
            agents={agents}
            aiPic={aiPic}
            conversations={conversations}
            currentConversation={currentConversation}
            fullName={fullName}
            handleImageChange={handleImageChange}
            isGeneratingResponse={isGeneratingResponse}
            isReconnecting={isReconnecting}
            messageListener={messageListener}
            messageText={messageText}
            messages={messages}
            promptCommands={promptCommands}
            selectedAgent={selectedAgent}
            selectedAgentId={selectedAgentId}
            setIdeogramImageUrl={setIdeogramImageUrl}
            setIdeogramInitialPrompt={setIdeogramInitialPrompt}
            setImageResponse={setImageResponse}
            setIsCommandsModalOpen={setIsCommandsModalOpen}
            setIsGeneratingResponse={setIsGeneratingResponse}
            setIsIdeogramModalOpen={setIsIdeogramModalOpen}
            setIsPromptModalOpen={setIsPromptModalOpen}
            setIsReconnecting={setIsReconnecting}
            setMessageText={setMessageText}
            setMessages={setMessages}
            setSelectedAgent={setSelectedAgent}
            setSelectedAgentId={setSelectedAgentId}
            socket={socket}
            translations={translations}
            userId={user?.id ?? ""}
          />

          <ChatModals
            conversations={conversations}
            currentConversation={currentConversation}
            errorMessage={errorMessage}
            fullName={fullName}
            ideogramImageUrl={ideogramImageUrl}
            ideogramInitialPrompt={ideogramInitialPrompt}
            isActiveMessage={translations?.subscription_is_active || ""}
            isCommandsModalOpen={isCommandsModalOpen}
            isConversationNameModalOpen={isConversationNameModalOpen}
            isErrorModalOpen={isErrorModalOpen}
            isIdeogramModalOpen={isIdeogramModalOpen}
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
            setIsImageModalOpen={setIsImageModalOpen}
            setIsLoading={setIsLoading}
            setIsPromptModalOpen={setIsPromptModalOpen}
            setIsSuccessModalOpen={setIsSuccessModalOpen}
            setMessageText={setMessageText}
            setMessages={setMessages}
            setPromptCommands={setPromptCommands}
            setUploadedImageUrl={setUploadedImageUrl}
            uploadedImageUrl={uploadedImageUrl}
          />
        </div>
      </div>
    </>
  );
}
