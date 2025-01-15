"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button, Input } from "@nextui-org/react";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";

interface PromptModalProps {
  isOpen: boolean;
  initialPrompt: string;
  onClose: () => void;
  onSuccess: (modifiedPrompt: string) => void;
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  initialPrompt,
  onClose,
  onSuccess,
}) => {
  const [language, setLanguage] = useState("");
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        <ModalHeader className="modal-header justify-center">
          <h1 style={{ fontSize: "26px" }}>{translations?.edit_prompt}</h1>
        </ModalHeader>
        <ModalBody
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Input
            value={prompt}
            onChange={handleInputChange}
            placeholder={translations?.enter_your_prompt_here}
            fullWidth
            size="lg"
            radius="lg"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            fullWidth
            color="secondary"
            radius="lg"
            size="md"
            onPress={onClose}
          >
            {translations?.cancel}
          </Button>
          <Button
            fullWidth
            color="secondary"
            radius="lg"
            size="md"
            onPress={() => onSuccess(prompt)}
          >
            {translations?.confirm}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PromptModal;
