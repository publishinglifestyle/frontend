import { FREE_CREDIT_KEY } from "@/constant/credits";
import { BACKEND_URLS } from "@/constant/urls";
import { axiosInstance } from "@/utils/axios";


export async function signUp(first_name, last_name, email, password, password_2) {
    const response = await axiosInstance.post(BACKEND_URLS.auth.signup,
        {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password": password,
            "password_2": password_2
        });

    if (response) {
        return response.data;
    }
}

export async function logIn(email, password) {
    const response = await axiosInstance.post(BACKEND_URLS.auth.login,
        {
            "email": email,
            "password": password,
        });

    if (response) {
        return response.data.response;
    }
}

export async function getUser(sendData=false) {

    const creditTokenPresent = typeof localStorage !="undefined" && sendData ? localStorage.getItem(FREE_CREDIT_KEY):"";

    const getUserUrl = sendData ? BACKEND_URLS.auth.getUser+`?creditToken=${creditTokenPresent}` : BACKEND_URLS.auth.getUser;

    const response = await axiosInstance.get(getUserUrl);

    if (creditTokenPresent){
        localStorage.removeItem(FREE_CREDIT_KEY);
    }

    if (response) {
        return response.data.response;
    }
}

export async function updateProfile(first_name, last_name, email) {
    const response = await axiosInstance.post(BACKEND_URLS.auth.updateProfile,
        {
            first_name, last_name, email
        });

    if (response) {
        return response.data.response;
    }
}

export async function deleteUser(user_id) {
    const response = await axiosInstance.post(BACKEND_URLS.auth.deleteUser,
        {
            user_id
        });

    if (response) {
        return response.data.response;
    }
}

export async function getProfilePic() {
    try {
        const response = await axiosInstance.get(BACKEND_URLS.auth.getProfilePic,
            {
                responseType: 'blob'
            });

        const url = URL.createObjectURL(response.data);

        return url;
    }
    catch {
        return "";
    }
}

export async function uploadProfilePic(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
            const base64String = reader.result.split(',')[1];

            try {
                const response = await axiosInstance.post(BACKEND_URLS.auth.uploadProflePic, { base64String });

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
    const response = await axiosInstance.post(BACKEND_URLS.auth.changePassword,
        {
            "new_password": new_password,
            "new_password_2": new_password_2
        });

    if (response) {
        return response.data.response;
    }
}

export async function initiatePasswordReset(email) {
    const response = await axiosInstance.post(
        BACKEND_URLS.auth.initiatePasswordReset,
        {
            "email": email
        });

    if (response) {
        return response.data.response;
    }
}

export async function resetPassword(token, password_1, password_2) {
    const response = await axiosInstance.post(
        BACKEND_URLS.auth.resetPassword,
        {
            token, password_1, password_2
        });

    if (response) {
        return response.data.response;
    }
}

export async function logInGoogle(access_token, req_type) {
    let response = await axiosInstance.post(
        BACKEND_URLS.auth.signupGoogle,
        {
            access_token, req_type
        });

    return {
        token: response.data.token,
        userExists: response.data.userExists ?? false
    };
}
