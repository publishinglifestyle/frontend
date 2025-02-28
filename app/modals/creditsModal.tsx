"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (selectedOption: string) => void;
}

const CreditsModal: React.FC<CreditsModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
}) => {
  const [language, setLanguage] = useState("");
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      setLanguage(browserLanguage);
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };

    detectLanguage();
  }, []);

  const handlePurchase = () => {
    if (selectedOption) {
      onPurchase(selectedOption);
      onClose();
    } else {
      alert(translations?.select_option_message || "Please select an option.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        <ModalHeader className="modal-header justify-center">
          <h1 style={{ fontSize: "26px" }}>{translations?.buy_credits}</h1>
        </ModalHeader>
        <ModalBody
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Select
            isRequired
            size="sm"
            label={translations?.select_package || "Select a package"}
            placeholder={translations?.select_package || "Select a package"}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            <SelectItem key="1">9.99$ - 8M credits</SelectItem>
            <SelectItem key="2">19.99$ - 16M credits</SelectItem>
            <SelectItem key="3">39.99$ - 32M credits</SelectItem>
          </Select>
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
            {translations?.cancel || "Cancel"}
          </Button>
          <Button
            fullWidth
            color="secondary"
            radius="lg"
            size="md"
            onPress={handlePurchase}
          >
            {translations?.purchase || "Purchase"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreditsModal;
