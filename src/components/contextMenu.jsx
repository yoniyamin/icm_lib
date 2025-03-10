import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Globe, Activity, X, Menu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';
import { checkBackendStatus, checkNeonDBStatus } from '../services/services.jsx';

const ContextMenu = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [backendUp, setBackendUp] = useState(false);
    const [dbUp, setDbUp] = useState(false);
    const { language, toggleLanguage, direction } = useLanguage();
    const LABELS = getFieldLabels(language);

    useEffect(() => {
        const checkStatus = async () => {
            const backendStatus = await checkBackendStatus();
            setBackendUp(backendStatus);

            const dbStatus = await checkNeonDBStatus();
            setDbUp(dbStatus);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Check every 60s
        return () => clearInterval(interval);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLanguageToggle = useCallback(() => {
        console.log("Language toggle clicked, current language:", language);
        toggleLanguage();
        setTimeout(() => setIsOpen(false), 100);
    }, [language, toggleLanguage]);

    // Use language to determine position: Hebrew => left, English => right
    const positionClass = language === 'he' ? 'left-4' : 'right-4';

    return (
        // Outer container with a high z-index
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
            {/* Toggle Button */}
            <button
                onClick={toggleMenu}
                className={`fixed top-4 ${positionClass} w-10 h-10 flex items-center justify-center bg-white/90 rounded-full shadow-md hover:bg-gray-100 transition-colors`}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Backdrop for closing the menu */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/10"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Menu Panel */}
            {isOpen && (
                <div
                    className={`fixed top-16 ${positionClass} z-50 bg-white rounded-lg shadow-lg p-2 border border-gray-200 ${direction === 'rtl' ? 'rtl text-right' : 'ltr text-left'}`}
                >
                    <ul className="space-y-1 w-48">
                        {/* System Status */}
                        <li className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                            {LABELS.system_status || "System Status"}
                        </li>

                        {/* Backend Status */}
                        <li className="px-3 py-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600">{LABELS.backend_status}</span>
                            <span className={`inline-flex items-center ${backendUp ? 'text-green-500' : 'text-red-500'}`}>
                                <Activity size={16} className={direction === 'rtl' ? 'ml-1' : 'mr-1'} />
                                <span className="text-xs font-medium">
                                    {backendUp ? LABELS.connected : LABELS.disconnected}
                                </span>
                            </span>
                        </li>

                        {/* NeonDB Status */}
                        <li className="px-3 py-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600">{LABELS.database_status}</span>
                            {!dbUp ? (
                                <a
                                    href="https://neonstatus.com/aws-europe-frankfurt"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {LABELS.check_status}
                                </a>
                            ) : (
                                <span className="inline-flex items-center text-green-500">
                                    <Activity size={16} className={direction === 'rtl' ? 'ml-1' : 'mr-1'} />
                                    <span className="text-xs font-medium">{LABELS.connected}</span>
                                </span>
                            )}
                        </li>

                        {/* Language Toggle */}
                        <li className="border-t border-gray-200 mt-1 pt-1">
                            <button
                                id="language-toggle-btn"
                                onClick={handleLanguageToggle}
                                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                                type="button"
                            >
                                <Globe size={16} className={direction === 'rtl' ? 'ml-2' : 'mr-2'} />
                                {language === 'en' ? 'עברית' : 'English'}
                            </button>
                        </li>

                        {/* Logout */}
                        <li>
                            <button
                                onClick={() => {
                                    onLogout();
                                    setIsOpen(false);
                                }}
                                className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center"
                            >
                                <LogOut size={16} className={direction === 'rtl' ? 'ml-2' : 'mr-2'} />
                                {LABELS.logout || "Logout"}
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ContextMenu;
