import React, { useState, useEffect } from 'react';
import {
    generateBooksReport,
    generateInventoryReport,
    generateQrCodesReport,
    fetchQrCodes,
} from '../services/reportsServices';
import { BarChart2, FileText, Download, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';

const ReportGenerationTab = () => {
    const { language, toggleLanguage } = useLanguage();
    const LABELS = getFieldLabels(language);

    // States for inventory and loans reports
    const [includeHistory, setIncludeHistory] = useState(false);
    const [includeBorrowed, setIncludeBorrowed] = useState(true);
    const [orderBy, setOrderBy] = useState('desc');
    const [sortField, setSortField] = useState('');
    const [reportType, setReportType] = useState('');

    // States for QR Codes PDF report (QR directory is fixed on the backend)
    const [startQr, setStartQr] = useState('');
    const [endQr, setEndQr] = useState('');
    const [qrCount, setQrCount] = useState(null);

    // Options for sorting (only used for inventory and loans reports)
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
        ],
    };

    // When the QR Codes report is selected, fetch the available QR codes count
    // and set defaults (start = 1, end = max).
    useEffect(() => {
        if (reportType === 'qr_codes') {
            fetchQrCodes()
                .then((data) => {
                    const count = data.length;
                    setQrCount(count);
                    setStartQr("1");
                    setEndQr(String(count));
                })
                .catch((err) => {
                    console.error('Error fetching QR codes:', err);
                    setQrCount(0);
                });
        }
    }, [reportType]);

    // Disable the generate button if:
    // - For QR codes: Either field is empty,
    //                "From QR ID" > "To QR ID",
    //                or "To QR ID" exceeds the available count.
    // - Otherwise, disable if sortField is empty.
    const isGenerateDisabled = () => {
        if (reportType === 'qr_codes') {
            if (!startQr || !endQr) return true;
            const from = parseInt(startQr, 10);
            const to = parseInt(endQr, 10);
            if (from > to) return true;
            if (qrCount !== null && to > qrCount) return true;
            return false;
        } else {
            return !sortField;
        }
    };

    const generateReport = async () => {
        try {
            let reportBlob;
            if (reportType === 'inventory') {
                reportBlob = await generateInventoryReport(orderBy, sortField, includeBorrowed);
            } else if (reportType === 'loans') {
                reportBlob = await generateBooksReport(orderBy, sortField, includeHistory);
            } else if (reportType === 'qr_codes') {
                reportBlob = await generateQrCodesReport(
                    parseInt(startQr, 10),
                    parseInt(endQr, 10)
                );
            }

            // Download the generated report (PDF for QR codes, XLSX for others)
            const url = window.URL.createObjectURL(new Blob([reportBlob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `${reportType}_report.${reportType === 'qr_codes' ? 'pdf' : 'xlsx'}`
            );
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error generating report:', error);
            alert(LABELS['error_generating_report']);
        }
    };

    return (
        <div
            className={`report-container ${language === 'he' ? 'rtl' : ''}`}
            dir={language === 'he' ? 'rtl' : 'ltr'}
        >
            {/* Language toggle button remains fixed at the top-left */}
            <button
                onClick={toggleLanguage}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-teal-500 bg-white/50 text-teal-500 shadow-md absolute top-2 left-2"
            >
                {language === 'en' ? 'HE' : 'EN'}
            </button>

            <div className="p-4 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-center mb-4">
                    <BarChart2 className="w-6 h-6 mr-2 text-teal-500" />
                    <h2 className="text-xl font-bold text-gray-800">{LABELS['reports']}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Report Type Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg" dir={language === 'he' ? 'rtl' : 'ltr'}>
                        <h3 className="text-md font-semibold text-teal-600 mb-3 flex items-center">
                            <FileText className={`w-4 h-4 ${language === 'he' ? 'ml-2' : 'mr-2'}`} />
                            {LABELS['report_type_title'] || LABELS['select_report_type']}
                        </h3>
                        <div className="space-y-2">
                            {['inventory', 'loans', 'qr_codes'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setReportType(type)}
                                    className={`w-full p-2 rounded-lg ${language === 'he' ? 'text-right' : 'text-left'} text-sm ${
                                        reportType === type
                                            ? 'bg-teal-500 text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {type === 'inventory'
                                        ? LABELS['inventory_report']
                                        : type === 'loans'
                                            ? LABELS['loans_report']
                                            : LABELS['qr_codes_report'] || 'QR Codes PDF'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Report Options */}
                    <div
                        className={`bg-white p-4 rounded-lg border border-gray-100 ${
                            !reportType ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                        {reportType && (
                            <div className="space-y-3">
                                <h3 className="text-md font-semibold text-teal-600 mb-3 flex items-center">
                                    <Filter className={`w-4 h-4 ${language === 'he' ? 'ml-2' : 'mr-2'}`}/>
                                    {LABELS['report_options']}
                                </h3>

                                <p className={`text-sm text-gray-600 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                                    {reportType === 'inventory'
                                        ? (LABELS['inventory_report_description'] ||
                                            'This report generates an Excel file with current inventory details. You can sort the data by various fields and choose to include borrowed items.')
                                        : reportType === 'loans'
                                            ? (LABELS['loans_report_description'] ||
                                                'This report generates an Excel file of active loans. You can choose to include historical loans and sort by various fields.')
                                            : (LABELS['qr_codes_description'] ||
                                                'This report generates a printable PDF of QR codes arranged in a grid with cutting guides.')}
                                </p>

                                {reportType === 'qr_codes' ? (
                                    <div className="space-y-3">
                                        {qrCount !== null && (
                                            <p className={`text-sm text-purple-600 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                                                {LABELS['qr_codes_available']
                                                    ? LABELS['qr_codes_available'].replace('{count}', qrCount)
                                                    : `There are ${qrCount} QR codes available.`}
                                            </p>
                                        )}
                                        <div className="flex flex-row items-end gap-4">
                                            <div className="flex flex-col flex-1">
                                                <label className="text-xs">
                                                    {LABELS['start_qr'] || 'From QR ID'}
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={startQr}
                                                    onChange={(e) => setStartQr(e.target.value)}
                                                    onBlur={() => {
                                                        const s = parseInt(startQr, 10);
                                                        if (isNaN(s) || s < 1) {
                                                            setStartQr("1");
                                                        }
                                                    }}
                                                    className="border rounded-md p-1 w-full"
                                                />
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <label className="text-xs">
                                                    {LABELS['end_qr'] || 'To QR ID'}
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={qrCount || undefined}
                                                    value={endQr}
                                                    onChange={(e) => setEndQr(e.target.value)}
                                                    onBlur={() => {
                                                        const eVal = parseInt(endQr, 10);
                                                        if (isNaN(eVal) || eVal < 1) {
                                                            setEndQr("1");
                                                        } else if (qrCount !== null && eVal > qrCount) {
                                                            setEndQr(String(qrCount));
                                                        }
                                                    }}
                                                    className="border rounded-md p-1 w-full"
                                                />
                                            </div>
                                        </div>
                                        {parseInt(endQr, 10) > qrCount && (
                                            <p className="text-red-500 text-sm">
                                                {LABELS['end_qr_exceed_error']
                                                    ? LABELS['end_qr_exceed_error'].replace('{qrCount}', qrCount)
                                                    : `End QR ID cannot exceed ${qrCount}.`}
                                            </p>
                                        )}
                                        {startQr && endQr && parseInt(startQr, 10) > parseInt(endQr, 10) && (
                                            <p className="text-red-500 text-sm">
                                                {LABELS['from_qr_greater_error'] ||
                                                    'From QR ID cannot be greater than To QR ID.'}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    // For loans and inventory, show toggles, sort, and order options.
                                    <div className="grid grid-cols-2 gap-2">
                                        {reportType === 'loans' && (
                                            <div className="flex items-center col-span-2">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setIncludeHistory(!includeHistory)}
                                                        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                                            includeHistory ? 'bg-teal-600' : 'bg-gray-200'
                                                        }`}
                                                    >
                            <span
                                className={`absolute ${language === 'he' ? 'right-1' : 'left-1'} top-1 h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                    includeHistory
                                        ? language === 'he'
                                            ? '-translate-x-5'
                                            : 'translate-x-5'
                                        : 'translate-x-0'
                                }`}
                            />
                                                    </button>
                                                    <span
                                                        className="text-sm text-gray-600">{LABELS.include_history}</span>
                                                </div>
                                            </div>
                                        )}

                                        {reportType === 'inventory' && (
                                            <div className="flex items-center col-span-2">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setIncludeBorrowed(!includeBorrowed)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                                            includeBorrowed ? 'bg-teal-600' : 'bg-gray-200'
                                                        }`}
                                                    >
                            <span
                                className={`absolute ${language === 'he' ? 'right-1' : 'left-1'} top-1 h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                    includeBorrowed
                                        ? language === 'he'
                                            ? '-translate-x-5'
                                            : 'translate-x-4'
                                        : 'translate-x-0'
                                }`}
                            />
                                                    </button>
                                                    <span
                                                        className="text-sm text-gray-600">{LABELS.include_borrowed}</span>
                                                </div>
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
                                )}

                                <button
                                    onClick={generateReport}
                                    disabled={isGenerateDisabled()}
                                    className={`w-full p-2 bg-teal-500 text-white rounded-md flex items-center justify-center ${
                                        language === 'he' ? 'flex-row-reverse' : ''
                                    }`}
                                >
                                    {LABELS.generate_report_button}{' '}
                                    <Download className={`w-4 h-4 ${language === 'he' ? 'ml-2' : 'mr-2'}`}/>
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
