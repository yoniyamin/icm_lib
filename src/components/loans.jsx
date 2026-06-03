// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { QrCode, Mail } from 'lucide-react';
import { fetchMembers, fetchAvailableBooks, fetchBookByQRCode, borrowBook, returnBook,
    fetchBorrowedBooks, fetchLoanHistory, sendReminder, fetchLastReminderForLoan } from '../services/loanService';
import QRCodeScanner from '../services/QRCodeScanner';
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';
import { nameMatchesSearch, compareHebrewNames } from '../utils/nameUtils';


const MAX_RECENT_BORROWERS = 2;
const DEFAULT_BOOK_STATE = 'מצויין - בלאי בלתי מורגש';

const brandColors = {
    coral: '#F38181',
    teal: '#4ECAC7',
    yellow: '#FEC43C',
};

const memberToBorrowerOption = (member, displayParentName) => ({
    value: member.id,
    label: displayParentName ? member.parent_name : member.kid_name,
    parentName: member.parent_name,
    childName: member.kid_name,
});

const getSelectStyles = (isHebrew) => ({
    control: (provided) => ({
        ...provided,
        textAlign: isHebrew ? 'right' : 'left',
        direction: isHebrew ? 'rtl' : 'ltr',
        borderColor: brandColors.coral,
        borderRadius: '4px',
        boxShadow: 'none',
        '&:hover': { borderColor: brandColors.teal },
    }),
    menu: (provided) => ({
        ...provided,
        direction: isHebrew ? 'rtl' : 'ltr',
        textAlign: isHebrew ? 'right' : 'left',
    }),
    option: (provided) => ({
        ...provided,
        textAlign: isHebrew ? 'right' : 'left',
        direction: isHebrew ? 'rtl' : 'ltr',
    }),
    input: (provided) => ({
        ...provided,
        textAlign: isHebrew ? 'right' : 'left',
        direction: isHebrew ? 'rtl' : 'ltr',
    }),
    singleValue: (provided) => ({
        ...provided,
        textAlign: isHebrew ? 'right' : 'left',
        direction: isHebrew ? 'rtl' : 'ltr',
    }),
    placeholder: (provided) => ({
        ...provided,
        textAlign: isHebrew ? 'right' : 'left',
    }),
    valueContainer: (provided) => ({
        ...provided,
        direction: isHebrew ? 'rtl' : 'ltr',
    }),
    groupHeading: (provided) => ({
        ...provided,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'none',
        borderBottom: '1px solid #e5e7eb',
        margin: '4px 8px 0',
        padding: '4px 0 6px',
    }),
});

const filterBorrowerOption = (option, inputValue) => {
    if (!inputValue) return true;
    const { parentName, childName, label } = option.data;
    return (
        nameMatchesSearch(label, inputValue) ||
        nameMatchesSearch(parentName, inputValue) ||
        nameMatchesSearch(childName, inputValue)
    );
};

const filterBookOption = (option, inputValue) => {
    if (!inputValue) return true;
    const { label, author, borrowingChild, borrowerName } = option.data;
    return (
        nameMatchesSearch(label, inputValue) ||
        nameMatchesSearch(author, inputValue) ||
        nameMatchesSearch(borrowingChild, inputValue) ||
        nameMatchesSearch(borrowerName, inputValue)
    );
};

const loanMatchesMember = (loan, member) => {
    if (!member) return true;
    const parentMatches = nameMatchesSearch(loan.borrower_name, member.parent_name);
    const childMatches = !loan.borrower_child || nameMatchesSearch(loan.borrower_child, member.kid_name);
    return parentMatches && childMatches;
};

const findMemberFromLoan = (members, loan) => (
    members.find((member) => loanMatchesMember(loan, member)) ||
    members.find((member) => nameMatchesSearch(member.parent_name, loan.borrower_name))
);

const formatLabel = (template, values) => (
    Object.entries(values).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, value ?? ''),
        template
    )
);

