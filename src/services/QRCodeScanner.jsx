import React, { useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";

const QRCodeScanner = ({ onScanSuccess, onScanError, onScanCancel }) => {
    const [isProcessingImage, setIsProcessingImage] = useState(false);

    const attemptScan = async (html5QrCode, file, config = {}) => {
        try {
            const result = await html5QrCode.scanFile(file, /* verbose= */ true, config);
            console.log("Scan attempt succeeded:", result);
            return result;
        } catch (error) {
            console.log("Scan attempt failed:", error);
            throw error;
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessingImage(true);
        const html5QrCode = new Html5Qrcode("qr-reader");

        try {
            // Array of different scanning configurations to try
            const scanConfigs = [
                {}, // Default config
                {
                    bindSearchRegion: true,
                    maxLength: 512,
                    minLength: 1
                },
                {
                    returnDetailedScanResult: true,
                    maxLength: 512,
                    minLength: 1
                },
                {
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: false
                    },
                    maxLength: 512,
                    minLength: 1
                }
            ];

            // Try each configuration
            for (let i = 0; i < scanConfigs.length; i++) {
                try {
                    console.log(`Attempting scan with config ${i + 1}:`, scanConfigs[i]);
                    const result = await attemptScan(html5QrCode, file, scanConfigs[i]);
                    if (result) {
                        html5QrCode.clear();
                        onScanSuccess(result);
                        return;
                    }
                } catch (error) {
                    console.log(`Config ${i + 1} failed:`, error);
                    // Continue to next config
                }
            }

            // If we get here, all configs failed
            throw new Error("Unable to scan QR code with any configuration");

        } catch (error) {
            console.error("Final error:", error);
            onScanError(error);
        } finally {
            try {
                await html5QrCode.clear();
            } catch (error) {
                console.error("Error clearing scanner:", error);
            }
            setIsProcessingImage(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
                <div className="space-y-4">
                    <div id="qr-reader" style={{ display: 'none' }}></div>
                    <div className="flex flex-col items-center">
                        <label className="w-full flex flex-col items-center px-4 py-6 bg-coral text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                            <span className="mt-2 text-base leading-normal">Select an image</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isProcessingImage}
                            />
                        </label>
                    </div>
                    {isProcessingImage && (
                        <div className="text-center text-gray-600">
                            Processing image...
                        </div>
                    )}
                    <button
                        onClick={onScanCancel}
                        className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeScanner;