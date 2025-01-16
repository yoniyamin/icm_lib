import React, { useState, useEffect } from 'react';
import { fetchBooks, addBookService, fetchMembers, downloadQrCode  } from '../services/services';
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';

const Inventory = () => {
    const [books, setBooks] = useState([]);
    const [orderBy, setOrderBy] = useState("desc");
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [year, setYear] = useState('');
    const [pages, setPages] = useState('');
    const [coverType, setCoverType] = useState('');
    const [bookCondition, setBookCondition] = useState('');
    const [recommendedAge, setRecommendedAge] = useState('');
    const [loanStatus] = useState('available');
    const [deliveringParent, setDeliveringParent] = useState('');
    const [members, setMembers] = useState([]);
    const [showAddBook, setShowAddBook] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedBooks, setExpandedBooks] = useState({});
    const { language, toggleLanguage } = useLanguage();
    const LABELS = getFieldLabels(language);

    const COVER_TYPE_OPTIONS = [
        { value: 'כריכה רכה', label: LABELS.soft_cover },
        { value: 'כריכה קשה', label: LABELS.hard_cover },
        { value: 'עמודים קשיחים', label: LABELS.rigid_pages },
        { value: 'ספר עם בטריה', label: LABELS.battery_book }
    ];

    const BOOK_CONDITION_OPTIONS = [
        { value: 'new', label: LABELS.new },
        { value: 'good', label: LABELS.good },
        { value: 'worn', label: LABELS.worn }
    ];

    const LOAN_STATUS_OPTIONS = [
        { value: 'available', label: LABELS.available },
        { value: 'borrowed', label: LABELS.borrowed }
    ];

    useEffect(() => {
        loadBooks();
        loadMembers();
    }, [orderBy]);

    const loadBooks = async () => {
        try {
            const data = await fetchBooks(orderBy);
            if (Array.isArray(data)) {
                setBooks(data);
            } else {
                console.error("Unexpected response format:", data);
                setBooks([]);
            }
        } catch (error) {
            console.error("Failed to load books:", error);
            setBooks([]);
        }
    };

    const loadMembers = async () => {
        try {
            const data = await fetchMembers();
            setMembers(data);
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await addBookService({
                title,
                author,
                description,
                year_of_publication: year,
                pages,
                cover_type: coverType,
                book_condition: bookCondition,
                recommended_age: recommendedAge,
                loan_status: loanStatus,
                delivering_parent: deliveringParent
            });

            // Reset form fields
            setTitle('');
            setAuthor('');
            setDescription('');
            setYear('');
            setPages('');
            setCoverType(COVER_TYPE_OPTIONS[0].value);
            setBookCondition(BOOK_CONDITION_OPTIONS[0].value);
            setDeliveringParent('');
            setShowAddBook(false);
            await loadBooks();
        } catch (error) {
            console.error("Error adding book:", error);
        }
    };

    const toggleExpand = (qrCode) => {
        setExpandedBooks((prev) => ({
            ...prev,
            [qrCode]: !prev[qrCode],
        }));
    };

    const handleDownloadQrCode = (qrCodeFileName) => {
        downloadQrCode(qrCodeFileName)
            .then(() => console.log("QR Code downloaded successfully"))
            .catch((err) => console.error("Failed to download QR Code:", err));
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <button
                className="w-12 h-12 flex items-center justify-center rounded-full border border-teal-500 bg-white text-teal-500 shadow-md absolute top-4 left-4"
                onClick={toggleLanguage}
            >
                {language === 'en' ? 'HE' : 'EN'}
            </button>
            {/* Search and Sort Section */}
            <div className="flex justify-between items-center mb-4">
                <input
                    id="search_by_name"
                    type="text"
                    placeholder={LABELS.search_books_placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 mr-4 border border-gray-300 rounded-md py-2 px-4"
                />
                <div className="sorting-container">
                    <label htmlFor="orderBy" className="mr-2">:{LABELS.sort_by}</label>
                    <select
                        id="orderBy"
                        value={orderBy}
                        onChange={(e) => setOrderBy(e.target.value)}
                        className="border rounded p-1"
                    >
                        <option value="desc">{LABELS.descending}</option>
                        <option value="asc">{LABELS.ascending}</option>
                    </select>
                </div>
            </div>

            {/* Add Book Button */}
            <button
                onClick={() => setShowAddBook(!showAddBook)}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition mb-4"
            >
                {showAddBook ? `- ${LABELS.close_add_book_button}` : `+ ${LABELS.add_book_button}`}
            </button>

            {/* Add Book Form */}
            {showAddBook && (
                <form onSubmit={handleAddBook} className="mb-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={LABELS.placeholder_book_title}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    />
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder={LABELS.placeholder_book_author}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        placeholder={LABELS.placeholder_book_description}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    />
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder={LABELS.placeholder_book_year}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    />
                    <select
                        value={coverType}
                        onChange={(e) => setCoverType(e.target.value)}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    >
                        <option value="">{LABELS.select_cover_type}</option>
                        {COVER_TYPE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        placeholder={LABELS.placeholder_book_pages}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    />
                    <input
                        type="number"
                        value={recommendedAge}
                        onChange={(e) => setRecommendedAge(e.target.value)}
                        placeholder={LABELS.placeholder_book_recommended_age}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    />
                    <select
                        value={bookCondition}
                        onChange={(e) => setBookCondition(e.target.value)}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    >
                        <option value="">{LABELS.select_condition}</option>
                        {BOOK_CONDITION_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <select
                        value={deliveringParent}
                        onChange={(e) => setDeliveringParent(e.target.value)}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    >
                        <option value="">{LABELS.select_parent}</option>
                        {members.map(member => (
                            <option key={member.id} value={member.parent_name}>{member.parent_name}</option>
                        ))}
                    </select>
                    <button type="submit"
                            className="w-full bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition">
                        {LABELS.add_book_button}
                    </button>
                </form>
            )}

            {/* Book List */}
            <div className="overflow-y-auto max-h-screen border-t pt-4">
                {books
                    .filter(book =>
                        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        book.author.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((book) => (
                        <div key={book.qr_code} className="bg-gray-50 shadow-sm rounded-lg p-4 mb-2">
                            <h2 className="font-bold text-gray-800">{book.title}</h2>
                            <p className="text-sm text-gray-500">{book.author}</p>
                            <p className="text-sm">
                                {LABELS.loan_status}:{" "}
                                <span className={book.loan_status === 'available' ? 'text-green-500' : 'text-red-500'}>
                                    {book.loan_status === 'borrowed' ? LABELS.borrowed : LABELS.available}
                                </span>
                                {book.loan_status === 'borrowed' && (
                                    <span> {LABELS.borrowing_child}: {book.borrowing_child}</span>
                                )}
                            </p>
                            <p>
                                <button
                                    onClick={() => handleDownloadQrCode(`${book.qr_code}.png`)}
                                    className="text-blue-500 text-sm mt-2 hover:underline"
                                >
                                    {LABELS.download_qr_code}
                                </button>
                            </p>
                            <button
                                onClick={() => toggleExpand(book.qr_code)}
                                className="text-blue-500 text-sm mt-2 hover:underline"
                            >
                                {expandedBooks[book.qr_code] ? LABELS.Hide_Details : LABELS.More_Details}
                            </button>
                            {expandedBooks[book.qr_code] && (
                                <div className="mt-2 text-gray-600">
                                    <p><strong>{LABELS.description}:</strong> {book.description || 'N/A'}</p>
                                    <p>
                                        <strong>{LABELS.year_of_publication}:</strong> {book.year_of_publication || 'N/A'}
                                    </p>
                                    <p><strong>{LABELS.cover_type}:</strong> {book.cover_type || 'N/A'}</p>
                                    <p><strong>{LABELS.pages}:</strong> {book.pages || 'N/A'}</p>
                                    <p><strong>{LABELS.recommended_age}:</strong> {book.recommended_age || 'N/A'}</p>
                                    <p><strong>{LABELS.select_condition}:</strong> {book.book_condition || 'N/A'}</p>
                                    <p><strong>{LABELS.delivering_parent}:</strong> {book.delivering_parent || 'N/A'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Inventory;