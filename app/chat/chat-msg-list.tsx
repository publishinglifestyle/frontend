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
import React, { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
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
  pendingImageUrl: string;
  setPendingImageUrl: Dispatch<SetStateAction<string>>;
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
  setIsDalleImageSizeModalOpen: (isOpen: boolean) => void;
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
  setIsDalleImageSizeModalOpen,
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
  pendingImageUrl,
  setPendingImageUrl,
}: ChatMessageListProps) => {
  // Add CSS styles for message images
  const imageStyles = `
    .message-image-container {
      max-width: 100%;
      overflow: hidden;
      border-radius: 8px;
      margin: 5px 0;
    }
    
    .message-image {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
      border-radius: 8px;
    }
    
    .message-with-description {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .message-text {
      word-break: break-word;
    }
  `;

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
    // Reset the file input before clicking to ensure the change event fires
    // even if the same file is selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // After resetting, trigger the click event
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
      // When sending, combine message text with image URL if both exist
      const messageToSend = combineMessageWithImage(text);
      sendChatMessage(messageToSend, false, "", true, promptCommands, 0, "", 1);
      
      // Clear the pending image URL after sending
      if (pendingImageUrl) {
        setPendingImageUrl("");
      }
    }
  };
  
  // Helper function to combine message text with image URL
  const combineMessageWithImage = (text: string): string => {
    if (!pendingImageUrl) {
      // If no image, just return the text
      return text;
    }
    
    // Remove cache-busting parameters for storage/transmission
    // This prevents multiple copies of the same image in the chat history
    let cleanImageUrl = pendingImageUrl;
    try {
      const url = new URL(pendingImageUrl);
      url.searchParams.delete('t');
      url.searchParams.delete('timestamp');
      cleanImageUrl = url.toString();
    } catch (e) {
      console.error('Error cleaning image URL:', e);
      // Fall back to the original URL if there's an error
    }
    
    if (text.trim()) {
      // Ensure there's always a space between text and URL
      const messageText = text.trim();
      
      // Always add a space between text and URL to ensure proper separation
      return `${messageText} ${cleanImageUrl}`;
    } else {
      // If we only have an image, return just the image URL
      return cleanImageUrl;
    }
  };

  const handleConfirmNumberOfPictures = (numberOfPictures: number) => {
    // Combine message text with image URL if both exist
    const messageToSend = combineMessageWithImage(messageText);
    sendChatMessage(
      messageToSend,
      false,
      "",
      true,
      promptCommands,
      0,
      "",
      numberOfPictures
    );
    setIsPictureGenerationModalOpen(false);
    
    // Clear the pending image URL after sending
    if (pendingImageUrl) {
      setPendingImageUrl("");
    }
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

      createNewMessage(text);

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
          
          // Check if we have a size parameter in promptCommands for DALL-E
          let size;
          if (current_agent?.model === "dall-e" && commands) {
            const sizeCommand = commands.find(cmd => cmd.command === "size");
            if (sizeCommand) {
              size = sizeCommand.value;
              console.log("Using DALL-E image size:", size);
            }
          }
          
          image_response = await generateImage(
            text,
            selectedAgentId,
            currentConversation,
            save_user_prompt,
            commands,
            socket?.id,
            n_images,
            size
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
      role: "user",
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
      role: "assistant",
    };

    const allMessages = [...messages, userMessage, typingMessage];

    setMessages(allMessages);
  };

  // Helper function to check if a string is an image URL
  const isImageUrl = (text: string): boolean => {
    if (!text || typeof text !== 'string') return false;
    
    // First, check if this is definitely NOT an image
    // Exclude common non-image URLs like localhost app routes
    if (text.includes('localhost:3000') || 
        text.includes('/chat') || 
        text.includes('/login') || 
        text.includes('/home')) {
      console.log('Excluded URL as non-image:', text);
      return false;
    }
    
    // Check for common prefixes concatenated with URLs and remove them for checking
    const commonPrefixes = ['describe', 'show', 'display', 'generate', 'create'];
    for (const prefix of commonPrefixes) {
      if (text.toLowerCase().startsWith(prefix) && text.includes('http')) {
        // Find the http(s) part
        const httpIndex = text.indexOf('http');
        if (httpIndex > 0) {
          // Extract just the URL part for checking
          const urlPart = text.substring(httpIndex);
          // Recursively check the extracted URL
          return isImageUrl(urlPart);
        }
      }
    }
    
    // Check for common image extensions
    if (text.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return true;
    
    // Check for image hosting services
    if (text.includes("cloudinary.com")) return true;
    if (text.includes("imgur.com")) return true;
    if (text.includes("res.cloudinary.com")) return true;
    if (text.includes("supabase.co/storage")) return true;
    
    // Check for data URLs
    if (text.startsWith("data:image/")) return true;
    
    // Check for blob URLs
    if (text.startsWith("blob:")) return true;
    
    // Try to check if it's a valid URL
    try {
      const parsedUrl = new URL(text);
      // Additional URL validation if needed
      return false; // Default to false unless specifically matched above
    } catch (e) {
      return false;
    }
  };

  // Function to extract image URLs from message text
  const extractImageUrl = (text: string): string | null => {
    if (!text || typeof text !== 'string') return null;
    
    // Only attempt to extract from text that might contain an image
    if (!isImageUrl(text)) return null;
    
    // Split the text by spaces and check each part
    const parts = text.split(/\s+/);
    for (const part of parts) {
      // Check if this part looks like a URL
      if (part.startsWith('http://') || part.startsWith('https://')) {
        // Only return URLs that are definitely images
        if (part.match(/\.(jpeg|jpg|gif|png|webp)$/i) || 
            part.includes('supabase.co/storage') || 
            (part.includes('cloudinary.com') && part.includes('/image/'))) {
          console.log('Found image URL in text:', part);
          return part;
        }
      }
    }
    
    // If no URL with space separation, try to handle "describe[URL]" pattern
    // by looking for http:// or https:// in the text
    const httpIndex = text.indexOf('http://');
    const httpsIndex = text.indexOf('https://');
    const startIndex = httpIndex >= 0 ? httpIndex : httpsIndex;
    
    if (startIndex >= 0) {
      const urlCandidate = text.substring(startIndex);
      // Find the end of URL - space or end of string
      const endIndex = urlCandidate.search(/\s/);
      const extractedUrl = endIndex >= 0 ? urlCandidate.substring(0, endIndex) : urlCandidate;
      
      // Only return URLs that are definitely images
      if (extractedUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || 
          extractedUrl.includes('supabase.co/storage') || 
          (extractedUrl.includes('cloudinary.com') && extractedUrl.includes('/image/'))) {
        console.log('Found concatenated image URL:', extractedUrl);
        return extractedUrl;
      }
    }
    
    return null;
  };

  // Helper function to ensure URL is properly formatted
  const ensureValidImageUrl = (url: string): string => {
    if (!url) return '';
    
    // Trim the URL
    url = url.trim();
    
    try {
      // Try to parse the URL to check if it's valid
      new URL(url);
      
      // If it's a relative URL (starts with /), convert to absolute
      if (url.startsWith('/') && !url.startsWith('//')) {
        return window.location.origin + url;
      }
      
      // For Cloudinary URLs, ensure they use https
      if (url.includes('cloudinary.com') && url.startsWith('http:')) {
        return url.replace('http:', 'https:');
      }
      
      // For other URLs, return as is
      return url;
    } catch (e) {
      console.error('Invalid URL:', url, e);
      return '';
    }
  };
  
  // Helper function to get proper image src with additional verification
  const getProperImageSrc = (url: string): string => {
    const validUrl = ensureValidImageUrl(url);
    if (!validUrl) return '';
    
    // Extra verification step to avoid loading non-image URLs
    if (validUrl.includes('localhost:3000') || 
        validUrl.includes('/chat') || 
        validUrl.match(/\/(login|dashboard|settings|profile)\/?$/i)) {
      console.error('Attempted to load non-image URL as image:', validUrl);
      return ''; // Return empty to prevent loading
    }
    
    // Only load URLs that are very likely to be images
    const likelyImageUrl = 
      validUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || 
      (validUrl.includes('supabase.co/storage') && validUrl.length > 40) ||
      validUrl.includes('cloudinary.com');
    
    if (likelyImageUrl) {
      console.log('Loading image from URL:', validUrl);
      return validUrl;
    }
    
    console.warn('URL might not be an image, not loading:', validUrl);
    return '';
  };

  // Debug: log messages when they change
  useEffect(() => {
    console.log("Current messages:", messages);
  }, [messages]);

  // Add styles to document head
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = imageStyles;
    document.head.appendChild(styleElement);

    // Clean up on component unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
              .filter((message) => {
                // Helper function to check if any property suggests it's a system message
                const hasSystemProperty = (obj: any): boolean => {
                  if (!obj || typeof obj !== 'object') return false;
                  return Object.entries(obj).some(([key, value]) => {
                    if (key === 'role' && value === 'system') return true;
                    if (key === 'ref' && value) return true; // Check for ref property
                    if (typeof value === 'string' && 
                        (value.includes('ImagineAPI') || 
                         value.includes('image generated') || 
                         value.includes('system message'))) return true;
                    return false;
                  });
                };
                
                // More comprehensive filtering
                // Check username and role for system messages
                const isSystemMessage = 
                  message.role === 'system' || 
                  message.username === 'system' ||
                  hasSystemProperty(message) ||
                  (message.text && message.text.includes("ImagineAPI")) ||
                  (message.text && message.text.includes("image generated")) ||
                  (message.text && message.text.includes("action completed")) ||
                  (message.id && message.id.startsWith("system-")) ||
                  (message.conversation_id && typeof message.text === 'object');
                
                console.log(`Message ${message.id}: isSystemMessage=${isSystemMessage}, role=${message.role}, username=${message.username}`);
                return !isSystemMessage;
              })
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
                  {/* Debug log to check if message contains image URL */}
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
                      {(() => {
                        // First try to extract an image URL from the message
                        const extractedImageUrl = extractImageUrl(message.text);
                        
                        // Case 1: Message is purely an image URL
                        if (extractedImageUrl && message.text.trim() === extractedImageUrl) {
                          console.log('Rendering pure image message');
                          return (
                            <div className="message-image-container">
                              <img
                                alt="Shared content" 
                                className="message-image"
                                src={getProperImageSrc(extractedImageUrl)}
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                  const target = e.target as HTMLImageElement;
                                  console.error(`Failed to load image: ${target.src}`, e);
                                  target.onerror = null;
                                  
                                  // Create a parent div for error message
                                  const errorContainer = document.createElement('div');
                                  errorContainer.className = 'p-2 border border-red-300 rounded bg-red-50 mt-2';
                                  
                                  // Create error message with image URL
                                  const errorMsg = document.createElement('p');
                                  errorMsg.className = 'text-red-500 text-sm';
                                  errorMsg.innerHTML = `Failed to load image. <br/>URL: <span class="text-xs break-all">${target.src}</span>`;
                                  
                                  // Try image URL again with different format
                                  const retryLink = document.createElement('a');
                                  retryLink.href = target.src;
                                  retryLink.target = '_blank';
                                  retryLink.className = 'text-blue-500 text-xs block mt-1 hover:underline';
                                  retryLink.innerText = 'Open image in new tab';
                                  
                                  // Add error elements
                                  errorContainer.appendChild(errorMsg);
                                  errorContainer.appendChild(retryLink);
                                  
                                  // Replace image with error message
                                  target.style.display = 'none';
                                  if (target.parentNode) {
                                    target.parentNode.appendChild(errorContainer);
                                  }
                                }}
                                crossOrigin="anonymous"
                              />
                            </div>
                          );
                        }
                        
                        // Case 2: Message contains both text and an image URL
                        else if (extractedImageUrl) {
                          console.log('Rendering mixed text/image message');
                          // Get text parts by replacing the exact image URL with an empty string
                          const textParts = message.text.split(extractedImageUrl);
                          const textContent = textParts.join(' ').trim();
                          
                          return (
                            <div className="message-with-description">
                              {textContent && (
                                <div
                                  className="message-text mb-2"
                                  dangerouslySetInnerHTML={{
                                    __html: formatMessageText(textContent),
                                  }}
                                />
                              )}
                              <div className="message-image-container">
                                <img
                                  alt="Shared content"
                                  className="message-image"
                                  src={getProperImageSrc(extractedImageUrl)}
                                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                    const target = e.target as HTMLImageElement;
                                    console.error(`Failed to load image: ${target.src}`, e);
                                    target.onerror = null;
                                    
                                    // Create a parent div for error message
                                    const errorContainer = document.createElement('div');
                                    errorContainer.className = 'p-2 border border-red-300 rounded bg-red-50 mt-2';
                                    
                                    // Create error message with image URL
                                    const errorMsg = document.createElement('p');
                                    errorMsg.className = 'text-red-500 text-sm';
                                    errorMsg.innerHTML = `Failed to load image. <br/>URL: <span class="text-xs break-all">${target.src}</span>`;
                                    
                                    // Try image URL again with different format
                                    const retryLink = document.createElement('a');
                                    retryLink.href = target.src;
                                    retryLink.target = '_blank';
                                    retryLink.className = 'text-blue-500 text-xs block mt-1 hover:underline';
                                    retryLink.innerText = 'Open image in new tab';
                                    
                                    // Add error elements
                                    errorContainer.appendChild(errorMsg);
                                    errorContainer.appendChild(retryLink);
                                    
                                    // Replace image with error message
                                    target.style.display = 'none';
                                    if (target.parentNode) {
                                      target.parentNode.appendChild(errorContainer);
                                    }
                                  }}
                                  crossOrigin="anonymous"
                                />
                              </div>
                            </div>
                          );
                        }
                        
                        // Case 3: Regular text message with no image
                        else {
                          return (
                            <div
                              className="message-text"
                              dangerouslySetInnerHTML={{
                                __html: formatMessageText(message.text),
                              }}
                            />
                          );
                        }
                      })()}

                      {/* Buttons section */}
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

                      {/* Ideogram buttons section */}
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
                                  // For remix, extract image URL if present
                                  const imageUrl = extractImageUrl(message.text) || message.text;
                                  if (typeof imageUrl === 'string') {
                                    setIdeogramImageUrl(imageUrl);
                                    setIsGeneratingImageDescription(true);
                                    const description = await describeImage(
                                      currentConversation,
                                      imageUrl,
                                      selectedAgent?.id,
                                      true
                                    );

                                    setIsGeneratingImageDescription(false);
                                    setIdeogramInitialPrompt(
                                      description.response
                                    );

                                    setIsPromptModalOpen(true);
                                  }
                                } else if (button == "Upscale") {
                                  createNewMessage();
                                  // For upscale, extract image URL if present
                                  const imageUrl = extractImageUrl(message.text) || message.text;
                                  if (typeof imageUrl === 'string') {
                                    const image_response = await upscaleImage(
                                      currentConversation,
                                      imageUrl,
                                      message.prompt
                                    );

                                    setImageResponse(image_response);
                                  }
                                } else if (button == "Describe") {
                                  // For describe, extract image URL if present
                                  const imageUrl = extractImageUrl(message.text) || message.text;
                                  if (typeof imageUrl === 'string') {
                                    createNewMessage(imageUrl);
                                    const description = await describeImage(
                                      currentConversation,
                                      imageUrl,
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
                                      role: "assistant",
                                    };

                                    messageListener(description_message);
                                  }
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
              {/* Image Preview */}
              {pendingImageUrl && (
                <div className="w-full mb-2 relative">
                  <div className="border rounded-md p-2 flex items-center">
                    <img 
                      src={pendingImageUrl} 
                      alt="Preview" 
                      className="h-16 object-contain mr-2"
                      key={pendingImageUrl}
                      crossOrigin="anonymous"
                    />
                    <div className="flex flex-grow justify-between items-center">
                      <div className="text-sm text-gray-600 overflow-hidden text-ellipsis">
                        Image attached
                      </div>
                      <button 
                        className="text-gray-500 hover:text-gray-700 ml-2"
                        onClick={() => setPendingImageUrl("")}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                  if (e.key === "Enter" && !e.shiftKey && (messageText || pendingImageUrl)) {
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

                {selectedAgent?.type === "image" && selectedAgent?.model === "dall-e" && (
                  <Button
                    className="mt-2"
                    color={promptCommands.length > 0 ? "secondary" : "default"}
                    variant={promptCommands.length > 0 ? "ghost" : "flat"}
                    onPress={() => setIsDalleImageSizeModalOpen(true)}
                  >
                    {translations?.commands || "Commands"}
                  </Button>
                )}
              </div>
            </div>

            <Spacer y={4} />

            <div className="flex gap-2">
              <Button
                fullWidth
                color="secondary"
                isDisabled={conversations.length === 0 || (!messageText && !pendingImageUrl)}
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
