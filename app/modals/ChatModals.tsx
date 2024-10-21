import { v4 as uuidv4 } from "uuid";

import {
  changeName,
  describeImage,
  remixImage,
} from "@/managers/conversationsManager";

import { Agent, Command, Conversation } from "@/types/chat.types";
import React from "react";
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
  isConversationNameModalOpen: boolean;
  setIsConversationNameModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  setMessageText,
  setImageResponse,
  setIsGeneratingResponse,
  setPromptCommands,
  selectedAgent,
  messageListener,
  setIsLoading,
  isActiveMessage,
  promptCommands,
}: ChatModals) => {
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

      <IdeogramModal
        isOpen={isIdeogramModalOpen}
        onClose={() => setIsIdeogramModalOpen(false)}
        onSuccess={async (
          selectedTab,
          styleType,
          aspectRatio,
          negativePrompt,
          remixPrompt,
          uploadedImageUrl
        ) => {
          const selected_commands = [
            { command: "styleType", value: styleType },
            { command: "aspectRatio", value: aspectRatio },
            { command: "negativePrompt", value: negativePrompt },
          ];

          setPromptCommands(selected_commands);
          setIsIdeogramModalOpen(false);

          if (selectedTab == "remix") {
            setIsGeneratingResponse(true);
            setMessageText(remixPrompt);
            const image_response = await remixImage(
              currentConversation,
              remixPrompt,
              uploadedImageUrl,
              promptCommands,
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

          setMessageText(prompt);
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
        isOpen={isConversationNameModalOpen}
        onClose={async (new_name) => {
          if (new_name) {
            // Ensure new_name is not undefined
            setIsConversationNameModalOpen(false);
            setIsLoading(true);
            await changeName(currentConversation, new_name, selectedAgent?.id);
            setIsLoading(false);
            setConversations(
              conversations.map((conversation) => {
                if (conversation.id === currentConversation) {
                  return {
                    ...conversation,
                    name: new_name,
                  };
                }

                return conversation;
              })
            );
          } else {
            setIsConversationNameModalOpen(false);
          }
        }}
      />
    </>
  );
};

export default ChatModals;
