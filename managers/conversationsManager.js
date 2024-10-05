import Cookie from 'js-cookie';
import axios from 'axios'

const endpoint = process.env.NEXT_PUBLIC_BASE_URL + "/"


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

export async function generateImage(msg, agent_id, conversation_id, save_user_prompt, prompt_commands, socket_id) {
    let response = await axios.post(endpoint + "generate_image",
        { msg, agent_id, conversation_id, save_user_prompt, prompt_commands, socket_id },
        { headers: headers });

    if (response) {
        return response.data;
    }
}

export async function remixImage(conversation_id, msg, image_url, prompt_commands, agent_id) {
    let response = await axios.post(endpoint + "remix_ideogram",
        { conversation_id, msg, image_url, prompt_commands, agent_id },
        { headers: headers });

    if (response) {
        return response.data;
    }
}

export async function upscaleImage(conversation_id, image_url, prompt) {
    let response = await axios.post(endpoint + "upscale_ideogram",
        { conversation_id, image_url, prompt },
        { headers: headers });

    if (response) {
        return response.data;
    }
}

export async function describeImage(conversation_id, image_url, agent_id) {
    let response = await axios.post(endpoint + "describe_ideogram",
        { conversation_id, image_url, agent_id },
        { headers: headers });

    if (response) {
        return response.data;
    }
}

export async function saveMjImage(msg, messageId, conversation_id, save_user_prompt, imageUrl, options, flags, agent_id) {
    let response = await axios.post(endpoint + "save_mj_image",
        { msg, messageId, conversation_id, save_user_prompt, imageUrl, options, flags, agent_id },
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}

export async function sendAction(conversation_id, message_id, custom_id, prompt, prompt_commands, flags, socket_id, new_prompt) {
    let response = await axios.post(endpoint + "send_action",
        { conversation_id, message_id, custom_id, prompt, prompt_commands, flags, new_prompt, socket_id },
        { headers: headers });

    if (response) {
        return response.data;
    }
}

export async function changeName(conversation_id, name, agent_id) {
    let response = await axios.post(endpoint + "change_conversation_name",
        { conversation_id, name, agent_id },
        { headers: headers });

    if (response) {
        return response.data;
    }
}

export async function uploadImage(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
            const base64String = reader.result.split(',')[1];

            try {
                const response = await axios.post(endpoint + "upload_image", { base64String }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': Cookie.get('authToken')
                    }
                });
                resolve(response.data.url);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject('Error reading file');
        };

        reader.readAsDataURL(file);
    });
}