export const FIELD_LABELS = {
    by: 'by',
    app_title: 'Israeli Community of Madrid Library',
    title: "Book Title",
    author: "Author",
    description: "Description",
    year_of_publication: "Year of Publication",
    cover_type: "Cover Type",
    pages: "Pages",
    borrowing_child: "Borrowing Child's Name",
    borrowed_by: "Borrowed By",
    borrower: "Borrower",
    borrow: "Borrow Book",
    delivery_status: "Delivery Status",
    delivering_parent: "Delivering Parent",
    recommended_age: "Recommended Age",
    borrow_date: "Borrow Date",
    return_date: "Return Date",
    NotReturned: "Not Returned",
    add_book_label: "Add New Book",
    books: "Books",
    members: "Members",
    loans: "Loans",
    ShowAllLoans: "Show History",
    Hide_Details: "Hide Details",
    More_Details: "More Details",
    loan_status: "Availability",
    sort_by: "Order by",
    ascending: "Ascending",
    descending: "Descending",
    Hide_Add_Book: "Hide Add Book",
    Add_Book: "Add Book",
    return: "Return Book",
    Select_Book: "Select Book",
    Select_Book_State: "Select Book State",
    ScanQR: "Scan QR Code",
    download_qr_code: "Download QR Code",
    SendReminders: "Send Reminders",
    last_reminder: "last reminder at",
    no_reminder_sent: "No Reminders Sent",
    sending_reminders: "Sending...",
    send_x_reminders: "Send {count} Reminders",
    error_generating_report: "Failed to generate report. Please try again.",
    reports: "Reports",
    generate_report_button: "Generate report",
    select_borrower: 'Select Borrower',

    // General Labels
    add_member_button: 'Add Member',
    edit_member: 'Edit Member',
    delete_member: 'Delete Member',
    close_add_member_button: 'Close Add Member',
    add_member_form_title: 'Add New Member',
    search_placeholder: 'Search members by name',
    members_list_title: 'Library Members',
    no_members_found: 'No members found',
    select_all: 'Select All',
    deselect_all: 'Deselect All',
    borrowed_books_label: 'Borrowed books',

    // Form Placeholders and Labels
    parent_name_placeholder: 'Parent\'s Name',
    kid_name_placeholder: 'Kid\'s Name',
    parent_name_borrower: 'Parent',
    kid_name_borrower: 'Kid',
    email_placeholder: 'Email Address',

    // Form Error Messages
    error_parent_name_required: 'Parent\'s name is required.',
    error_kid_name_required: 'Kid\'s name is required.',
    error_email_required: 'Email address is required.',
    error_email_invalid: 'Invalid email address.',
    email_missing_warning: 'No email provided - notifications will not be sent to this member',
    confirm_delete_member: 'Are you sure you want to delete this member?',
    no_email_provided: 'No email provided',

    // Success Messages
    success_member_added: 'Member added successfully!',
    success_member_updated: 'Member updates successfully!',
    success_member_deleted: 'Member deleted successfully!',

    // List Item Labels
    parent_name_label: 'Parent Name',
    kid_name_label: 'Child Name',
    email_label: 'Email',

    // New Labels for Inventory
    // UI Labels
    inventory_list_title: 'Library Inventory',
    add_book_button: 'Add Book',
    close_add_book_button: 'Close Add Book',
    search_books_placeholder: 'Search books by title',
    no_books_found: 'No books found',

    // Field Placeholders
    placeholder_book_title: 'Enter Book Title',
    placeholder_book_author: 'Enter Author Name',
    placeholder_book_description: 'Enter Description',
    placeholder_book_year: 'Enter Year of Publication',
    placeholder_book_pages: 'Enter Number of Pages',
    placeholder_book_recommended_age: 'Enter Recommended Age',
    select_condition: 'Select Condition',
    select_loan_status: 'Select loan status',
    select_parent: 'Select Parent',
    select_cover_type: 'format',

    // ENUM Options for Drop-Downs
    soft_cover: 'Soft Cover',
    hard_cover: 'Hard Cover',
    rigid_pages: 'Rigid Pages',
    battery_book: 'Book with Battery',
    new: 'Like New',
    good: 'Excellent - No noticeable wear',
    worn: 'Good - Minor wear',
    available: 'Available',
    borrowed: 'Borrowed',

    // Validation Errors
    error_book_title_required: 'Book title is required.',
    error_book_author_required: 'Author name is required.',
    error_book_description_required: 'Description is required.',
    error_book_year_required: 'Year of publication is required.',
    error_book_pages_required: 'Number of pages is required.',
    cannot_delete_with_borrowed_books: "Cannot delete a member with borrowed books",


    // Report labels
    inventory_report: 'Inventory Report',
    loans_report: 'Loans Report',
    select_report_type: 'Select Report Type',
    report_options: 'Report Options',
    select_field: 'Select Field',
    book_title: 'Book Title',
    id: 'ID',
    order: 'Order',
    include_history: 'Include Historical Loans',
    include_borrowed: 'Include Currently Borrowed Books',
    update_book_button: 'Update book information',
    edit_book: 'Edit book information',

    // Login screen
    login_title: "Library Login",
    username: "Username",
    password: "Password",
    username_placeholder: "Enter username",
    password_placeholder: "Enter password",
    login_button: "Login",
    logging_in: "Logging in...",
    invalid_credentials: "Invalid username or password.",

    // Context menu
    system_status: "System Status",
    database_status: "Database Status",
    backend_status: "Backend Status",
    connected: "Connected",
    disconnected: "Disconnected",
    logout: "Logout",
    navigate: "Navigate",

    qr_codes_report: "Print QR Codes",
    qr_codes_available: "There are {count} QR codes available.",
    qr_codes_description: "This report generates a printable PDF of QR codes arranged in a grid with cutting guides.",
    inventory_report_description: "This report generates an Excel file with current inventory details. You can sort the data by various fields and choose to include borrowed items.",
    loans_report_description: "This report generates an Excel file of active loans. You can choose to include historical loans and sort by various fields.",
    no_qr_codes: "No QR Codes",
    qr_codes: "QR Codes",

    // QR Code Scanner Labels
    qr_scan_failed: "Scan Failed",
    qr_select_image: "Select an image",
    qr_error_no_code: "No QR code detected. Please try again with a clearer image.",
    qr_error_no_support: "Your browser doesn't support QR scanning. Try another browser.",
    qr_error_timeout: "Scanning timed out. Try using a smaller image.",
    qr_error_unreadable: "The QR code is unclear or damaged. Try a different image.",
    qr_error_tips: "Try using a well-lit image with the entire QR code visible and in focus",
    qr_error_large_file: "The image file is too large. Please use a smaller image.",
    qr_error_generic: "Couldn't scan the QR code",
    qr_try_again: "Try Again",
    qr_cancel: "Cancel",
    processing_image: "Processing Image...",
    error_scanning: "Scanning of the QR code failed",
};
