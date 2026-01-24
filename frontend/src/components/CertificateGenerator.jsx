import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FiDownload, FiShare2, FiCheckCircle } from 'react-icons/fi';
import logoIcon from '../assets/logo_icon_transparent.png';
import ProgressManager from '../utils/progressManager';

const CertificateGenerator = ({ userName, courseName, completionDate, sector, courseHours }) => {
    const certificateRef = useRef(null);
    const [isDownloading, setIsDownloading] = React.useState(false);

    // Generate a consistent verification ID
    const generateVerificationId = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `R2R-${timestamp}-${random}`;
    };

    const verificationId = useRef(generateVerificationId()).current;

    // Automatically save certificate to profile when generated
    useEffect(() => {
        if (sector && verificationId) {
            console.log("Issuing certificate to profile:", sector, verificationId);
            ProgressManager.saveCertificate(sector, verificationId);
        }
    }, [sector, verificationId]);

    // In a real app, this would be a permanent URL. For demo, we use a placeholder.
    const credentialUrl = `https://root2rise.com/verify/${verificationId}`;

    const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleDownload = () => {
        console.log("Certificate Download clicked");
        setIsDownloading(true);

        // Use setTimeout to allow the UI to update with "Downloading..." spinner
        setTimeout(async () => {
            try {
                if (!certificateRef.current) {
                    throw new Error("Certificate element not found");
                }

                console.log("Capturing Certificate UI...");

                const canvas = await html2canvas(certificateRef.current, {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    backgroundColor: '#ffffff',
                    allowTaint: true
                });

                const imgData = canvas.toDataURL('image/png');
                if (imgData.length < 1000) throw new Error("Captured image is empty");

                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgProps = pdf.getImageProperties(imgData);
                const ratio = imgProps.width / imgProps.height;

                let finalWidth = pdfWidth;
                let finalHeight = pdfWidth / ratio;

                if (finalHeight > pdfHeight) {
                    finalHeight = pdfHeight;
                    finalWidth = pdfHeight * ratio;
                }

                const x = (pdfWidth - finalWidth) / 2;
                const y = (pdfHeight - finalHeight) / 2;

                pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

                // --- ROBUST DOWNLOAD RELIABILITY FIX ---
                const filename = `${courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_certificate.pdf`;
                console.log("Attempting manual download for:", filename);

                // 1. Generate Blob
                const blob = pdf.output('blob');
                const blobUrl = URL.createObjectURL(blob);

                // 2. Force clicking a temporary link (Manual Trigger)
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // 3. ALSO Open in New Tab (Backup Strategy)
                // If the download is blocked by browser, this will force it to appear.
                // We use a small timeout to let the download event fire first.
                setTimeout(() => {
                    window.open(blobUrl, '_blank');
                }, 100);

                console.log("Download triggered manually + Tab opened");

            } catch (error) {
                console.error('Download failed', error);
                alert(`Download failed: ${error.message}`);
            } finally {
                setIsDownloading(false);
            }
        }, 500);
    };

    // LinkedIn Add to Profile URL construction
    const handleLinkedInClick = () => {
        const date = new Date(completionDate);
        const params = new URLSearchParams({
            startTask: 'CERTIFICATION_NAME',
            name: `${courseName} - ${courseHours} Hours`,
            organizationName: 'Root2Rise',
            issueYear: date.getFullYear(),
            issueMonth: date.getMonth() + 1,
            certUrl: credentialUrl,
            certId: verificationId
        });

        window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, '_blank');
    };



    return (
        <div className="py-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
            >
                {/* Certificate Container */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 mb-6 overflow-x-auto">
                    {/* The Actual Certificate */}
                    <div
                        ref={certificateRef}
                        className="bg-white rounded-lg shadow-xl overflow-hidden"
                        style={{
                            minWidth: '800px',
                            aspectRatio: '1.414 / 1',
                        }}
                    >
                        {/* Top Gradient Bar */}
                        <div className="h-2" style={{
                            background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)'
                        }} />

                        <div className="p-8 md:p-12 h-full flex flex-col" style={{ height: 'calc(100% - 8px)' }}>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                {/* Logo + Brand */}
                                <div className="flex items-center gap-3">
                                    <img src={logoIcon} alt="Root2Rise" className="h-12 w-auto" />
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">Root2Rise</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Learning Platform</div>
                                    </div>
                                </div>

                                {/* Certificate Label */}
                                <div className="text-right">
                                    <div className="text-xs text-gray-400 uppercase tracking-widest">Certificate of</div>
                                    <div className="text-lg font-semibold text-gray-700">Completion</div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 flex flex-col justify-center">
                                {/* Date */}
                                <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>

                                {/* Name */}
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                                    {userName}
                                </h1>

                                {/* Description */}
                                <p className="text-gray-600 mb-6">
                                    has successfully completed the online course
                                </p>

                                {/* Course Name */}
                                <h2 className="text-2xl md:text-3xl font-bold text-indigo-600 mb-2">
                                    {courseName}
                                </h2>

                                {/* Course Info */}
                                <p className="text-sm text-gray-500">
                                    an online non-credit course • {courseHours} hours
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 pt-6 flex justify-between items-end">
                                {/* Verification */}
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                        Verify this credential
                                    </p>
                                    <p className="text-xs text-gray-500 mb-2">{credentialUrl}</p>
                                    <div className="inline-block bg-gray-100 px-3 py-1.5 rounded font-mono text-sm text-gray-700">
                                        {verificationId}
                                    </div>
                                </div>

                                {/* Signature */}
                                <div className="text-center">
                                    <img src={logoIcon} alt="Root2Rise" className="h-10 mx-auto mb-2" />
                                    <div className="border-t-2 border-gray-800 pt-2 px-8">
                                        <p className="font-semibold text-gray-900">Root2Rise</p>
                                        <p className="text-xs text-gray-500">Authorized Signature</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition-all ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
                    >
                        {isDownloading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <FiDownload className="text-lg" />
                                Download Certificate
                            </>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLinkedInClick}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-[#0A66C2] text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                        <FiShare2 className="text-lg" />
                        Add to LinkedIn
                    </motion.button>
                </div>

                {/* Credential Info */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                            <FiCheckCircle className="text-emerald-400" />
                            <span>Issued by Root2Rise</span>
                        </div>
                        <div className="hidden sm:block text-gray-600">•</div>
                        <div className="text-gray-400">
                            Credential ID: <code className="bg-white/10 px-2 py-1 rounded text-indigo-400">{verificationId}</code>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CertificateGenerator;
