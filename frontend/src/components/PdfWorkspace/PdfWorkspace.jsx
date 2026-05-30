import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PdfViewer from '../PdfViewer';
import './PdfWorkspace.css'; 
import ConfirmModal from '../Reusable/ConfirmModal';

const PdfWorkspace = ({ room, socket }) => {
    const { user } = useAuth();
    const [pdfs, setPdfs] = useState([]);
    const [activePdf, setActivePdf] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    
    // State to track which PDF is about to be deleted
    const [pdfToDelete, setPdfToDelete] = useState(null);

    // Fetch PDFs on load
    useEffect(() => {
        if (!room) return;
        const fetchPdfs = async () => {
            try {
                const { data } = await API.get(`/pdf/room/${room._id}`);
                setPdfs(data);
                if (data.length > 0) setActivePdf(data[0]);
            } catch (err) {
                setError('Could not load documents.');
            }
        };
        fetchPdfs();
    }, [room]);

    // Upload Handler
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed.');
            return;
        }
        setIsUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomId', room._id);
        
        try {
            const { data } = await API.post('/pdf/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPdfs([data.pdf, ...pdfs]);
            setActivePdf(data.pdf);
        } catch {
            setError('Failed to upload the PDF.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 1. This triggers when you click the trash can icon
    const handleDeleteClick = (e, pdfId) => {
        e.stopPropagation(); 
        setPdfToDelete(pdfId); // Open the modal
    };

    // 2. This triggers when you click "Delete" inside the modal
    const confirmDeletePdf = async () => {
        if (!pdfToDelete) return;
        
        try {
            await API.delete(`/pdf/${pdfToDelete}`);
            setPdfs(prevPdfs => prevPdfs.filter(pdf => pdf._id !== pdfToDelete));
            if (activePdf && activePdf._id === pdfToDelete) {
                setActivePdf(null); 
            }
        } catch (error) {
            console.error("Failed to delete PDF:", error);
            setError('Failed to remove PDF.');
        } finally {
            setPdfToDelete(null); // Close the modal
        }
    };

    const truncateName = (name, max = 22) =>
        name.length > max ? name.slice(0, max) + '…' : name;

    return (
        <div className="ws-root">

            {/* ── Sidebar ── */}
            <div className="ws-sidebar">
                <div className="ws-sidebar-head">
                    <p className="ws-sidebar-label">Documents</p>
                    <input
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="ws-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>Uploading…</>
                        ) : (
                            <>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                                </svg>
                                Upload PDF
                            </>
                        )}
                    </button>
                    {error && <p className="ws-error">{error}</p>}
                </div>

                <div className="ws-pdf-list">
                    {pdfs.length === 0 ? (
                        <div className="ws-pdf-empty">
                            No documents yet.<br />Upload a PDF to get started.
                        </div>
                    ) : (
                        pdfs.map((pdf) => (
                            <div
                                key={pdf._id}
                                className={`ws-pdf-item ${activePdf?._id === pdf._id ? 'active' : ''}`}
                                onClick={() => setActivePdf(pdf)}
                            >
                                <div className="ws-pdf-icon">
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                                        stroke={activePdf?._id === pdf._id ? '#fff' : '#0f3460'}
                                        strokeWidth="1.8">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                </div>
                                
                                <div className="ws-pdf-meta">
                                    <p className="ws-pdf-name">{truncateName(pdf.fileName)}</p>
                                    <p className="ws-pdf-by">by {pdf.uploadedBy?.name || 'User'}</p>
                                </div>

                                {/* FIX: Ensure this calls handleDeleteClick */}
                                <button 
                                    className="pdf-sidebar-delete-btn" 
                                    onClick={(e) => handleDeleteClick(e, pdf._id)}
                                    title="Remove PDF"
                                >
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Viewer ── */}
            <div className="ws-viewer-area">
                {!activePdf ? (
                    <div className="ws-viewer-box">
                        <div className="ws-empty">
                            <div className="ws-empty-icon">
                                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#9aa3b2" strokeWidth="1.4">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                </svg>
                            </div>
                            <p className="ws-empty-title">No document selected</p>
                            <p className="ws-empty-sub">Upload or select a PDF from the sidebar<br />to start your study session.</p>
                        </div>
                    </div>
                ) : (
                    <div className="ws-viewer-box">
                        <div className="ws-viewer-toolbar">
                            <div className="ws-toolbar-icon">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0f3460" strokeWidth="1.8">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                            </div>
                            <span className="ws-toolbar-filename">{activePdf.fileName}</span>
                            <span className="ws-toolbar-badge">
                                Hold Alt + drag to select area
                            </span>
                        </div>

                        <div className="ws-viewer-content">
                            <PdfViewer
                                activePdf={activePdf}
                                room={room}
                                socket={socket}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* FIX: Actually render the ConfirmModal component at the bottom of the workspace! */}
            <ConfirmModal 
                isOpen={!!pdfToDelete}
                title="Remove PDF"
                message="Are you sure you want to remove this PDF from your workspace? If everyone removes it, it will be permanently deleted."
                onConfirm={confirmDeletePdf}
                onCancel={() => setPdfToDelete(null)}
                confirmText="Remove PDF"
            />
            
        </div>
    );
};

export default PdfWorkspace;