"use client"

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

import {
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
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
                <ModalHeader className="modal-header justify-center"><h1 style={{ fontSize: "26px", textAlign: "center", justifyContent: "center" }}>{translations?.attention}</h1></ModalHeader>
                <ModalBody style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ExclamationTriangleIcon color="red" style={{ width: "30%" }} />
                    <p className="text-center">
                        {message}
                    </p>
                </ModalBody>
                <ModalFooter className="mt-4 mb-2 justify-center">
                    <Button
                        color="secondary"
                        style={{ color: "white", width: "150px" }}
                        onPress={onClose}>
                        {translations?.understood}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ErrorModal;