import React, { useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useLanguage } from "../context/LanguageContext";
import { getFieldLabels } from "../utils/labels";

// eslint-disable-next-line react/prop-types
const QRCodeScanner = ({ onScanSuccess, onScanError, onScanCancel }) => {
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [errorDetails, setErrorDetails] = useState("");
    const [attemptCount, setAttemptCount] = useState(0);

    // Language Support
    const { language } = useLanguage();
    const LABELS = getFieldLabels(language);

    const attemptScan = async (html5QrCode, file, config = {}, configIndex) => {
        try {
            const result = await html5QrCode.scanFile(file, /* verbose= */ true, config);
            console.log(`Scan attempt ${configIndex} succeeded:`, result);
            return result;
        } catch (error) {
            console.log(`Scan attempt ${configIndex} failed:`, error);
            // Format a more user-friendly error message
            const errorMsg = formatErrorMessage(error);
            throw new Error(errorMsg);
        }
    };

    // Format error messages to be more user-friendly
    const formatErrorMessage = (error) => {
        const msg = error?.message || LABELS.error_scanning;

        // Common error patterns and their user-friendly translations
        if (msg.includes("No barcode or QR code found")) {
            return LABELS.qr_error_no_code || "No QR code detected. Please try again.";
        } else if (msg.includes("BarCodeDetector not supported")) {
            return LABELS.qr_error_no_support || "Your browser doesn't support QR scanning.";
        } else if (msg.includes("timeout")) {
            return LABELS.qr_error_timeout || "Scanning timed out. Try using a smaller image.";
        } else if (msg.includes("unable to parse")) {
            return LABELS.qr_error_unreadable || "The QR code is unclear or damaged.";
        } else if (msg.includes("file too large")) {
            return LABELS.qr_error_large_file || "The image file is too large.";
        }

        return `${LABELS.error_scanning}: ${msg}`;
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Log detailed file information
        console.log("File details:", file.name, file.type, file.size);
        console.log("File last modified:", new Date(file.lastModified).toISOString());

        setIsProcessingImage(true);
        setErrorDetails(""); // Clear any previous errors
        setAttemptCount(0);
        const html5QrCode = new Html5Qrcode("qr-reader");

        // Enhanced device detection
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        console.log("Device detection - iOS:", isIOS, "Safari:", isSafari);

        try {
            // Create a smaller version of the image to help with processing
            const resizedFile = await resizeImageIfNeeded(file, isIOS);

            // iOS-specific configurations first if on iOS
            const scanConfigs = isIOS ? [
                // iOS-specific configs first
                {
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: false
                    }
                },
                // Try with BarCodeDetector API (newer iOS versions might support this)
                {
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: true
                    }
                },
                // Default configuration as last resort
                {}
            ] : [
                // Non-iOS devices: Try BarCodeDetector first as it's usually better
                {
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: true
                    }
                },
                {
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                },
                // Default as fallback
                {}
            ];

            // Try each configuration
            let scanSuccess = false;
            let errors = [];

            for (let i = 0; i < scanConfigs.length; i++) {
                try {
                    console.log(`Attempting scan with config ${i + 1}:`, scanConfigs[i]);
                    setAttemptCount(i + 1);

                    // Use the potentially resized file
                    const fileToScan = resizedFile || file;
                    console.log("Scanning file:", fileToScan.name, fileToScan.type, fileToScan.size);

                    const result = await attemptScan(html5QrCode, fileToScan, scanConfigs[i], i + 1);
                    if (result) {
                        scanSuccess = true;
                        try {
                            await html5QrCode.clear();
                        } catch (clearError) {
                            console.warn("Error clearing scanner:", clearError);
                        }
                        onScanSuccess(result);
                        break;
                    }
                } catch (error) {
                    console.log(`Config ${i + 1} failed:`, error);
                    errors.push(error.message);
                    // Continue to next config
                }
            }

            // If we get here and scanSuccess is still false, all configs failed
            if (!scanSuccess) {
                // Show the most informative error (avoid duplicates)
                const uniqueErrors = [...new Set(errors)];
                const errorMessage = uniqueErrors.length > 0
                    ? uniqueErrors[0]
                    : "Failed to scan QR code. Please try a different image with better lighting and focus.";

                // Set the error message in the state so it displays in the UI
                setErrorDetails(errorMessage);

                // Don't call onScanError immediately - we'll wait for the user to dismiss
                // or they can see the error and try again
            }

        } catch (error) {
            console.error("Final error:", error);
            // Set the error message for display first
            const errorMessage = formatErrorMessage(error);
            setErrorDetails(errorMessage);
            // Don't immediately call onScanError
        } finally {
            try {
                await html5QrCode.clear();
            } catch (error) {
                console.error("Error clearing scanner:", error);
            }
            setIsProcessingImage(false);
        }
    };

    // Helper function to resize large images from iOS devices
    const resizeImageIfNeeded = async (file, isIOS) => {
        // Only resize if it's an image and over 1MB (common for iOS photos)
        if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
            return new Promise((resolve, reject) => {
                try {
                    const img = new Image();
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    img.onload = () => {
                        // Get the original dimensions
                        let width = img.width;
                        let height = img.height;

                        // Calculate new dimensions (max dimension 1200px)
                        const MAX_DIMENSION = 1200;
                        if (width > height && width > MAX_DIMENSION) {
                            height = Math.round((height * MAX_DIMENSION) / width);
                            width = MAX_DIMENSION;
                        } else if (height > MAX_DIMENSION) {
                            width = Math.round((width * MAX_DIMENSION) / height);
                            height = MAX_DIMENSION;
                        }

                        // Set canvas dimensions
                        canvas.width = width;
                        canvas.height = height;

                        // Draw resized image
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to blob with high quality for QR codes
                        canvas.toBlob((blob) => {
                            if (blob) {
                                // Create a File object from the Blob
                                const resizedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                console.log("Resized image from", file.size, "to", resizedFile.size, "bytes");
                                resolve(resizedFile);
                            } else {
                                console.warn("Failed to create blob from canvas");
                                resolve(null); // Fall back to original file
                            }
                        }, 'image/jpeg', 0.95); // High quality for QR codes
                    };

                    img.onerror = () => {
                        console.warn("Failed to load image for resizing");
                        resolve(null); // Fall back to original file
                    };

                    // Load image from file
                    img.src = URL.createObjectURL(file);
                } catch (error) {
                    console.error("Error resizing image:", error);
                    resolve(null); // Fall back to original file
                }
            });
        }
        return null; // No resize needed, use original
    };

    // Handler for the "Try Again" button
    const handleTryAgain = () => {
        setErrorDetails("");
        // Reset file input by clearing the error
    };

    // Handler for the "Report Error" button to notify parent component
    const handleReportError = () => {
        onScanError(new Error(errorDetails));
        // This will close the scanner through the parent component
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">{LABELS.ScanQR}</h3>
                <div className="space-y-4">
                    <div id="qr-reader" style={{ display: 'none' }}></div>

                    {!errorDetails ? (
                        <div className="flex flex-col items-center">
                            <label className="w-full flex flex-col items-center px-4 py-6 bg-coral text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                                <span className="mt-2 text-base leading-normal">{LABELS.qr_select_image || "Select an image"}</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageUpload}
                                    disabled={isProcessingImage}
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="text-center text-red-500 p-3 border border-red-200 rounded bg-red-50 mb-4">
                            <p className="font-medium mb-2">{LABELS.error_scanning}</p>
                            <p className="text-sm mb-3">{errorDetails}</p>
                            <p className="text-xs mb-3 text-gray-600">
                                {LABELS.qr_error_tips}
                            </p>
                            <div className="flex space-x-2 mt-2">
                                <button
                                    onClick={handleTryAgain}
                                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                                >
                                    {LABELS.qr_try_again || "Try Again"}
                                </button>
                                <button
                                    onClick={handleReportError}
                                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
                                >
                                    {LABELS.qr_cancel || "Cancel"}
                                </button>
                            </div>
                        </div>
                    )}

                    {isProcessingImage && (
                        <div className="text-center text-gray-600">
                            {LABELS.processing_image || "Processing image..."}  {attemptCount > 0 && `(Attempt ${attemptCount})`}
                        </div>
                    )}

                    {!errorDetails && (
                        <button
                            onClick={onScanCancel}
                            className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                            {LABELS.qr_cancel || "Cancel"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRCodeScanner;