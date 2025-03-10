import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Create the LanguageContext
const LanguageContext = createContext();

// eslint-disable-next-line react/prop-types
export const LanguageProvider = ({ children }) => {
    // Load language from localStorage or default to Hebrew ('he')
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        return savedLanguage || 'he';
    });

    // Update the <html> tag with the correct direction & language
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
        localStorage.setItem('language', language);
        console.log("Language updated to:", language);
    }, [language]);

    // Toggle function - using useCallback to memoize the function
    const toggleLanguage = useCallback(() => {
        setLanguage((prevLang) => {
            const newLang = prevLang === 'en' ? 'he' : 'en';
            console.log("Toggling language from", prevLang, "to", newLang);
            return newLang;
        });
    }, []);

    const contextValue = {
        language,
        toggleLanguage,
        direction: language === 'he' ? 'rtl' : 'ltr',
    };

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook to access the LanguageContext
export const useLanguage = () => useContext(LanguageContext);