const getApiErrorMessage = (error, fallback) => (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
);

const getRecentBorrowerIdsFromLoans = (loans, members, limit = MAX_RECENT_BORROWERS) => {
    const sorted = [...loans].sort(
        (a, b) => new Date(b.borrowed_at) - new Date(a.borrowed_at)
    );
    const seen = new Set();
    const ids = [];

    for (const loan of sorted) {
        const memberId = loan.member_id ?? findMemberFromLoan(members, loan)?.id;
        if (memberId && !seen.has(memberId)) {
            seen.add(memberId);
            ids.push(memberId);
            if (ids.length >= limit) break;
        }
    }

    return ids;
};

function Loans() {
    const [scanMode, setScanMode] = useState('');
    const [members, setMembers] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);
    const [selectedBorrower, setSelectedBorrower] = useState('');
    const [selectedBookQR, setSelectedBookQR] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [selectedBorrowedBookQR, setSelectedBorrowedBookQR] = useState("");
    const [selectedBorrowedBook, setSelectedBorrowedBook] = useState(null);
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
    const [displayParentName, setDisplayParentName] = useState(true);
    const [recentBorrowerIds, setRecentBorrowerIds] = useState([]);
    const [returnSearchMode, setReturnSearchMode] = useState('book');
    const [returnBorrowerFilter, setReturnBorrowerFilter] = useState(null);
    const [actionFeedback, setActionFeedback] = useState(null);
    const [isSubmittingBorrow, setIsSubmittingBorrow] = useState(false);
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
    const borrowInFlightRef = useRef(false);
    const returnInFlightRef = useRef(false);



    useEffect(() => {
        if (!actionFeedback || actionFeedback.type !== 'success') return undefined;

        const timer = setTimeout(() => setActionFeedback(null), 6000);
        return () => clearTimeout(timer);
    }, [actionFeedback]);

    const showFeedback = (type, message) => {
        setActionFeedback({ type, message });
    };

    useEffect(() => {

        const loadInitialData = async () => {
            try {
                const [membersData, availableBooksData, borrowedBooksData, allLoans] = await Promise.all([
                    fetchMembers(),
                    fetchAvailableBooks(),
                    fetchBorrowedBooks(),
                    fetchLoanHistory(null, true),
                ]);

                setMembers(membersData);
                setAvailableBooks(availableBooksData);
                setBorrowedBooks(borrowedBooksData);
                setRecentBorrowerIds(getRecentBorrowerIdsFromLoans(allLoans, membersData));
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
        setSelectedBorrower(null);
        setReturnSearchMode('book');
        setReturnBorrowerFilter(null);
    }, [scanMode]);

    const buildBorrowerSelectOptions = () => {
        const toOption = (member) => memberToBorrowerOption(member, displayParentName);

        const recentMembers = recentBorrowerIds
            .map((id) => members.find((member) => member.id === id))
            .filter(Boolean)
            .slice(0, MAX_RECENT_BORROWERS);

        const recentIdSet = new Set(recentMembers.map((member) => member.id));

        const sortedMembers = members
            .filter((member) => !recentIdSet.has(member.id))
            .map(toOption)
            .sort((a, b) => compareHebrewNames(a.label, b.label));

        if (recentMembers.length === 0) {
            return members
                .map(toOption)
                .sort((a, b) => compareHebrewNames(a.label, b.label));
        }

        return [
            {
                label: 'recent',
                options: recentMembers.map(toOption),
            },
            {
                label: 'all',
                options: sortedMembers,
            },
        ];
    };

    const borrowerSelectOptions = buildBorrowerSelectOptions();

    const borrowerOptions = members
        .map((member) => memberToBorrowerOption(member, displayParentName))
        .sort((a, b) => compareHebrewNames(a.label, b.label));

    const bookOptions = availableBooks.map((book) => ({
        value: book.qr_code,
        label: book.title,
    }));

    const getBorrowerNameForBook = (book) => {
        const openLoan = loanHistory.find(
            (loan) => !loan.returned_at && loan.book_id === book.id
        );
        return openLoan?.borrower_name || book.borrowing_parent || book.parent_name || '';
    };

    const bookMatchesMember = (book, member) => {
        if (!member) return true;
        if (nameMatchesSearch(book.borrowing_child, member.kid_name)) return true;
        const openLoan = loanHistory.find(
            (loan) => !loan.returned_at && loan.book_id === book.id
        );
        return openLoan ? loanMatchesMember(openLoan, member) : false;
    };

    const borrowedBookOptions = borrowedBooks
        .filter((book) => bookMatchesMember(book, returnBorrowerFilter))
        .map((book) => ({
            value: book.qr_code,
            label: book.title,
            author: book.author,
            borrowingChild: book.borrowing_child,
            borrowerName: getBorrowerNameForBook(book),
        }))
        .sort((a, b) => compareHebrewNames(a.label, b.label));

    const filteredLoanHistory = returnBorrowerFilter
        ? loanHistory.filter((loan) => loanMatchesMember(loan, returnBorrowerFilter))
        : loanHistory;

    const handleBorrowerFilterClick = (event, loan) => {
        event.stopPropagation();
        const member = findMemberFromLoan(members, loan);
        if (!member) return;

        setReturnSearchMode('borrower');
        setReturnBorrowerFilter(member);
        setSelectedBorrowedBook(null);
        setSelectedBorrowedBookQR('');
        setSelectedBook(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLoanCardClick = (loan) => {
        if (!loan.returned_at) {
            const matchingBook = borrowedBooks.find((book) => book.id === loan.book_id);

            if (matchingBook) {
                setSelectedBorrowedBook(matchingBook);
                setSelectedBorrowedBookQR(matchingBook.qr_code);
                setSelectedBook(matchingBook);
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
                            },
                            language
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
        if (!selectedBorrower || !selectedBook) {
            showFeedback('error', LABELS.select_borrower_and_book);
            return;
        }

        if (borrowInFlightRef.current || isSubmittingBorrow) {
            showFeedback('info', LABELS.action_in_progress);
            return;
        }

        const bookTitle = selectedBook.title;
        const borrowerName = displayParentName
            ? selectedBorrower.parent_name
            : selectedBorrower.kid_name;

        borrowInFlightRef.current = true;
        setIsSubmittingBorrow(true);
        showFeedback('info', LABELS.borrowing_in_progress);

        try {
            const result = await borrowBook(selectedBook.qr_code, selectedBorrower.id, DEFAULT_BOOK_STATE);

            if (result.message) {
                showFeedback('success', formatLabel(LABELS.borrow_success, {
                    book: bookTitle,
                    borrower: borrowerName,
                }));

                setSelectedBook(null);
                setSelectedBorrower(null);
                setSelectedBookQR('');

                const [updatedAvailableBooks, updatedBorrowedBooks, updatedLoanHistory, allLoans] = await Promise.all([
                    fetchAvailableBooks(),
                    fetchBorrowedBooks(),
                    fetchLoanHistory(null, showAllLoans),
                    fetchLoanHistory(null, true),
                ]);

                setAvailableBooks(updatedAvailableBooks);
                setBorrowedBooks(updatedBorrowedBooks);
                setLoanHistory(sortLoans(updatedLoanHistory));
                setRecentBorrowerIds(getRecentBorrowerIdsFromLoans(allLoans, members));
            } else {
                showFeedback('error', getApiErrorMessage(result, LABELS.borrow_error));
            }
        } catch (error) {
            console.error("Failed to borrow book:", error);
            showFeedback('error', getApiErrorMessage(error, LABELS.network_error));
        } finally {
            borrowInFlightRef.current = false;
            setIsSubmittingBorrow(false);
        }
    };


    // Confirm return of a book
    const confirmReturn = async () => {
        if (!selectedBorrowedBookQR || !selectedBorrowedBook) {
            showFeedback('error', LABELS.select_book_to_return);
            return;
        }

        if (returnInFlightRef.current || isSubmittingReturn) {
            showFeedback('info', LABELS.action_in_progress);
            return;
        }

        const bookTitle = selectedBorrowedBook.title;

        returnInFlightRef.current = true;
        setIsSubmittingReturn(true);
        showFeedback('info', LABELS.returning_in_progress);

        try {
            const response = await returnBook(selectedBorrowedBookQR);

            if (response.success) {
                showFeedback('success', formatLabel(LABELS.return_success, { book: bookTitle }));

                setSelectedBorrowedBook(null);
                setSelectedBorrowedBookQR('');
                setSelectedBook(null);

                const [updatedAvailableBooks, updatedBorrowedBooks, updatedLoanHistory] = await Promise.all([
                    fetchAvailableBooks(),
                    fetchBorrowedBooks(),
                    fetchLoanHistory(null, showAllLoans),
                ]);

                setAvailableBooks(updatedAvailableBooks);
                setBorrowedBooks(updatedBorrowedBooks);
                setLoanHistory(sortLoans(updatedLoanHistory));
            } else {
                showFeedback('error', getApiErrorMessage(response, LABELS.return_error));
            }
        } catch (error) {
            console.error("Error returning book:", error);
            showFeedback('error', getApiErrorMessage(error, LABELS.network_error));
        } finally {
            returnInFlightRef.current = false;
            setIsSubmittingReturn(false);
        }
    };

    const sortLoans = (loans) => {
        return [...loans].sort((a, b) => {
            if (!a.returned_at && b.returned_at) return -1;
            if (a.returned_at && !b.returned_at) return 1;
            return new Date(b.borrowed_at) - new Date(a.borrowed_at);
        });
    };

    return (
        <div className="loans-panel bg-white shadow-md rounded-lg p-6 w-full">

            {actionFeedback && (
                <div
                    className={`loan-action-feedback loan-action-feedback--${actionFeedback.type} ${language === 'he' ? 'rtl' : ''}`}
                    role="status"
                    aria-live="polite"
                >
                    <span>{actionFeedback.message}</span>
                    <button
                        type="button"
                        className="loan-action-feedback__dismiss"
                        onClick={() => setActionFeedback(null)}
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                </div>
            )}

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
                <div className="space-y-4 w-full">
                    {/* Borrower Dropdown */}
                    <div className="flex items-center space-x-2">
                        <Select
                            options={borrowerSelectOptions}
                            placeholder={displayParentName ? LABELS.parent_name_placeholder : LABELS.kid_name_placeholder}
                            value={selectedBorrower ? {
                                value: selectedBorrower.id,
                                label: displayParentName ? selectedBorrower.parent_name : selectedBorrower.kid_name
                            } : null}
                            onChange={(selectedOption) => {
                                if (selectedOption) {
                                    const selectedMember = members.find(
                                        (member) => member.id === selectedOption.value
                                    );
                                    setSelectedBorrower(selectedMember || null);
                                } else {
                                    setSelectedBorrower(null);
                                }
                            }}
                            filterOption={filterBorrowerOption}
                            formatGroupLabel={(group) => (
                                <span>{group.label === 'recent' ? LABELS.recent_borrowers : LABELS.all_borrowers}</span>
                            )}
                            isClearable
                            styles={getSelectStyles(language === 'he')}
                            className="w-full flex-grow"
                            classNamePrefix="borrower-select"
                        />
                        <button
                            onClick={() => setDisplayParentName(!displayParentName)}
                            className={`relative inline-flex h-6 w-16 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                displayParentName ? 'bg-teal-600' : 'bg-gray-200'
                            }`}
                        >
                        <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-gray-300 transition duration-200 ease-in-out ${
                                    displayParentName ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                                            </button>
                                            <span className="text-sm text-gray-600">
                            {displayParentName ? LABELS.parent_name_borrower : LABELS.kid_name_borrower}
                        </span>
                    </div>

                    {/* Display Book title */}
                    <Select
                        options={bookOptions}
                        placeholder={LABELS.Select_Book}
                        value={selectedBook ? {value: selectedBook.qr_code, label: selectedBook.title} : null}
                        onChange={(selectedOption) => {
                            const selectedBook = availableBooks.find((book) => book.qr_code === selectedOption?.value);
                            setSelectedBook(selectedBook || null);
                            setSelectedBookQR(selectedOption?.value || '');
                        }}
                        isClearable
                        styles={getSelectStyles(language === 'he')}
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
                        className="w-full py-2 px-4 rounded text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{backgroundColor: brandColors.coral}}
                        onClick={handleBorrow}
                        disabled={isSubmittingBorrow || !selectedBorrower || !selectedBook}
                    >
                        {isSubmittingBorrow ? LABELS.borrowing_in_progress : LABELS.borrow}
                    </button>

                    {/* Available Books as Cards */}
                    <div className={`loan-history-container w-full ${language === 'he' ? 'rtl' : ''}`}>
                        {availableBooks.map((book) => (
                            <div
                                key={book.qr_code}
                                className={`loan-history-card w-full max-w-full ${selectedBook?.qr_code === book.qr_code ? 'active-loan' : ''} ${language === 'he' ? 'rtl' : ''}`}
                                onClick={() => {
                                    setSelectedBook(book);
                                    setSelectedBookQR(book.qr_code);
                                }}
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
                <div className="space-y-4 w-full">
                    <div className="flex items-center gap-2 w-full">
                        <button
                            type="button"
                            className={`flex-1 py-2 px-3 rounded text-sm ${returnSearchMode === 'book' ? 'text-white' : 'text-gray-800'}`}
                            style={{
                                backgroundColor: returnSearchMode === 'book' ? brandColors.teal : 'transparent',
                                borderColor: brandColors.teal,
                                borderWidth: '1px',
                            }}
                            onClick={() => {
                                setReturnSearchMode('book');
                                setReturnBorrowerFilter(null);
                                setSelectedBorrowedBook(null);
                                setSelectedBorrowedBookQR('');
                                setSelectedBook(null);
                            }}
                        >
                            {LABELS.search_by_book}
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 px-3 rounded text-sm ${returnSearchMode === 'borrower' ? 'text-white' : 'text-gray-800'}`}
                            style={{
                                backgroundColor: returnSearchMode === 'borrower' ? brandColors.teal : 'transparent',
                                borderColor: brandColors.teal,
                                borderWidth: '1px',
                            }}
                            onClick={() => setReturnSearchMode('borrower')}
                        >
                            {LABELS.search_by_borrower}
                        </button>
                    </div>

                    {returnSearchMode === 'borrower' && (
                            <Select
                                options={borrowerOptions}
                                placeholder={LABELS.select_borrower}
                                value={returnBorrowerFilter ? {
                                    value: returnBorrowerFilter.id,
                                    label: displayParentName
                                        ? returnBorrowerFilter.parent_name
                                        : returnBorrowerFilter.kid_name,
                                } : null}
                                onChange={(selectedOption) => {
                                    if (selectedOption) {
                                        const member = members.find(
                                            (m) => m.id === selectedOption.value
                                        );
                                        setReturnBorrowerFilter(member || null);
                                    } else {
                                        setReturnBorrowerFilter(null);
                                    }
                                    setSelectedBorrowedBook(null);
                                    setSelectedBorrowedBookQR('');
                                    setSelectedBook(null);
                                }}
                                filterOption={filterBorrowerOption}
                                isClearable
                                styles={getSelectStyles(language === 'he')}
                                className="w-full"
                                classNamePrefix="borrower-select"
                            />
                    )}

                    {(returnSearchMode === 'book' || returnBorrowerFilter) && (
                        <Select
                            options={borrowedBookOptions}
                            placeholder={LABELS.Select_Book}
                            value={selectedBorrowedBook ? {
                                value: selectedBorrowedBook.qr_code,
                                label: selectedBorrowedBook.title,
                            } : null}
                            onChange={(selectedOption) => {
                                if (selectedOption) {
                                    const matchingBook = borrowedBooks.find(
                                        (book) => book.qr_code === selectedOption.value
                                    );
                                    setSelectedBorrowedBookQR(selectedOption.value);
                                    setSelectedBorrowedBook(matchingBook || null);
                                    if (matchingBook) {
                                        setSelectedBook(matchingBook);
                                    }
                                } else {
                                    setSelectedBorrowedBookQR('');
                                    setSelectedBorrowedBook(null);
                                    setSelectedBook(null);
                                }
                            }}
                            filterOption={filterBookOption}
                            isClearable
                            styles={getSelectStyles(language === 'he')}
                            className="w-full"
                            classNamePrefix="book-select"
                        />
                    )}

                    <div className="space-y-2 w-full">
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
                            className="w-full py-2 px-4 rounded text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{backgroundColor: brandColors.coral}}
                            onClick={confirmReturn}
                            disabled={!selectedBorrowedBook || isSubmittingReturn}
                        >
                            {isSubmittingReturn ? LABELS.returning_in_progress : LABELS.return}
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

                    <div className="flex items-center w-full">
                        <label className="flex items-center space-x-2">
                            <button
                                onClick={(e) => handleShowAllChange({target: {checked: !showAllLoans}})}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                    showAllLoans ? 'bg-teal-600' : 'bg-gray-200'
                                }`}
                            >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                    showAllLoans ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                            </button>
                            <span className="text-sm text-gray-600">{LABELS.ShowAllLoans}</span>
                        </label>
                    </div>


                    {/* Reminder Section */}
                    {showReminderOptions && filteredLoanHistory.filter(loan => !loan.returned_at).length > 0 && (
                        <div className="reminder-section bg-gray-100 p-4 rounded-lg w-full">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">{LABELS.SendReminders}</h3>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedLoansForReminder.length === filteredLoanHistory.filter(loan => !loan.returned_at).length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const nonReturnedLoans = filteredLoanHistory.filter(loan => !loan.returned_at);
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

                    {filteredLoanHistory.length > 0 && (
                        <div className={`loan-history-container w-full ${language === 'he' ? 'rtl' : ''}`}>
                            {filteredLoanHistory.map((loan) => (
                                <div
                                    className={`loan-history-card w-full max-w-full ${loan.returned_at ? 'returned-loan' : 'active-loan'} ${language === 'he' ? 'rtl' : ''}`}
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
                                            {LABELS.borrowed_by}{' '}
                                            {!loan.returned_at ? (
                                                <button
                                                    type="button"
                                                    className="text-teal-600 underline hover:text-teal-800"
                                                    onClick={(e) => handleBorrowerFilterClick(e, loan)}
                                                >
                                                    {loan.borrower_name}
                                                </button>
                                            ) : (
                                                loan.borrower_name
                                            )}
                                        </div>
                                        <div className="loan-history-card-detail">
                                            {LABELS.kid_name_borrower}: {loan.borrower_child || 'N/A'}
                                        </div>
                                        <div className="loan-history-card-detail">
                                            {LABELS.borrow_date}: {loan.borrowed_at}
                                        </div>
                                        {loan.returned_at && (
                                            <div className="loan-history-card-detail">
                                                {LABELS.return_date}: {loan.returned_at}
                                            </div>
                                        )}
                                        <div className="loan-history-card-detail">
                                            {LABELS.delivery_status}: {loan.book_state || 'N/A'}
                                        </div>
                                        {loan.last_reminder_date ? (
                                            <div className="loan-history-card-detail">
                                                {LABELS.last_reminder}: {loan.last_reminder_date}
                                            </div>
                                        ) : (
                                            <div className="loan-history-card-detail no-reminder">
                                                {LABELS.no_reminder_sent}
                                            </div>
                                        )}
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
