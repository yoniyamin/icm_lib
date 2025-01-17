import axios from 'axios';
import BASE_URL from "../utils/apiConfig";

const language = navigator.language || 'en-US';


export const generateBooksReport = async (orderBy = 'desc', sortField = 'title', includeHistory = true) => {
    try {
        const params = new URLSearchParams({
            order_by: orderBy,
            sort_column: sortField,
            include_history: includeHistory.toString()
        });

        const response = await axios.get(`${BASE_URL}/api/generate_books_report?${params.toString()}`, {
            headers: { 'Accept-Language': language },
            responseType: 'blob' // Important to receive binary data
        });

        return response.data; // Return the file blob data
    } catch (error) {
        console.error('Error generating books report:', error);
        throw error;
    }
};

export const generateInventoryReport = async (orderBy = 'desc', sortField = 'title', includeBorrowed = false) => {
    try {
        const params = new URLSearchParams({
            order_by: orderBy,
            sort_column: sortField,
            include_borrowed: includeBorrowed.toString()
        });

        const response = await axios.get(`${BASE_URL}/api/generate_inventory_report?${params.toString()}`, {
            headers: { 'Accept-Language': language }, // Include language header
            responseType: 'blob' // Important to receive binary data
        });

        return response.data; // Return the file blob data
    } catch (error) {
        console.error('Error generating inventory report:', error);
        throw error;
    }
};
