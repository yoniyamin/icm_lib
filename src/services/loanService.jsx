import axios from "axios";
import BASE_URL from "../utils/apiConfig";
import axiosInstance from "./axiosConfig.js";
import { fetchMemberLoans } from "./services.jsx";


export async function fetchBooks() {
    const response = await axios.get(`${BASE_URL}/api/books`);
    return await response.data;
}

export async function fetchAvailableBooks() {
    const response = await axios.get(`${BASE_URL}/api/available_books`);
    return await response.data;
}

export async function fetchBorrowedBooks() {
    try {
        const response = await axios.get(`${BASE_URL}/api/borrowed_books`);
        console.log("Borrowed Books Response:", response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error("Error fetching borrowed books:", error.response || error);
        throw error;
    }
}

export async function fetchBookByQRCode(qrCode) {
    const response = await axios.get(`${BASE_URL}/api/book/${qrCode}`);
    return await response.data;
}

export async function fetchMembers() {
    const response = await axiosInstance.get(`/api/members`);
    console.log("API Response:", response.data);
    return response.data.members || response.data;
}

export async function addMember(parent_name, kid_name, email) {
    const response = await axiosInstance.post(`/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_name, kid_name, email }),
    });
    return await response.data;
}

export const borrowBook = async (qr_code, member_id, book_state) => {
    try {
        const response = await axiosInstance.post(`/api/book/borrow`, {
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
        const response = await axiosInstance.post(`/api/book/return`, { qr_code });
        return response.data;
    } catch (error) {
        console.error("Error returning book:", error);
        throw error;
    }
};

export async function updateBookStatus(qrCode, status) {
    const response = await axiosInstance.put(`/api/books/${qrCode}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    return await response.data;
}

export async function fetchBorrowingHistory(qrCode) {
    const response = await axios.get(`${BASE_URL}/api/borrowing_history`, {
        params: { qr_code: qrCode },
    });
    return response.data;
}

export async function fetchLoanHistory(qrCode, showAll) {
    const response = await axios.get(`${BASE_URL}/api/loans/history`, {
        params: {
            qr_code: qrCode || "",
            show_all: showAll ? "true" : "false",
        },
    });
    return response.data;
}

export async function fetchOpenLoans(qrCode = null) {
    const response = await axios.get(`${BASE_URL}/api/open_loans`, {
        params: { qr_code: qrCode },
    });
    return response.data;
}

export const sendReminder = async (loanId, subject, loanDetails, language = 'en') => {
    try {
        const response = await axiosInstance.post(`/api/send-reminder`, {
            loan_id: loanId,
            subject,
            loan_details: loanDetails,
            language
        });
        return response.data;
    } catch (error) {
        console.error(`Error sending reminder for loan_id ${loanId}:`, error);
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        return { success: false, error: errorMessage };
    }
};


export const fetchLastReminderForLoan = async (loanId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/reminders/last/${loanId}`);
        const { sent_at } = response.data;
        return { sent_at };
    } catch (error) {
        console.error(`Error fetching last reminder for loan_id ${loanId}:`, error);
        return null;
    }
};

const shouldFallbackToPerLoan = (error) => {
    const status = error.response?.status;
    if (!status) return false;
    if (status === 405) return true;
    if (status === 404) {
        const data = error.response.data;
        if (typeof data === "string") return true;
        if (!data || typeof data !== "object") return true;
        if (data.success === false && data.error) return false;
    }
    return false;
};

const getOpenMemberLoans = (loans) =>
    (loans || []).filter((loan) => !loan.returned_at);

const sendMemberReminderPerLoan = async (member, language = "en") => {
    const loans = await fetchMemberLoans(member.id);
    const openLoans = getOpenMemberLoans(loans);
    if (openLoans.length === 0) {
        return { success: false, error: "No borrowed books", mode: "per_loan" };
    }

    const subject = language === "he" ? "תזכורת החזרת ספר" : "Book Return Reminder";
    const borrowerName = member.parent_name;

    const results = await Promise.all(
        openLoans.map(async (loan) => {
            const loanId = loan.id ?? loan.loan_id;
            const response = await sendReminder(
                loanId,
                subject,
                {
                    borrower_name: borrowerName,
                    book_title: loan.book_title,
                    borrowed_at: loan.borrowed_at,
                },
                language
            );
            return { success: response.success, loanId, error: response.error };
        })
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success);

    if (successful > 0) {
        return {
            success: true,
            book_count: successful,
            failed_count: failed.length,
            mode: "per_loan",
            message: failed.length
                ? `Sent ${successful} of ${openLoans.length} reminders`
                : `Sent ${successful} reminders`,
        };
    }

    const errorMessages = failed.map((f) => f.error).filter(Boolean).join("; ");
    return {
        success: false,
        error: errorMessages || "Failed to send reminders",
        mode: "per_loan",
    };
};

export const sendMemberGeneralReminder = async (member, language = "en") => {
    const subject = language === "he" ? "תזכורת החזרת ספרים" : "Book Return Reminder";

    try {
        const response = await axiosInstance.post("/api/send-member-reminder", {
            member_id: member.id,
            language,
            subject,
        });
        return { ...response.data, mode: response.data.mode || "combined" };
    } catch (error) {
        if (shouldFallbackToPerLoan(error)) {
            return sendMemberReminderPerLoan(member, language);
        }
        const errorMessage = error.response?.data?.error || error.message || "Unknown error";
        return { success: false, error: errorMessage, mode: "combined" };
    }
};

