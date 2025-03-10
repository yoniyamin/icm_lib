import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { fetchBooks, addBookService, fetchMembers, downloadQrCode , updateBookService  } from '../services/services';
import { useLanguage } from '../context/LanguageContext';
import {getFieldLabels, translateBookCondition, translateCoverType} from '../utils/labels';

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
    const { language, toggleLanguage, direction } = useLanguage();
    const LABELS = getFieldLabels(language);
    const [editingBookId, setEditingBookId] = useState(null);
    const [currentQrCode, setCurrentQrCode] = useState('');


    const COVER_TYPE_OPTIONS = [
        { value: 'כריכה רכה', label: LABELS.soft_cover },
        { value: 'כריכה קשה', label: LABELS.hard_cover },
        { value: 'עמודים קשיחים', label: LABELS.rigid_pages },
        { value: 'ספר עם בטריה', label: LABELS.battery_book }
    ];

    const BOOK_CONDITION_OPTIONS = [
        { value: 'כמו חדש', label: LABELS.new },
        { value: 'מצויין - בלאי בלתי מורגש', label: LABELS.good },
        { value: 'טוב - בלאי קל', label: LABELS.worn },
    ];


    useEffect(() => {
        loadBooks();
        loadMembers();
    }, [orderBy]);

    useEffect(() => {
        // Scroll to the top when the component mounts
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

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
            const bookData = {
                title,
                author,
                description,
                year_of_publication: year,
                pages,
                cover_type: coverType,
                book_condition: bookCondition || 'טוב - בלאי קל',
                recommended_age: recommendedAge,
                loan_status: loanStatus,
                delivering_parent: deliveringParent
            };

            if (editingBookId) {
                await updateBookService(editingBookId, bookData);
            } else {
                await addBookService(bookData);
            }

            // Reset form fields
            setEditingBookId(null);
            setCurrentQrCode('');
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
            console.error("Error saving book:", error);
        }
    };

    const handleEditBook = (book) => {
        setShowAddBook(true);
        setEditingBookId(book.id);
        setCurrentQrCode(book.qr_code);
        setTitle(book.title);
        setAuthor(book.author || '');
        setDescription(book.description || '');
        setYear(book.year_of_publication || '');
        setPages(book.pages || '');
        setCoverType(book.cover_type || '');
        setBookCondition(book.book_condition || '');
        setRecommendedAge(book.recommended_age || '');
        setDeliveringParent(book.delivering_parent || '');
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
            {/* Search and Sort Section */}
            <div className="flex flex-col mb-4">
                {/* Sorting Button at the Top */}


                {/* Search Box (Align Right for Hebrew) */}
                <input
                    id="search_by_name"
                    type="text"
                    placeholder={LABELS.search_books_placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 border border-gray-300 rounded-md py-1.5 px-4 ${language === 'he' ? 'text-right' : 'text-left'}`}
                />
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
                        {editingBookId ? LABELS.update_book_button : LABELS.add_book_button}
                    </button>

                </form>
            )}
            {/* Sorting Button as a Full-Width Table Header */}
            {/* Clickable Sorting Row with Dynamic Direction */}
            <div
                className={`w-full border-b border-gray-300 bg-gray-100 py-2 px-4 flex ${language === 'he' ? 'flex-row-reverse' : 'flex-row'} justify-between items-center cursor-pointer`}
                onClick={() => setOrderBy(orderBy === "desc" ? "asc" : "desc")}
                aria-label={LABELS.sort_by}
            >
                <span className="font-semibold text-gray-700">{LABELS.title}</span>
                {orderBy === "desc" ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}
            </div>


            {/* Book List */}
            <div dir={direction}>
                <div className="overflow-y-auto max-h-screen border-t pt-4">
                    {books
                        .filter(book =>
                            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((book) => (
                            <div key={book.qr_code} className="bg-gray-50 shadow-sm rounded-lg p-4 mb-2 relative">
                                {/* Main content */}
                                <div className="mb-12">
                                    <h2 className="font-bold text-gray-800">{book.title}</h2>
                                    <p className="text-sm text-gray-500">{book.author}</p>
                                    <p className="text-sm mb-4">
                                        <span
                                            className={book.loan_status === 'available' ? 'text-green-500' : 'text-red-500'}>
                                            {book.loan_status === 'borrowed' ? LABELS.borrowed : LABELS.available}
                                        </span>
                                        {book.loan_status === 'borrowed' && (
                                            <span> {LABELS.by} {book.borrowing_child}</span>
                                        )}
                                    </p>

                                    <button
                                        onClick={() => handleDownloadQrCode(`${book.qr_code}.png`)}
                                        className="text-blue-600 text-sm px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                    >
                                        {LABELS.download_qr_code}
                                    </button>
                                </div>

                                {/* Bottom controls */}
                                <div className="absolute bottom-4 inset-x-4 flex justify-between items-center">
                                    <button
                                        onClick={() => handleEditBook(book)}
                                        className="p-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200"
                                        aria-label={LABELS.edit_book}
                                    >
                                        <Edit size={20}/>
                                    </button>

                                    <button
                                        onClick={() => toggleExpand(book.qr_code)}
                                        className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                                    >
                                        {expandedBooks[book.qr_code] ? (
                                            <>
                                                <span className="text-sm">{LABELS.Hide_Details}</span>
                                                <ChevronUp size={20}/>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm">{LABELS.More_Details}</span>
                                                <ChevronDown size={20}/>
                                            </>
                                        )}
                                    </button>

                                    <div className="w-8" aria-hidden="true"/>
                                </div>

                                {/* Expanded details */}
                                {expandedBooks[book.qr_code] && (
                                    <div
                                        className="mt-8 mb-8 text-gray-600 bg-white p-4 rounded-md border border-gray-100">
                                        <p><strong>{LABELS.description}:</strong> {book.description || 'N/A'}</p>
                                        <p>
                                            <strong>{LABELS.year_of_publication}:</strong> {book.year_of_publication || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>{LABELS.cover_type}:</strong> {translateCoverType(book.cover_type, LABELS)}
                                        </p>
                                        <p><strong>{LABELS.pages}:</strong> {book.pages || 'N/A'}</p>
                                        <p><strong>{LABELS.recommended_age}:</strong> {book.recommended_age || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>{LABELS.select_condition}:</strong> {translateBookCondition(book.book_condition, LABELS)}
                                        </p>
                                        <p>
                                            <strong>{LABELS.delivering_parent}:</strong> {book.delivering_parent || 'N/A'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default Inventory;