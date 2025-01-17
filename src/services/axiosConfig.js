import axios from "axios";
import BASE_URL from "../utils/apiConfig";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
});

// Add Authorization header dynamically
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        console.log("Token in localStorage:", token);
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle expired tokens
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            // Token expired or unauthorized
            localStorage.removeItem("authToken");
            alert("Session expired. Please log in again.");
            window.location.reload(); // Redirect to login
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
