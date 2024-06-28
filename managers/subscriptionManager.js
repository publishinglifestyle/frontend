import Cookie from 'js-cookie';
import axios from 'axios'

const endpoint = "http://localhost:8090/"
const headers = {
    'Content-Type': 'application/json',
    'Authorization': Cookie.get('authToken')
}

export async function startSubscription(token, price_id) {
    let response = await axios.post(endpoint + "start_subscription",
        { price_id }, {
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
    let response = await axios.get(endpoint + "get_subscriptions", {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function isSubscriptionActive(user_id) {
    let response = await axios.post(endpoint + "is_subscription_active",
        { user_id },
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}

export async function getPortal() {
    let response = await axios.get(endpoint + "get_stripe_portal",
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}