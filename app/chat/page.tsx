"use client"

import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../auth-context';
import React, { useRef, useCallback, useState, useEffect } from "react";
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { io, Socket } from 'socket.io-client';
import { Spacer } from "@nextui-org/spacer"
import { Button } from "@nextui-org/button"
import { Spinner } from "@nextui-org/spinner"
import { Input } from "@nextui-org/input"
import { Table, TableBody, TableHeader, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Select, SelectItem } from '@nextui-org/select';
import { Avatar } from "@nextui-org/avatar";
import SuccessModal from '../modals/successModal';
import { getProfilePic, getUser } from '@/managers/userManager';
import { getAgentsPerLevel } from '@/managers/agentsManager';
import { getConversations, createConversation, getConversation, deleteConversation } from '@/managers/conversationsManager';
import { TrashIcon } from "@heroicons/react/24/outline";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

let GREETING_MESSAGE = ""

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
    type: string;
    conversation_id: string;
}

interface Conversation {
    id: string;
    name: string;
    context: [Context];
}

interface Context {
    user: string;
    system: string;
}

interface Column {
    key: string;
    name: string;
}

let columns: Column[] = [
    { key: "id", name: "Conversations" }
];

let socket: Socket<DefaultEventsMap, DefaultEventsMap>
const defaultPic = "./profile.png"
const aiPic = "./ai.png"

