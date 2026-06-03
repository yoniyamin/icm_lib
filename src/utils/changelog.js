export const APP_VERSION = '1.0.2';

export const CHANGELOG = {
    en: [
        'After returning a book, the list stays filtered by that borrower if they still have books out.',
        'Returns: search by borrower, or tap a borrower name on a loan card to see all their books.',
        'Recent borrowers appear at the top of the borrow list and sync across devices.',
        'Borrowing no longer asks for book condition; it defaults to excellent.',
        'Borrow and return show clear on-screen confirmations and block double submissions on slow connections.',
        'Loan cards match the width of buttons; returned loans are grey, active loans are teal.',
        'Login background now fills the full screen.',
    ],
    he: [
        'לאחר החזרת ספר, הרשימה נשארת מסוננת לפי המשאיל אם עדיין יש לו ספרים מושאלים.',
        'החזרות: חיפוש לפי משאיל, או לחיצה על שם משאיל בכרטיס השאלה להצגת כל ספריו.',
        'משאילים אחרונים מופיעים בראש רשימת ההשאלה ומסתנכרנים בין מכשירים.',
        'השאלה לא דורשת בחירת מצב ספר; ברירת המחדל היא מצויין.',
        'השאלה והחזרה מציגות אישור ברור על המסך ומונעות שליחה כפולה בחיבור איטי.',
        'כרטיסי השאלות באותו רוחב כמו הכפתורים; היסטוריה באפור, השאלות פתוחות בטורקיז.',
        'רקע מסך הכניסה ממלא כעת את כל המסך.',
    ],
};

export const getChangelogItems = (language) => CHANGELOG[language] || CHANGELOG.en;
