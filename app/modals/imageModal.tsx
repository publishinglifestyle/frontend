"use client"

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/react";
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
    
    // Create a cache-busting image URL if needed
    const cacheBustedImageUrl = (() => {
        // If the URL already has a timestamp parameter, use it as is
        if (imageUrl && (imageUrl.includes('t=') || imageUrl.includes('timestamp='))) {
            return imageUrl;
        }
        // Otherwise, add a timestamp parameter
        return imageUrl && imageUrl.includes('?') 
            ? `${imageUrl}&t=${Date.now()}` 
            : `${imageUrl}?t=${Date.now()}`;
    })();
    
    // Reset state when modal opens to ensure proper rendering
    useEffect(() => {
        if (isOpen) {
            setTooltipContent('Copy to clipboard');
        }
    }, [isOpen]);

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
    
    // Clean close function to ensure state is reset
    const handleClose = () => {
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            size="xl" 
            isDismissable={false} 
            isKeyboardDismissDisabled={true}
        >
            <ModalContent>
                <ModalHeader className="modal-header justify-center">
                    <h1 style={{ fontSize: "26px" }}>{translations?.attention}</h1>
                </ModalHeader>
                <ModalBody style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: "center" }}>
                    <p>Your image has been uploaded successfully!</p>
                    <img 
                        src={cacheBustedImageUrl}
                        alt="Uploaded"
                        className="max-h-48 object-contain my-3"
                        key={cacheBustedImageUrl} 
                        crossOrigin="anonymous"
                    />
                    <p>The image is now attached to your message. You can type your message text in the input field.</p>
                    <p className="text-xs text-gray-500 mt-2">Image URL: {imageUrl}</p>
                </ModalBody>
                <ModalFooter className="flex flex-col gap-2">
                    <Tooltip content={tooltipContent}>
                        <Button
                            fullWidth
                            color="secondary"
                            radius="lg"
                            size="md"
                            onPress={handleCopyToClipboard}
                        >
                            {translations?.copy || 'Copy URL'}
                        </Button>
                    </Tooltip>
                    <Button
                        fullWidth
                        color="primary"
                        radius="lg"
                        size="md"
                        onPress={handleClose}
                    >
                        Continue
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ImageModal;