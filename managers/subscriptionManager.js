import Cookie from 'js-cookie';
import axios from 'axios'

//const endpoint = "https://chatbot-books-9d87f0a90bbe.herokuapp.com/"
//const endpoint = "http://localhost:8090/"
const endpoint = "https://18.185.31.235.nip.io/"

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

export async function getSubscription() {
    let response = await axios.get(endpoint + "get_subscription",
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