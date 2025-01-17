import axios from "axios";
import BASE_URL from "../utils/apiConfig";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
});

// Add the Authorization header dynamically
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
