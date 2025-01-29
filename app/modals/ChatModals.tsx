import { v4 as uuidv4 } from "uuid";

import {
  changeName,
  describeImage,
  remixImage,
} from "@/managers/conversationsManager";

import { Agent, Command, Conversation, Message } from "@/types/chat.types";
import React, { Dispatch, SetStateAction } from "react";
import CommandsModal from "./commandsModal";
import ConversationNameModal from "./conversationName";
import ErrorModal from "./errorModal";
import IdeogramModal from "./ideogramModal";
import ImageModal from "./imageModal";
import PromptModal from "./promptModal";
import SuccessModal from "./successModal";

interface ChatModals {
  isSuccessModalOpen: boolean;
  setIsSuccessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCommandsModalOpen: boolean;
  setIsCommandsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isIdeogramModalOpen: boolean;
  setIsIdeogramModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isErrorModalOpen: boolean;
  setIsErrorModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isImageModalOpen: boolean;
  setIsImageModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPromptModalOpen: boolean;
  setIsPromptModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isConversationNameModalOpen: Conversation | null;
  setIsConversationNameModalOpen: React.Dispatch<
    React.SetStateAction<Conversation | null>
  >;
  ideogramInitialPrompt: string;
  setIdeogramInitialPrompt: React.Dispatch<React.SetStateAction<string>>;
  ideogramImageUrl: string;
  setIdeogramImageUrl: React.Dispatch<React.SetStateAction<string>>;
  uploadedImageUrl: string;
  setUploadedImageUrl: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string;
  currentConversation: string;
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  conversations: Conversation[];
  setMessageText: React.Dispatch<React.SetStateAction<string>>;
  setImageResponse: React.Dispatch<React.SetStateAction<any>>;
  setIsGeneratingResponse: React.Dispatch<React.SetStateAction<boolean>>;
  setPromptCommands: React.Dispatch<React.SetStateAction<any[]>>;
  selectedAgent?: Agent;
  messageListener: (message: any) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isActiveMessage: string;
  promptCommands: Command[];
  fullName: string;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
}

const ChatModals = ({
  isSuccessModalOpen,
  setIsSuccessModalOpen,
  isCommandsModalOpen,
  setIsCommandsModalOpen,
  isIdeogramModalOpen,
  setIsIdeogramModalOpen,
  isErrorModalOpen,
  setIsErrorModalOpen,
  isImageModalOpen,
  setIsImageModalOpen,
  isPromptModalOpen,
  setIsPromptModalOpen,
  isConversationNameModalOpen,
  setIsConversationNameModalOpen,
  ideogramInitialPrompt,
  ideogramImageUrl,
  uploadedImageUrl,
  errorMessage,
  currentConversation,
  setConversations,
  conversations,
  setImageResponse,
  setIsGeneratingResponse,
  setPromptCommands,
  selectedAgent,
  messageListener,
  setIsLoading,
  isActiveMessage,
  promptCommands,
  fullName,
  messages,
  setMessages,
}: ChatModals) => {
  const [selectedAspectRatio, setSelectedAspectRatio] = React.useState("");
  const createMessageText = (text: string) => {
    const userMessageId = `${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      username: fullName,
      text,
      conversation_id: currentConversation,
      complete: true,
      title: "",
      buttons: [],
      ideogram_buttons: [],
      messageId: "",
      flags: 0,
      prompt: "",
    };

    const typingMessageId = `typing-${Date.now()}`;
    const typingMessage = {
      id: typingMessageId,
      username: "LowContent AI",
      text: '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>',
      conversation_id: currentConversation,
      complete: false,
      title: "",
      buttons: [],
      ideogram_buttons: [],
      messageId: "",
      flags: 0,
      prompt: "",
    };

    const allMessages = [...messages, userMessage, typingMessage];
    setMessages(allMessages);
  };

  return (
    <>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }}
        message={isActiveMessage}
      />

      <CommandsModal
        isOpen={isCommandsModalOpen}
        onClose={() => setIsCommandsModalOpen(false)}
        onSuccess={(selected_commands) => {
          setPromptCommands(selected_commands);
          setIsCommandsModalOpen(false);
        }}
      />

      {isIdeogramModalOpen && (
        <IdeogramModal
          agentId={selectedAgent?.id}
          selectedAspectRatio={selectedAspectRatio}
          isOpen={isIdeogramModalOpen}
          onClose={() => setIsIdeogramModalOpen(false)}
          onSuccess={async (
            selectedTab,
            styleType,
            aspectRatio,
            negativePrompt,
            remixPrompt,
            remixSimilarity,
            uploadedImageUrl
          ) => {
            const selected_commands = [
              { command: "styleType", value: styleType },
              { command: "aspectRatio", value: aspectRatio },
              { command: "negativePrompt", value: negativePrompt },
              { command: "similarity", value: remixSimilarity },
            ];

            setSelectedAspectRatio(aspectRatio);
            setPromptCommands(selected_commands);
            setIsIdeogramModalOpen(false);

            if (selectedTab == "remix") {
              setIsGeneratingResponse(true);

              createMessageText(remixPrompt);
              const image_response = await remixImage(
                currentConversation,
                remixPrompt,
                uploadedImageUrl,
                selected_commands,
                selectedAgent?.id
              );

              setImageResponse(image_response);
            } else if (selectedTab == "describe") {
              setIsGeneratingResponse(true);
              const description = await describeImage(
                currentConversation,
                uploadedImageUrl,
                selectedAgent?.id
              );
              const description_message = {
                id: uuidv4(),
                username: "LowContent AI",
                text: description.response,
                conversation_id: currentConversation,
                complete: true,
                title: "",
                buttons: [],
                ideogram_buttons: [],
                messageId: "",
                flags: 0,
                prompt: "",
              };
              messageListener(description_message);
            }
          }}
        />
      )}

      <ErrorModal
        isOpen={isErrorModalOpen}
        message={errorMessage}
        onClose={() => setIsErrorModalOpen(false)}
      />

      <ImageModal
        imageUrl={uploadedImageUrl}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />

      <PromptModal
        initialPrompt={ideogramInitialPrompt}
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSuccess={async (prompt) => {
          setIsPromptModalOpen(false);
          setIsGeneratingResponse(true);
          createMessageText(prompt);
          const image_response = await remixImage(
            currentConversation,
            prompt,
            ideogramImageUrl,
            promptCommands,
            selectedAgent?.id
          );

          setImageResponse(image_response);
        }}
      />

      <ConversationNameModal
        isOpen={Boolean(isConversationNameModalOpen)}
        conversation={isConversationNameModalOpen}
        onClose={async (new_name) => {
          if (new_name) {
            setIsConversationNameModalOpen(null);
            setIsLoading(true);
            await changeName(
              isConversationNameModalOpen?.id,
              new_name,
              selectedAgent?.id
            );
            setIsLoading(false);
            setConversations(
              conversations.map((conversation) => {
                if (conversation.id === isConversationNameModalOpen?.id) {
                  return {
                    ...conversation,
                    name: new_name,
                  };
                }

                return conversation;
              })
            );
          } else {
            setIsConversationNameModalOpen(null);
          }
        }}
      />
    </>
  );
};

export default ChatModals;
