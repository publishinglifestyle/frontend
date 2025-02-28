import { axiosInstance } from '@/utils/axios';
import { BACKEND_URLS } from '@/constant/urls';

export async function transcribeAudio(formData) {
    const response = await axiosInstance.post(
        BACKEND_URLS.audio.transcribe,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
}