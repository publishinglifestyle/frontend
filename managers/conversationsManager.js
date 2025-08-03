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

export async function generateImage(msg, agent_id, conversation_id, save_user_prompt, prompt_commands, socket_id, n_images, size) {
    const response = await axiosInstance.post(BACKEND_URLS.imageGen.generateImage,
        { msg, agent_id, conversation_id, save_user_prompt, prompt_commands, socket_id, n_images, size })

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

export async function describeImage(conversation_id, image_url, agent_id, no_append = false) {
    const response = await axiosInstance.post(BACKEND_URLS.imageGen.describeIdiogram,
        { conversation_id, image_url, agent_id, no_append })

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

export async function uploadImage(file, retries = 3) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
            const base64String = reader.result.split(',')[1];

            let lastError = null;
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    console.log(`Upload attempt ${attempt} of ${retries}`);
                    const response = await axiosInstance.post(
                        BACKEND_URLS.imageGen.uploadImage,
                        { base64String },
                        {
                            timeout: 30000, // 30 second timeout
                        }
                    );

                    if (response.data && response.data.url) {
                        console.log('Upload successful:', response.data.url);
                        resolve(response.data.url);
                        return;
                    } else {
                        throw new Error('Invalid response from server - no URL returned');
                    }
                } catch (error) {
                    lastError = error;
                    console.error(`Upload attempt ${attempt} failed:`, error.message);
                    
                    if (attempt < retries) {
                        // Wait before retrying (exponential backoff)
                        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                        console.log(`Waiting ${delay}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            
            // All retries failed
            reject(lastError || new Error('Upload failed after all retries'));
        };

        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };

        reader.readAsDataURL(file);
    });
}