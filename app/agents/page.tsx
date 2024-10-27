"use client"

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Spinner } from '@nextui-org/spinner';
import { Spacer } from '@nextui-org/spacer';
import { Button } from '@nextui-org/button';
import { Select, SelectItem } from '@nextui-org/select';
import { Input, Textarea } from "@nextui-org/input";
import { Table, TableBody, TableHeader, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { useAuth } from '@/app/auth-context';
import { useRouter } from 'next/navigation';
import ErrorModal from "@/app/modals/errorModal";
import { getAllAgents, getAgent, createAgent, updateAgent, deleteAgent } from "@/managers/agentsManager";
import { TrashIcon } from "@heroicons/react/24/outline";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

interface Agent {
    id: string;
    name: string;
    type: string;
    prompt: string;
    temperature: number;
    level: number;
    model: string;
    n_buttons: number;
    buttons: Button[];
}

interface Button {
    id: string;
    name: string;
    prompt: string;
}

interface Column {
    key: string;
    name: string;
}

let columns: Column[] = [
    { key: "name", name: "NAME" },
    { key: "actions", name: "" }
];

const n_buttons = [0, 1, 2, 3, 4]

const agent_languages = [
    {
        value: "both",
        label: "Both"
    },
    {
        value: "en",
        label: "English"
    },
    {
        value: "it",
        label: "Italian"
    }
]

const agent_types = [
    {
        value: 'text',
        label: 'Text'
    },
    {
        value: 'image',
        label: 'Image'
    }
]

const agent_models = [
    {
        value: 'dall-e',
        label: 'Dall-E'
    },
    {
        value: 'midjourney',
        label: 'Midjourney'
    },
    {
        value: 'ideogram',
        label: 'Ideogram'
    }
]

const agent_levels = [
    {
        value: "1",
        label: 'Basic'
    },
    {
        value: "2",
        label: 'Pro'
    },
    {
        value: "3",
        label: 'Advanced'
    }
]

export default function AgentsPage() {
    const [language, setLanguage] = useState('');
    const [translations, setTranslations] = useState<Translations | null>(null);
    const router = useRouter()

    const { isAuthenticated: isAuthenticatedClient } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');

    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState("");
    const [agentName, setAgentName] = useState("");
    const [agentType, setAgentType] = useState("");
    const [agentPrompt, setAgentPrompt] = useState("");
    const [agentTemperature, setAgentTemperature] = useState(0);
    const [agentModel, setAgentModel] = useState("");
    const [agentLevel, setAgentLevel] = useState(1);
    const [agentNButtons, setAgentNButtons] = useState(0);
    const [agentButtons, setAgentButtons] = useState<Button[]>([]);
    const [agentLanguage, setAgentLanguage] = useState("");

    useEffect(() => {
        const detectLanguage = async () => {
            // Detect browser language
            const browserLanguage = navigator.language;
            setLanguage(browserLanguage);

            // Get translations for the detected language
            const translations = await getTranslations(browserLanguage);
            setTranslations(translations);

            columns = [
                { key: "name", name: translations?.name },
                { key: "actions", name: "" }
            ];
        };

        detectLanguage();
    }, []);

    // Simulate fetching documents from an API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const all_agents = await getAllAgents()
                setAgents(all_agents)
                setIsLoading(false)
            } catch (e) {
                setIsLoading(false)
            }
        };

        if (!isAuthenticatedClient) {
            router.push('/')
        } else {
            fetchData()
        }
    }, [isAuthenticatedClient]);

    const renderCell = (item: Agent, columnKey: keyof Agent | 'actions') => {
        if (columnKey === "name") {
            return <div className="flex items-center">{item.name}</div>;
        } else if (columnKey === "actions") {
            return (
                <div style={{ textAlign: 'right' }}>
                    <Button
                        variant="light"
                        color="danger"
                        size="sm"
                        onClick={async () => {
                            setIsLoading(true);
                            await deleteAgent(item.id);
                            setAgents(currentAgents => currentAgents.filter(w => w.id !== item.id));
                            setIsLoading(false);
                        }}
                    >
                        <TrashIcon width={18} />
                    </Button>
                </div>
            );
        }
        return null;
    };

    const handleRowClick = async (item: Agent) => {
        // Reset state to avoid showing data from the previous workflow
        setSelectedAgentId("");
        setIsLoading(true);
        try {
            const current_agent = await getAgent(item.id);
            setSelectedAgentId(item.id);
            setAgentName(current_agent.name);
            setAgentLevel(current_agent.level);
            setAgentPrompt(current_agent.prompt);
            setAgentTemperature(current_agent.temperature);
            setAgentModel(current_agent.model);
            setAgentType(current_agent.type);
            setAgentNButtons(current_agent.n_buttons);
            setAgentButtons(current_agent.buttons || []);
            setAgentLanguage(current_agent.language)
        } catch (error) {
            console.error("Failed to load agent:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ marginTop: "10%" }} className="text-center items-center align-center">
                <Spinner color="secondary" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{translations?.agents}</h1>
                </div>
                {
                    <Button color="secondary" style={{ color: "white" }} size="sm" onClick={async () => {
                        setSelectedAgentId("new");
                    }}>
                        {translations?.new_agent}
                    </Button>

                }
            </div >
            <Spacer y={8} />
            {
                selectedAgentId != "" ?
                    <Card>
                        <Spacer y={4} />
                        <CardBody>
                            <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-4 gap-4">
                                <Select
                                    isRequired
                                    size="sm"
                                    label="Language"
                                    placeholder="Select a language"
                                    defaultSelectedKeys={[agentLanguage]}
                                    onChange={(e) => {
                                        console.log(e.target.value)
                                        setAgentLanguage(e.target.value)
                                    }}
                                >
                                    {agent_languages.map((agent_type) => (
                                        <SelectItem key={agent_type.value} value={agent_type.value}>
                                            {agent_type.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                            <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                <Select
                                    isRequired
                                    size="sm"
                                    label={translations?.type}
                                    placeholder="Select a type"
                                    defaultSelectedKeys={[agentType]}
                                    onChange={(e) => {
                                        console.log(e.target.value)
                                        setAgentType(e.target.value)
                                    }}
                                >
                                    {agent_types.map((agent_type) => (
                                        <SelectItem key={agent_type.value} value={agent_type.value}>
                                            {agent_type.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    isRequired
                                    value={agentName}
                                    onChange={e => {
                                        setAgentName(e.target.value);
                                    }}
                                    fullWidth
                                    label={translations?.name}
                                    type="text"
                                    size='sm'
                                    radius='lg'
                                    variant="bordered"
                                />
                            </div>
                            <Spacer y={8} />
                            <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                <Select
                                    isRequired
                                    size="sm"
                                    label={translations?.level}
                                    placeholder={translations?.select_level}
                                    defaultSelectedKeys={[agentLevel.toString()]}
                                    onChange={(e) => {
                                        console.log(e.target.value)
                                        setAgentLevel(parseInt(e.target.value))
                                    }}
                                >
                                    {agent_levels.map((agent_level) => (
                                        <SelectItem key={agent_level.value} value={agent_level.value}>
                                            {agent_level.label}
                                        </SelectItem>
                                    ))}
                                </Select>

                                {
                                    agentType == "image" ?
                                        <Select
                                            isRequired
                                            size="sm"
                                            label={translations?.model}
                                            placeholder={translations?.select_model}
                                            defaultSelectedKeys={[agentModel]}
                                            onChange={(e) => {
                                                console.log(e.target.value)
                                                setAgentModel(e.target.value)
                                            }}
                                        >
                                            {agent_models.map((agent_model) => (
                                                <SelectItem key={agent_model.value} value={agent_model.value}>
                                                    {agent_model.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        :
                                        <Input
                                            value={agentTemperature?.toString()}
                                            onChange={e => {
                                                const newValue = parseFloat(e.target.value);
                                                if (!isNaN(newValue)) {
                                                    setAgentTemperature(newValue);
                                                } else {
                                                    setAgentTemperature(0);
                                                }
                                            }}
                                            fullWidth
                                            label={translations?.temperature}
                                            type="number"
                                            size='sm'
                                            radius='lg'
                                            variant="bordered"
                                        />
                                }

                            </div>
                            <Spacer y={8} />
                            <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                <Textarea
                                    isRequired
                                    label="Prompt"
                                    value={agentPrompt}
                                    onChange={e => {
                                        setAgentPrompt(e.target.value)
                                    }}
                                />
                            </div>
                            <Spacer y={8} />
                            <div className="flex flex-col md:flex-row md:space-x-4 mb-8">
                                {n_buttons.map(btn => (
                                    <Card
                                        key={btn}
                                        isPressable
                                        isHoverable
                                        onPress={() => setAgentNButtons(btn)}
                                        className={`w-full md:w-1/3 mb-4 md:mb-0 ${agentNButtons === btn ? 'border-4 border-purple-500 shadow-lg shadow-purple-500/50' : ''}`}
                                        style={{ height: '100px' }}
                                    >
                                        <CardHeader className="flex flex-col items-center justify-center" style={{ height: '100%' }}>
                                            <h2 className="text-3xl">{btn}</h2>
                                            <p style={{ color: "#9353D3" }}>
                                                Buttons
                                            </p>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                            <Spacer y={8} />
                            <div className="flex flex-col gap-4">
                                {Array.from({ length: agentNButtons }).map((_, index) => (
                                    <div key={index} className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                        <Input
                                            isRequired
                                            value={agentButtons[index]?.name || ""}
                                            onChange={(e) => {
                                                const newButtons = [...agentButtons];
                                                if (!newButtons[index]) newButtons[index] = { id: `${index}`, name: "", prompt: "" };
                                                newButtons[index].name = e.target.value;
                                                setAgentButtons(newButtons);
                                            }}
                                            fullWidth
                                            label={`Button ${index + 1} Name`}
                                            type="text"
                                            size='sm'
                                            radius='lg'
                                            variant="bordered"
                                        />
                                        <Input
                                            isRequired
                                            value={agentButtons[index]?.prompt || ""}
                                            onChange={(e) => {
                                                const newButtons = [...agentButtons];
                                                if (!newButtons[index]) newButtons[index] = { id: `${index}`, name: "", prompt: "" };
                                                newButtons[index].prompt = e.target.value;
                                                setAgentButtons(newButtons);
                                            }}
                                            fullWidth
                                            label={`Button ${index + 1} Prompt`}
                                            type="text"
                                            size='sm'
                                            radius='lg'
                                            variant="bordered"
                                        />
                                    </div>
                                ))}
                            </div>
                            <Spacer y={8} />


                        </CardBody>
                        <CardFooter className="flex gap-4">
                            <Button
                                fullWidth
                                color="secondary"
                                variant="ghost"
                                className="mb-4"
                                onClick={async () => {
                                    setSelectedAgentId("");
                                    setAgentName("");
                                    setAgentLevel(0);
                                    setAgentPrompt("");
                                    setAgentTemperature(0);
                                    setAgentType("");
                                }}>
                                {translations?.cancel}
                            </Button>
                            <Button
                                fullWidth
                                color="secondary"
                                className="mb-4"
                                onClick={async () => {
                                    try {
                                        setIsLoading(true)

                                        if (agentButtons.length > 0) {
                                            while (agentButtons.length != agentNButtons) {
                                                agentButtons.pop()
                                            }
                                        }

                                        if (selectedAgentId == "new") {
                                            await createAgent(agentName, agentType, agentPrompt, agentTemperature, agentLevel, agentModel, agentNButtons, agentButtons, agentLanguage)
                                        } else {
                                            console.log("update")
                                            await updateAgent(selectedAgentId, agentName, agentTemperature, agentType, agentLevel, agentPrompt, agentModel, agentNButtons, agentButtons, agentLanguage)
                                        }
                                        const all_agents = await getAllAgents()
                                        setAgents(all_agents)
                                        setSelectedAgentId("")
                                        setIsLoading(false)
                                    } catch (e) {
                                        console.log(e)
                                        setIsLoading(false)
                                    }
                                }}>
                                {translations?.update_agent}
                            </Button>
                        </CardFooter>
                    </Card>
                    :
                    <Table aria-label="Agents table" selectionMode="single">
                        <TableHeader columns={columns}>
                            {(column: Column) => (
                                <TableColumn key={column.key}>
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={agents}>
                            {(item: Agent) => (
                                <TableRow
                                    key={item.id.toString()}
                                    onClick={() => handleRowClick(item)}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.key}>{renderCell(item, column.key as keyof Agent | "actions")}</TableCell>
                                    ))}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

            }


            <ErrorModal
                isOpen={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                message={errorModalMessage}
            />
        </div >
    );
}