import React, { useState } from 'react';
import { generateBooksReport, generateInventoryReport } from '../services/reportsServices';
import { BarChart2, FileText, Download, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';

const ReportGenerationTab = () => {
    const { language, toggleLanguage } = useLanguage();
    const LABELS = getFieldLabels(language); // Use the updated language for labels
    const [includeHistory, setIncludeHistory] = useState(false);
    const [includeBorrowed, setIncludeBorrowed] = useState(true);
    const [orderBy, setOrderBy] = useState('desc');
    const [sortField, setSortField] = useState('');
    const [reportType, setReportType] = useState('');

    const sortOptions = {
        inventory: [
            { value: 'title', label: LABELS['book_title'] },
            { value: 'author', label: LABELS['author'] },
            { value: 'id', label: LABELS['id'] },
            { value: 'loan_status', label: LABELS['loan_status'] },
        ],
        loans: [
            { value: 'title', label: LABELS['book_title'] },
            { value: 'author', label: LABELS['author'] },
            { value: 'id', label: LABELS['id'] },
        ]
    };

    const generateReport = async () => {
        try {
            let reportBlob;

            if (reportType === 'inventory') {
                reportBlob = await generateInventoryReport(orderBy, sortField, includeBorrowed);
            } else if (reportType === 'loans') {
                reportBlob = await generateBooksReport(orderBy, sortField, includeHistory);
            }

            // Download logic (unchanged)
            const url = window.URL.createObjectURL(new Blob([reportBlob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}_report.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error generating report:', error);
            alert(LABELS['error_generating_report']);
        }
    };


    return (
        <div className={`report-container ${language === 'he' ? 'rtl' : ''}`}>
            <button
                className="w-12 h-12 flex items-center justify-center rounded-full border border-teal-500 bg-white text-teal-500 shadow-md absolute top-4 left-4"
                onClick={toggleLanguage}
            >
                {language === 'en' ? 'HE' : 'EN'}
            </button>
            <div className="p-4 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-center mb-4">
                    <BarChart2 className="w-6 h-6 mr-2 text-teal-500"/>
                    <h2 className="text-xl font-bold text-gray-800">{LABELS['reports']}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Report Type Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-md font-semibold text-teal-600 mb-3 flex items-center">
                            <FileText className="w-4 h-4 mr-2"/>
                            {LABELS['select_report_type']}
                        </h3>
                        <div className="space-y-2">
                            {['inventory', 'loans'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setReportType(type)}
                                    className={`w-full p-2 rounded-lg text-left text-sm ${
                                        reportType === type
                                            ? 'bg-teal-500 text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {type === 'inventory' ? LABELS['inventory_report'] : LABELS['loans_report']}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Report Options */}
                    <div
                        className={`bg-white p-4 rounded-lg border border-gray-100 ${!reportType ? 'opacity-50 pointer-events-none' : ''}`}>
                        {reportType && (
                            <div className="space-y-3">
                                <h3 className="text-md font-semibold text-teal-600 mb-3 flex items-center">
                                    <Filter className="w-4 h-4 mr-2"/>
                                    {LABELS['report_options']}
                                </h3>

                                <div className="grid grid-cols-2 gap-2">
                                    {reportType === 'loans' && (
                                        <div className="flex items-center col-span-2">
                                            <input
                                                type="checkbox"
                                                checked={includeHistory}
                                                onChange={(e) => setIncludeHistory(e.target.checked)}
                                                className="mr-2"
                                            />
                                            <label>{LABELS.include_history}</label>
                                        </div>
                                    )}

                                    {reportType === 'inventory' && (
                                        <div className="flex items-center col-span-2">
                                            <input
                                                type="checkbox"
                                                checked={includeBorrowed}
                                                onChange={(e) => setIncludeBorrowed(e.target.checked)}
                                                className="mr-2"
                                            />
                                            <label>{LABELS.include_borrowed}</label>
                                        </div>
                                    )}

                                    <div className="flex flex-col">
                                        <label>{LABELS['sort_by']}</label>
                                        <select
                                            value={sortField}
                                            onChange={(e) => setSortField(e.target.value)}
                                            className="border rounded-md"
                                        >
                                            <option value="">{LABELS['select_field']}</option>
                                            {sortOptions[reportType].map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label>{LABELS['order']}</label>
                                        <select
                                            value={orderBy}
                                            onChange={(e) => setOrderBy(e.target.value)}
                                            className="border rounded-md"
                                        >
                                            <option value="asc">{LABELS['ascending']}</option>
                                            <option value="desc">{LABELS['descending']}</option>
                                        </select>
                                    </div>
                                </div>

                                <button onClick={generateReport} disabled={!sortField}
                                        className="w-full p-2 bg-teal-500 text-white rounded-md">
                                    <Download className="w-4 h-4 mr-2"/>
                                    {LABELS['generate_report_button']}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportGenerationTab;
