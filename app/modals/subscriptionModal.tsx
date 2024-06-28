"use client"

import Cookie from 'js-cookie';
import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { getSubscriptions, startSubscription } from '../../managers/subscriptionManager';

interface Subscription {
    id: string;
    name: string;
    price_id: string;
    price: number;
}

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                setIsLoading(true);
                const allSubscriptions = await getSubscriptions();
                setSubscriptions(allSubscriptions);
            } catch (error) {
                console.error('Failed to fetch subscriptions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchSubscriptions();
        }
    }, [isOpen]);

    const handleSubscriptionSelect = async () => {
        if (selectedSubscription) {
            setIsLoading(true)
            const url = await startSubscription(Cookie.get('authToken'), selectedSubscription.price_id)
            window.location.href = url;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                <ModalHeader className="modal-header justify-center">
                    <h1 style={{ fontSize: "26px", textAlign: "center" }}>Select Your Subscription Plan</h1>
                </ModalHeader>
                <ModalBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="flex flex-col md:flex-row md:space-x-4 mt-8 mb-8 w-full">
                            {subscriptions.map(sub => (
                                <Card
                                    key={sub.id}
                                    isPressable
                                    isHoverable
                                    onPress={() => setSelectedSubscription(sub)}
                                    className={`w-full md:w-1/3 mb-4 md:mb-0 ${selectedSubscription === sub ? 'border-4 border-purple-500 shadow-lg shadow-purple-500/50' : ''}`}
                                    style={{ height: '200px' }}
                                >
                                    <CardHeader className="flex flex-col items-center justify-center" style={{ height: '100%' }}>
                                        <h2 className="text-3xl">{sub.name}</h2>
                                        <p style={{ color: "#9353D3" }}>$ {sub.price} / month</p>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </ModalBody>
                <ModalFooter className="mt-4 mb-2 justify-center">
                    <Button
                        color="secondary"
                        style={{ color: "white", width: "150px" }}
                        onPress={handleSubscriptionSelect}
                        isDisabled={!selectedSubscription}
                    >
                        Continue
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default SubscriptionModal;
