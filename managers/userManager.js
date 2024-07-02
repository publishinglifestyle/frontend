import Cookie from 'js-cookie';
import axios from 'axios'

const endpoint = "https://chatbot-books-9d87f0a90bbe.herokuapp.com/"
//const endpoint = "http://localhost:8090/"
const headers = {
    'Content-Type': 'application/json',
}

export async function signUp(first_name, last_name, email, password, password_2) {
    let response = await axios.post(endpoint + "sign_up",
        {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password": password,
            "password_2": password_2
        }, { headers: headers });

    if (response) {
        return response.data;
    }
}

export async function logIn(email, password) {
    let response = await axios.post(endpoint + "login",
        {
            "email": email,
            "password": password,
        }, { headers: headers });

    if (response) {
        return response.data.response;
    }
}

export async function getUser() {
    let response = await axios.get(endpoint + "get_user", {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': Cookie.get('authToken')
        }
    });

    if (response) {
        return response.data.response;
    }
}

export async function updateProfile(first_name, last_name, email) {
    let response = await axios.post(endpoint + "update_profile",
        {
            first_name, last_name, email
        }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': Cookie.get('authToken')
        }
    });

    if (response) {
        return response.data.response;
    }
}

export async function deleteUser(user_id) {
    let response = await axios.post(endpoint + "delete_user",
        {
            user_id
        }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': Cookie.get('authToken')
        }
    });

    if (response) {
        return response.data.response;
    }
}

export async function getProfilePic(user_id) {
    let response = await axios.get(endpoint + "get_profile_pic", {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': Cookie.get('authToken')
        },
        responseType: 'blob'
    });

    if (response) {
        console.log(response.data)
        const url = URL.createObjectURL(response.data);
        return url;
    }
}

export async function uploadProfilePic(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
            const base64String = reader.result.split(',')[1];

            try {
                const response = await axios.post(endpoint + "upload_profile_pic", { base64String }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': Cookie.get('authToken')
                    }
                });
                resolve(response.data);
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

export async function changePassword(new_password, new_password_2) {
    let response = await axios.post(endpoint + "change_password",
        {
            "new_password": new_password,
            "new_password_2": new_password_2
        }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': Cookie.get('authToken')
        }
    });

    if (response) {
        return response.data.response;
    }
}

export async function initiatePasswordReset(email) {
    let response = await axios.post(endpoint + "initiate_password_reset",
        {
            "email": email
        }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response) {
        console.log(response.data)
        return response.data.response;
    }
}

export async function resetPassword(token, password_1, password_2) {
    let response = await axios.post(endpoint + "reset_password",
        {
            token, password_1, password_2
        }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response) {
        return response.data.response;
    }
}