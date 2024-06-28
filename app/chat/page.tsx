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
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Avatar } from "@nextui-org/avatar";
import SuccessModal from '../modals/successModal';
import { getProfilePic, getUser } from '@/managers/userManager';
import { user } from '@nextui-org/theme';


let socket: Socket<DefaultEventsMap, DefaultEventsMap>
const defaultPic = "./profile.png"
const aiPic = "./ai.png"

export default function ChatPage() {
    const { isAuthenticated: isAuthenticatedClient } = useAuth();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [messages, setMessages] = useState<Array<{ id: string; username: string; text: string, type: string }>>([]);
    const [messageText, setMessageText] = useState<string>('');
    const [userId, setUserId] = useState('')
    const [profileImage, setProfileImage] = useState(defaultPic);
    const [fullName, setFullName] = useState('Guest')

    useEffect(() => {
        let user_id
        async function fetchData() {
            const current_user = await getUser()
            user_id = current_user.id
            setUserId(current_user.id)

            const first_name = current_user.first_name
            const last_name = current_user.last_name
            setFullName(`${first_name} ${last_name}`)

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
            if (window.location.href.includes('session_id')) {
                console.log("Session ID found")
                setIsSuccessModalOpen(true)
            }
        }

        fetchData()

        socket = io('http://localhost:8090', {
            query: { user_id }
        });

        const messageListener = (message: { id: string, username: string, text: string, type: string }) => {
            setMessages((prevMessages) => {
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
                message: text
            });

            // Display the user message immediately
            setMessages(prevMessages => [...prevMessages, userMessage]);

            // Insert a typing indicator
            const typingMessageId = `typing-${Date.now()}`;
            const typingMessage = {
                id: typingMessageId,
                username: 'Riccardo AI',
                text: '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>',
                type: 'chat'
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
        <>
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
                                        />
                                    )}
                                    {message.username !== Cookies.get('user_name') && (
                                        <Avatar
                                            src={aiPic}
                                            className="transition-transform mr-2 mt-2 ml-2"
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
                                            <img src={message.text} alt="Received Image" className="max-w-full h-auto rounded-lg" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                    </CardBody>

                </div>

                <CardFooter>
                    <div className='flex flex-col w-full'>
                        <Input
                            fullWidth
                            type='text'
                            size='sm'
                            label="Type your message..."
                            value={messageText}
                            onChange={e => setMessageText(e.target.value)}
                            onKeyDown={async e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendChatMessage(messageText, messageText)
                                }
                            }}
                        />
                        <Spacer y={4} />

                        <Button
                            fullWidth
                            color='secondary'
                            style={{ color: "white" }}
                            onClick={async () => {
                                sendChatMessage(messageText, messageText)
                            }}
                        >
                            Send
                        </Button>
                    </div>

                </CardFooter>
            </Card>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false)
                    window.history.replaceState({}, document.title, window.location.pathname);
                }}
                message="Your subscription is now active!"
            />
        </>
    )
}