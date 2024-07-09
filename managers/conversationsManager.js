import Cookie from 'js-cookie';
import axios from 'axios'

//const endpoint = "https://chatbot-books-9d87f0a90bbe.herokuapp.com/"
//const endpoint = "http://localhost:8090/"
const endpoint = "https://18.185.31.235.nip.io/"

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

export async function generateImage(msg, agent_id, conversation_id) {
    let response = await axios.post(endpoint + "generate_image",
        { msg, agent_id, conversation_id },
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

export async function stopSequence() {
    let response = await axios.get(endpoint + "stopSequence",
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}