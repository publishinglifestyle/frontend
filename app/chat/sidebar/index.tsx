import { Dispatch, SetStateAction } from "react";
import { Button } from "@heroui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";

import SingleConversationRow from "./conversation-history-row";

import { Column, Conversation, Message } from "@/types/chat.types";
import {
  createConversation,
  deleteConversation,
  getConversation,
} from "@/managers/conversationsManager";

interface ChatSidebarProps {
  agents: any[];
  conversations: Conversation[];
  currentConversation: string;
  setCurrentConversation: (id: string) => void;
  setIsConversationNameModalOpen: Dispatch<SetStateAction<null | Conversation>>;
  setMessages: (messages: Message[]) => void;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setSelectedAgentId: (id: string) => void;
  setSelectedAgent: (agent: any) => void;
  setIsLoading: (isLoading: boolean) => void;
  fullName: string;
  columns: Column[];
  translations?: any;
  greeting: string;
}

const ChatSidebar = ({
  agents,
  columns,
  conversations,
  currentConversation,
  setCurrentConversation,
  setMessages,
  setConversations,
  setSelectedAgentId,
  setSelectedAgent,
  setIsLoading,
  fullName,
  translations,
  setIsConversationNameModalOpen,
  greeting,
}: ChatSidebarProps) => {
  const changeConversationMessages = async (newConversation: Conversation) => {
    const conversation = await getConversation(newConversation.id);
    let conversation_messages = [];

    if (conversation) {
      for (let i = 0; i < conversation.context.length; i++) {
        const textMessage =
          i === 0 ? greeting : conversation.context[i].content;
        const conversation_message: Message = {
          id: i.toString(),
          text: textMessage,
          username:
            conversation.context[i].role === "user"
              ? fullName
              : "LowContent AI",
          conversation_id: newConversation.id,
          complete: false,
          title: "",
          buttons: conversation.context[i].buttons,
          ideogram_buttons: conversation.context[i].ideogram_buttons,
          messageId: conversation.context[i].messageId,
          flags: conversation.context[i].flags,
          prompt: conversation.context[i].prompt,
          role: conversation.context[i].role,
        };

        conversation_messages.push(conversation_message);
      }
    }
    setMessages(conversation_messages.map((message) => ({ ...message })));
  };

  const handleCreateNewMessage = async () => {
    // Simply clear the current conversation and messages
    // The actual conversation will be created when the user sends a message
    setCurrentConversation("");
    setSelectedAgentId("");
    setSelectedAgent(undefined);
    
    // Show initial greeting message
    const greetingMessage = {
      id: "0",
      text: greeting || "Hello! How can I help you today?",
      username: "LowContent AI",
      conversation_id: "",
      complete: true,
      title: "",
      buttons: [],
      ideogram_buttons: [],
      messageId: "",
      flags: 0,
      prompt: "",
      role: "system",
    };
    setMessages([greetingMessage as Message]);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    setIsLoading(true);

    // Delete the conversation from the backend
    await deleteConversation(conversationId);

    // Update the conversations state to remove the deleted conversation
    setConversations((prevConversations) =>
      prevConversations.filter((conv) => conv.id !== conversationId)
    );

    // If the deleted conversation was the current conversation, update the current conversation to the first available one
    if (currentConversation === conversationId) {
      const remainingConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );

      if (remainingConversations.length > 0) {
        const newCurrent = remainingConversations[0];

        setCurrentConversation(newCurrent.id);
        changeConversationMessages(newCurrent); // Load messages for the new current conversation
      } else {
        // If no remaining conversations, create a new one
        await handleCreateNewMessage();
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col md:w-1/2 lg:w-1/3 xl:w-1/4 md:h-[750px]">
      <Button
        className="mb-4"
        color="secondary"
        isDisabled={!agents || agents.length === 0}
        size="sm"
        onPress={async () => {
          handleCreateNewMessage();
        }}
      >
        {translations?.new_conversation}
      </Button>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Table
          aria-label={translations?.conversations || ""}
          selectedKeys={[currentConversation]}
          selectionMode="single"
        >
          <TableHeader columns={columns}>
            {(column: Column) => (
              <TableColumn key={column.key}>{column.name}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={conversations}>
            {(item: Conversation) => (
              <TableRow key={item.id.toString()}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <SingleConversationRow
                      columnKey={column.key as keyof Conversation}
                      handleClick={async () => {
                        setIsLoading(true);
                        setCurrentConversation(item.id);

                        setSelectedAgentId("");
                        setSelectedAgent(undefined);

                        const conversation = await getConversation(item.id);

                        let conversation_messages = [];

                        for (let i = 0; i < conversation.context.length; i++) {
                          const textMessage =
                            i == 0 ? greeting : conversation.context[i].content;
                          const conversation_message: Message = {
                            id: i.toString(),
                            text: textMessage,
                            username:
                              conversation.context[i].role === "user"
                                ? fullName
                                : "LowContent AI",
                            conversation_id: item.id,
                            complete: false,
                            title: "",
                            buttons: conversation.context[i].buttons,
                            ideogram_buttons:
                              conversation.context[i].ideogram_buttons,
                            messageId: conversation.context[i].messageId,
                            flags: conversation.context[i].flags,
                            prompt: conversation.context[i].prompt,
                            role: conversation.context[i].role,
                          };

                          conversation_messages.push(conversation_message);
                        }

                        setMessages(
                          conversation_messages.map((message) => ({
                            ...message,
                          }))
                        );
                        setSelectedAgentId(conversation?.agent_id);
                        const s_agent = agents.find(
                          (agent) => agent.id === conversation?.agent_id
                        );
                        setSelectedAgent(s_agent);
                        setIsLoading(false);
                      }}
                      handleDeleteConversation={handleDeleteConversation}
                      handleEditConversation={() => {
                        setIsConversationNameModalOpen(item);
                      }}
                      item={item}
                    />
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ChatSidebar;