export default function ChatPage() {
    const [language, setLanguage] = useState('');
    const [translations, setTranslations] = useState<Translations | null>(null);

    const { isAuthenticated: isAuthenticatedClient } = useAuth();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [messageText, setMessageText] = useState<string>('');
    const [userId, setUserId] = useState('')
    const [profileImage, setProfileImage] = useState(defaultPic);
    const [fullName, setFullName] = useState('Guest')
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string>('');
    const [currentConversation, setCurrentConversation] = useState<string>('');
    const [conversations, setConversations] = useState<Array<Conversation>>([]);
    const [nextMessageId, setNextMessageId] = useState(0);

    useEffect(() => {
        const detectLanguage = async () => {
            // Detect browser language
            const browserLanguage = navigator.language;
            setLanguage(browserLanguage);

            // Get translations for the detected language
            const translations = await getTranslations(browserLanguage);
            setTranslations(translations);

            columns = [
                { key: "id", name: translations?.conversations || "" }
            ];

            GREETING_MESSAGE = translations?.greeting || ""
        };

        detectLanguage();
    }, []);

    useEffect(() => {
        let user_id
        async function fetchData() {
            const current_user = await getUser()
            user_id = current_user.id
            setUserId(current_user.id)

            const first_name = current_user.first_name
            const last_name = current_user.last_name
            setFullName(`${first_name} ${last_name}`)

            const all_agents = await getAgentsPerLevel(current_user.subscription_level)
            setAgents(all_agents)

            const all_conversations = await getConversations();
            setConversations(all_conversations);

            let current_conversation
            if (all_conversations.length > 0) {
                current_conversation = all_conversations[all_conversations.length - 1]
                setCurrentConversation(current_conversation.id);

                let conversation_messages = [];
                let messageId = 0;
                for (let i = 0; i < current_conversation.context.length; i++) {
                    const conversation_message: Message = {
                        id: i.toString(),
                        text: i > 0 ? current_conversation.context[i].content : GREETING_MESSAGE,
                        username: current_conversation.context[i].role == 'user' ? `${first_name} ${last_name}` : 'Riccardo AI',
                        type: "chat",
                        conversation_id: current_conversation.id
                    };
                    conversation_messages.push(conversation_message);
                }
                setMessages(conversation_messages.map((message) => ({ ...message, type: 'chat' })));
                setNextMessageId(messageId);
            }

            Cookies.set('user_name', `${first_name} ${last_name}`)

            try {
                const logo_img = await getProfilePic()
                if (logo_img) {
                    setProfileImage(logo_img)
                } else {
                    setProfileImage(defaultPic)
                }
            } catch {
                setProfileImage(defaultPic)
            }
        }

        if (!isAuthenticatedClient) {
            window.location.href = '/';
        } else {
            fetchData()
            if (window.location.href.includes('session_id')) {
                console.log("Session ID found")
                setIsSuccessModalOpen(true)
            }
        }

        socket = io('http://localhost:8090', {
            query: { user_id }
        });

        const messageListener = (message: { id: string, username: string, text: string, type: string, conversation_id: string, title: string }) => {
            setMessages((prevMessages) => {
                console.log("message.title", message.title)
                setCurrentConversation(message.conversation_id)

                // Check if the last message is from the AI
                if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].username === 'Riccardo AI') {
                    // Remove the last message
                    prevMessages.pop();
                }

                const existingMessageIndex = prevMessages.findIndex(m => m.id === message.id);

                if (existingMessageIndex !== -1) {
                    // If we find an existing message with the same ID, append the new text
                    const updatedMessages = [...prevMessages];
                    updatedMessages[existingMessageIndex] = {
                        ...updatedMessages[existingMessageIndex],
                        text: updatedMessages[existingMessageIndex].text + message.text
                    };
                    return updatedMessages;
                } else {
                    // If no existing message, add a new entry
                    return [...prevMessages, message];
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
        };

        socket.on('message', messageListener);

        // Cleanup this component is unmounted or messages change
        return () => {
            socket.off('message', messageListener);
        };
    }, [isAuthenticatedClient]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const renderCell = (item: Conversation, columnKey: keyof Conversation) => {
        if (columnKey === "id") {
            return (
                <div className="flex justify-between">
                    <div className='flex justify-start'>
                        {item.name ? <span>{item.name}</span> : <span>{item.id}</span>}
                    </div>
                    <div className='flex justify-end'>
                        <Button
                            variant='light'
                            color="danger"
                            onClick={async () => {
                                setIsLoading(true);
                                await deleteConversation(item.id);
                                window.location.reload();
                            }}
                        >
                            <TrashIcon width={15} />
                        </Button>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    };

    const sendChatMessage = useCallback((text = messageText, title: string) => {
        if (text.trim()) {
            const userMessageId = `${Date.now()}`;

            const userMessage = {
                id: userMessageId,
                username: fullName,
                text: title,
                type: 'chat'
            };

            console.log("userId: ", userId)

            // Emit the user message to the server
            socket.emit('sendMessage', {
                senderId: userId,
                message: text,
                agent_id: selectedAgentId,
                conversation_id: currentConversation
            });

            // Display the user message immediately
            setMessages(prevMessages => [...prevMessages, { ...userMessage, conversation_id: currentConversation }]);

            // Insert a typing indicator
            const typingMessageId = `typing-${Date.now()}`;
            const typingMessage = {
                id: typingMessageId,
                username: 'Riccardo AI',
                text: '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>',
                type: 'chat',
                conversation_id: currentConversation
            };

            setMessages(prevMessages => [...prevMessages, typingMessage]);

            // Clear the input field
            setMessageText('');
        }
    }, [messageText, setMessages]);

    function formatMessageText(text: string) {
        // Replace markdown bold "**text**" with HTML "<strong>text</strong>"
        const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Preserve new line characters by converting them into <br> HTML tags
        const newLineFormatted = boldFormatted.replace(/\n/g, '<br>');

        console.log(newLineFormatted);
        return newLineFormatted;
    }

    if (isLoading) {
        return (
            <div className='text-center align-center items-center justify-center' style={{ marginTop: "15%" }}>
                <Spinner color='secondary' />
            </div>
        )
    }

    return (
        <div className='flex justify-between gap-2' style={{ height: '100vh' }}>
            <div className='flex flex-col w-1/4'>
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
                                            const conversation_message: Message = {
                                                id: i.toString(),
                                                text: conversation.context[i].content,
                                                username: conversation.context[i].role == 'user' ? fullName : 'Riccardo AI',
                                                type: "chat",
                                                conversation_id: item.id
                                            };
                                            conversation_messages.push(conversation_message);
                                        }
                                        setMessages(conversation_messages.map((message) => ({ ...message, type: 'chat' })));
                                        setNextMessageId(messageId);

                                        setIsLoading(false)
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

            <div className='w-3/4'>
                <Card>
                    <div ref={chatContainerRef} className="overflow-auto" style={{ height: "570px" }}>
                        <CardBody>
                            {messages.map((message) => (
                                <div key={message.id} className={`mt-4 message flex ${message.username === Cookies.get('user_name') ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className="flex items-start rounded-lg"
                                        style={{ backgroundColor: message.username === Cookies.get('user_name') ? '#9353D3' : 'lightgray' }}
                                    >
                                        {message.username === Cookies.get('user_name') && (
                                            <Avatar
                                                src={profileImage}
                                                className="transition-transform mr-2 mt-2 ml-2"
                                                alt='Profile Picture'
                                            />
                                        )}
                                        {message.username !== Cookies.get('user_name') && (
                                            <Avatar
                                                src={aiPic}
                                                className="transition-transform mr-2 mt-2 ml-2"
                                                alt='Profile Picture'
                                            />
                                        )}
                                        <div
                                            className={`text-small max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg`}
                                            style={{ backgroundColor: message.username === Cookies.get('user_name') ? '#9353D3' : 'lightgray', color: message.username === Cookies.get('user_name') ? 'white' : 'black' }}
                                        >
                                            {message.username !== Cookies.get('user_name') && (
                                                <p className="font-semibold">Riccardo AI</p>
                                            )}
                                            {message.username == Cookies.get('user_name') && (
                                                <p className="font-semibold">{fullName}</p>
                                            )}
                                            {message.type === 'chat' ? (
                                                <div dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }} />
                                            ) : (
                                                <img src={message.text} alt="Received" className="max-w-full h-auto rounded-lg" />
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
                                <Input
                                    isDisabled={conversations.length === 0}
                                    fullWidth
                                    type='text'
                                    size='sm'
                                    label={translations?.type_message}
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    onKeyDown={async e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendChatMessage(messageText, messageText)
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
                                        console.log(e.target.value)
                                        setSelectedAgentId(e.target.value)
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

                            <Button
                                isDisabled={conversations.length === 0}
                                fullWidth
                                color='secondary'
                                style={{ color: "white" }}
                                onClick={async () => {
                                    sendChatMessage(messageText, messageText)
                                }}
                            >
                                {translations?.send}
                            </Button>
                        </div>

                    </CardFooter>
                </Card>
            </div>


            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false)
                    window.history.replaceState({}, document.title, window.location.pathname);
                }}
                message={translations?.subscription_is_active || ""}
            />
        </div>
    )
}