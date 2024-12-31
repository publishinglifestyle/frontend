import { BACKEND_URLS } from "@/constant/urls";
import { axiosInstance } from "@/utils/axios";

export async function createConversation() {
    const response = await axiosInstance.get(BACKEND_URLS.conversation.createConversation);

    if (response) {
        return response.data.response;
    }
}

export async function getConversations() {
    const response = await axiosInstance.get(BACKEND_URLS.conversation.getConversations);

    if (response) {
        return response.data.response;
    }
}

export async function getConversation(conversation_id) {
    const response = await axiosInstance.get(BACKEND_URLS.conversation.getConversation + "?conversation_id=" + conversation_id)

    if (response) {
        return response.data.response;
    }
}

export async function deleteConversation(conversation_id) {
    const response = await axiosInstance.post(BACKEND_URLS.conversation.deleteConversation,
        { conversation_id })

    if (response) {
        return response.data.response;
    }
}

export async function generateImage(msg, agent_id, conversation_id, save_user_prompt, prompt_commands, socket_id) {
    const response = await axiosInstance.post(BACKEND_URLS.imageGen.generateImage,
        { msg, agent_id, conversation_id, save_user_prompt, prompt_commands, socket_id })

    if (response) {
        return response.data;
    }
}

export async function remixImage(conversation_id, msg, image_url, prompt_commands, agent_id) {
    const response = await axiosInstance.post(BACKEND_URLS.imageGen.remixIdiogram,
        { conversation_id, msg, image_url, prompt_commands, agent_id });

    if (response) {
        return response.data;
    }
}

export async function upscaleImage(conversation_id, image_url, prompt) {

    const response = await axiosInstance.post(BACKEND_URLS.imageGen.upscaleImage,
        { conversation_id, image_url, prompt })

    if (response) {
        return response.data;
    }
}

export async function describeImage(conversation_id, image_url, agent_id,no_append=false) {
    const response = await axiosInstance.post(BACKEND_URLS.imageGen.describeIdiogram,
        { conversation_id, image_url, agent_id,no_append })

    if (response) {
        return response.data;
    }
}

export async function saveMjImage(msg, messageId, conversation_id, save_user_prompt, imageUrl, options, flags, agent_id) {
    const response = await axiosInstance.post(
        BACKEND_URLS.imageGen.saveMjImage,
        { msg, messageId, conversation_id, save_user_prompt, imageUrl, options, flags, agent_id })

    if (response) {
        return response.data.response;
    }
}

export async function sendAction(conversation_id, message_id, custom_id, prompt, prompt_commands, flags, socket_id, new_prompt) {
    const response = await axiosInstance.post(
        BACKEND_URLS.imageGen.sendAction,
        { conversation_id, message_id, custom_id, prompt, prompt_commands, flags, new_prompt, socket_id })

    if (response) {
        return response.data;
    }
}

export async function changeName(conversation_id, name, agent_id) {
    const response = await axiosInstance.post(
        BACKEND_URLS.conversation.changeConversationName,
        { conversation_id, name, agent_id })

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
                const response = await axiosInstance.post(
                    BACKEND_URLS.imageGen.uploadImage,
                    { base64String }, {
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