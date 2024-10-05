"use client";

import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../auth-context';
import React, { useRef, useCallback, useState, useEffect } from "react";
import { io, Socket } from 'socket.io-client';
import { Spacer } from "@nextui-org/spacer";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { Textarea } from "@nextui-org/input";
import { Table, TableBody, TableHeader, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Select, SelectItem } from '@nextui-org/select';
import { Avatar } from "@nextui-org/avatar";
import { getProfilePic, getUser } from '@/managers/userManager';
import { getAgentsPerLevel, getAgent } from '@/managers/agentsManager';
import { getConversations, createConversation, getConversation, deleteConversation, generateImage, remixImage, upscaleImage, describeImage, saveMjImage, sendAction, changeName, uploadImage } from '@/managers/conversationsManager';
import { TrashIcon, StopIcon, PencilSquareIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';
import ConversationNameModal from '../modals/conversationName';
import ImageModal from '../modals/imageModal';
import SuccessModal from '../modals/successModal';
import ErrorModal from '../modals/errorModal';
import CommandsModal from '../modals/commandsModal';
import PromptModal from '../modals/promptModal';
import IdeogramModal from '../modals/ideogramModal';

let GREETING_MESSAGE = "";

interface Agent {
    id: string;
    name: string;
    type: string;
    prompt: string;
    temperature: number;
    level: number;
    n_buttons: number;
    buttons: Button[];
    model: string;
}

interface Button {
    id: string;
    name: string;
    prompt: string;
}

interface Option {
    custom: string;
    label: string;
}

interface Message {
    id: string;
    text: string;
    username: string;
    conversation_id: string;
    complete: boolean;
    title: string;
    buttons: Option[];
    ideogram_buttons: string[];
    messageId: string;
    flags: number;
    prompt: string;
}

interface Conversation {
    id: string;
    name: string;
    context: Context[];
}

interface Context {
    role: string;
    content: string;
}

interface Column {
    key: string;
    name: string;
}

interface Command {
    command: string;
    value: string;
}

let columns: Column[] = [
    { key: "id", name: "Conversations" }
];

let socket: Socket | null = null;
const defaultPic = "./profile.png";
const aiPic = "./ai.png";

export default function ChatPage() {
    const pageLoadedRef = useRef(false);
    const [language, setLanguage] = useState('');
    const [translations, setTranslations] = useState<Translations | null>(null);

    const { isAuthenticated: isAuthenticatedClient } = useAuth();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [isCommandsModalOpen, setIsCommandsModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [messageText, setMessageText] = useState<string>('');
    const [userId, setUserId] = useState('');
    const [profileImage, setProfileImage] = useState(defaultPic);
    const [fullName, setFullName] = useState('Guest');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string>('');
    const [selectedAgent, setSelectedAgent] = useState<Agent>();
    const [currentConversation, setCurrentConversation] = useState<string>('');
    const [conversations, setConversations] = useState<Array<Conversation>>([]);
    const [nextMessageId, setNextMessageId] = useState(0);
    const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
    const [isConversationNameModalOpen, setIsConversationNameModalOpen] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [promptCommands, setPromptCommands] = useState<Command[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [isIdeogramModalOpen, setIsIdeogramModalOpen] = useState(false);
    const [ideogramInitialPrompt, setIdeogramInitialPrompt] = useState('');
    const [ideogramImageUrl, setIdeogramImageUrl] = useState('');

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
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
        console.log("Received message:", message);

        setMessages((prevMessages) => {
            const existingMessageIndex = prevMessages.findIndex(
                (m) => m.id === message.id
            );

            const updatedMessages = prevMessages.filter(m => !m?.id?.startsWith('typing-'));

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
            setConversations(prevConversations =>
                prevConversations.map(conversation =>
                    conversation.id === message.conversation_id
                        ? { ...conversation, name: message.title }
                        : conversation
                )
            );
        }
    };

    function setImageResponse(image_response: any) {
        if (image_response.error || (image_response && image_response.image_ready)) {
            const message = {
                id: image_response.messageId,
                username: 'LowContent AI',
                text: image_response.response,
                conversation_id: currentConversation,
                title: image_response.conversation_name,
                complete: true,
                buttons: [],
                ideogram_buttons: image_response.ideogram_buttons || [],
                messageId: "",
                flags: 0,
                prompt: image_response.prompt || ""
            };

            setMessages((prevMessages) => {
                const existingMessageIndex = prevMessages.findIndex((m) => m.id === message.id);
                const updatedMessages = prevMessages.filter(m => !m?.id?.startsWith('typing-'));

                if (existingMessageIndex !== -1) {
                    updatedMessages[existingMessageIndex] = {
                        ...updatedMessages[existingMessageIndex],
                        text: updatedMessages[existingMessageIndex].text + message.text,
                        id: message.id
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

    const sendChatMessage = useCallback(async (text = messageText, isButtonPressed: boolean, midjourneyMessageId: string, save_user_prompt: boolean, commands = promptCommands, flags: number, customId: string) => {
        if (text.trim()) {
            const userMessageId = `${Date.now()}`;

            if (!isSocketConnected) {
                console.log("Socket disconnected, attempting to reconnect...");
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

            setIsGeneratingResponse(true);

            console.log("userId: ", userId);
            let current_agent;
            try {
                current_agent = await getAgent(selectedAgentId);
            } catch (error) {
                console.log("Error getting agent: ", error);
            }

            if ((current_agent && current_agent.type === 'image') || isButtonPressed) {
                setIsGeneratingResponse(true);
                let image_response: any = "";

                if (isButtonPressed) {
                    image_response = await sendAction(currentConversation, midjourneyMessageId, customId, text, promptCommands, flags, socket?.id);
                    console.log("Button pressed response: ", image_response);

                } else {
                    console.log("Conversation", currentConversation);
                    setMessageText('');
                    image_response = await generateImage(text, selectedAgentId, currentConversation, save_user_prompt, commands, socket?.id);
                    setPromptCommands([]);
                }

                setImageResponse(image_response);

            } else {
                console.log("Sending message to server:", {
                    senderId: userId,
                    message: text,
                    agent_id: selectedAgentId,
                    conversation_id: currentConversation
                });
                socket?.emit('sendMessage', {
                    senderId: userId,
                    message: text,
                    agent_id: selectedAgentId,
                    conversation_id: currentConversation
                });

                setMessageText('');
            }

        }
    }, [messageText, setMessages, socket, currentConversation, selectedAgentId, userId, fullName, isSocketConnected, isReconnecting]);

    useEffect(() => {
        if (isGeneratingResponse) {
            const userMessageId = `${Date.now()}`;
            const userMessage = {
                id: userMessageId,
                username: fullName,
                text: messageText,
                conversation_id: currentConversation,
                complete: true,
                title: "",
                buttons: [],
                ideogram_buttons: [],
                messageId: "",
                flags: 0,
                prompt: ""
            };

            setMessages(prevMessages => [...prevMessages, userMessage]);

            const typingMessageId = `typing-${Date.now()}`;
            const typingMessage = {
                id: typingMessageId,
                username: 'LowContent AI',
                text: '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>',
                conversation_id: currentConversation,
                complete: false,
                title: "",
                buttons: [],
                ideogram_buttons: [],
                messageId: "",
                flags: 0,
                prompt: ""
            };

            setMessages(prevMessages => [...prevMessages, typingMessage]);
        }
    }, [isGeneratingResponse]);

    useEffect(() => {
        if (isAuthenticatedClient && !socket) {
            console.log('Initializing socket connection...');
            socket = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8090', {
                query: { user_id: userId },
                reconnection: false,
            });

            socket.on('connect', () => {
                console.log('Socket connected:', socket?.id);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                socket?.connect();
            });

            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            // Ensure only one messageListener is attached
            if (!socket.hasListeners('message')) {
                socket.on('message', messageListener);
            }

            // Listen for the midjourneyCallback event
            socket.on('midjourneyCallback', async (response) => {
                console.log("Received midjourney callback:", response);

                const message = {
                    id: uuidv4(),
                    username: 'LowContent AI',
                    text: response.result.url,
                    conversation_id: response.conversation_id,
                    complete: true,
                    buttons: response.result.options || [],
                    ideogram_buttons: [],
                    messageId: response.result.message_id,
                    flags: response.result.flags,
                    prompt: response.result.prompt
                };

                // Store conversation context
                await saveMjImage(response.result.prompt, response.result.message_id, response.conversation_id, true, response.result.url, response.result.options, response.result.flags, selectedAgent?.id);

                setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.filter(m => !m?.id?.startsWith('typing-'));

                    // Ensure the new message conforms to the Message type
                    return [
                        ...updatedMessages,
                        {
                            ...message,
                            title: '',
                        }
                    ];
                });

                setIsGeneratingResponse(false); // Stop the loading bubble
            });

            return () => {
                if (socket) {
                    socket.off('connect');
                    socket.off('disconnect');
                    socket.off('connect_error');
                    socket.off('message', messageListener);
                    socket.off('midjourneyCallback');
                    socket.close();
                    socket = null;
                }
            };
        } else if (!isAuthenticatedClient) {
            window.location.href = '/';
        }
    }, [isAuthenticatedClient, userId]);


    useEffect(() => {
        const detectLanguage = async () => {
            const browserLanguage = navigator.language;
            setLanguage(browserLanguage);

            const translations = await getTranslations(browserLanguage);
            setTranslations(translations);

            columns = [
                { key: "id", name: translations?.conversations || "" }
            ];

            GREETING_MESSAGE = translations?.greeting || "";
        };

        detectLanguage();
    }, []);

    useEffect(() => {
        let user_id;

        async function fetchData() {
            const current_user = await getUser();
            user_id = current_user.id;
            setUserId(current_user.id);

            const first_name = current_user.first_name;
            const last_name = current_user.last_name;
            setFullName(`${first_name} ${last_name}`);

            const all_agents = await getAgentsPerLevel();
            if (all_agents) {
                setAgents(all_agents);

                const all_conversations = await getConversations();
                console.log(all_conversations);
                setConversations(all_conversations);

                if (all_conversations.length > 0) {
                    const current_conversation = all_conversations[0];
                    setCurrentConversation(current_conversation.id);
                    const current_agent = all_agents.find((agent: any) => agent.id === current_conversation.agent_id);
                    setSelectedAgent(current_agent);
                    setSelectedAgentId(current_conversation.agent_id);

                    let conversation_messages = [];
                    let messageId = 0;

                    for (let i = 0; i < current_conversation.context.length; i++) {
                        const textMessage = i === 0 ? GREETING_MESSAGE : current_conversation.context[i].content;
                        if (textMessage && textMessage !== "NaN") {
                            const conversation_message: Message = {
                                id: uuidv4(),
                                text: textMessage,
                                username: current_conversation.context[i].role === 'user' ? `${first_name} ${last_name}` : 'LowContent AI',
                                conversation_id: current_conversation.id,
                                complete: false,
                                title: "",
                                buttons: current_conversation.context[i].buttons,
                                ideogram_buttons: current_conversation.context[i].ideogram_buttons,
                                messageId: current_conversation.context[i].messageId,
                                flags: current_conversation.context[i].flags,
                                prompt: current_conversation.context[i].prompt
                            };
                            conversation_messages.push(conversation_message);
                        }
                    }

                    setMessages(conversation_messages.map((message) => ({ ...message })));
                    setNextMessageId(messageId);
                }

                Cookies.set('user_name', `${first_name} ${last_name}`);

                try {
                    const logo_img = await getProfilePic();
                    if (logo_img) {
                        setProfileImage(logo_img);
                    } else {
                        setProfileImage(defaultPic);
                    }
                } catch {
                    setProfileImage(defaultPic);
                }
            }

        }

        if (!isAuthenticatedClient) {
            window.location.href = '/';
        } else {
            if (!pageLoadedRef.current) {
                pageLoadedRef.current = true; // Mark the ref as loaded
                fetchData();
            }

            if (window.location.href.includes('session_id')) {
                console.log("Session ID found");
                setIsSuccessModalOpen(true);
            }
        }
    }, [isAuthenticatedClient]);

    const renderCell = (item: Conversation, columnKey: keyof Conversation) => {
        if (columnKey === "id") {
            return (
                <div className="flex justify-between items-center">
                    <div className='flex-1'>
                        <span>{item.name}</span>
                    </div>
                    <div className='flex'>
                        <Button
                            variant='light'
                            color="danger"
                            onClick={async (e) => {
                                e.stopPropagation(); // Prevent row click
                                setIsLoading(true);
                                await deleteConversation(item.id);
                                window.location.reload();
                            }}
                        >
                            <TrashIcon width={15} />
                        </Button>
                        <Button
                            variant='light'
                            color="secondary"
                            className='-ml-8'
                            onClick={(e) => {
                                setIsConversationNameModalOpen(true);
                            }}
                        >
                            <PencilSquareIcon width={15} />
                        </Button>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    };

    function formatMessageText(text: string) {
        const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const newLineFormatted = boldFormatted.replace(/\n/g, '<br>');
        return newLineFormatted;
    }

    if (isLoading) {
        return (
            <div className='text-center align-center items-center justify-center' style={{ marginTop: "15%" }}>
                <Spinner color='secondary' />
            </div>
        );
    }

    return (
        <div className='flex flex-col text-center'>
            <h1 className="text-4xl font-bold text-center">Chat with Low Content AI</h1>
            <h2 className="text-lg font-semibold text-center mb-4">
                Start a Conversation and Create Low-Content Books with AI
            </h2>


            <div className='flex flex-col md:flex-row justify-between gap-2'>
                <div className='flex flex-col md:w-1/4' style={{ height: '750px' }}>
                    <Button
                        isDisabled={!agents || agents.length === 0}
                        className='mb-4'
                        size='sm'
                        color='secondary'
                        onClick={async () => {
                            setIsLoading(true);
                            const newConversation = await createConversation();
                            console.log("New Conversation: ", newConversation);
                            setConversations(prevConversations => [...prevConversations, newConversation]);
                            setCurrentConversation(newConversation.id);
                            setSelectedAgentId('');
                            setSelectedAgent(undefined);

                            // Fetch and display messages for the new conversation
                            const conversation = await getConversation(newConversation.id);
                            let conversation_messages = [];
                            let messageId = 0;
                            for (let i = 0; i < conversation.context.length; i++) {
                                const textMessage = i === 0 ? GREETING_MESSAGE : conversation.context[i].content;
                                const conversation_message: Message = {
                                    id: i.toString(),
                                    text: textMessage,
                                    username: conversation.context[i].role === 'user' ? fullName : 'LowContent AI',
                                    conversation_id: newConversation.id,
                                    complete: false,
                                    title: "",
                                    buttons: conversation.context[i].buttons,
                                    ideogram_buttons: conversation.context[i].ideogram_buttons,
                                    messageId: conversation.context[i].messageId,
                                    flags: conversation.context[i].flags,
                                    prompt: conversation.context[i].prompt
                                };
                                conversation_messages.push(conversation_message);
                            }
                            setMessages(conversation_messages.map((message) => ({ ...message })));
                            setNextMessageId(messageId);
                            setIsLoading(false);
                        }}
                    >
                        {translations?.new_conversation}
                    </Button>

                    {/* Updated container to handle scrolling */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <Table
                            aria-label={translations?.conversations || ""}
                            selectionMode="single"
                            selectedKeys={[currentConversation]}
                        >
                            <TableHeader columns={columns}>
                                {(column: Column) => (
                                    <TableColumn key={column.key}>
                                        {column.name}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={conversations}>
                                {(item: Conversation) => (
                                    <TableRow
                                        key={item.id.toString()}
                                        onClick={async () => {
                                            setIsLoading(true);
                                            setCurrentConversation(item.id);
                                            setSelectedAgentId('');
                                            setSelectedAgent(undefined);

                                            const conversation = await getConversation(item.id);

                                            let conversation_messages = [];
                                            let messageId = 0;
                                            for (let i = 0; i < conversation.context.length; i++) {
                                                const textMessage = i == 0 ? GREETING_MESSAGE : conversation.context[i].content;
                                                const conversation_message: Message = {
                                                    id: i.toString(),
                                                    text: textMessage,
                                                    username: conversation.context[i].role === 'user' ? fullName : 'LowContent AI',
                                                    conversation_id: item.id,
                                                    complete: false,
                                                    title: "",
                                                    buttons: conversation.context[i].buttons,
                                                    ideogram_buttons: conversation.context[i].ideogram_buttons,
                                                    messageId: conversation.context[i].messageId,
                                                    flags: conversation.context[i].flags,
                                                    prompt: conversation.context[i].prompt
                                                };
                                                conversation_messages.push(conversation_message);
                                            }
                                            setMessages(conversation_messages.map((message) => ({ ...message })));
                                            setNextMessageId(messageId);

                                            setIsLoading(false);
                                        }}
                                    >
                                        {columns.map((column) => (
                                            <TableCell key={column.key}>{renderCell(item, column.key as keyof Conversation)}</TableCell>
                                        ))}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>


                <div className='md:w-3/4'>
                    <Card>
                        <div ref={chatContainerRef} className="overflow-auto" style={{ height: "570px" }}>
                            <CardBody>

                                {messages.filter(message => message.text && message.text !== "NaN").map((message) => (
                                    <div key={message.id} className={`mt-4 message flex ${message.username === Cookies.get('user_name') ? 'justify-end' : 'justify-start'}`}>
                                        <div className="flex items-start rounded-lg" style={{ backgroundColor: message.username === Cookies.get('user_name') ? '#9353D3' : 'lightgray' }}>
                                            {message.username === Cookies.get('user_name') && (
                                                <Avatar src={profileImage} className="transition-transform mr-2 mt-2 ml-2" alt='Profile Picture' />
                                            )}
                                            {message.username !== Cookies.get('user_name') && (
                                                <Avatar src={aiPic} className="transition-transform mr-2 mt-2 ml-2" alt='Profile Picture' />
                                            )}
                                            <div className={`text-small max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg`} style={{ backgroundColor: message.username === Cookies.get('user_name') ? '#9353D3' : 'lightgray', color: message.username === Cookies.get('user_name') ? 'white' : 'black' }}>
                                                {message.username !== Cookies.get('user_name') && (
                                                    <p className="font-semibold">LowContent AI</p>
                                                )}
                                                {message.username === Cookies.get('user_name') && (
                                                    <p className="font-semibold">{fullName}</p>
                                                )}
                                                {message.text.startsWith("http") ? (
                                                    <>
                                                        <img src={message.text} alt="Received" className="max-w-full h-auto rounded-lg" />
                                                        {message.buttons?.length > 0 && (
                                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
                                                                {message.buttons.map((button, index) => (
                                                                    <Button
                                                                        size="sm"
                                                                        key={index}
                                                                        color="secondary"
                                                                        className="w-full"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            sendChatMessage(button.label, true, message.messageId, true, promptCommands, message.flags, button.custom);
                                                                        }}
                                                                    >
                                                                        <span style={{ fontSize: "8px" }}>{button.label}</span>
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {message.ideogram_buttons?.length > 0 && (
                                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
                                                                {message.ideogram_buttons.map((button, index) => (
                                                                    <Button
                                                                        size="sm"
                                                                        key={index}
                                                                        color="secondary"
                                                                        className="w-full"
                                                                        onClick={async (e) => {
                                                                            e.preventDefault();

                                                                            if (button == 'Remix') {
                                                                                setIdeogramInitialPrompt(message.prompt);
                                                                                setIdeogramImageUrl(message.text);
                                                                                setIsPromptModalOpen(true);
                                                                            } else if (button == 'Upscale') {
                                                                                setIsGeneratingResponse(true);
                                                                                const image_response = upscaleImage(currentConversation, message.text, message.prompt);
                                                                                setImageResponse(image_response);
                                                                            } else if (button == 'Describe') {
                                                                                setIsGeneratingResponse(true);
                                                                                const description = await describeImage(currentConversation, message.text, selectedAgent?.id);
                                                                                const description_message = {
                                                                                    id: uuidv4(),
                                                                                    username: 'LowContent AI',
                                                                                    text: description.response,
                                                                                    conversation_id: currentConversation,
                                                                                    complete: true,
                                                                                    title: "",
                                                                                    buttons: [],
                                                                                    ideogram_buttons: [],
                                                                                    messageId: "",
                                                                                    flags: 0,
                                                                                    prompt: ""
                                                                                };
                                                                                messageListener(description_message);
                                                                            }

                                                                        }}
                                                                    >
                                                                        <span style={{ fontSize: "8px" }}>{button}</span>
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }} />
                                                )}


                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </CardBody>
                        </div>

                        <CardFooter>
                            <div className='flex flex-col w-full'>
                                <div className='flex gap-2'>
                                    {selectedAgent?.buttons?.map((agent_button) => (
                                        <Button
                                            key={agent_button.id}
                                            variant='ghost'
                                            size="sm"
                                            color="secondary"
                                            className='mb-8'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                sendChatMessage(agent_button.prompt, false, '', false, promptCommands, 0, '');
                                            }}
                                        >
                                            {agent_button.name}
                                        </Button>
                                    ))}
                                </div>

                                <div className='flex gap-4 md:flex-row flex-col'>
                                    <Textarea
                                        isDisabled={
                                            (conversations.length === 0 || isGeneratingResponse)
                                            ||
                                            (selectedAgent?.buttons && selectedAgent?.buttons?.length > 0)
                                        }
                                        fullWidth
                                        type='text'
                                        size='sm'
                                        label={translations?.type_message}
                                        value={messageText}
                                        onChange={e => setMessageText(e.target.value)}
                                        onKeyDown={async e => {
                                            if (e.key === 'Enter' && !e.shiftKey && messageText) {
                                                e.preventDefault();
                                                sendChatMessage(messageText, false, '', true, promptCommands, 0, '');
                                            }
                                        }}
                                    />
                                    <div className='flex flex-col md:w-1/3'>
                                        <Select
                                            isDisabled={conversations.length === 0}
                                            //className='md:w-1/3 '
                                            size="sm"
                                            label={translations?.type}
                                            placeholder={translations?.select_agent || ""}
                                            selectedKeys={[selectedAgentId]}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setSelectedAgentId(e.target.value);
                                                const s_agent = agents.find(agent => agent.id === e.target.value);
                                                setSelectedAgent(s_agent);
                                            }}
                                        >
                                            {agents.map((agent) => (
                                                <SelectItem key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        {
                                            selectedAgent?.model == 'midjourney' &&
                                            <Button
                                                variant={promptCommands.length > 0 ? 'ghost' : 'flat'}
                                                color={promptCommands.length > 0 ? 'secondary' : 'default'}
                                                className='mt-2'
                                                onClick={() => setIsCommandsModalOpen(true)}
                                            >
                                                {translations?.commands}
                                            </Button>
                                        }

                                        {
                                            selectedAgent?.model == 'ideogram' &&
                                            <Button
                                                variant={promptCommands.length > 0 ? 'ghost' : 'flat'}
                                                color={promptCommands.length > 0 ? 'secondary' : 'default'}
                                                className='mt-2'
                                                onClick={() => setIsIdeogramModalOpen(true)}
                                            >
                                                {translations?.commands}
                                            </Button>
                                        }

                                    </div>

                                </div>

                                <Spacer y={4} />

                                <div className='flex gap-2'>
                                    <Button
                                        isDisabled={conversations.length === 0 || !messageText}
                                        fullWidth
                                        color='secondary'
                                        style={{ color: "white" }}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            sendChatMessage(messageText, false, '', true, promptCommands, 0, '');
                                        }}
                                    >
                                        {translations?.send}
                                    </Button>
                                    <Button size='sm' onClick={handleIconClick}>
                                        <PaperClipIcon width={20} height={20} />
                                    </Button>
                                    <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
                                    <Button
                                        isDisabled={!isGeneratingResponse}
                                        size='sm'
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

                <SuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => {
                        setIsSuccessModalOpen(false);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }}
                    message={translations?.subscription_is_active || ""}
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
                    onSuccess={async (selectedTab, styleType, aspectRatio, negativePrompt, remixPrompt, uploadedImageUrl) => {
                        console.log(styleType, aspectRatio, negativePrompt);
                        const selected_commands = [
                            { command: 'styleType', value: styleType },
                            { command: 'aspectRatio', value: aspectRatio },
                            { command: 'negativePrompt', value: negativePrompt }
                        ];
                        setPromptCommands(selected_commands);
                        setIsIdeogramModalOpen(false);

                        if (selectedTab == 'remix') {
                            setIsGeneratingResponse(true);
                            setMessageText(remixPrompt);
                            const image_response = await remixImage(currentConversation, remixPrompt, uploadedImageUrl, promptCommands, selectedAgent?.id);
                            setPromptCommands([]);
                            setImageResponse(image_response);

                        } else if (selectedTab == 'describe') {
                            setIsGeneratingResponse(true);
                            const description = await describeImage(currentConversation, uploadedImageUrl, selectedAgent?.id);
                            const description_message = {
                                id: uuidv4(),
                                username: 'LowContent AI',
                                text: description.response,
                                conversation_id: currentConversation,
                                complete: true,
                                title: "",
                                buttons: [],
                                ideogram_buttons: [],
                                messageId: "",
                                flags: 0,
                                prompt: ""
                            };
                            messageListener(description_message);
                        }
                    }}
                />

                <ErrorModal
                    isOpen={isErrorModalOpen}
                    onClose={() => setIsErrorModalOpen(false)}
                    message={errorMessage}
                />

                <ImageModal
                    imageUrl={uploadedImageUrl}
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                />

                <PromptModal
                    isOpen={isPromptModalOpen}
                    initialPrompt={ideogramInitialPrompt}
                    onClose={() => setIsPromptModalOpen(false)}
                    onSuccess={async (prompt) => {
                        setIsPromptModalOpen(false);
                        setIsGeneratingResponse(true);

                        setMessageText(prompt);
                        const image_response = await remixImage(currentConversation, prompt, ideogramImageUrl, promptCommands, selectedAgent?.id);
                        setPromptCommands([]);
                        setImageResponse(image_response);
                    }}
                />

                <ConversationNameModal isOpen={isConversationNameModalOpen} onClose={async (new_name) => {
                    if (new_name) { // Ensure new_name is not undefined
                        setIsConversationNameModalOpen(false);
                        setIsLoading(true);
                        await changeName(currentConversation, new_name, selectedAgent?.id);
                        setIsLoading(false);
                        setConversations(conversations.map((conversation) => {
                            if (conversation.id === currentConversation) {
                                return {
                                    ...conversation,
                                    name: new_name as string
                                };
                            }
                            return conversation;
                        }));
                    } else {
                        setIsConversationNameModalOpen(false);
                    }
                }} />
            </div>
        </div>
    );
}
