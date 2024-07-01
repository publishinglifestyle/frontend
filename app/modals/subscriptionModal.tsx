"use client"

import Cookie from 'js-cookie';
import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { getSubscriptions, startSubscription } from '../../managers/subscriptionManager';
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';
import { Switch } from "@nextui-org/switch";

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
    const [isAnnual, setIsAnnual] = useState(true);
    const [language, setLanguage] = useState('');
    const [translations, setTranslations] = useState<Translations | null>(null);

    useEffect(() => {
        const detectLanguage = async () => {
            // Detect browser language
            const browserLanguage = navigator.language;
            setLanguage(browserLanguage);

            // Get translations for the detected language
            const translations = await getTranslations(browserLanguage);
            setTranslations(translations);
        };

        detectLanguage();
    }, []);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                setIsLoading(true);
                const all_subscriptions = await getSubscriptions();
                const filteredSubscriptions = all_subscriptions.filter((subscription: { type: string; }) => subscription.type === 'year');
                setSubscriptions(filteredSubscriptions);
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
                    <h1 style={{ fontSize: "26px", textAlign: "center" }}>{translations?.select_subscription}</h1>
                </ModalHeader>
                <ModalBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className='flex flex-col'>
                            <Switch isSelected={isAnnual} color='secondary' className='mt-8' size='sm' onChange={async () => {
                                setIsLoading(true);
                                let filteredSubscriptions = await getSubscriptions();
                                if (isAnnual) {
                                    filteredSubscriptions = filteredSubscriptions.filter((subscription: { type: string; }) => subscription.type === 'month');
                                    setSubscriptions(filteredSubscriptions);
                                } else {
                                    filteredSubscriptions = filteredSubscriptions.filter((subscription: { type: string; }) => subscription.type === 'year');
                                    setSubscriptions(filteredSubscriptions);
                                }
                                setIsLoading(false);
                                setIsAnnual(!isAnnual)

                            }}>
                                {translations?.save_annually}
                            </Switch>
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
                                            {
                                                isAnnual ? (
                                                    <p style={{ color: "#9353D3" }}>€ {sub.price} / {translations?.yearly}</p>
                                                ) : (
                                                    <p style={{ color: "#9353D3" }}>€ {sub.price} / {translations?.monthly}</p>
                                                )
                                            }
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
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
                        {translations?.next}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default SubscriptionModal;
