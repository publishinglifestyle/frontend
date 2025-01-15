"use client"

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/react";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, isOpen, onClose }) => {
    const [language, setLanguage] = useState('');
    const [translations, setTranslations] = useState<Translations | null>(null);
    const [tooltipContent, setTooltipContent] = useState('Copy to clipboard');

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

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(imageUrl)
            .then(() => {
                setTooltipContent('Copied to clipboard!');
                setTimeout(() => {
                    setTooltipContent('Copy to clipboard');
                }, 2000);
            })
            .catch((err) => {
                console.error('Failed to copy image URL to clipboard:', err);
            });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isDismissable={false} isKeyboardDismissDisabled={true}>
            <ModalContent>
                <ModalHeader className="modal-header justify-center">
                    <h1 style={{ fontSize: "26px" }}>{translations?.attention}</h1>
                </ModalHeader>
                <ModalBody style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: "center" }}>
                    <p>Copy paste your image URL into the text box:</p>
                    <p className="text-xs">{imageUrl}</p>
                </ModalBody>
                <ModalFooter>
                    <Tooltip content={tooltipContent}>
                        <Button
                            fullWidth
                            color="secondary"
                            radius="lg"
                            size="md"
                            onPress={handleCopyToClipboard}
                        >
                            {translations?.copy || 'Copy'}
                        </Button>
                    </Tooltip>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ImageModal;