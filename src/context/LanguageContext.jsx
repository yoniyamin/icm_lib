import React, { createContext, useState, useContext } from 'react';

// Create the LanguageContext
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('he');

    // Determine text direction based on the language
    const getDirection = (lang) => (lang === 'he' ? 'rtl' : 'ltr');

    const toggleLanguage = () => {
        setLanguage((prevLang) => (prevLang === 'en' ? 'he' : 'en'));
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                toggleLanguage,
                direction: getDirection(language), // Provide the direction
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook to access the LanguageContext
export const useLanguage = () => useContext(LanguageContext);
