import { getAgent } from "@/managers/agentsManager";
import {
  describeImage,
  generateImage,
  sendAction,
  upscaleImage,
} from "@/managers/conversationsManager";
import { Translations } from "@/translations";
import { Agent, Conversation, Message } from "@/types/chat.types";
import { PaperClipIcon, StopIcon } from "@heroicons/react/24/outline";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import {
  Avatar,
  Button,
  Select,
  SelectItem,
  Spacer,
  Textarea,
} from "@nextui-org/react";
import Cookies from "js-cookie";
import React, { Dispatch, SetStateAction, useRef } from "react";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../auth-context";

interface ChatMessageListProps {
  agents: Agent[];
  conversations: Conversation[];
  messages: Message[];
  currentConversation: string;
  selectedAgent?: Agent;
  selectedAgentId: string;
  aiPic: string;
  fullName: string;
  isGeneratingResponse: boolean;
  messageText: string;
  promptCommands: any[];
  translations?: Translations | null;
  setSelectedAgentId: (id: string) => void;
  setSelectedAgent: (agent: Agent | undefined) => void;
  setMessageText: (text: string) => void;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setIsGeneratingResponse: (isGenerating: boolean) => void;
  setIdeogramInitialPrompt: (prompt: string) => void;
  setIdeogramImageUrl: (url: string) => void;
  setIsPromptModalOpen: (isOpen: boolean) => void;
  setImageResponse: (response: any) => void;
  setIsCommandsModalOpen: (isOpen: boolean) => void;
  setIsIdeogramModalOpen: (isOpen: boolean) => void;
  socket?: Socket | null;
  userId: string;
  setIsReconnecting: Dispatch<SetStateAction<boolean>>;
  isReconnecting: boolean;
  messageListener: (message: Message) => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}

