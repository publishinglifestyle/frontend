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

interface DalleImageSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imageSize: string) => void;
}

const DalleImageSizeModal: React.FC<DalleImageSizeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [language, setLanguage] = useState("");
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [selectedSize, setSelectedSize] = useState("1024x1024");

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
    if (selectedSize) {
      onConfirm(selectedSize);
    }
  };

  const imageSizeOptions = [
    { value: "1024x1024", label: "Square (1024x1024)" },
    { value: "1536x1024", label: "Landscape (1536x1024)" },
    { value: "1024x1536", label: "Portrait (1024x1536)" },
  ];

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
            Select Image Size
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
            label="Image Size"
            placeholder={translations?.select || "Select"}
            selectedKeys={[selectedSize]}
            size="sm"
            selectionMode="single"
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            {imageSizeOptions.map((option) => (
              <SelectItem key={option.value}>{option.label}</SelectItem>
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
            {translations?.cancel || "Cancel"}
          </Button>
          <Button
            fullWidth
            color="secondary"
            radius="lg"
            size="md"
            onPress={handleConfirm}
            isDisabled={!selectedSize}
          >
            {translations?.confirm || "Confirm"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DalleImageSizeModal; 