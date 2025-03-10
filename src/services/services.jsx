import axios from "axios";
import BASE_URL from "../utils/apiConfig";
import axiosInstance from "./axiosConfig"; //baseURL is provided by the instance.

export const checkNeonDBStatus = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/neon-status`);
        if (!response.ok) throw new Error("Database unreachable");

        const data = await response.json();
        return data.status === "operational" ? "operational" : "error"; // Returns "error" if down
    } catch (error) {
        console.error("NeonDB health check failed:", error);
        return "error"; // Return "error" to trigger fallback UI
    }
};

export const checkBackendStatus = async () => {
    try {
        await axios.get(`${BASE_URL}/api/health`);
        return true; // Backend is up
    } catch (error) {
        return false; // Backend is down
    }
};

export const loginService = async (username, password) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/login`, {
            username,
            password // Send password as is (let backend hash & verify)
        });

        return response.data; // Return the token
    } catch (error) {
        throw new Error("Invalid username or password");
    }
};


export const addMemberService = async (formData) => {
    try {
        const response = await axiosInstance.post(`/api/members`, formData);
        return response.data;
        // eslint-disable-next-line no-unused-vars
    } catch (error) {
        throw new Error("Failed to add member.");
    }
};

export const fetchMembers = async () => {
    try {
        const response = await axiosInstance.get(`/api/members`);
        return response.data.map(member => ({
            ...member,
            borrowed_books_count: member.borrowed_books_count || 0
        }));
    } catch (error) {
        console.error("Error fetching members:", error);
        throw error;
    }
};

export const fetchMemberLoans = async (memberId) => {
    try {
        const response = await axiosInstance.get(`/api/members/${memberId}/loans`);
        return response.data.loans;
    } catch (error) {
        console.error(`Error fetching loans for member ${memberId}:`, error);
        throw error;
    }
};

export const updateMemberService = async (id, memberData) => {
    try {
        const response = await axiosInstance.put(`/api/members/${id}`, memberData);
        return response.data;
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
};

export const deleteMemberService = async (id) => {
    try {
        const response = await axiosInstance.delete(`/api/members/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting member:', error);
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

export const updateBookService = async (id, bookData) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/api/books/${id}`,bookData);
        return response.data;
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
};