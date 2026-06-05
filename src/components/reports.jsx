import React, { useState, useEffect } from 'react';
import {
    generateBooksReport,
    generateInventoryReport,
    generateQrCodesReport,
    fetchQrCodesWithTitles,
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
    const [qrCodeList, setQrCodeList] = useState([]);
    const [allSelected, setAllSelected] = useState(true);
    const [rawData, setRawData] = useState([]);
    const [addedFromMonth, setAddedFromMonth] = useState('');
    const [addedFromYear, setAddedFromYear] = useState('');
    const [addedToMonth, setAddedToMonth] = useState('');
    const [addedToYear, setAddedToYear] = useState('');
    const [qrCodesLoading, setQrCodesLoading] = useState(false);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear + 1 - i);
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

    const hasAddedDateFilter = () =>
        (addedFromMonth && addedFromYear) || (addedToMonth && addedToYear);

    const clearAddedDateFilter = () => {
        setAddedFromMonth('');
        setAddedFromYear('');
        setAddedToMonth('');
        setAddedToYear('');
    };

    // Local sorting states for the table
    const [sortColumn, setSortColumn] = useState('qr_code');
    const [sortAsc, setSortAsc] = useState(true);

    function parseQrNumber(qrCode) {
        const match = qrCode.match(/\d+$/);
        if (!match) return 0;
        return parseInt(match[0], 10);
    }

    function getQrPadLength(qrList) {
        if (!qrList.length) return 3;
        const maxNum = Math.max(...qrList.map((item) => parseQrNumber(item.qr_code)));
        return Math.max(String(maxNum).length, 3);
    }

    function formatQrNumber(qrCode, padLength) {
        return String(parseQrNumber(qrCode)).padStart(padLength, '0');
    }

    function buildRangeBoundaryDate(month, year, boundary) {
        if (!month || !year) return null;
        const paddedMonth = String(month).padStart(2, '0');
        if (boundary === 'start') {
            return `${year}-${paddedMonth}-01`;
        }
        const lastDay = new Date(Number(year), Number(month), 0).getDate();
        return `${year}-${paddedMonth}-${String(lastDay).padStart(2, '0')}`;
    }

    function isDateFilterIncomplete() {
        const partialFrom =
            (addedFromMonth && !addedFromYear) || (!addedFromMonth && addedFromYear);
        const partialTo =
            (addedToMonth && !addedToYear) || (!addedToMonth && addedToYear);
        return partialFrom || partialTo;
    }

    function getActiveDateFilterParams() {
        if (isDateFilterIncomplete()) {
            return null;
        }
        return {
            fromDate: buildRangeBoundaryDate(addedFromMonth, addedFromYear, 'start'),
            toDate: buildRangeBoundaryDate(addedToMonth, addedToYear, 'end'),
        };
    }

    function sortQrList(qrList, column, ascending) {
        const newData = [...qrList];
        newData.sort((a, b) => {
            if (column === 'qr_code') {
                const numA = parseQrNumber(a.qr_code);
                const numB = parseQrNumber(b.qr_code);
                return ascending ? numA - numB : numB - numA;
            }
            if (column === 'title') {
                const valA = (a.title || '').toLowerCase();
                const valB = (b.title || '').toLowerCase();
                if (valA < valB) return ascending ? -1 : 1;
                if (valA > valB) return ascending ? 1 : -1;
                return 0;
            }
            return 0;
        });
        return newData;
    }


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

    // Fetch QR codes when report opens or date filter changes (server-side filter)
    useEffect(() => {
        if (reportType !== 'qr_codes') return;
        if (isDateFilterIncomplete()) return;

        let cancelled = false;
        const filterParams = getActiveDateFilterParams();

        setQrCodesLoading(true);
        fetchQrCodesWithTitles(filterParams ?? {})
            .then((data) => {
                if (cancelled) return;
                setRawData((prev) => {
                    const selectedByCode = Object.fromEntries(
                        prev.map((item) => [item.qr_code, item.selected])
                    );
                    return data.map((item) => ({
                        ...item,
                        selected: selectedByCode[item.qr_code] ?? true,
                    }));
                });
            })
            .catch((err) => {
                if (cancelled) return;
                console.error(err);
                setRawData([]);
            })
            .finally(() => {
                if (!cancelled) setQrCodesLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [reportType, addedFromMonth, addedFromYear, addedToMonth, addedToYear]);

    // Sort displayed list whenever data or sort changes
    useEffect(() => {
        if (reportType === 'qr_codes') {
            const sorted = sortQrList(rawData, sortColumn, sortAsc);
            setQrCodeList(sorted);
            setAllSelected(sorted.length > 0 && sorted.every((item) => item.selected));
        }
    }, [rawData, sortColumn, sortAsc, reportType]);

    const qrPadLength = getQrPadLength(qrCodeList.length ? qrCodeList : rawData);

    const handleSelectToggle = (qrCode) => {
        setRawData((prev) =>
            prev.map((item) =>
                item.qr_code === qrCode ? { ...item, selected: !item.selected } : item
            )
        );
    };

    // Select or deselect visible codes at once
    const handleAllSelectedToggle = () => {
        const newValue = !allSelected;
        setAllSelected(newValue);
        setRawData((prev) => prev.map((item) => ({ ...item, selected: newValue })));
    };

    // A simple helper to disable the "Generate" button if invalid or nothing selected
    const isGenerateDisabled = () => {
        if (!reportType) return true;

        if (reportType === 'inventory' || reportType === 'loans') {
            // require that user chooses a sortField
            return !sortField;
        } else if (reportType === 'qr_codes') {
            // require that at least 1 QR code is selected
            return !qrCodeList.some((item) => item.selected);
        }
        return false;
    };

    const generateReport = async () => {
        try {
            let reportBlob;
            if (reportType === 'inventory') {
                reportBlob = await generateInventoryReport(orderBy, sortField, includeBorrowed);
            } else if (reportType === 'loans') {
                reportBlob = await generateBooksReport(orderBy, sortField, includeHistory);
            } else if (reportType === 'qr_codes') {
                const selectedCodes = qrCodeList
                    .filter((item) => item.selected)
                    .map((item) => item.qr_code);
                if (selectedCodes.length === 0) {
                    alert('No QR codes selected!');
                    return;
                }
                reportBlob = await generateQrCodesReport(selectedCodes);
            }

            // Download file
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
            alert(LABELS.error_generating_report || 'Error generating report.');
        }
    };

    // Clickable table header for sorting
    const handleColumnHeaderClick = (columnName) => {
        if (sortColumn === columnName) {
            // if same column, just flip the direction
            setSortAsc(!sortAsc);
        } else {
            // switch to a new column, default ascending
            setSortColumn(columnName);
            setSortAsc(true);
        }
    };

    const renderMonthYearPicker = (label, month, setMonth, year, setYear) => (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className="grid grid-cols-2 gap-2">
                <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="border border-gray-300 rounded-md py-2 px-2 text-sm w-full bg-white"
                    aria-label={`${label} ${LABELS.month}`}
                >
                    <option value="">{LABELS.month}</option>
                    {monthOptions.map((monthNumber) => (
                        <option key={monthNumber} value={String(monthNumber)}>
                            {String(monthNumber).padStart(2, '0')}
                        </option>
                    ))}
                </select>
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="border border-gray-300 rounded-md py-2 px-2 text-sm w-full bg-white"
                    aria-label={`${label} ${LABELS.year}`}
                >
                    <option value="">{LABELS.year}</option>
                    {yearOptions.map((yearNumber) => (
                        <option key={yearNumber} value={String(yearNumber)}>
                            {yearNumber}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <div
            className={`report-container ${language === 'he' ? 'rtl' : ''}`}
            dir={language === 'he' ? 'rtl' : 'ltr'}
        >

            <div className="p-4 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-center mb-4">
                    <BarChart2 className="w-6 h-6 mr-2 text-teal-500" />
                    <h2 className="text-xl font-bold text-gray-800">{LABELS['reports']}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Report Type Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg border-gray-200 border-1" dir={language === 'he' ? 'rtl' : 'ltr'}>
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
                        className={`bg-gray-100 p-4 rounded-lg border border-gray-300 ${
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
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-3 p-3 bg-white rounded-md border border-gray-200">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {LABELS.filter_by_added_date}
                                            </span>
                                            {renderMonthYearPicker(
                                                LABELS.date_from,
                                                addedFromMonth,
                                                setAddedFromMonth,
                                                addedFromYear,
                                                setAddedFromYear
                                            )}
                                            {renderMonthYearPicker(
                                                LABELS.date_to,
                                                addedToMonth,
                                                setAddedToMonth,
                                                addedToYear,
                                                setAddedToYear
                                            )}
                                            {hasAddedDateFilter() && (
                                                <button
                                                    type="button"
                                                    onClick={clearAddedDateFilter}
                                                    className="text-sm text-teal-600 hover:text-teal-800 self-start"
                                                >
                                                    {LABELS.clear_date_filter}
                                                </button>
                                            )}
                                        </div>

                                        {/* Toggle Switch for Select All */}
                                        <div className="flex items-center gap-3">
                                            <span>{LABELS.select_all || 'Select All'}</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={handleAllSelectedToggle}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        {/* Table for the QR items */}
                                        {qrCodesLoading ? (
                                            <p className="text-sm text-gray-500">{LABELS.loading_qr_codes}</p>
                                        ) : isDateFilterIncomplete() ? (
                                            <p className="text-sm text-gray-500">{LABELS.complete_date_filter}</p>
                                        ) : (
                                        <table className="qr-table">
                                            <thead>
                                            <tr>
                                                <th style={{width: '40px'}}></th>
                                                <th onClick={() => handleColumnHeaderClick('qr_code')}>
                                                    {LABELS.qr_code_number}{' '}
                                                    {sortColumn === 'qr_code' && (sortAsc ? '▲' : '▼')}
                                                </th>
                                                <th onClick={() => handleColumnHeaderClick('title')}>
                                                    {LABELS.book_title || 'Title'}{' '}
                                                    {sortColumn === 'title' && (sortAsc ? '▲' : '▼')}
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {qrCodeList.map((qrItem) => (
                                                <tr
                                                    key={qrItem.qr_code}
                                                    onClick={() => handleSelectToggle(qrItem.qr_code)}
                                                    className="cursor-pointer"
                                                >
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={qrItem.selected}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectToggle(qrItem.qr_code);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="font-mono">{formatQrNumber(qrItem.qr_code, qrPadLength)}</td>
                                                    <td>{qrItem.title || '(No Title)'}</td>
                                                </tr>
                                            ))}
                                            {qrCodeList.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="text-sm text-gray-500">
                                                        {hasAddedDateFilter()
                                                            ? LABELS.no_qr_codes_in_range
                                                            : (LABELS.no_qr_codes || 'No QR codes found.')}
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
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
