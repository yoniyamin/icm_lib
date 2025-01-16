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
    const { language, toggleLanguage } = useLanguage();
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

    const borrowerOptions = members.map((member) => ({
        value: member.id,
        label: member.parent_name,
    }));

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

                const updatedBorrowedBooks = await fetchBorrowedBooks();
                const updatedLoanHistory = await fetchLoanHistory(null, showAllLoans);

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
                    <div className="flex gap-4">
                        {/* Borrower Dropdown */}
                        <Select
                            options={borrowerOptions}
                            placeholder={LABELS.borrowed_by}
                            value={selectedBorrower ? { value: selectedBorrower.id, label: selectedBorrower.parent_name } : null}
                            onChange={(selectedOption) => {
                                if (selectedOption) {
                                    const selectedMember = members.find((member) => member.id === selectedOption.value);
                                    setSelectedBorrower(selectedMember);
                                } else {
                                    setSelectedBorrower(null); // Clear selection
                                }
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

                        {/* Book Title Dropdown */}
                        <select
                            className="w-full p-2 border rounded"
                            style={{borderColor: brandColors.coral}}
                            onChange={(e) => {
                                const selectedBook = availableBooks.find((book) => book.qr_code === e.target.value);
                                setSelectedBook(selectedBook);
                                setSelectedBookQR(e.target.value);
                                if (selectedBook) {
                                    setBookState(selectedBook.delivery_status || '');
                                }
                            }}
                            value={selectedBookQR || ''} // Use selectedBookQR explicitly
                        >
                            <option value="">{LABELS.Select_Book}</option>
                            {availableBooks.map((book) => (
                                <option key={book.qr_code} value={book.qr_code}>
                                    {book.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Book State Dropdown */}
                    {selectedBook && (
                        <select
                            className="w-full p-2 border rounded mt-2"
                            style={{borderColor: brandColors.coral}}
                            onChange={(e) => setBookState(e.target.value)}
                            value={bookState}
                        >
                            <option value="">{LABELS.Select_Book_State}</option>
                            <option value="כמו חדש">כמו חדש</option>
                            <option value="מצויין - בלאי בלתי מורגש">מצויין - בלאי בלתי מורגש</option>
                            <option value="טוב - בלאי קל">טוב - בלאי קל</option>
                        </select>
                    )}

                    {/* Display Book Information */}
                    {selectedBook && (
                        <div className="bg-gray-100 p-4 rounded mt-4">
                            <h3 className="font-bold text-lg">{selectedBook.title}</h3>
                            <p className="text-sm">{LABELS.author}: {selectedBook.author}</p>
                            <p className="text-sm">{LABELS.year_of_publication}: {selectedBook.year_of_publication}</p>
                            <p className="text-sm">{LABELS.cover_type}: {selectedBook.cover_type}</p>
                            <p className="text-sm">{LABELS.pages}: {selectedBook.pages}</p>
                            <p className="text-sm">{LABELS.recommended_age}: {selectedBook.recommended_age}</p>
                            <p className="text-sm">{LABELS.Select_Book_State}: {selectedBook.book_condition}</p>
                        </div>
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

                    {/* Borrow History Section */}
                    <div className={`loan-history-container ${language === 'he' ? 'rtl' : ''}`}>
                        {loanHistory.map((loan) => (
                            <div
                                className={`loan-history-card ${!loan.returned_at ? 'active-loan flex items-center' : ''} ${language === 'he' ? 'rtl' : ''}`}
                                key={loan.id}
                            >
                                <div className="loan-history-card-title">{loan.book_title}</div>
                                <div
                                    className="loan-history-card-detail">{LABELS.borrowed_by}: {loan.borrower_name}</div>
                                <div className="loan-history-card-detail">{LABELS.borrow_date}: {loan.borrowed_at}</div>
                                <div
                                    className="loan-history-card-detail">{LABELS.return_date}: {loan.returned_at || "Not Returned"}</div>
                                <div
                                    className="loan-history-card-detail">{LABELS.delivery_status}: {loan.book_state || "N/A"}</div>
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
                        <label className="ml-4 flex items-center">
                            <input
                                id="checkbox_showall"
                                type="checkbox"
                                checked={showAllLoans}
                                onChange={handleShowAllChange}
                                className="mr-2"
                            />
                            {LABELS.ShowAllLoans}
                        </label>
                    </div>


                    {/* Reminder Section */}
                    {showReminderOptions && loanHistory.filter(loan => !loan.returned_at).length > 0 && (
                        <div className="reminder-section bg-gray-100 p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">Send Reminders</h3>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedLoansForReminder.length === loanHistory.filter(loan => !loan.returned_at).length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                // Select all non-returned loans
                                                const nonReturnedLoans = loanHistory.filter(loan => !loan.returned_at);
                                                setSelectedLoansForReminder(nonReturnedLoans);
                                            } else {
                                                // Deselect all
                                                setSelectedLoansForReminder([]);
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    Select All
                                </label>
                            </div>

                            {/* Send Reminders Button */}
                            <button
                                className="w-full py-2 px-4 rounded text-white"
                                style={{backgroundColor: brandColors.coral}}
                                onClick={handleSendReminders}
                                disabled={selectedLoansForReminder.length === 0 || isReminderSending}
                            >
                                {isReminderSending ? 'Sending...' : `Send ${selectedLoansForReminder.length} Reminders`}
                            </button>
                        </div>
                    )}

                    {loanHistory.length > 0 && (
                        <div className={`loan-history-container ${language === 'he' ? 'rtl' : ''}`}>
                            {loanHistory.map((loan) => (
                                <div
                                    className={`loan-history-card ${!loan.returned_at ? 'active-loan' : ''} ${language === 'he' ? 'rtl' : ''}`}
                                    key={loan.id}
                                    onClick={() => {
                                        // Update the selectedBook state
                                        if (!loan.returned_at) {
                                            console.log("Current loan:", loan); // See the full loan object
                                            console.log("All borrowed books:", borrowedBooks); // See all borrowed books
                                            const matchingBook = borrowedBooks.find((book) => {
                                                console.log("Comparing book:", {
                                                    "loan book_id": loan.book_id,
                                                    "book id": book.id,
                                                    "match": book.id === loan.book_id
                                                });
                                                return book.id === loan.book_id;
                                            });

                                            console.log("Matching book result:", matchingBook);

                                            if (matchingBook) {
                                                setSelectedBorrowedBook(matchingBook); // For return-specific logic
                                                setSelectedBorrowedBookQR(matchingBook.qr_code); // Sync with the dropdown
                                                setSelectedBook(matchingBook); // General book selection
                                                setBookState(matchingBook.delivery_status || ''); // Update book state if applicable
                                            } else {
                                                alert('Book not found in borrowed books.');
                                            }
                                            // Scroll to top
                                            window.scrollTo({top: 0, behavior: 'smooth'});
                                        }
                                    }}
                                    style={{cursor: 'pointer'}} // Make the card look clickable
                                >
                                    {showReminderOptions && !loan.returned_at && (
                                        <input
                                            type="checkbox"
                                            checked={selectedLoansForReminder.some((l) => l.id === loan.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedLoansForReminder([...selectedLoansForReminder, loan]);
                                                } else {
                                                    setSelectedLoansForReminder(selectedLoansForReminder.filter((l) => l.id !== loan.id));
                                                }
                                                // Stop event propagation to prevent card click
                                                e.stopPropagation();
                                            }}
                                            className="mr-2 ml-2 flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-grow">
                                        <div className="loan-history-card-title">{loan.book_title}</div>
                                        <div
                                            className="loan-history-card-detail">{LABELS.borrowed_by}: {loan.borrower_name}</div>
                                        <div
                                            className="loan-history-card-detail">{LABELS.borrow_date}: {loan.borrowed_at}</div>
                                        <div
                                            className="loan-history-card-detail">{LABELS.return_date}: {loan.returned_at || 'Not Returned'}</div>
                                        <div
                                            className="loan-history-card-detail">{LABELS.delivery_status}: {loan.book_state || 'N/A'}</div>
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
