import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import './PdfViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const COLORS = ['#FFD700', '#FF7F50', '#90EE90', '#87CEEB', '#DDA0DD'];

const PdfViewer = ({ activePdf, room, socket }) => {
    const { user } = useAuth();
    const pageWrapperRef = useRef(null); 
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.5);
    
    const [highlights, setHighlights] = useState([]);
    const [activeColor, setActiveColor] = useState(COLORS[0]);

    // --- NEW: Track which highlight is clicked ---
    const [selectedHighlightId, setSelectedHighlightId] = useState(null);
    
    // Color picker dropdown state
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);

    const pdfUrl = `http://localhost:5000/${encodeURI(activePdf.filePath.replace(/\\/g, '/'))}`;

    // 1. FETCH DATABASE ANNOTATIONS
    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                const { data } = await API.get(`/annotations/pdf/${activePdf._id}`);
                setHighlights(data);
            } catch (error) {
                console.error('Failed to load highlights:', error);
            }
        };
        fetchHighlights();
    }, [activePdf._id]);

    // Handle click outside color picker to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setShowColorPicker(false);
            }
        };

        if (showColorPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showColorPicker]);

    // 2. LISTEN FOR SOCKET EVENTS
    useEffect(() => {
        if (!socket) return;
        
        // When someone else draws...
        const handleReceive = (data) => {
            if (data.pdfId === activePdf._id) setHighlights((prev) => [...prev, data]);
        };

        // When someone else hits Undo/Delete...
        const handleDelete = (data) => {
            console.log(`📥 [SOCKET RECEIVER] Heard remove-annotation for ID: ${data.id}`);

            if (data.pdfId === activePdf._id) {
                // Filter out the deleted highlight by its ID
                setHighlights((prev) => prev.filter(h => h.annotationData.id !== data.id));
                setSelectedHighlightId(null);
            }
        };

        socket.on('receive-annotation', handleReceive);
        socket.on('remove-annotation', handleDelete); // Start listening
        
        return () => {
            socket.off('receive-annotation', handleReceive);
            socket.off('remove-annotation', handleDelete); // Clean up listener
        };
    }, [socket, activePdf._id]);

    // --- REUSABLE DELETE FUNCTION ---
    const deleteHighlight = async (highlightId) => {
        console.log(`🚀 [FRONTEND] Initiating Delete for ID: ${highlightId}`);

        // 1. Remove locally
        setHighlights(prev => prev.filter(h => h.annotationData.id !== highlightId));
        setSelectedHighlightId(null);

        // 2. Emit to Socket
        const socketPayload = { 
            roomId: room._id, 
            pdfId: activePdf._id, 
            id: highlightId 
        };
        console.log(`📡 [SOCKET] Emitting delete-annotation:`, socketPayload);
        socket?.emit('delete-annotation', socketPayload);

        // 3. Remove from Database
        try {
            const response = await API.delete(`/annotations/${highlightId}`);
            console.log("✅ [FRONTEND] DB Delete Success:", response.data);
        } catch (error) {
            console.error('❌ [FRONTEND] DB Delete Failed:', error.response?.data || error.message);
        }
    };

    // 3. UNDO (CTRL + Z) LOGIC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                const userHighlights = highlights.filter(h => h.annotationData?.author?.id === user._id);
                if (userHighlights.length === 0) return;
                
                const lastHighlight = userHighlights[userHighlights.length - 1];
                deleteHighlight(lastHighlight.annotationData.id);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [highlights, user._id, activePdf._id, room._id, socket]);

    // 4. CAPTURE MOUSE HIGHLIGHTS
    const handleMouseUp = async () => {
        const selection = window.getSelection();
        const text = selection.toString().trim(); 
        
        if (!text || !pageWrapperRef.current) return; 

        const range = selection.getRangeAt(0);
        const rects = Array.from(range.getClientRects());
        const layerRect = pageWrapperRef.current.getBoundingClientRect(); 

        const validRects = rects.filter(rect => rect.height < layerRect.height * 0.5);
        if (validRects.length === 0) return;

        const normalizedRects = validRects.map(rect => ({
            top: (rect.top - layerRect.top) / scale,
            left: (rect.left - layerRect.left) / scale,
            width: rect.width / scale,
            height: rect.height / scale
        }));

        const uniqueId = Date.now().toString();

        const newHighlight = {
            roomId: room._id,
            pdfId: activePdf._id,
            pageNumber: currentPage,
            type: 'highlight',
            annotationData: {
                id: uniqueId,
                color: activeColor,
                rects: normalizedRects,
                author: { id: user._id, name: user.name }
            }
        };

        selection.removeAllRanges(); 
        setHighlights((prev) => [...prev, newHighlight]);

        try {
            await API.post('/annotations/save', newHighlight);
            socket?.emit('draw-annotation', newHighlight);
        } catch (error) {
            console.error('Failed to save highlight', error);
        }
    };

    return (
        <div className="pdf-workspace">
            <div className="pdf-toolbar">
                <div className="toolbar-section">
                    <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="nav-btn">
                        Prev
                    </button>
                    <span className="page-display">{currentPage}/{totalPages}</span>
                    <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="nav-btn">
                        Next
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                <div className="toolbar-section zoom-section">
                    <button 
                        onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                        className="zoom-btn"
                        title="Zoom Out"
                    >
                        −
                    </button>
                    <span className="zoom-display">{Math.round(scale * 100)}%</span>
                    <button 
                        onClick={() => setScale(s => s + 0.25)}
                        className="zoom-btn"
                        title="Zoom In"
                    >
                        +
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                <div className="color-picker-container" ref={colorPickerRef}>
                    <button 
                        className="color-preview-btn"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        style={{ backgroundColor: activeColor }}
                        title="Select highlight color"
                    >
                        <span className="checkmark">✓</span>
                    </button>
                    {showColorPicker && (
                        <div className="color-picker-dropdown">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    className={`color-option ${activeColor === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => {
                                        setActiveColor(color);
                                        setShowColorPicker(false);
                                    }}
                                    title={color}
                                >
                                    {activeColor === color && <span className="color-checkmark">✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pdf-container">
                <Document 
                    file={pdfUrl} 
                    onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
                    className="pdf-document"
                >
                    <div 
                        className="pdf-page-wrapper" 
                        ref={pageWrapperRef} 
                        onMouseUp={handleMouseUp}
                        // --- NEW: Clicking anywhere empty closes the popup ---
                        onClick={() => setSelectedHighlightId(null)}
                    >
                        <Page 
                            pageNumber={currentPage} 
                            scale={scale} 
                            renderTextLayer={true} 
                            renderAnnotationLayer={false} 
                        />

                        <div className="custom-highlight-layer">
                            {highlights
                                .filter(h => h.pageNumber === currentPage)
                                .map((h, i) => (
                                    <div 
                                        key={i} 
                                        className="highlight-group"
                                        title={`Highlighted by ${h.annotationData?.author?.name || 'Unknown'}`}
                                        // --- NEW: Click highlight to select it ---
                                        onClick={(e) => {
                                            e.stopPropagation(); // Stops the wrapper onClick from firing
                                            setSelectedHighlightId(h.annotationData.id);
                                        }}
                                    >
                                        {/* Render the highlight rectangles */}
                                        {h.annotationData.rects.map((rect, j) => (
                                            <div
                                                key={j}
                                                style={{
                                                    position: 'absolute',
                                                    top: `${rect.top * scale}px`,
                                                    left: `${rect.left * scale}px`,
                                                    width: `${rect.width * scale}px`,
                                                    height: `${rect.height * scale}px`,
                                                    backgroundColor: h.annotationData.color,
                                                    opacity: 0.4,
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}

                                        {/* --- NEW: The Delete Button Popup --- */}
                                        {selectedHighlightId === h.annotationData.id && 
                                         h.annotationData.rects.length > 0 && 
                                         h.annotationData.author?.id === user._id && ( // Only show if user owns it
                                            <button
                                                className="highlight-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteHighlight(h.annotationData.id);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    // Place it right above the first word highlighted
                                                    top: `${(h.annotationData.rects[0].top * scale) - 32}px`, 
                                                    left: `${h.annotationData.rects[0].left * scale}px`,
                                                }}
                                            >
                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </Document>
            </div>
        </div>
    );
};

export default PdfViewer;