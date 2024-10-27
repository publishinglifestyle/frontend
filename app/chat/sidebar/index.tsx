import { Dispatch, SetStateAction } from "react";
import { Button } from "@nextui-org/button";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";

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
  setIsConversationNameModalOpen: Dispatch<SetStateAction<boolean>>;
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

    for (let i = 0; i < conversation.context.length; i++) {
      const textMessage = i === 0 ? greeting : conversation.context[i].content;
      const conversation_message: Message = {
        id: i.toString(),
        text: textMessage,
        username:
          conversation.context[i].role === "user" ? fullName : "LowContent AI",
        conversation_id: newConversation.id,
        complete: false,
        title: "",
        buttons: conversation.context[i].buttons,
        ideogram_buttons: conversation.context[i].ideogram_buttons,
        messageId: conversation.context[i].messageId,
        flags: conversation.context[i].flags,
        prompt: conversation.context[i].prompt,
      };

      conversation_messages.push(conversation_message);
    }
    setMessages(conversation_messages.map((message) => ({ ...message })));
  };

  const handleCreateNewMessage = async () => {
    setIsLoading(true);
    const newConversation = await createConversation();

    setConversations((prevConversations) => [
      ...prevConversations,
      newConversation,
    ]);
    setCurrentConversation(newConversation.id);
    setSelectedAgentId("");
    setSelectedAgent(undefined);

    // Fetch and display messages for the new conversation
    changeConversationMessages(newConversation);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col md:w-1/4" style={{ height: "750px" }}>
      <Button
        className="mb-4"
        color="secondary"
        isDisabled={!agents || agents.length === 0}
        size="sm"
        onClick={async () => {
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
              <TableRow
                key={item.id.toString()}
                onClick={async () => {
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
                    };

                    conversation_messages.push(conversation_message);
                  }
                  setMessages(
                    conversation_messages.map((message) => ({ ...message }))
                  );

                  setIsLoading(false);
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <SingleConversationRow
                      columnKey={column.key as keyof Conversation}
                      handleDeleteConversation={async () => {
                        setIsLoading(true);
                        await deleteConversation(item.id);
                        const newConversations = conversations.filter(
                          (conversation) => conversation.id !== item.id
                        );

                        setConversations(newConversations);

                        if (
                          currentConversation === item.id &&
                          newConversations.length > 0
                        ) {
                          setCurrentConversation(newConversations[0].id);
                          await changeConversationMessages(newConversations[0]);
                        } else {
                          // Create a new conversaion by default if there is none
                          await handleCreateNewMessage();
                        }

                        setIsLoading(false);
                      }}
                      handleEditConversation={(value) => {
                        setIsConversationNameModalOpen(value);
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
