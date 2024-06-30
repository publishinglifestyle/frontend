import Cookie from 'js-cookie';
import axios from 'axios'

const endpoint = "http://localhost:8090/"
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