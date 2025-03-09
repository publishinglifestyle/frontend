import {
  PaperClipIcon,
  StopIcon,
  ClipboardIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/outline";
import { Card, CardBody, CardFooter } from "@heroui/card";
import {
  Avatar,
  Button,
  Select,
  SelectItem,
  Spacer,
  Textarea,
} from "@heroui/react";
import Cookies from "js-cookie";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useClipboard } from "@heroui/use-clipboard";

import { useAuth } from "../auth-context";

import { Agent, Conversation, Message } from "@/types/chat.types";
import { Translations } from "@/translations";
import {
  describeImage,
  generateImage,
  sendAction,
  upscaleImage,
} from "@/managers/conversationsManager";
import { transcribeAudio } from "@/managers/audioManager";
import { getAgent } from "@/managers/agentsManager";
import PictureGenerationModal from "../modals/pictureGenerationModal";

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
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSocketConnected = false;
  const { copied, copy } = useClipboard();
  const { profilePic, user } = useAuth();
  const [isGeneratingImageDescription, setIsGeneratingImageDescription] =
    useState(false);
  const [isPictureGenerationModalOpen, setIsPictureGenerationModalOpen] =
    useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        try {
          const data = await transcribeAudio(formData);
          setMessageText(data.text);
          handleSendMessage(data.text);
        } catch (err) {
          console.error("Error transcribing audio:", err);
        }
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  function formatMessageText(text: string) {
    const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    const newLineFormatted = boldFormatted.replace(/\n/g, "<br>");

    return newLineFormatted;
  }

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleCopy = (message: string) => {
    if (message) {
      copy(message);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (selectedAgent?.model === "ideogram") {
      setIsPictureGenerationModalOpen(true);
    } else {
      sendChatMessage(text, false, "", true, promptCommands, 0, "", 1);
    }
  };

  const handleConfirmNumberOfPictures = (numberOfPictures: number) => {
    sendChatMessage(
      messageText,
      false,
      "",
      true,
      promptCommands,
      0,
      "",
      numberOfPictures
    );
    setIsPictureGenerationModalOpen(false);
  };

  const sendChatMessage = async (
    text = messageText,
    isButtonPressed: boolean,
    midjourneyMessageId: string,
    save_user_prompt: boolean,
    commands = promptCommands,
    flags: number,
    customId: string,
    n_images: number
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
            socket?.id,
            n_images
          );
        }

        setImageResponse(image_response);
      } else {
        setIsGeneratingResponse(true);
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

  if (!currentConversation) {
    return <p>Loading...</p>;
  }

  return (
    <div className="md:w-3/4 relative">
      <Card>
        <div
          ref={chatContainerRef}
          className="overflow-auto"
          style={{ height: "570px" }}
        >
          <CardBody>
            {messages
              .filter((message) => message.text && message.text !== "NaN")
              .map((message, index) => (
                <div
                  key={message.id}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className={`mt-4 message flex ${
                    message.username === Cookies.get("user_name")
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className="flex items-start rounded-lg relative"
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
                        size="sm"
                        src={profilePic ?? ""}
                      />
                    )}
                    {message.username !== Cookies.get("user_name") && (
                      <Avatar
                        alt="Profile Picture"
                        className="transition-transform mr-2 mt-2 ml-2"
                        size="sm"
                        src={aiPic}
                      />
                    )}
                    <div
                      className={`text-small max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg relative`}
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
                      {/* Message content */}
                      {message.text.endsWith(".png") ? (
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
                                  onPress={() => {
                                    sendChatMessage(
                                      button.label,
                                      true,
                                      message.messageId,
                                      true,
                                      promptCommands,
                                      message.flags,
                                      button.custom,
                                      1
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
                                  isLoading={isGeneratingImageDescription}
                                  size="sm"
                                  onPress={async () => {
                                    if (button == "Remix") {
                                      setIdeogramImageUrl(message.text);
                                      setIsGeneratingImageDescription(true);
                                      const description = await describeImage(
                                        currentConversation,
                                        message.text,
                                        selectedAgent?.id,
                                        true
                                      );

                                      setIsGeneratingImageDescription(false);
                                      setIdeogramInitialPrompt(
                                        description.response
                                      );

                                      setIsPromptModalOpen(true);
                                    } else if (button == "Upscale") {
                                      createNewMessage();
                                      const image_response = await upscaleImage(
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

                      {message.username != Cookies.get("user_name") &&
                        !message.text.startsWith("http") && (
                          <Button
                            isIconOnly
                            className="absolute -top-2 -right-4"
                            radius="full"
                            size="sm"
                            onPress={() => handleCopy(message.text)}
                          >
                            {copied ? (
                              <span className="text-md">✔</span>
                            ) : (
                              <ClipboardIcon height={15} width={15} />
                            )}
                          </Button>
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
                  className="mb-8"
                  color="secondary"
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    sendChatMessage(
                      agent_button.prompt,
                      false,
                      "",
                      false,
                      promptCommands,
                      0,
                      "",
                      1
                    );
                  }}
                >
                  {agent_button.name}
                </Button>
              ))}
            </div>

            <div className="flex gap-4 md:flex-row flex-col">
              <Textarea
                fullWidth
                isDisabled={
                  conversations.length === 0 ||
                  isGeneratingResponse ||
                  (selectedAgent?.buttons && selectedAgent?.buttons?.length > 0)
                }
                label={translations?.type_message}
                maxRows={3}
                minRows={1}
                size="sm"
                style={{ overflowY: "auto" }}
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && !e.shiftKey && messageText) {
                    e.preventDefault();
                    handleSendMessage(messageText);
                  }
                }}
              />
              <div className="flex flex-col w-full md:w-1/3">
                <Select
                  className="max-w-xs"
                  isDisabled={conversations.length === 0}
                  label={translations?.type}
                  placeholder={translations?.select_agent || ""}
                  selectedKeys={[selectedAgentId]}
                  size="sm"
                  onChange={(e) => {
                    setSelectedAgentId(e.target.value);
                    const s_agent = agents.find(
                      (agent) => agent.id === e.target.value
                    );

                    setSelectedAgent(s_agent);
                  }}
                >
                  {agents.map((agent) => (
                    <SelectItem key={agent.id}>{agent.name}</SelectItem>
                  ))}
                </Select>
                {selectedAgent?.model == "midjourney" && (
                  <Button
                    className="mt-2"
                    color={promptCommands.length > 0 ? "secondary" : "default"}
                    variant={promptCommands.length > 0 ? "ghost" : "flat"}
                    onPress={() => setIsCommandsModalOpen(true)}
                  >
                    {translations?.commands}
                  </Button>
                )}

                {selectedAgent?.model == "ideogram" && (
                  <div className="flex flex-row gap-2">
                    <Button
                      fullWidth
                      className="mt-2"
                      color={
                        promptCommands.length > 0 ? "secondary" : "default"
                      }
                      variant={promptCommands.length > 0 ? "ghost" : "flat"}
                      onPress={() => setIsIdeogramModalOpen(true)}
                    >
                      {translations?.commands}
                    </Button>
                    <Button
                      fullWidth
                      className="mt-2"
                      color="secondary"
                      variant="ghost"
                      onPress={() =>
                        window.open(
                          "https://low-content-ai-parameter-list.gitbook.io/low-content-ai/ideator-commands/ideator-prompt",
                          "_blank"
                        )
                      }
                    >
                      Prompts
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Spacer y={4} />

            <div className="flex gap-2">
              <Button
                fullWidth
                color="secondary"
                isDisabled={conversations.length === 0 || !messageText}
                style={{ color: "white" }}
                onPress={async () => {
                  handleSendMessage(messageText);
                }}
              >
                {translations?.send}
              </Button>
              <Button size="sm" onPress={handleIconClick}>
                <PaperClipIcon height={20} width={20} />
              </Button>

              <Button
                size="sm"
                onPress={
                  isRecording ? handleStopRecording : handleStartRecording
                }
              >
                <MicrophoneIcon
                  height={20}
                  width={20}
                  className={isRecording ? "text-red-500" : ""}
                />
              </Button>

              <input
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                type="file"
                onChange={handleImageChange}
              />
              <Button
                isDisabled={!isGeneratingResponse}
                size="sm"
                onPress={async () => {
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

      <PictureGenerationModal
        isOpen={isPictureGenerationModalOpen}
        onClose={() => setIsPictureGenerationModalOpen(false)}
        onConfirm={handleConfirmNumberOfPictures}
      />
    </div>
  );
};

export default ChatMessageList;
