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

interface PictureGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (numberOfPictures: number) => void;
}

const PictureGenerationModal: React.FC<PictureGenerationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [language, setLanguage] = useState("");
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [selectedNumber, setSelectedNumber] = useState(1);

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      setLanguage(browserLanguage);
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };
    detectLanguage();
  }, []);

  const handleConfirm = () => {
    if (selectedNumber !== null) {
      onConfirm(selectedNumber);
    }
  };

  const options = Array.from({ length: 8 }, (_, i) => i + 1);

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
          <h1 style={{ fontSize: "20px" }}>
            {translations?.selectNumberOfPictures}
          </h1>
        </ModalHeader>
        <ModalBody
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            flexDirection: "column",
          }}
        >
          <Select
            className="max-w-xs"
            label={translations?.numberOfPictures}
            placeholder={translations?.select}
            selectedKeys={[selectedNumber.toString()]}
            size="sm"
            selectionMode="single"
            onChange={(e) => setSelectedNumber(Number(e.target.value))}
          >
            {options.map((option) => (
              <SelectItem key={option}>{option.toString()}</SelectItem>
            ))}
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
            {translations?.cancel}
          </Button>
          <Button
            fullWidth
            color="secondary"
            radius="lg"
            size="md"
            onPress={handleConfirm}
            isDisabled={selectedNumber === null}
          >
            {translations?.confirm}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PictureGenerationModal;
