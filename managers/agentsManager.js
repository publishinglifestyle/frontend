import { axiosInstance } from '@/utils/axios';
import { BACKEND_URLS } from '@/constant/urls';


export async function createAgent(name, type, prompt, temperature, level, model, n_buttons, buttons, language) {
    const response = await axiosInstance.post(BACKEND_URLS.agent.createAgent,
        { name, temperature, type, level, prompt, model, n_buttons, buttons, language });

    if (response) {
        return response.data.response;
    }
}

export async function updateAgent(agent_id, name, temperature, type, level, prompt, model, n_buttons, buttons, language) {
    const response = await axiosInstance.post(BACKEND_URLS.agent.updateAgent,
        { agent_id, name, temperature, type, level, prompt, model, n_buttons, buttons, language });

    if (response) {
        return response.data.response;
    }
}

export async function getAllAgents() {
    const response = await axiosInstance.get(BACKEND_URLS.agent.getAllAgents)

    if (response) {
        return response.data.response;
    }
}

export async function getAgentsPerLevel(language) {
    const response = await axiosInstance.get(BACKEND_URLS.agent.getAgentsPerLevel + "?language=" + language)

    if (response) {
        return response.data.response;
    }
}

export async function deleteAgent(agent_id) {
    const response = await axiosInstance.post(BACKEND_URLS.agent.deleteAgent,
        { agent_id },
        );

    if (response) {
        return response.data.response;
    }
}

export async function getAgent(agent_id) {
    const response = await axiosInstance.post(BACKEND_URLS.agent.getAgent,
        { agent_id });

    if (response) {
        return response.data.response;
    }
}