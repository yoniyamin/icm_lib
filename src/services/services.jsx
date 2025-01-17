import axios from "axios";
import BASE_URL from "../utils/apiConfig";
import axiosInstance from "./axiosConfig"; //baseURL is provided by the instance.

export const addMemberService = async (formData) => {
    try {
        const response = await axiosInstance.post(`/api/members`, formData);
        return response.data;
    } catch (error) {
        throw new Error("Failed to add member.");
    }
};

export const fetchMembers = async () => {
    try {
        const response = await axiosInstance.get(`/api/members`);
        return response.data;
    } catch (error) {
        console.error("Error fetching members:", error);
        throw error;
    }
};

export const fetchBooks = async (orderBy = 'desc') => {
    try {
        const response = await axios.get(`${BASE_URL}/api/books?order_by=${orderBy}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error);
        throw error;
    }
};

export const addBookService = async (bookData) => {
    try {
        const response = await axiosInstance.post(`/api/books`, bookData, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error adding book:", error);
        throw new Error("Failed to add book.");
    }
};

export const downloadQrCode = async (qrCodeFileName) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/qr_codes/${qrCodeFileName}`, {
            responseType: 'blob', // Ensure the response is handled as a file
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', qrCodeFileName); // Set the file name
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Error downloading QR code:", error);
        throw error;
    }
};