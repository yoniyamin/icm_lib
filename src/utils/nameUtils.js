const HEBREW_FINAL_TO_REGULAR = {
    '\u05DA': '\u05DB', // ך → כ
    '\u05DD': '\u05DE', // ם → מ
    '\u05DF': '\u05E0', // ן → נ
    '\u05E3': '\u05E4', // ף → פ
    '\u05E5': '\u05E6', // ץ → צ
};

/**
 * Normalize a name/string for search: Unicode NFC, strip niqqud,
 * map Hebrew final letters to regular forms, trim, lowercase (Latin).
 */
export function normalizeNameForSearch(str) {
    if (!str) return '';

    return str
        .normalize('NFC')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[\u05DA\u05DD\u05DF\u05E3\u05E5]/g, (char) => HEBREW_FINAL_TO_REGULAR[char] || char)
        .trim()
        .toLowerCase();
}

/** Locale-aware comparison for Hebrew (and mixed) names. */
export function compareHebrewNames(a, b) {
    return (a || '').localeCompare(b || '', 'he', { sensitivity: 'base', numeric: true });
}

export function nameMatchesSearch(name, searchTerm) {
    const normalizedName = normalizeNameForSearch(name);
    const normalizedSearch = normalizeNameForSearch(searchTerm);
    if (!normalizedSearch) return true;
    return normalizedName.includes(normalizedSearch);
}

export function memberMatchesSearch(member, searchTerm) {
    return (
        nameMatchesSearch(member.parent_name, searchTerm) ||
        nameMatchesSearch(member.kid_name, searchTerm)
    );
}