const ChatMessageList = ({
  messageListener,
  setIsReconnecting,
  conversations,
  messageText,
  messages,
  agents,
  selectedAgentId,
  setIdeogramImageUrl,
  setIdeogramInitialPrompt,
  setImageResponse,
  setIsCommandsModalOpen,
  setIsGeneratingResponse,
  setIsIdeogramModalOpen,
  setIsPromptModalOpen,
  setMessageText,
  setSelectedAgent,
  setSelectedAgentId,
  selectedAgent,
  socket,
  aiPic,
  currentConversation,
  translations,
  handleImageChange,
  promptCommands,
  isGeneratingResponse,
  fullName,
  setMessages,
}: ChatMessageListProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSocketConnected = false;

  const { profilePic, user } = useAuth();

  function formatMessageText(text: string) {
    const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    const newLineFormatted = boldFormatted.replace(/\n/g, "<br>");

    return newLineFormatted;
  }

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const sendChatMessage = async (
    text = messageText,
    isButtonPressed: boolean,
    midjourneyMessageId: string,
    save_user_prompt: boolean,
    commands = promptCommands,
    flags: number,
    customId: string
  ) => {
    if (text.trim()) {
      if (!isSocketConnected) {
        setIsReconnecting(true);
        socket?.connect();

        await new Promise<void>((resolve) => {
          const checkConnection = () => {
            if (socket?.connected) {
              resolve();
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
        });

        setIsReconnecting(false);
      }

      createNewMessage();

      let current_agent;
      if (selectedAgentId) {
        try {
          current_agent = await getAgent(selectedAgentId);
        } catch (error) {
          console.log("Error getting agent: ", error);
        }
      }
      if (
        (current_agent && current_agent.type === "image") ||
        isButtonPressed
      ) {
        setIsGeneratingResponse(true);
        let image_response: any = "";

        if (isButtonPressed) {
          image_response = await sendAction(
            currentConversation,
            midjourneyMessageId,
            customId,
            text,
            promptCommands,
            flags,
            socket?.id
          );
        } else {
          setMessageText("");
          image_response = await generateImage(
            text,
            selectedAgentId,
            currentConversation,
            save_user_prompt,
            commands,
            socket?.id
          );
        }

        setImageResponse(image_response);
      } else {
        socket?.emit("sendMessage", {
          senderId: user?.id,
          message: text,
          agent_id: selectedAgentId,
          conversation_id: currentConversation,
        });

        setMessageText("");
      }
    }
  };

  const createNewMessage = (text = messageText) => {
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
    <div className="md:w-3/4">
      <Card>
        <div
          ref={chatContainerRef}
          className="overflow-auto"
          style={{ height: "570px" }}
        >
          <CardBody>
            {messages
              .filter((message) => message.text && message.text !== "NaN")
              .map((message) => (
                <div
                  key={message.id}
                  className={`mt-4 message flex ${
                    message.username === Cookies.get("user_name")
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className="flex items-start rounded-lg"
                    style={{
                      backgroundColor:
                        message.username === Cookies.get("user_name")
                          ? "#9353D3"
                          : "lightgray",
                    }}
                  >
                    {message.username === Cookies.get("user_name") && (
                      <Avatar
                        alt="Profile Picture"
                        className="transition-transform mr-2 mt-2 ml-2"
                        src={profilePic ?? ""}
                      />
                    )}
                    {message.username !== Cookies.get("user_name") && (
                      <Avatar
                        alt="Profile Picture"
                        className="transition-transform mr-2 mt-2 ml-2"
                        src={aiPic}
                      />
                    )}
                    <div
                      className={`text-small max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg`}
                      style={{
                        backgroundColor:
                          message.username === Cookies.get("user_name")
                            ? "#9353D3"
                            : "lightgray",
                        color:
                          message.username === Cookies.get("user_name")
                            ? "white"
                            : "black",
                      }}
                    >
                      {message.username !== Cookies.get("user_name") && (
                        <p className="font-semibold">LowContent AI</p>
                      )}
                      {message.username === Cookies.get("user_name") && (
                        <p className="font-semibold">{fullName}</p>
                      )}
                      {message.text.startsWith("http") ? (
                        <>
                          <img
                            alt="Received"
                            className="max-w-full h-auto rounded-lg"
                            src={message.text.trim()}
                          />
                          {message.buttons?.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
                              {message.buttons.map((button, index) => (
                                <Button
                                  key={index}
                                  className="w-full"
                                  color="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    sendChatMessage(
                                      button.label,
                                      true,
                                      message.messageId,
                                      true,
                                      promptCommands,
                                      message.flags,
                                      button.custom
                                    );
                                  }}
                                >
                                  <span style={{ fontSize: "8px" }}>
                                    {button.label}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          )}

                          {message.ideogram_buttons?.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
                              {message.ideogram_buttons.map((button, index) => (
                                <Button
                                  key={index}
                                  className="w-full"
                                  color="secondary"
                                  size="sm"
                                  onClick={async (e) => {
                                    e.preventDefault();

                                    if (button == "Remix") {
                                      setIdeogramInitialPrompt(message.prompt);
                                      setIdeogramImageUrl(message.text);
                                      setIsPromptModalOpen(true);
                                    } else if (button == "Upscale") {
                                      createNewMessage();
                                      const image_response = upscaleImage(
                                        currentConversation,
                                        message.text,
                                        message.prompt
                                      );
                                      setImageResponse(image_response);
                                    } else if (button == "Describe") {
                                      createNewMessage(message.text);
                                      const description = await describeImage(
                                        currentConversation,
                                        message.text,
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
                                >
                                  <span style={{ fontSize: "8px" }}>
                                    {button}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatMessageText(message.text),
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </CardBody>
        </div>

        <CardFooter>
          <div className="flex flex-col w-full">
            <div className="flex gap-2">
              {selectedAgent?.buttons?.map((agent_button) => (
                <Button
                  key={agent_button.id}
                  variant="ghost"
                  size="sm"
                  color="secondary"
                  className="mb-8"
                  onClick={(e) => {
                    e.preventDefault();
                    sendChatMessage(
                      agent_button.prompt,
                      false,
                      "",
                      false,
                      promptCommands,
                      0,
                      ""
                    );
                  }}
                >
                  {agent_button.name}
                </Button>
              ))}
            </div>

            <div className="flex gap-4 md:flex-row flex-col">
              <Textarea
                isDisabled={
                  conversations.length === 0 ||
                  isGeneratingResponse ||
                  (selectedAgent?.buttons && selectedAgent?.buttons?.length > 0)
                }
                fullWidth
                type="text"
                size="sm"
                label={translations?.type_message}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && !e.shiftKey && messageText) {
                    e.preventDefault();
                    sendChatMessage(
                      messageText,
                      false,
                      "",
                      true,
                      promptCommands,
                      0,
                      ""
                    );
                  }
                }}
              />
              <div className="flex flex-col md:w-1/3">
                <Select
                  isDisabled={conversations.length === 0}
                  size="sm"
                  label={translations?.type}
                  placeholder={translations?.select_agent || ""}
                  selectedKeys={[selectedAgentId]}
                  onChange={(e) => {
                    setSelectedAgentId(e.target.value);
                    const s_agent = agents.find(
                      (agent) => agent.id === e.target.value
                    );
                    setSelectedAgent(s_agent);
                  }}
                >
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </Select>
                {selectedAgent?.model == "midjourney" && (
                  <Button
                    variant={promptCommands.length > 0 ? "ghost" : "flat"}
                    color={promptCommands.length > 0 ? "secondary" : "default"}
                    className="mt-2"
                    onClick={() => setIsCommandsModalOpen(true)}
                  >
                    {translations?.commands}
                  </Button>
                )}

                {selectedAgent?.model == "ideogram" && (
                  <Button
                    variant={promptCommands.length > 0 ? "ghost" : "flat"}
                    color={promptCommands.length > 0 ? "secondary" : "default"}
                    className="mt-2"
                    onClick={() => setIsIdeogramModalOpen(true)}
                  >
                    {translations?.commands}
                  </Button>
                )}
              </div>
            </div>

            <Spacer y={4} />

            <div className="flex gap-2">
              <Button
                isDisabled={conversations.length === 0 || !messageText}
                fullWidth
                color="secondary"
                style={{ color: "white" }}
                onClick={async (e) => {
                  e.preventDefault();
                  sendChatMessage(
                    messageText,
                    false,
                    "",
                    true,
                    promptCommands,
                    0,
                    ""
                  );
                }}
              >
                {translations?.send}
              </Button>
              <Button size="sm" onClick={handleIconClick}>
                <PaperClipIcon width={20} height={20} />
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <Button
                isDisabled={!isGeneratingResponse}
                size="sm"
                onClick={async () => {
                  setIsGeneratingResponse(false);
                  socket?.disconnect();
                }}
              >
                <StopIcon />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChatMessageList;
