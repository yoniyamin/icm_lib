// App.jsx
import React, { useState } from 'react';
import './App.css';
import Login from "./components/Login";
import Inventory from './components/Inventory';
import Members from './components/Members';
import Loans from './components/Loans';
import Reports from './components/Reports';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { getFieldLabels } from './utils/labels';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { BookOpen, Users, QrCode, BarChart } from 'lucide-react';
import BannerImage from './static/banner_nobg.png';
import ContextMenu from './components/contextMenu';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    return (
        <LanguageProvider>
            {isAuthenticated ? <AppContent onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
        </LanguageProvider>
    );
}

// eslint-disable-next-line react/prop-types
function AppContent({ onLogout }) {
    const { language } = useLanguage();
    const LABELS = getFieldLabels(language);
    const isRTL = language === "he";

    // Add activeTab state and pass its setter to the ContextMenu
    const [activeTab, setActiveTab] = useState("inventory");

    // Define your tabs (order can be adjusted based on language if needed)
    const tabs = isRTL
        ? [
            { value: "reports", icon: <BarChart className="w-4 h-4 mr-2" />, label: LABELS.reports },
            { value: "members", icon: <Users className="w-4 h-4 mr-2" />, label: LABELS.members },
            { value: "loans", icon: <QrCode className="w-4 h-4 mr-2" />, label: LABELS.loans },
            { value: "inventory", icon: <BookOpen className="w-4 h-4 mr-2" />, label: LABELS.books }
        ]
        : [
            { value: "inventory", icon: <BookOpen className="w-4 h-4 mr-2" />, label: LABELS.books },
            { value: "loans", icon: <QrCode className="w-4 h-4 mr-2" />, label: LABELS.loans },
            { value: "members", icon: <Users className="w-4 h-4 mr-2" />, label: LABELS.members },
            { value: "reports", icon: <BarChart className="w-4 h-4 mr-2" />, label: LABELS.reports }
        ];

    return (

        <div className={`app-container min-h-screen bg-blend-screen max-w-md mx-auto ${isRTL ? "rtl" : "ltr"}`}>
            {/* Header with Banner */}
            <ContextMenu onLogout={onLogout} onNavigate={setActiveTab} activeTab={activeTab} />
            <header className="bg-white drop-shadow-2xl rounded-full">
                <div className="banner-container">
                    <img src={BannerImage} alt="ICM Library Logo" className="banner-logo" />
                    <div className="banner-text">
                        <p className="text-sm text-gray-600">{LABELS.app_title}</p>
                    </div>
                </div>
            </header>

            {/* Main Content with Tabs */}
            <div className="max-w-md mx-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-content">
                    <TabsList className={`tabs-list w-full shadow-md rounded-lg grid grid-cols-4`}>
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={`tab-item 
                                    flex items-center justify-center 
                                    text-gray-800 py-2 rounded-t-lg hover:bg-gray-100 
                                    ${tab.value === "inventory" && "data-[state=active]:bg-teal-500 data-[state=active]:!text-white"}
                                    ${tab.value === "loans" && "data-[state=active]:bg-red-500 data-[state=active]:!text-white"}
                                    ${tab.value === "members" && "data-[state=active]:bg-[#FDB813] data-[state=active]:!text-white"}
                                    ${tab.value === "reports" && "data-[state=active]:bg-purple-500 data-[state=active]:!text-white"}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div style={{ height: '15px' }}></div>

                    <TabsContent value="inventory">
                        <Inventory />
                    </TabsContent>
                    <TabsContent value="loans">
                        <Loans />
                    </TabsContent>
                    <TabsContent value="members">
                        <Members />
                    </TabsContent>
                    <TabsContent value="reports">
                        <Reports />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default App;
