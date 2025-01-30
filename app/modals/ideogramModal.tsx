"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Key } from "react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import {
  Button,
  Input,
  Tabs,
  Tab,
  Card,
  CardBody,
  Spinner,
} from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";
import { describeImage, uploadImage } from "@/managers/conversationsManager";

interface IdeogramModalProps {
  agentId?: string;
  selectedAspectRatio: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    selectedTab: string,
    styleType: string,
    aspectRatio: string,
    negativePrompt: string,
    remixPrompt: string,
    remixSimilarity: number,
    uploadedImageUrl: string
  ) => void;
}

const styleTypes = [
  { key: "AUTO", label: "Automatic" },
  { key: "GENERAL", label: "General" },
  { key: "REALISTIC", label: "Realistic" },
  { key: "DESIGN", label: "Design" },
  { key: "RENDER_3D", label: "3D Render" },
  { key: "ANIME", label: "Anime" },
];

const aspectRatios = [
  { key: "ASPECT_10_16", label: "ASPECT_10_16" },
  { key: "ASPECT_16_10", label: "ASPECT_16_10" },
  { key: "ASPECT_9_16", label: "ASPECT_9_16" },
  { key: "ASPECT_16_9", label: "ASPECT_16_9" },
  { key: "ASPECT_3_2", label: "ASPECT_3_2" },
  { key: "ASPECT_2_3", label: "ASPECT_2_3" },
  { key: "ASPECT_4_3", label: "ASPECT_4_3" },
  { key: "ASPECT_3_4", label: "ASPECT_3_4" },
  { key: "ASPECT_1_1", label: "ASPECT_1_1" },
  { key: "ASPECT_1_3", label: "ASPECT_1_3" },
  { key: "ASPECT_3_1", label: "ASPECT_3_1" },
];

