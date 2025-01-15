"use client"

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button"
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    message: string;
}

import {
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, message, onSuccess }) => {
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
        <Modal isOpen={isOpen} onClose={onClose} size="sm" isDismissable={false} isKeyboardDismissDisabled={true}>
            <ModalContent>
                <ModalHeader className="modal-header justify-center"><h1 style={{ fontSize: "26px" }}>{translations?.attention}</h1></ModalHeader>
                <ModalBody style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: "center" }}>
                    <ExclamationTriangleIcon color="red" style={{ width: "30%" }} />
                    <p>
                        {message}
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="ghost"
                        fullWidth
                        color="secondary"
                        radius="lg"
                        size="md"
                        onPress={onClose}>
                        {translations?.cancel}
                    </Button>
                    <Button
                        fullWidth
                        color="secondary"
                        radius="lg"
                        size="md"
                        onPress={() => {
                            onSuccess()
                        }}>
                        {translations?.confirm}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ConfirmModal;
