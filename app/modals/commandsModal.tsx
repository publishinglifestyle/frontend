"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

interface CommandsModalProps {
    agentId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (selectedCommands: Array<{ command: string, value: string }>) => void;
}

const commands = [
    {
        value: '--aspect',
        description: 'Change the aspect ratio of a generation.',
        has_parameter: true
    },
    {
        value: '--chaos',
        description: 'Change how varied the results will be. ',
        has_parameter: true
    },
    {
        value: '--cref',
        description: 'Use images as character references to create images of the same character.',
        has_parameter: true
    },
    /*{
        value: '--fast',
        description: 'Override your current setting and run a single job using Fast Mode.',
        has_parameter: false
    },*/
    {
        value: '--iw',
        description: 'Sets image prompt weight relative to text weight. The default value is 1.',
        has_parameter: true
    },
    {
        value: '--no',
        description: 'Negative prompting',
        has_parameter: true
    },
    {
        value: '--quality',
        description: 'How much rendering quality time you want to spend.',
        has_parameter: true
    },
    {
        value: '--style random',
        description: 'Add a random 32 base styles Style Tuner code to your prompt.',
        has_parameter: false
    },
    /*{
         value: '--relax',
         description: 'Override your current setting and run a single job using Relax Mode.',
         has_parameter: false
     },*/
    {
        value: '--repeat',
        description: 'Create multiple Jobs from a single prompt',
        has_parameter: true
    },
    {
        value: '--style',
        description: 'Switch between versions of the Midjourney and Niji.',
        has_parameter: true
    },
    {
        value: '--stylize',
        description: 'Influence how strongly aesthetic style is applied to Jobs.',
        has_parameter: true
    },
    {
        value: '--tile',
        description: 'Generates images that can be used as repeating tiles to create seamless patterns.',
        has_parameter: false
    },
    /*{
        value: '--turbo',
        description: 'Override your current setting and run a single job using Turbo Mode.',
        has_parameter: false
    },*/
    {
        value: '--weird',
        description: 'Explore unusual aesthetics',
        has_parameter: true
    }
];

const CommandsModal: React.FC<CommandsModalProps> = ({ agentId, isOpen, onClose, onSuccess }) => {
    const [language, setLanguage] = useState('');
    const [translations, setTranslations] = useState<Translations | null>(null);
    const [selectedCommands, setSelectedCommands] = useState<{ [key: string]: boolean }>({});
    const [commandValues, setCommandValues] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const detectLanguage = async () => {
            const browserLanguage = navigator.language;
            setLanguage(browserLanguage);
            const translations = await getTranslations(browserLanguage);
            setTranslations(translations);
        };

        detectLanguage();
    }, []);

    useEffect(() => {
        if (agentId === "041acc6b-18df-4567-91f0-0f3684e1188c") {
            setSelectedCommands(prev => ({
                ...prev,
                '--aspect': true,
                '--style': true,
            }));
            setCommandValues(prev => ({
                ...prev,
                '--aspect': '3:4',
                '--style': 'raw',
            }));
        }
    }, [agentId]);


    const handleCheckboxChange = (commandValue: string) => {
        setSelectedCommands(prevState => ({
            ...prevState,
            [commandValue]: !prevState[commandValue]
        }));
    };

    const handleValueChange = (commandValue: string, newValue: string) => {
        setCommandValues(prevState => ({
            ...prevState,
            [commandValue]: newValue
        }));
    };

    const handleConfirm = () => {
        const selected = commands
            .filter(cmd => selectedCommands[cmd.value])
            .map(cmd => ({ command: cmd.value, value: commandValues[cmd.value] || '' }));

        onSuccess(selected);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl" // Increase the modal size further to accommodate more commands
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            scrollBehavior="inside" // Allow scrolling within the modal
        >
            <ModalContent>
                <ModalHeader className="modal-header justify-center">
                    <h1 style={{ fontSize: "26px" }}>{translations?.commands}</h1>
                </ModalHeader>
                <ModalBody style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="w-full">
                        {commands.map((command) => (
                            <div key={command.value} className="flex w-full gap-4 mb-4">
                                <Checkbox
                                    isSelected={!!selectedCommands[command.value]}
                                    onChange={() => handleCheckboxChange(command.value)}
                                >
                                </Checkbox>
                                <Input
                                    isRequired={command.has_parameter}
                                    isDisabled={!command.has_parameter || !selectedCommands[command.value]}
                                    value={commandValues[command.value] || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleValueChange(command.value, e.target.value)}
                                    fullWidth
                                    label={command.value}
                                    placeholder={command.description}
                                    type="text"
                                    size='sm'
                                    radius='lg'
                                    variant="bordered"
                                />
                            </div>
                        ))}
                    </div>
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
                        onPress={handleConfirm}>
                        {translations?.confirm}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CommandsModal;
