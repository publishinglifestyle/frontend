import { BACKEND_URLS } from "@/constant/urls";
import { axiosInstance } from "@/utils/axios";

export async function startSubscription(token, price_id, affiliateId, endorsely_referral, utmData) {
    const response = await axiosInstance.post(BACKEND_URLS.stripe.startSubscription,
        { price_id, affiliateId, endorsely_referral, utmData }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });

    if (response) {
        return response.data.response;
    }
}

export async function getSubscriptions() {
    const response = await axiosInstance.get(BACKEND_URLS.subscription.getSubscriptions)

    if (response) {
        return response.data.response;
    }
}

export async function getSubscription() {
    const response = await axiosInstance.get(BACKEND_URLS.subscription.getSubscription)

    if (response) {
        return response.data.response;
    }
}

export async function getPortal() {
    const response = await axiosInstance.get(BACKEND_URLS.stripe.getStripePortal);

    if (response) {
        return response.data.response;
    }
}