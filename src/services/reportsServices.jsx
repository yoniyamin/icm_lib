import axiosInstance from "../services/axiosConfig";

const language = navigator.language || 'en-US';

export const generateBooksReport = async (orderBy = 'desc', sortField = 'title', includeHistory = true) => {
    try {
        const params = new URLSearchParams({
            order_by: orderBy,
            sort_column: sortField,
            include_history: includeHistory.toString(),
        });

        const response = await axiosInstance.get(
            `/api/generate_books_report?${params.toString()}`,
            {
                headers: { 'Accept-Language': language },
                responseType: 'blob', // Receive binary data
            }
        );

        return response.data;
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
            include_borrowed: includeBorrowed.toString(),
        });

        const response = await axiosInstance.get(
            `/api/generate_inventory_report?${params.toString()}`,
            {
                headers: { 'Accept-Language': language },
                responseType: 'blob',
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error generating inventory report:', error);
        throw error;
    }
};

export const generateQrCodesReport = async (startQr, endQr) => {
    try {
        const data = { start_qr: startQr, end_qr: endQr };
        const response = await axiosInstance.post(
            `/api/reports/qr_codes`,
            data,
            {
                headers: { 'Accept-Language': language },
                responseType: 'blob', // Receive binary PDF data
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error generating QR codes report:', error);
        throw error;
    }
};

export const fetchQrCodes = async () => {
    try {
        const response = await axiosInstance.get(`/api/qr_codes`, {
            headers: { 'Accept-Language': language },
        });
        return response.data; // Expected to be an array of filenames
    } catch (error) {
        console.error('Error fetching QR codes:', error);
        throw error;
    }
};
