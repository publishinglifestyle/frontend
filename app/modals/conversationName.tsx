"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";
import { Conversation } from "@/types/chat.types";

interface ConversationNameModalProps {
  isOpen: boolean;
  onClose: (name?: string) => void;
  conversation: Conversation | null;
}

const ConversationNameModal: React.FC<ConversationNameModalProps> = ({
  isOpen,
  onClose,
  conversation,
}) => {
  const [translations, setTranslations] = useState<Translations | null>(null);

  const [language, setLanguage] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (conversation) {
      setName(conversation.name ?? "");
    }

    return () => {
      setName("");
    };
  }, [conversation]);

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
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      size="2xl"
      className="apply-modal"
    >
      <ModalContent>
        <ModalHeader className="modal-header">
          {translations?.change_conversation_name}
        </ModalHeader>
        <ModalBody>
          <Input
            value={name}
            onChange={(e: {
              target: { value: React.SetStateAction<string> };
            }) => {
              setName(e.target.value ?? "");
            }}
            fullWidth
            labelPlacement="outside"
            label={translations?.new_name}
            type="text"
            placeholder={translations?.name}
            isRequired
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            color="secondary"
            style={{ width: "150px" }}
            radius="lg"
            size="md"
            onPress={() => onClose()}
          >
            {translations?.cancel}
          </Button>
          <Button
            color="secondary"
            style={{ color: "white", width: "150px" }}
            radius="lg"
            size="md"
            onPress={() => onClose(name)}
          >
            {translations?.confirm}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConversationNameModal;
