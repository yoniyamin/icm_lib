export const APP_VERSION = '1.0.4';

export const CHANGELOG = {
    en: [
        'Books: teal badge on each card showing how many times the book was borrowed.',
        'Books: download QR, edit, and more/hide details on one row; expanded details open below the toggle.',
        'Members: list fills the screen; member info and action buttons shown side-by-side.',
        'Members: delete is hidden when a member still has borrowed books.',
        'Print QR codes: list shows zero-padded QR numbers; filter by added date range (from/to month and year).',
        'Fixed web app manifest loading.',
    ],
    he: [
        'ספרים: תג טורקיז בכל כרטיס המציג כמה פעמים הספר הושאל.',
        'ספרים: הורדת QR, עריכה ועוד/הסתר פרטים בשורה אחת; פרטים נפתחים מתחת לכפתור.',
        'חברים: הרשימה ממלאת את המסך; פרטי החבר וכפתורי הפעולה מוצגים זה לצד זה.',
        'חברים: מחיקה מוסתרת כשיש לחבר ספרים מושאלים.',
        'הדפס QR: הרשימה מציגה מספר QR עם אפסים מובילים; סינון לפי טווח תאריכי הוספה (מ/עד חודש ושנה).',
        'תוקן טעינת קובץ ה-manifest של האפליקציה.',
    ],
};

export const getChangelogItems = (language) => CHANGELOG[language] || CHANGELOG.en;
