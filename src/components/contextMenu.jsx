// contextMenu.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Globe, Activity, X, Menu, BookOpen, QrCode, Users, BarChart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';
import { checkBackendStatus, checkNeonDBStatus } from '../services/services.jsx';
import { APP_VERSION, getChangelogItems } from '../utils/changelog';

// eslint-disable-next-line react/prop-types
const ContextMenu = ({ onLogout, onNavigate, activeTab}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const [backendUp, setBackendUp] = useState(false);
    const [dbUp, setDbUp] = useState(false);
    const { language, toggleLanguage, direction } = useLanguage();
    const LABELS = getFieldLabels(language);

    const tabColors = {
        inventory: "#14b8a6", // teal
        loans: "#ef4444",     // red
        members: "#FDB813",   // yellow
        reports: "#a855f7"    // purple
    };

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
    const changelogItems = getChangelogItems(language);

    // Define navigation items matching your tabs (adjust labels as needed)
    const navigationItems = [
        { value: "inventory", label: LABELS.books, icon: <BookOpen size={16} className={direction === 'rtl' ? 'ml-1' : 'mr-1'} /> },
        { value: "loans", label: LABELS.loans, icon: <QrCode size={16} className={direction === 'rtl' ? 'ml-1' : 'mr-1'} /> },
        { value: "members", label: LABELS.members, icon: <Users size={16} className={direction === 'rtl' ? 'ml-1' : 'mr-1'} /> },
        { value: "reports", label: LABELS.reports, icon: <BarChart size={16} className={direction === 'rtl' ? 'ml-1' : 'mr-1'} /> },
    ];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
            {/* Toggle Button */}
            <button
                onClick={toggleMenu}
                className={`fixed top-4 ${positionClass} w-10 h-10 flex items-center justify-center bg-white/90 rounded-full shadow-md hover:bg-gray-100 transition-colors`}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/10"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {isOpen && (
                <div
                    className={`fixed top-16 ${positionClass} z-50 bg-white rounded-lg shadow-lg p-2 border border-gray-200 ${direction === 'rtl' ? 'rtl text-right' : 'ltr text-left'}`}
                >
                    <ul className="space-y-1 w-48">
                        {/* System Status + Version */}
                        <li className="px-3 py-2 flex items-center justify-between gap-2 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-700">
                                {LABELS.system_status || "System Status"}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowChangelog(true);
                                    setIsOpen(false);
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600 hover:underline shrink-0"
                            >
                                v{APP_VERSION}
                            </button>
                        </li>

                        {/* Backend Status */}
                        <li className="px-3 py-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600">{LABELS.backend_status}</span>
                            <a
                                href="https://status.koyeb.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center ${backendUp ? 'text-green-500' : 'text-red-500'} hover:underline`}
                            >
                                <Activity size={16} className={direction === 'rtl' ? 'ml-1' : 'mr-1'} />
                                <span className="text-xs font-medium">
                                    {backendUp ? LABELS.connected : LABELS.disconnected}
                                </span>
                            </a>
                        </li>

                        {/* NeonDB Status */}
                        <li className="px-3 py-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600">{LABELS.database_status}</span>
                            <a
                                href="https://neonstatus.com/aws-europe-frankfurt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center ${dbUp ? 'text-green-500' : 'text-red-500'} hover:underline`}
                            >
                                <Activity size={16} className={direction === 'rtl' ? 'ml-1' : 'mr-1'} />
                                <span className="text-xs font-medium">
                                    {dbUp ? LABELS.connected : LABELS.disconnected}
                                </span>
                            </a>
                        </li>

                        {/* Navigation Section */}
                        <li className="border-t border-gray-200 mt-1 pt-1">
                            <div className="px-3 py-2 text-sm font-medium text-gray-700">
                                {LABELS.navigate || "Navigate"}
                            </div>
                        </li>
                        {navigationItems.map((item) => {
                            const isActive = (activeTab === item.value);
                            // Use the tabColors object to set the icon color
                            const iconColor = isActive ? tabColors[item.value] : "#666";

                            return (
                                <li key={item.value} className="px-3 py-1">
                                    <button
                                        onClick={() => {
                                            onNavigate(item.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-sm rounded-md hover:bg-gray-100 flex items-center ${isActive ? "font-medium" : ""}`}
                                    >
                                        {/* Clone the icon to apply the color */}
                                        {React.cloneElement(item.icon, {
                                            style: { color: iconColor },
                                            className: direction === 'rtl' ? 'ml-1' : 'mr-1'
                                        })}
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}


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

            {showChangelog && (
                <div
                    className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setShowChangelog(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="changelog-title"
                >
                    <div
                        className={`bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[80vh] overflow-hidden ${direction === 'rtl' ? 'rtl text-right' : 'ltr text-left'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
                            <h2 id="changelog-title" className="text-base font-semibold text-gray-800">
                                {LABELS.whats_new} (v{APP_VERSION})
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowChangelog(false)}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label={LABELS.close}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <ul className="px-4 py-3 space-y-3 overflow-y-auto max-h-[60vh] text-sm text-gray-700 leading-relaxed list-disc marker:text-gray-400">
                            {changelogItems.map((item) => (
                                <li key={item} className={direction === 'rtl' ? 'mr-4' : 'ml-4'}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="px-4 py-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowChangelog(false)}
                                className="w-full py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                {LABELS.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContextMenu;
