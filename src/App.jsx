import React, { useState } from 'react';
import './App.css';
import Login from "./components/Login";
import Inventory from './components/Inventory';
import Members from './components/Members';
import Loans from './components/Loans';
import Reports from './components/Reports';
import { LanguageProvider, useLanguage } from './context/LanguageContext'; // Import the context
import { getFieldLabels } from './utils/labels';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { BookOpen, Users, QrCode, BarChart, LogOut } from 'lucide-react';
import BannerImage from './static/banner_nobg.png';


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

function AppContent({onLogout}) {
    const { language } = useLanguage();
    const LABELS = getFieldLabels(language);

    return (
        <div className="app-container min-h-screen bg-blend-screen max-w-md mx-auto">
            {/* Header with Banner */}
            <header className="bg-white drop-shadow-2xl rounded-full">
                <div className="banner-container">
                    <img src={BannerImage} alt="ICM Library Logo" className="banner-logo"/>
                    <div className="banner-text">
                        <p className="text-sm text-gray-600">{LABELS.app_title}</p>
                    </div>
                </div>
                {/* Logout Button */}
                <button className="logout-button" onClick={onLogout} title="Logout">
                    <LogOut className="logout-icon"/>
                </button>
            </header>

            {/* Main Content with Tabs */}
            <div className="max-w-md mx-auto">
                <Tabs defaultValue="inventory" className="tabs-content">
                    <TabsList className="tabs-list w-full shadow-md rounded-lg grid grid-cols-4">
                        <TabsTrigger
                            value="inventory"
                            className="tab-item flex items-center justify-center data-[state=active]:bg-teal-500 data-[state=active]:text-white text-gray-800 py-2 rounded-t-lg hover:bg-gray-100"
                        >
                            <BookOpen className="w-4 h-4 mr-2"/>
                            {LABELS.books}
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="tab-item flex items-center justify-center data-[state=active]:bg-[#FDB813] data-[state=active]:text-white text-gray-800 py-2 rounded-t-lg hover:bg-gray-100"
                        >
                            <Users className="w-4 h-4 mr-2"/>
                            {LABELS.members}
                        </TabsTrigger>
                        <TabsTrigger
                            value="loans"
                            className="tab-item flex items-center justify-center data-[state=active]:bg-red-500 data-[state=active]:text-white text-gray-800 py-2 rounded-t-lg hover:bg-gray-100"
                        >
                            <QrCode className="w-4 h-4 mr-2"/>
                            {LABELS.loans}
                        </TabsTrigger>
                        <TabsTrigger
                            value="reports"
                            className="tab-item flex items-center justify-center data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-800 py-2 rounded-t-lg hover:bg-gray-100"
                        >
                            <BarChart className="w-4 h-4 mr-2"/>
                            {LABELS.reports}
                        </TabsTrigger>
                    </TabsList>
                    <div style={{height: '15px'}}></div>

                    <TabsContent value="inventory">
                        <Inventory/>
                    </TabsContent>
                    <TabsContent value="members">
                        <Members/>
                    </TabsContent>
                    <TabsContent value="loans">
                        <Loans/>
                    </TabsContent>
                    <TabsContent value="reports">
                        <Reports/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default App;
