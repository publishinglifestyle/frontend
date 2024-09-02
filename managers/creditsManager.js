import Cookie from 'js-cookie';
import axios from 'axios'

const endpoint = process.env.NEXT_PUBLIC_BASE_URL

const headers = {
    'Content-Type': 'application/json',
    'Authorization': Cookie.get('authToken')
}

export async function buyCredits(package_number) {
    let response = await axios.post(endpoint + "purchase_credits",
        { package_number },
        { headers: headers });

    if (response) {
        return response.data.response;
    }
}