const IdeogramModal: React.FC<IdeogramModalProps> = ({
  agentId,
  selectedAspectRatio,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [language, setLanguage] = useState("");
  const [translations, setTranslations] = useState<Translations | null>(null);

  // States for form data
  const [styleType, setStyleType] = useState<string>("AUTO");
  const [aspectRatio, setAspectRatio] = useState<string>(selectedAspectRatio ? selectedAspectRatio : "ASPECT_1_1");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [remixPrompt, setRemixPrompt] = useState<string>("");
  const [remixSimilarity, setRemixSimilarity] = useState<number>(70);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("configuration");

  // UI Control states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);

  // Track the active tab
  const [activeTab, setActiveTab] = useState<string>("configuration");

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      setLanguage(browserLanguage);
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };

    detectLanguage();

    if (agentId == "88ab4ff2-dca1-4753-b3f4-2f34b564e4a5" || agentId == "10280eaa-370c-4456-a6f6-a182f3605d67" || agentId == "e2c5ee2c-3130-4603-85ab-e2a2f88d9470" || agentId == "73afdc60-c72f-458d-a5fa-af9ceeeeb761" || agentId == "35563d6e-da4c-4042-a793-ec68e1812dbe") {
      let negative_prompt = (agentId == "88ab4ff2-dca1-4753-b3f4-2f34b564e4a5") ? "No thin lines. No fine details. No intricate textures. No delicate strokes. No light or faint outlines. No shading. No complex patterns. No background elements. No realism. No soft edges." : "no details"
      setNegativePrompt(negative_prompt)
    }
  }, []);

  const handleStyleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStyleType(event.target.value);
  };

  const handleAspectRatioChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setAspectRatio(event.target.value);
  };

  const handleTabChange = (key: Key) => {
    const tabKey = key.toString(); // Convert Key to string for consistent logic
    setActiveTab(tabKey);

    // Reset values when the tab changes
    if (tabKey === "configuration") {
      setStyleType("GENERAL");
      setAspectRatio("ASPECT_10_16");
      setNegativePrompt("");
    } else if (tabKey === "remix") {
      setRemixPrompt("");
      setSelectedImage(null);
    } else if (tabKey === "describe") {
      setSelectedImage(null);
    }

    setSelectedTab(tabKey);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Start reading file
      const reader = new FileReader();
      reader.readAsDataURL(file);

      try {
        // Show loading state
        setIsLoading(true);

        const uploadedImageUrl = await uploadImage(file);
        const description = await describeImage("", uploadedImageUrl, "", true);
        setRemixPrompt(description.response);
        setUploadedImageUrl(uploadedImageUrl);

        // Stop loading state and show modal with the uploaded image
        setIsLoading(false);
        setIsImageModalOpen(true);
      } catch (error) {
        // Handle errors and stop loading state
        setIsLoading(false);
        const err = error as any;
        if (err.response) {
          setErrorMessage(err.response.data);
          setIsErrorModalOpen(true);
        }
      }
    }
  };

  const handleConfirm = () => {
    onSuccess(
      selectedTab,
      styleType,
      aspectRatio,
      negativePrompt,
      remixPrompt,
      remixSimilarity,
      uploadedImageUrl
    );
    setActiveTab("configuration");
    /*setStyleType('GENERAL');
        setAspectRatio('ASPECT_10_16');*/
    setNegativePrompt("");
    setRemixPrompt("");
    setSelectedImage(null);
    setUploadedImageUrl("");

    onClose();
  };

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="modal-header justify-center">
          <h1 style={{ fontSize: "26px" }}>{translations?.commands}</h1>
        </ModalHeader>
        <ModalBody
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center">
              <Spinner size="sm" color="secondary" />
            </div>
          ) : (
            <Tabs
              aria-label="Options"
              selectedKey={activeTab}
              onSelectionChange={handleTabChange}
            >
              <Tab key="configuration" title="Configuration">
                <Card>
                  <CardBody>
                    <Select
                      label="Style Type"
                      placeholder="Select a style type"
                      size="sm"
                      value={styleType}
                      onChange={handleStyleTypeChange}
                      defaultSelectedKeys={[styleType]}
                    >
                      {styleTypes.map((style) => (
                        <SelectItem key={style.key} value={style.key}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      className="mt-2"
                      label="Aspect Ratio"
                      placeholder="Select an aspect ratio"
                      size="sm"
                      value={aspectRatio}
                      onChange={handleAspectRatioChange}
                      defaultSelectedKeys={[aspectRatio]}
                    >
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.key} value={ratio.key}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      className="mt-2"
                      label="Negative Prompt"
                      placeholder="Enter negative prompt"
                      fullWidth
                      value={negativePrompt}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setNegativePrompt(e.target.value)
                      }
                      size="sm"
                      radius="lg"
                      variant="bordered"
                    />
                  </CardBody>
                </Card>
              </Tab>

              <Tab key="remix" title="Remix">
                <Card>
                  <CardBody>
                    <Input
                      className="mb-2"
                      label="Prompt for Remix"
                      placeholder="Enter remix prompt"
                      fullWidth
                      value={remixPrompt}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setRemixPrompt(e.target.value)
                      }
                      size="sm"
                      radius="lg"
                      variant="bordered"
                    />
                    <Input
                      className="mb-2"
                      label="Similarity Prompt"
                      placeholder="Enter percentage similarity prompt"
                      fullWidth
                      type="number" // Set type to "number"
                      value={remixSimilarity.toString()} // Ensure the value is a string representation of the number
                      onChange={
                        (e: ChangeEvent<HTMLInputElement>) =>
                          setRemixSimilarity(Number(e.target.value)) // Parse input as a number
                      }
                      size="sm"
                      radius="lg"
                      variant="bordered"
                    />

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {selectedImage && (
                      <div>
                        <p>Selected Image: {selectedImage.name}</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Tab>

              <Tab key="describe" title="Describe">
                <Card>
                  <CardBody>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {selectedImage && (
                      <div>
                        <p>Selected Image: {selectedImage.name}</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          )}
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
          >
            {translations?.confirm}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default IdeogramModal;
