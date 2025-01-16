import axios from "axios";
const baseURL = "https://religious-cherianne-dbprops-ef8ee171.koyeb.app";
//const baseURL = "http://localhost:5000";

export async function fetchBooks() {
    const response = await axios.get(`${baseURL}/api/books`);
    return await response.data;
}

export async function fetchAvailableBooks() {
    const response = await axios.get(`${baseURL}/api/available_books`);
    return await response.data;
}

export async function fetchBorrowedBooks() {
    const response = await axios.get(`${baseURL}/api/borrowed_books`);
    return await response.data;
}

export async function fetchBookByQRCode(qrCode) {
    const response = await axios.get(`${baseURL}/api/book/${qrCode}`);
    return await response.data;
}

export async function fetchMembers() {
    const response = await axios.get(`${baseURL}/api/members`);
    console.log("API Response:", response.data);
    return response.data.members || response.data;
}

export async function addMember(parent_name, kid_name, email) {
    const response = await axios.post(`${baseURL}/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_name, kid_name, email }),
    });
    return await response.data;
}

export const borrowBook = async (qr_code, member_id, book_state) => {
    try {
        const response = await axios.post(`${baseURL}/api/book/borrow`, {
            qr_code,
            member_id,
            book_state,
        });
        return response.data;
    } catch (error) {
        console.error("Error borrowing book:", error.response || error);
        throw error;
    }
};

export const returnBook = async (qr_code) => {
    try {
        const response = await axios.post(`${baseURL}/api/book/return`, { qr_code });
        return response.data;
    } catch (error) {
        console.error("Error returning book:", error);
        throw error;
    }
};

export async function updateBookStatus(qrCode, status) {
    const response = await axios.put(`${baseURL}/api/books/${qrCode}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    return await response.data;
}

export async function fetchBorrowingHistory(qrCode) {
    const response = await axios.get(`${baseURL}/api/borrowing_history`, {
        params: { qr_code: qrCode },
    });
    return response.data;
}

export async function fetchLoanHistory(qrCode, showAll) {
    const response = await axios.get(`${baseURL}/api/loans/history`, {
        params: {
            qr_code: qrCode || "",
            show_all: showAll ? "true" : "false",
        },
    });
    return response.data;
}

export async function fetchOpenLoans(qrCode = null) {
    const response = await axios.get(`${baseURL}/api/open_loans`, {
        params: { qr_code: qrCode },
    });
    return response.data;
}

export const sendReminder = async (loanId, subject, loanDetails) => {
    try {
        const response = await axios.post(`${baseURL}/api/send-reminder`, {
            loan_id: loanId,
            subject,
            loan_details: loanDetails
        });

        return response.data; // Return backend response
    } catch (error) {
        console.error(`Error sending reminder for loan_id ${loanId}:`, error);

        // 🔥 Extract the backend error message if it exists
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';

        return { success: false, error: errorMessage };
    }
};


export const fetchLastReminderForLoan = async (loanId) => {
    try {
        const response = await axios.get(`${baseURL}/api/reminders/last/${loanId}`);
        const { sent_at } = response.data;
        return { sent_at };
    } catch (error) {
        console.error(`Error fetching last reminder for loan_id ${loanId}:`, error);
        return null;
    }
};

