import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import PdfViewer from './PdfViewer';

const PdfWorkspace = ({ room, socket }) => {
    const { user } = useAuth();
    const [pdfs, setPdfs] = useState([]);
    const [activePdf, setActivePdf] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

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

    const truncateName = (name, max = 22) =>
        name.length > max ? name.slice(0, max) + '…' : name;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

                /* ─── ROOT ───────────────────────────────────────────
                   Must fill whatever height the parent gives it.
                   overflow:hidden here clips at this boundary.        */
                .ws-root {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    height: 100%;           /* fill parent room panel   */
                    min-height: 0;          /* flex shrink guard        */
                    font-family: 'DM Sans', sans-serif;
                    overflow: hidden;
                }

                /* ─── SIDEBAR ────────────────────────────────────── */
                .ws-sidebar {
                    width: 210px;
                    flex-shrink: 0;
                    background: #fff;
                    border-right: 1px solid #e8eaf0;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                }

                .ws-sidebar-head {
                    padding: 1rem 1rem 0.8rem;
                    border-bottom: 1px solid #e8eaf0;
                    flex-shrink: 0;
                }

                .ws-sidebar-label {
                    font-size: 11px;
                    font-weight: 500;
                    color: #9aa3b2;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin-bottom: 0.75rem;
                }

                .ws-upload-btn {
                    width: 100%;
                    padding: 9px 12px;
                    background: #1a1a2e;
                    color: #fff;
                    border: none;
                    border-radius: 50px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    transition: background 0.15s;
                }

                .ws-upload-btn:hover:not(:disabled) { background: #0f3460; }
                .ws-upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .ws-error {
                    font-size: 11.5px;
                    color: #c53030;
                    margin-top: 8px;
                    text-align: center;
                }

                .ws-pdf-list {
                    flex: 1;
                    min-height: 0;          /* allow list to shrink     */
                    overflow-y: auto;
                    padding: 0.6rem;
                }

                .ws-pdf-list::-webkit-scrollbar { width: 3px; }
                .ws-pdf-list::-webkit-scrollbar-thumb { background: #dde3ed; border-radius: 2px; }

                .ws-pdf-empty {
                    text-align: center;
                    padding: 2rem 1rem;
                    font-size: 12.5px;
                    color: #b0b8c8;
                    font-weight: 300;
                    line-height: 1.6;
                }

                .ws-pdf-item {
                    width: 100%;
                    padding: 9px 10px;
                    border-radius: 12px;
                    border: 1.5px solid transparent;
                    background: none;
                    cursor: pointer;
                    display: flex;
                    align-items: flex-start;
                    gap: 9px;
                    text-align: left;
                    margin-bottom: 4px;
                    transition: background 0.13s, border-color 0.13s;
                    font-family: 'DM Sans', sans-serif;
                }

                .ws-pdf-item:hover { background: #f5f7fb; }

                .ws-pdf-item.active {
                    background: #eef2f9;
                    border-color: #c5d0e8;
                }

                .ws-pdf-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    background: #eef2f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .ws-pdf-item.active .ws-pdf-icon { background: #0f3460; }

                .ws-pdf-meta { flex: 1; min-width: 0; }

                .ws-pdf-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: #1a1a2e;
                    line-height: 1.3;
                    word-break: break-word;
                }

                .ws-pdf-item.active .ws-pdf-name { color: #0f3460; }

                .ws-pdf-by {
                    font-size: 10.5px;
                    color: #9aa3b2;
                    font-weight: 300;
                    margin-top: 2px;
                }

                /* ─── VIEWER COLUMN ──────────────────────────────────
                   This is the right column that holds the viewer box.
                   KEY: flex:1 + min-height:0 so it can shrink.        */
                .ws-viewer-area {
                    flex: 1;
                    min-width: 0;           /* horizontal shrink guard  */
                    min-height: 0;          /* vertical  shrink guard   */
                    display: flex;
                    flex-direction: column;
                    padding: 12px;
                    overflow: hidden;
                    background: #f0f2f6;
                }

                /* ─── VIEWER BOX ─────────────────────────────────────
                   The rounded card wrapping toolbar + pdf content.
                   KEY: flex:1 + min-height:0 so it grows but can
                   also shrink within ws-viewer-area.                  */
                .ws-viewer-box {
                    flex: 1;
                    min-height: 0;          /* ← critical               */
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                    border-radius: 14px;
                    border: 1px solid #e8eaf0;
                    overflow: hidden;
                    box-shadow: 0 2px 16px rgba(15,52,96,0.07);
                }

                /* Filename bar above the PDF */
                .ws-viewer-toolbar {
                    height: 42px;
                    flex-shrink: 0;         /* never compress toolbar   */
                    background: #fff;
                    border-bottom: 1px solid #e8eaf0;
                    display: flex;
                    align-items: center;
                    padding: 0 1rem;
                    gap: 10px;
                }

                .ws-toolbar-icon {
                    width: 26px;
                    height: 26px;
                    border-radius: 7px;
                    background: #eef2f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .ws-toolbar-filename {
                    font-size: 13px;
                    font-weight: 500;
                    color: #1a1a2e;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .ws-toolbar-badge {
                    margin-left: auto;
                    font-size: 10.5px;
                    color: #9aa3b2;
                    background: #f5f7fb;
                    border-radius: 50px;
                    padding: 2px 10px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                /* ─── VIEWER CONTENT ─────────────────────────────────
                   This div wraps <PdfViewer> directly.
                   MUST be flex:1 + min-height:0 AND pass a real height
                   down via position:relative so PdfViewer's
                   height:100% resolves to pixels, not 0.              */
                .ws-viewer-content {
                    flex: 1;

                    min-height: 0;
                    min-width: 0;

                    overflow: hidden;

                    display: flex;
                    flex-direction: column;

                    position: relative;
                }

                /* Empty state */
                .ws-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    color: #b0b8c8;
                    text-align: center;
                    padding: 2rem;
                }

                .ws-empty-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: #eef2f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 4px;
                }

                .ws-empty-title {
                    font-size: 14.5px;
                    font-weight: 500;
                    color: #9aa3b2;
                }

                .ws-empty-sub {
                    font-size: 13px;
                    color: #b0b8c8;
                    font-weight: 300;
                }
            `}</style>

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
                                <button
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
                                </button>
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

                            {/* 
                                ws-viewer-content is position:relative + flex:1 + min-height:0.
                                PdfViewer receives a real pixel height from this container.
                            */}
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

            </div>
        </>
    );
};

export default PdfWorkspace;