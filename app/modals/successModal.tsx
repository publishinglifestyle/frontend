"use client"

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, message }) => {
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                <ModalHeader className="modal-header justify-center">
                    <h1 style={{ fontSize: "26px", textAlign: "center", justifyContent: "center" }}>{translations?.success}</h1>
                </ModalHeader>
                <ModalBody style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CheckCircleIcon style={{ width: "30%", color: "#9353D3" }} />
                    <p className="text-center ml-4">
                        {message}
                    </p>
                </ModalBody>
                <ModalFooter className="mt-4 mb-2 justify-center">
                    <Button
                        color="secondary"
                        style={{ color: "white", width: "150px" }}
                        onPress={onClose}>
                        {translations?.next}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default SuccessModal;
