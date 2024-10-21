import { BACKEND_URLS } from "@/constant/urls";
import { axiosInstance } from "@/utils/axios";

export async function buyCredits(package_number) {
    const response = await axiosInstance.post(BACKEND_URLS.stripe.purchaseCredits,
        { package_number })

    if (response) {
        return response.data.response;
    }
}