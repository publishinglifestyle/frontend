import Cookie from 'js-cookie';
import axios from 'axios'

const endpoint = process.env.NEXT_PUBLIC_BASE_URL


const headers = {
    'Content-Type': 'application/json',
    'Authorization': Cookie.get('authToken')
}

export async function createConversation() {
    let response = await axios.get(endpoint + "create_conversation",
        { headers: headers }
    );

    if (response) {
        return response.data.response;
    }
}

export async function getConversations() {
    let response = await axios.get(endpoint + "get_conversations", {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function getConversation(conversation_id) {
    let response = await axios.get(endpoint + "get_conversation?conversation_id=" + conversation_id,
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}

export async function deleteConversation(conversation_id) {
    let response = await axios.post(endpoint + "delete_conversation",
        { conversation_id },
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}

export async function generateImage(msg, agent_id, conversation_id, save_user_prompt, prompt_commands) {
    let response = await axios.post(endpoint + "generate_image",
        { msg, agent_id, conversation_id, save_user_prompt, prompt_commands },
        { headers: headers });

    if (response) {
        return response.data;
    }
}

export async function checkImageStatus(msg, messageId, conversation_id, save_user_prompt) {
    let response = await axios.post(endpoint + "check_image_status",
        { msg, messageId, conversation_id, save_user_prompt },
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}

export async function pressButton(conversation_id, messageId, midjourneyMessageId, button) {
    let response = await axios.post(endpoint + "press_button",
        { conversation_id, messageId, midjourneyMessageId, button },
        { headers: headers });

    if (response) {
        return response.data;
    }
}

export async function changeName(conversation_id, name) {
    let response = await axios.post(endpoint + "change_conversation_name",
        { conversation_id, name },
        { headers: headers });

    if (response) {
        return response.data;
    }
}