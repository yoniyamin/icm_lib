import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"

export const addMemberService = async (formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/members`, formData);
        return response.data;
    } catch (error) {
        throw new Error("Failed to add member.");
    }
};

export const fetchMembers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/members`);
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
        const response = await axios.post(`${BASE_URL}/api/books`, bookData, {
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