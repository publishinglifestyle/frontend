"use client"

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Spinner } from '@nextui-org/spinner';
import { Spacer } from '@nextui-org/spacer';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
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
}

interface Column {
    key: string;
    name: string;
}

let columns: Column[] = [
    { key: "name", name: "NAME" },
    { key: "actions", name: "" }
];

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
    const [agentLevel, setAgentLevel] = useState(1);

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
            setAgentType(current_agent.type);
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
                                        if (selectedAgentId == "new") {
                                            console.log(agentName, agentType, agentPrompt, agentTemperature, agentLevel)
                                            await createAgent(agentName, agentType, agentPrompt, agentTemperature, agentLevel)
                                        } else {
                                            await updateAgent(selectedAgentId, agentName, agentTemperature, agentType, agentLevel, agentPrompt)
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