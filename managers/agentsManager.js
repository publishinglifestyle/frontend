import Cookie from 'js-cookie';
import axios from 'axios'

const endpoint = process.env.NEXT_PUBLIC_BASE_URL

const headers = {
    'Content-Type': 'application/json',
    'Authorization': Cookie.get('authToken')
}

export async function createAgent(name, type, prompt, temperature, level, model, n_buttons, buttons) {
    let response = await axios.post(endpoint + "create_agent",
        { name, temperature, type, level, prompt, model, n_buttons, buttons }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function updateAgent(agent_id, name, temperature, type, level, prompt, model, n_buttons, buttons) {
    console.log(agent_id, name, temperature, type, level, prompt, model, n_buttons, buttons)
    let response = await axios.post(endpoint + "update_agent",
        { agent_id, name, temperature, type, level, prompt, model, n_buttons, buttons }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function getAllAgents() {
    let response = await axios.get(endpoint + "get_all_agents", {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function getAgentsPerLevel() {
    let response = await axios.get(endpoint + "get_agents_per_level",
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}

export async function deleteAgent(agent_id) {
    let response = await axios.post(endpoint + "delete_agent",
        { agent_id },
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}

export async function getAgent(agent_id) {
    let response = await axios.post(endpoint + "get_agent",
        { agent_id },
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}