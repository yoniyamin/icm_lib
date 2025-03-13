// contextMenu.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Globe, Activity, X, Menu, BookOpen, QrCode, Users, BarChart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';
import { checkBackendStatus, checkNeonDBStatus } from '../services/services.jsx';

// eslint-disable-next-line react/prop-types
const ContextMenu = ({ onLogout, onNavigate, activeTab}) => {
    const [isOpen, setIsOpen] = useState(false);
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
                        {/* System Status */}
                        <li className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                            {LABELS.system_status || "System Status"}
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
        </div>
    );
};

export default ContextMenu;
