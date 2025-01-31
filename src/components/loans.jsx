// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { QrCode, Mail } from 'lucide-react';
import { fetchMembers, fetchAvailableBooks, fetchBookByQRCode, borrowBook, returnBook,
    fetchBorrowedBooks, fetchLoanHistory, sendReminder, fetchLastReminderForLoan } from '../services/loanService';
import QRCodeScanner from '../services/QRCodeScanner';
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';


const brandColors = {
    coral: '#F38181',
    teal: '#4ECAC7',
    yellow: '#FEC43C',
};

function Loans() {
    const [scanMode, setScanMode] = useState('');
    const [members, setMembers] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);
    const [selectedBorrower, setSelectedBorrower] = useState('');
    const [selectedBookQR, setSelectedBookQR] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [bookState, setBookState] = useState('');
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [selectedBorrowedBookQR, setSelectedBorrowedBookQR] = useState("");
    const [selectedBorrowedBook, setSelectedBorrowedBook] = useState(null);
    const [selectedBorrowerSuggestions, setSelectedBorrowerSuggestions] = useState([]);
    const [loanHistory, setLoanHistory] = useState([]);
    const [showAllLoans, setShowAllLoans] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // reminder options
    const [showReminderOptions, setShowReminderOptions] = useState(false);
    const [selectedLoansForReminder, setSelectedLoansForReminder] = useState([]);
    const [isReminderSending, setIsReminderSending] = useState(false);
    const { language, toggleLanguage, direction } = useLanguage();
    const LABELS = getFieldLabels(language);



    useEffect(() => {

        const loadInitialData = async () => {
            try {
                const [membersData, availableBooksData, borrowedBooksData] = await Promise.all([
                    fetchMembers(),
                    fetchAvailableBooks(),
                    fetchBorrowedBooks(),
                ]);

                setMembers(membersData);
                setAvailableBooks(availableBooksData);
                setBorrowedBooks(borrowedBooksData);
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const loadLoanHistory = async () => {
            try {
                let qrCode = null;
                if (scanMode === 'return') {
                    qrCode = selectedBorrowedBookQR || null;
                } else if (scanMode === 'borrow') {
                    qrCode = selectedBookQR || null;
                }

                const history = await fetchLoanHistory(qrCode, showAllLoans);

                // 🔥 Fetch the last reminder for each loan
                const updatedLoanHistory = await Promise.all(history.map(async (loan) => {
                    try {
                        const reminder = await fetchLastReminderForLoan(loan.id);
                        return { ...loan, last_reminder_date: reminder ? reminder.sent_at : null };
                    } catch (error) {
                        console.error(`Failed to fetch reminder for loan_id ${loan.id}:`, error);
                        return { ...loan, last_reminder_date: null };
                    }
                }));

                setLoanHistory(sortLoans(updatedLoanHistory));
            } catch (error) {
                console.error("Error fetching loan history:", error);
                setLoanHistory([]); // Clear history on error
            }
        };

        loadLoanHistory();
    }, [showAllLoans, scanMode, selectedBorrowedBookQR, selectedBookQR]);

    useEffect(() => {
        // Clear all selection states when switching modes
        setSelectedBook(null);
        setSelectedBookQR('');
        setSelectedBorrowedBook(null);
        setSelectedBorrowedBookQR('');
        setBookState('');
        setSelectedBorrower(null);
    }, [scanMode]);

    const borrowerOptions = members.map((member) => ({
        value: member.id,
        label: member.parent_name,
    }));

    const bookOptions = availableBooks.map((book) => ({
        value: book.qr_code,
        label: book.title,
    }));

    const handleLoanCardClick = (loan) => {
        if (!loan.returned_at) {
            const matchingBook = borrowedBooks.find((book) => book.id === loan.book_id);

            if (matchingBook) {
                setSelectedBorrowedBook(matchingBook);
                setSelectedBorrowedBookQR(matchingBook.qr_code);
                setSelectedBook(matchingBook);
                setBookState(matchingBook.delivery_status || '');
                window.scrollTo({top: 0, behavior: 'smooth'});
            } else {
                alert('Book not found in borrowed books.');
            }
        }
    };

    const handleReminderCheckboxChange = (e, loan) => {
        e.stopPropagation(); // Stop event from bubbling up
        if (e.target.checked) {
            setSelectedLoansForReminder([...selectedLoansForReminder, loan]);
        } else {
            setSelectedLoansForReminder(selectedLoansForReminder.filter((l) => l.id !== loan.id));
        }
    };

    // Handle sending reminders
    const handleSendReminders = async () => {
        setIsReminderSending(true);
        try {
            const results = await Promise.all(
                selectedLoansForReminder.map(async (loan) => {
                    try {
                        const response = await sendReminder(
                            loan.id,
                            'Book Return Reminder',
                            {
                                borrower_name: loan.borrower_name,
                                book_title: loan.book_title,
                                borrowed_at: loan.borrowed_at
                            }
                        );

                        if (response.success) {
                            console.log(`Reminder sent successfully for loan_id: ${loan.id}`);

                            const updatedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

                            setLoanHistory((prevLoanHistory) =>
                                prevLoanHistory.map((loanItem) =>
                                    loanItem.id === loan.id
                                        ? { ...loanItem, last_reminder_date: updatedDate }
                                        : loanItem
                                )
                            );

                            const lastReminderResponse = await fetchLastReminderForLoan(loan.id);
                            if (lastReminderResponse?.sent_at) {
                                setLoanHistory((prevLoanHistory) =>
                                    prevLoanHistory.map((loanItem) =>
                                        loanItem.id === loan.id
                                            ? { ...loanItem, last_reminder_date: lastReminderResponse.sent_at }
                                            : loanItem
                                    )
                                );
                            }
                        } else {
                            console.error(`Failed to send reminder for loan_id: ${loan.id} - ${response.error}`);
                        }

                        return { success: response.success, loanId: loan.id, error: response.error };
                    } catch (error) {
                        console.error(`Error sending reminder for loan_id ${loan.id}:`, error);
                        return { success: false, loanId: loan.id, error: error.message };
                    }
                })
            );

            // 🔥 Count successful and failed reminders
            const successfulReminders = results.filter(result => result.success).length;
            const failedReminders = results.filter(result => !result.success);

            if (successfulReminders > 0) {
                alert(`Sent ${successfulReminders} reminders successfully!`);
            }

            if (failedReminders.length > 0) {
                const errorMessages = failedReminders.map(fail =>
                    `Loan ID: ${fail.loanId} - ${fail.error}`
                ).join('\n');

                alert(`Failed to send ${failedReminders.length} reminders.\n\n${errorMessages}`);
            }

            setSelectedLoansForReminder([]);
            setShowReminderOptions(false);
        } catch (error) {
            console.error('Failed to send reminders:', error);
            alert('Failed to send reminders. Please check your email service configuration.');
        } finally {
            setIsReminderSending(false);
        }
    };


    // Handle checkbox state and prevent additional requests
    const handleShowAllChange = async (e) => {
        const newShowAll = e.target.checked;
        setShowAllLoans(newShowAll);

        try {
            let qrCode = null;
            if (scanMode === 'return') {
                qrCode = selectedBorrowedBookQR || null;
            } else if (scanMode === 'borrow') {
                qrCode = selectedBookQR || null;
            }

            const history = await fetchLoanHistory(qrCode, newShowAll);
            setLoanHistory(sortLoans(history));
        } catch (error) {
            console.error("Error fetching loan history:", error);
            setLoanHistory([]); // Clear history on error
        }
    };


    const handleScan = async () => {
        setIsProcessing(true);
        setIsScanning(true);
    };

    const handleScanResult = async (decodedText) => {
        try {
            console.log("Handling scan result...");
            setIsScanning(false);
            setIsProcessing(true);

            const book = await fetchBookByQRCode(decodedText);

            if (book) {
                if (scanMode === 'borrow') {
                    setSelectedBookQR(decodedText);
                    setSelectedBook(book);
                } else if (scanMode === 'return') {
                    setSelectedBorrowedBookQR(decodedText);
                    setSelectedBorrowedBook(book);
                    setSelectedBook(book);
                    setSelectedBorrowedBook(book);
                }

                setBookState(book.delivery_status);

                if (book.loan_status === 'borrowed') {
                    const loanInfo = await fetchLoanHistory(decodedText);
                    if (loanInfo && loanInfo.length > 0) {
                        const currentLoan = loanInfo[0];
                        alert(
                            `The book "${book.title}" was borrowed by ${currentLoan.borrower_name} on ${currentLoan.borrowed_at}.`
                        );
                    } else {
                        alert(`The book "${book.title}" is marked as borrowed, but no loan history is available.`);
                    }
                } else {
                    alert(`The book "${book.title}" is available.`);
                }
            } else {
                alert("Book not found for the given QR code.");
            }
        } catch (error) {
            console.error("Error processing scan result:", error);
            alert("An error occurred while processing the QR code.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleScanError = (error) => {
        console.error('QR Scan Error:', error);
        setIsScanning(false);
        setIsProcessing(false);
        alert("Failed to scan QR code. Please try again.");
    };

    const handleScanCancel = () => {
        setIsScanning(false);
        setIsProcessing(false);
    };


    // Handle borrowing of book
    const handleBorrow = async () => {
        if (selectedBorrower && selectedBook && bookState) {
            try {
                const result = await borrowBook(selectedBook.qr_code, selectedBorrower.id, bookState);
                if (result.message) {
                    alert("Book borrowed successfully!");

                    // Reset form and refresh book lists
                    setSelectedBook(null);
                    setSelectedBorrower(null);
                    setBookState("");

                    const updatedAvailableBooks = await fetchAvailableBooks();
                    const updatedBorrowedBooks = await fetchBorrowedBooks();
                    const updatedLoanHistory = await fetchLoanHistory(null, showAllLoans);

                    setAvailableBooks(updatedAvailableBooks);
                    setBorrowedBooks(updatedBorrowedBooks);
                    setLoanHistory(sortLoans(updatedLoanHistory));
                } else {
                    alert("Error borrowing book.");
                }
            } catch (error) {
                console.error("Failed to borrow book:", error);
            }
        } else {
            alert("Please select a borrower, book, and book state.");
        }
    };


    // Confirm return of a book
    const confirmReturn = async () => {
        if (!selectedBorrowedBookQR) {
            alert("Please select a book to return.");
            return;
        }

        try {
            const response = await returnBook(selectedBorrowedBookQR);

            if (response.success) {
                alert("Book returned successfully!");

                // Reset form and refresh lists
                // Clear the selected states
                setSelectedBorrowedBook(null);
                setSelectedBorrowedBookQR('');
                setSelectedBook(null);
                setBookState('');

                const updatedAvailableBooks = await fetchAvailableBooks();
                const updatedBorrowedBooks = await fetchBorrowedBooks();
                const updatedLoanHistory = await fetchLoanHistory(null, showAllLoans);

                setAvailableBooks(updatedAvailableBooks);
                setBorrowedBooks(updatedBorrowedBooks);
                setLoanHistory(sortLoans(updatedLoanHistory));
            } else {
                alert("Failed to return the book. Please try again.");
            }
        } catch (error) {
            console.error("Error returning book:", error);
            alert("An error occurred while returning the book. Please try again.");
        }
    };

    // Sort loan history
    const sortLoans = (loans) => {
        return loans.sort((a, b) => {
            if (!a.return_date && b.return_date) return -1; // Open loans first
            if (a.return_date && !b.return_date) return 1;
            return new Date(b.loan_start_date) - new Date(a.loan_start_date); // Most recent first
        });
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">

            {/* QR Code Scanner Modal */}
            {isScanning && (
                <div className="scanner-modal">
                    <QRCodeScanner
                        onScanSuccess={handleScanResult}
                        onScanError={handleScanError}
                        onScanCancel={handleScanCancel}
                    />
                </div>
            )}
            <div className="flex gap-4 mb-4">
                {/* Language Toggle Button */}
                <div className="absolute top-4 left-4">
                    <button
                        className="w-12 h-12 flex items-center justify-center rounded-full border border-teal-500 bg-white text-teal-500 shadow-md"
                        onClick={toggleLanguage}
                    >
                        {language === 'en' ? 'HE' : 'EN'}
                    </button>
                </div>
                <button
                    className={`flex-1 py-2 px-4 rounded ${scanMode === 'borrow' ? 'text-white' : 'text-gray-800'}`}
                    style={{
                        backgroundColor: scanMode === 'borrow' ? brandColors.coral : 'transparent',
                        borderColor: brandColors.coral,
                        borderWidth: '1px'
                    }}
                    onClick={() => setScanMode('borrow')}
                >
                    {LABELS.borrow}
                </button>
                <button
                    className={`flex-1 py-2 px-4 rounded ${scanMode === 'return' ? 'text-white' : 'text-gray-800'}`}
                    style={{
                        backgroundColor: scanMode === 'return' ? brandColors.coral : 'transparent',
                        borderColor: brandColors.coral,
                        borderWidth: '1px'
                    }}
                    onClick={() => setScanMode('return')}
                >
                    {LABELS.return}
                </button>
            </div>

            {scanMode === 'borrow' && (
                <div className="space-y-4">
                    {/* Borrower Dropdown */}
                    <Select
                        options={borrowerOptions}
                        placeholder={LABELS.borrower}
                        value={selectedBorrower ? { value: selectedBorrower.id, label: selectedBorrower.parent_name } : null}
                        onChange={(selectedOption) => {
                            const selectedMember = members.find((member) => member.id === selectedOption?.value);
                            setSelectedBorrower(selectedMember || null);
                        }}
                        isClearable
                        styles={{
                            control: (provided) => ({
                                ...provided,
                                borderColor: brandColors.coral,
                                borderRadius: '4px',
                                boxShadow: 'none',
                                '&:hover': { borderColor: brandColors.teal },
                            }),
                        }}
                        className="w-full"
                        classNamePrefix="borrower-select"
                    />

                    {/* Display Book title */}
                    <Select
                        options={bookOptions}
                        placeholder={LABELS.Select_Book}
                        value={selectedBook ? { value: selectedBook.qr_code, label: selectedBook.title } : null}
                        onChange={(selectedOption) => {
                            const selectedBook = availableBooks.find((book) => book.qr_code === selectedOption?.value);
                            setSelectedBook(selectedBook || null);
                            setSelectedBookQR(selectedOption?.value || '');
                            setBookState(selectedBook?.delivery_status || '');
                        }}
                        isClearable
                        styles={{
                            control: (provided) => ({
                                ...provided,
                                borderColor: brandColors.coral,
                                borderRadius: '4px',
                                boxShadow: 'none',
                                '&:hover': { borderColor: brandColors.teal },
                            }),
                        }}
                        className="w-full"
                        classNamePrefix="book-select"
                    />

                    {/* Display Book Information */}
                    {selectedBook && (
                        <div
                            className={`bg-gray-100 p-4 rounded mt-4 ${language === 'he' ? 'rtl' : ''}`}
                        >
                            <h3 className="font-bold text-lg">{selectedBook.title}</h3>
                            <p className="text-sm">{LABELS.author}: {selectedBook.author}</p>
                            <p className="text-sm">{LABELS.description}: {selectedBook.description}</p>
                            <p className="text-sm">{LABELS.year_of_publication}: {selectedBook.year_of_publication}</p>
                            <p className="text-sm">{LABELS.cover_type}: {selectedBook.cover_type}</p>
                            <p className="text-sm">{LABELS.pages}: {selectedBook.pages}</p>
                            <p className="text-sm">{LABELS.recommended_age}: {selectedBook.recommended_age}</p>
                            <p className="text-sm">{LABELS.Select_Book_State}: {selectedBook.book_condition}</p>
                        </div>
                    )}

                    {/* Book State Dropdown */}
                    {selectedBook && (
                        <select
                            className="w-full p-2 border rounded mt-2"
                            style={{borderColor: brandColors.coral}}
                            onChange={(e) => setBookState(e.target.value)}
                            value={bookState}
                        >
                            <option value="">{LABELS.Select_Book_State}</option>
                            <option value="כמו חדש">{LABELS.new}</option>
                            <option value="מצויין - בלאי בלתי מורגש">{LABELS.good}</option>
                            <option value="טוב - בלאי קל">{LABELS.worn}</option>
                        </select>
                    )}



                    {/* QR Code Scan Button */}
                    <button
                        className="w-full flex items-center justify-center py-2 px-4 rounded text-white"
                        style={{backgroundColor: brandColors.coral}}
                        onClick={handleScan}
                    >
                        <QrCode className="w-4 h-4 mr-2"/>
                        {LABELS.ScanQR}
                    </button>

                    {/* Confirm Borrow Button */}
                    <button
                        className="w-full py-2 px-4 rounded text-white mt-2"
                        style={{backgroundColor: brandColors.coral}}
                        onClick={handleBorrow}
                    >
                        {LABELS.borrow}
                    </button>

                    {/* Available Books as Cards */}
                    <div className={`loan-history-container ${language === 'he' ? 'rtl' : ''}`}>
                        {availableBooks.map((book) => (
                            <div
                                key={book.qr_code}
                                className={`loan-history-card ${selectedBook?.qr_code === book.qr_code ? 'active-loan' : ''} ${language === 'he' ? 'rtl' : ''}`}
                                onClick={() => {
                                    setSelectedBook(book);
                                    setSelectedBookQR(book.qr_code);
                                    setBookState(book.delivery_status || '');
                                }}
                                style={{cursor: 'pointer'}}
                            >
                                {/* Header Section */}
                                <div className="loan-history-card-header">
                                    <h3 className="loan-history-card-title">{book.title}</h3>
                                </div>

                                {/* Body Section */}
                                <div className="loan-history-card-body">
                                    <p className="loan-history-card-detail">{LABELS.author}: {book.author}</p>
                                    <p className="loan-history-card-detail">{LABELS.year_of_publication}: {book.year_of_publication}</p>
                                    <p className="loan-history-card-detail">{LABELS.pages}: {book.pages}</p>
                                    <p className="loan-history-card-detail">{LABELS.recommended_age}: {book.recommended_age}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {scanMode === 'return' && (
                <div className="mt-6">
                    <div className="mt-4">
                        <select
                            value={selectedBorrowedBookQR || ''}
                            onChange={(e) => {
                                const qrCode = e.target.value;
                                setSelectedBorrowedBookQR(qrCode);

                                const matchingBook = borrowedBooks.find((book) => book.qr_code === qrCode);

                                if (matchingBook) {
                                    setSelectedBook(matchingBook);
                                    setBookState(matchingBook.delivery_status || '');
                                }
                            }}
                            className="w-full p-2 border rounded"
                            style={{borderColor: brandColors.coral}}
                        >
                            <option value="">{LABELS.Select_Book}</option>
                            {borrowedBooks.map((book) => (
                                <option key={book.qr_code} value={book.qr_code}>
                                    {book.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-4">
                        {/* QR Code Scan Button */}
                        <button
                            className="w-full flex items-center justify-center py-2 px-4 rounded text-white"
                            style={{backgroundColor: brandColors.coral}}
                            onClick={handleScan}
                        >
                            <QrCode className="w-4 h-4 mr-2"/>
                            {LABELS.ScanQR}
                        </button>

                        <button
                            className="w-full py-2 px-4 rounded text-white mt-2"
                            style={{backgroundColor: brandColors.coral}}
                            onClick={confirmReturn}
                            disabled={!selectedBorrowedBook}
                        >
                            {LABELS.return}
                        </button>
                        {/* Reminder Button */}
                        <button
                            className="w-full flex items-center justify-center py-2 px-4 rounded text-white mt-2"
                            style={{backgroundColor: brandColors.teal}}
                            onClick={() => setShowReminderOptions(!showReminderOptions)}
                        >
                            <Mail className="w-4 h-4 mr-2"/>
                            {LABELS.SendReminders}
                        </button>
                    </div>
                    <div className="flex items-center my-4">
                        <label className="ml-4 flex items-center cursor-pointer">
                            <input
                                id="checkbox_showall"
                                type="checkbox"
                                checked={showAllLoans}
                                onChange={handleShowAllChange}
                                className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                            />
                            <span className="ml-2">{LABELS.ShowAllLoans}</span>
                        </label>
                    </div>


                    {/* Reminder Section */}
                    {showReminderOptions && loanHistory.filter(loan => !loan.returned_at).length > 0 && (
                        <div className="reminder-section bg-gray-100 p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">{LABELS.SendReminders}</h3>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedLoansForReminder.length === loanHistory.filter(loan => !loan.returned_at).length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const nonReturnedLoans = loanHistory.filter(loan => !loan.returned_at);
                                                setSelectedLoansForReminder(nonReturnedLoans);
                                            } else {
                                                setSelectedLoansForReminder([]);
                                            }
                                        }}
                                        className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                                    />
                                    <span className="ml-2">{LABELS.select_all}</span>
                                </label>
                            </div>

                            {/* Send Reminders Button */}
                            <button
                                className="w-full py-2 px-4 rounded text-white"
                                style={{backgroundColor: brandColors.coral}}
                                onClick={handleSendReminders}
                                disabled={selectedLoansForReminder.length === 0 || isReminderSending}
                            >
                                {isReminderSending
                                    ? LABELS.sending_reminders
                                    : LABELS.send_x_reminders.replace("{count}", selectedLoansForReminder.length)}
                            </button>
                        </div>
                    )}

                    {loanHistory.length > 0 && (
                        <div className={`loan-history-container ${language === 'he' ? 'rtl' : ''}`}>
                            {loanHistory.map((loan) => (
                                <div
                                    className={`loan-history-card ${!loan.returned_at ? 'active-loan' : ''} ${language === 'he' ? 'rtl' : ''}`}
                                    key={loan.id}
                                    onClick={() => scanMode === 'return' && handleLoanCardClick(loan)}
                                >
                                    {/* Header Section */}
                                    <div className="loan-history-card-header">
                                        {showReminderOptions && !loan.returned_at && (
                                            <div onClick={e => e.stopPropagation()}>
                                                <label className="custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLoansForReminder.some((l) => l.id === loan.id)}
                                                        onChange={(e) => handleReminderCheckboxChange(e, loan)}
                                                        className="hidden-checkbox"
                                                    />
                                                    <span className="checkbox-mark"></span>
                                                </label>
                                            </div>
                                        )}
                                        <div className="loan-history-card-title">
                                            {loan.book_title}
                                        </div>
                                    </div>

                                    <div className="loan-history-card-body">
                                        <div className="loan-history-card-detail">
                                            {LABELS.borrowed_by}: {loan.borrower_name}
                                        </div>
                                        <div className="loan-history-card-detail">
                                            {LABELS.borrow_date}: {loan.borrowed_at}
                                        </div>
                                        <div className="loan-history-card-detail">
                                            {LABELS.return_date}: {loan.returned_at || 'Not Returned'}
                                        </div>
                                        <div className="loan-history-card-detail">
                                            {LABELS.delivery_status}: {loan.book_state || 'N/A'}
                                        </div>
                                        <div className="loan-history-card-detail">
                                            {LABELS.last_reminder}: {loan.last_reminder_date || 'No Reminders Sent'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Loans;
