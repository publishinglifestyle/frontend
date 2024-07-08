"use client";

import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../auth-context';
import React, { useRef, useCallback, useState, useEffect } from "react";
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { io, Socket } from 'socket.io-client';
import { Spacer } from "@nextui-org/spacer";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { Textarea, Input } from "@nextui-org/input";
import { Table, TableBody, TableHeader, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Select, SelectItem } from '@nextui-org/select';
import { Avatar } from "@nextui-org/avatar";
import SuccessModal from '../modals/successModal';
import { getProfilePic, getUser } from '@/managers/userManager';
import { getAgentsPerLevel, getAgent } from '@/managers/agentsManager';
import { getConversations, createConversation, getConversation, deleteConversation, generateImage, changeName } from '@/managers/conversationsManager';
import { TrashIcon, StopIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';
import ConversationNameModal from '../modals/conversationName';

let GREETING_MESSAGE = "";

interface Agent {
    id: string;
    name: string;
    type: string;
    prompt: string;
    temperature: number;
    level: number;
}

interface Message {
    id: string;
    text: string;
    username: string;
    conversation_id: string;
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

let columns: Column[] = [
    { key: "id", name: "Conversations" }
];

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;
const defaultPic = "./profile.png";
const aiPic = "./ai.png";

export default function ChatPage() {
    const [language, setLanguage] = useState('');
    const [translations, setTranslations] = useState<Translations | null>(null);

    const { isAuthenticated: isAuthenticatedClient } = useAuth();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isUserAtBottomRef = useRef(true); // Define isUserAtBottomRef here

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [messageText, setMessageText] = useState<string>('');
    const [userId, setUserId] = useState('');
    const [profileImage, setProfileImage] = useState(defaultPic);
    const [fullName, setFullName] = useState('Guest');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string>('');
    const [currentConversation, setCurrentConversation] = useState<string>('');
    const [conversations, setConversations] = useState<Array<Conversation>>([]);
    const [nextMessageId, setNextMessageId] = useState(0);
    const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
    const [isConversationNameModalOpen, setIsConversationNameModalOpen] = useState(false);

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
            setAgents(all_agents);

            const all_conversations = await getConversations();
            setConversations(all_conversations);

            if (all_conversations.length > 0) {
                const current_conversation = all_conversations[all_conversations.length - 1];
                setCurrentConversation(current_conversation.id);

                let conversation_messages = [];
                let messageId = 0;

                for (let i = 0; i < current_conversation.context.length; i++) {
                    const textMessage = i === 0 ? GREETING_MESSAGE : current_conversation.context[i].content;
                    const conversation_message: Message = {
                        id: uuidv4(),  // Use uuid for unique keys
                        text: textMessage,
                        username: current_conversation.context[i].role === 'user' ? `${first_name} ${last_name}` : 'Riccardo AI',
                        conversation_id: current_conversation.id
                    };
                    conversation_messages.push(conversation_message);
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

        if (!isAuthenticatedClient) {
            window.location.href = '/';
        } else {
            fetchData();
            if (window.location.href.includes('session_id')) {
                console.log("Session ID found");
                setIsSuccessModalOpen(true);
            }
        }

        socket = io('https://chatbot-books-9d87f0a90bbe.herokuapp.com', {
            //socket = io('http://localhost:8090', {
            query: { user_id }
        });

        const messageListener = (message: { id: string, username: string, text: string, conversation_id: string, title: string, complete: boolean }) => {
            if (!message.complete) {
                setIsGeneratingResponse(true);
                formatMessages(message, 'chat')
            } else {
                setIsGeneratingResponse(false);
            }
        };

        socket.on('message', messageListener);

        return () => {
            socket.off('message', messageListener);
        };
    }, [isAuthenticatedClient]);

    useEffect(() => {
        const chatContainer = chatContainerRef.current;

        const handleScroll = () => {
            if (chatContainer) {
                const scrollTop = chatContainer.scrollTop;
                const scrollHeight = chatContainer.scrollHeight;
                const clientHeight = chatContainer.clientHeight;

                // Check if the user is at the bottom
                isUserAtBottomRef.current = scrollTop + clientHeight >= scrollHeight - 10;
            }
        };

        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (chatContainer) {
                chatContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    useEffect(() => {
        const chatContainer = chatContainerRef.current;

        if (chatContainer && isUserAtBottomRef.current) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    function formatMessages(message: { id: string, username: string, text: string, conversation_id: string, title: string, complete: boolean }, type: string) {
        setMessages((prevMessages) => {
            setCurrentConversation(message.conversation_id);

            if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].username === 'Riccardo AI') {
                prevMessages.pop();
            }

            const existingMessageIndex = prevMessages.findIndex(m => m.id === message.id);

            if (existingMessageIndex !== -1) {
                const updatedMessages = [...prevMessages];
                updatedMessages[existingMessageIndex] = {
                    ...updatedMessages[existingMessageIndex],
                    text: updatedMessages[existingMessageIndex].text + message.text
                };
                return updatedMessages;
            } else {
                if (type == 'chat') {
                    return [...prevMessages, message];
                } else {
                    return [...prevMessages, { ...message, id: uuidv4() }];
                }

            }
        });

        setConversations((prevConversations) => {
            const conversationIndex = prevConversations.findIndex(c => c.id === message.conversation_id);
            if (conversationIndex !== -1) {
                const updatedConversations = [...prevConversations];
                updatedConversations[conversationIndex] = {
                    ...updatedConversations[conversationIndex],
                    name: message.title
                };
                return updatedConversations;
            }
            return prevConversations;
        });
    }

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

    const sendChatMessage = useCallback(async (text = messageText, title: string) => {
        if (text.trim()) {
            const userMessageId = `${Date.now()}`;

            if (socket.disconnected) {
                socket.connect();
            }

            const userMessage = {
                id: userMessageId,
                username: fullName,
                text: title,
            };

            setMessages(prevMessages => [...prevMessages, { ...userMessage, conversation_id: currentConversation }]);

            const typingMessageId = `typing-${Date.now()}`;
            const typingMessage = {
                id: typingMessageId,
                username: 'Riccardo AI',
                text: '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>',
                conversation_id: currentConversation
            };

            setMessages(prevMessages => [...prevMessages, typingMessage]);

            setMessageText('');

            console.log("userId: ", userId);
            let current_agent
            try {
                current_agent = await getAgent(selectedAgentId);
            } catch (error) {
                console.log("Error getting agent: ", error);
            }

            if (current_agent && current_agent.type === 'image') {
                setIsGeneratingResponse(true);
                const image_response = await generateImage(text, selectedAgentId, currentConversation);
                console.log("Image Response: ", image_response);

                const message = { id: image_response.messageId, username: 'Riccardo AI', text: image_response.response, conversation_id: currentConversation, title: image_response.conversation_name, complete: true }
                formatMessages(message, 'image');
                setIsGeneratingResponse(false);
            } else {
                socket.emit('sendMessage', {
                    senderId: userId,
                    message: text,
                    agent_id: selectedAgentId,
                    conversation_id: currentConversation
                });
            }
        }
    }, [messageText, setMessages]);

    function formatMessageText(text: string) {
        const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const newLineFormatted = boldFormatted.replace(/\n/g, '<br>');
        console.log(newLineFormatted);
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
        <div className='flex justify-between gap-2' style={{ height: '100vh' }}>
            <div className='flex flex-col w-1/3'>
                <Button
                    className='mb-4'
                    size='sm'
                    color='secondary'
                    onClick={async () => {
                        setIsLoading(true);
                        await createConversation();
                        window.location.reload();
                    }}
                >
                    {translations?.new_conversation}
                </Button>
                <div style={{ height: '75%', overflowY: 'auto' }}>
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

                                        const conversation = await getConversation(item.id);

                                        let conversation_messages = [];
                                        let messageId = 0;
                                        for (let i = 0; i < conversation.context.length; i++) {
                                            const textMessage = i == 0 ? GREETING_MESSAGE : conversation.context[i].content;
                                            const conversation_message: Message = {
                                                id: i.toString(),
                                                text: textMessage,
                                                username: conversation.context[i].role === 'user' ? fullName : 'Riccardo AI',
                                                conversation_id: item.id
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

            <div className='w-2/3'>
                <Card>
                    <div ref={chatContainerRef} className="overflow-auto" style={{ height: "570px" }}>
                        <CardBody>

                            {messages.map((message) => (
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
                                                <p className="font-semibold">Riccardo AI</p>
                                            )}
                                            {message.username === Cookies.get('user_name') && (
                                                <p className="font-semibold">{fullName}</p>
                                            )}
                                            {message.text.startsWith("http") ? (
                                                <img src={message.text} alt="Received" className="max-w-full h-auto rounded-lg" />
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
                            <div className='flex gap-4'>
                                <Textarea
                                    isDisabled={conversations.length === 0 || isGeneratingResponse}
                                    fullWidth
                                    type='text'
                                    size='sm'
                                    label={translations?.type_message}
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    onKeyDown={async e => {
                                        if (e.key === 'Enter' && !e.shiftKey && messageText) {
                                            e.preventDefault();
                                            sendChatMessage(messageText, messageText);
                                        }
                                    }}
                                />
                                <Select
                                    isDisabled={conversations.length === 0}
                                    className='w-1/3'
                                    size="sm"
                                    label={translations?.type}
                                    placeholder={translations?.select_agent || ""}
                                    onChange={(e) => {
                                        console.log(e.target.value);
                                        setSelectedAgentId(e.target.value);
                                    }}
                                >
                                    {agents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                            {agent.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            <Spacer y={4} />

                            <div className='flex gap-2'>
                                <Button
                                    isDisabled={conversations.length === 0 || !messageText}
                                    fullWidth
                                    color='secondary'
                                    style={{ color: "white" }}
                                    onClick={async () => {
                                        sendChatMessage(messageText, messageText);
                                    }}
                                >
                                    {translations?.send}
                                </Button>
                                <Button
                                    isDisabled={!isGeneratingResponse}
                                    size='sm'
                                    onClick={async () => {
                                        socket.disconnect();
                                        setIsGeneratingResponse(false)
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

            <ConversationNameModal isOpen={isConversationNameModalOpen} onClose={async (new_name) => {
                if (new_name) { // Ensure new_name is not undefined
                    setIsConversationNameModalOpen(false);
                    setIsLoading(true);
                    await changeName(currentConversation, new_name);
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
    );
}
