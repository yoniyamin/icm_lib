import React from 'react';
import './App.css';
import Inventory from './components/Inventory';
import Members from './components/Members';
import Loans from './components/Loans';
import Reports from './components/Reports';
import { LanguageProvider, useLanguage } from './context/LanguageContext'; // Import the context
import { getFieldLabels } from './utils/labels';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { BookOpen, Users, QrCode, BarChart } from 'lucide-react';
import BannerImage from './static/img.png';

function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}

function AppContent() {
    const { language, toggleLanguage } = useLanguage();
    const LABELS = getFieldLabels(language);

    return (
        <div className="app-container min-h-screen bg-blend-screen max-w-md mx-auto">
            {/* Header with Banner */}
            <header className="bg-white">
                <div className="max-w-md mx-auto flex items-start justify-items-center p-4">
                    <img src={BannerImage} alt="ICM Library Logo" className="max-h-16 sm:max-h-20"/>
                    <div className="logo">
                        <p className="text-sm text-gray-600">{LABELS.app_title}</p>
                    </div>
                </div>
            </header>

            {/* Main Content with Tabs */}
            <div className="max-w-md mx-auto">
                <Tabs defaultValue="inventory" className="w-full">
                    <TabsList className="tabs-list w-full bg-white shadow-md rounded-lg grid grid-cols-4">
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
