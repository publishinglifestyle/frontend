import axios from "axios";
import Cookie from "js-cookie";

import { baseURL } from "@/constant/urls";

const headers = {
  "Content-Type": "application/json",
  Authorization: Cookie.get("authToken"),
};

export const axiosInstance = axios.create({
  baseURL,
  headers,
});
