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
    const pdfContainerRef = useRef(null);
    const pageRefsMap = useRef(new Map());
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.5);
    const [pageInput, setPageInput] = useState('1');
    const [zoomInput, setZoomInput] = useState('150');
    
    const [highlights, setHighlights] = useState([]);
    const [activeColor, setActiveColor] = useState(COLORS[0]);

    // --- NEW: Track which highlight is clicked ---
    const [selectedHighlightId, setSelectedHighlightId] = useState(null);
    
    // Color picker dropdown state
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);

    const pdfUrl = `http://localhost:5000/${encodeURI(activePdf.filePath.replace(/\\/g, '/'))}`;

    // --- DETECT CURRENT PAGE ON SCROLL ---
    useEffect(() => {
        const container = pdfContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const containerRect = container.getBoundingClientRect();
            const viewportCenter = containerRect.top + containerRect.height / 2;

            // Find which page is closest to viewport center
            let closestPage = 1;
            let closestDistance = Infinity;

            pageRefsMap.current.forEach((pageRef, pageNum) => {
                if (pageRef && pageRef.getBoundingClientRect()) {
                    const rect = pageRef.getBoundingClientRect();
                    const pageCenter = rect.top + rect.height / 2;
                    const distance = Math.abs(pageCenter - viewportCenter);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestPage = pageNum;
                    }
                }
            });

            setCurrentPage(closestPage);
            setPageInput(closestPage.toString());
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [totalPages]);

    // --- HANDLE PAGE INPUT CHANGE ---
    const handlePageInput = (e) => {
        const value = e.target.value;
        setPageInput(value);

        // Allow real-time validation but only navigate on Enter
        if (!/^\d*$/.test(value)) {
            setPageInput(pageInput);
        }
    };

    const handlePageInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            let pageNum = parseInt(pageInput, 10);
            if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
            if (pageNum > totalPages) pageNum = totalPages;
            
            setCurrentPage(pageNum);
            setPageInput(pageNum.toString());
            
            // Scroll to that page
            const pageRef = pageRefsMap.current.get(pageNum);
            if (pageRef) {
                pageRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    // --- HANDLE ZOOM INPUT CHANGE ---
    const handleZoomInput = (e) => {
        const value = e.target.value;
        setZoomInput(value);

        // Allow real-time input
        if (!/^\d*$/.test(value)) {
            setZoomInput(zoomInput);
            return;
        }
    };

    const handleZoomInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            let zoomPercent = parseInt(zoomInput, 10);
            if (isNaN(zoomPercent) || zoomPercent < 50) zoomPercent = 50;
            if (zoomPercent > 300) zoomPercent = 300;
            
            setScale(zoomPercent / 100);
            setZoomInput(zoomPercent.toString());
        }
    };

    // --- HANDLE PREVIOUS/NEXT NAVIGATION ---
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            setPageInput(nextPage.toString());
            
            const pageRef = pageRefsMap.current.get(nextPage);
            if (pageRef) {
                pageRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            setPageInput(prevPage.toString());
            
            const pageRef = pageRefsMap.current.get(prevPage);
            if (pageRef) {
                pageRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };
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
    const handleMouseUp = async (e) => {
        const selection = window.getSelection();
        const text = selection.toString().trim(); 
        
        if (!text) return; 

        // Use event.currentTarget to get the specific page wrapper
        const layerRect = e.currentTarget.getBoundingClientRect();

        const range = selection.getRangeAt(0);
        const rects = Array.from(range.getClientRects());

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
                {/* Navigation Section */}
                <div className="toolbar-section">
                    <button 
                        disabled={currentPage <= 1} 
                        onClick={handlePrevPage}
                        className="nav-btn"
                        title="Previous Page"
                    >
                        ← Prev
                    </button>
                    
                    {/* Page Input */}
                    <div className="page-input-group">
                        <input 
                            type="text" 
                            value={pageInput}
                            onChange={handlePageInput}
                            onKeyDown={handlePageInputKeyDown}
                            className="page-input"
                            placeholder="Go to page"
                            title="Enter page number and press Enter"
                        />
                        <span className="page-separator">/</span>
                        <span className="total-pages">{totalPages}</span>
                    </div>
                    
                    <button 
                        disabled={currentPage >= totalPages} 
                        onClick={handleNextPage}
                        className="nav-btn"
                        title="Next Page"
                    >
                        Next →
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Zoom Section */}
                <div className="toolbar-section zoom-section">
                    <button 
                        onClick={() => {
                            const newScale = Math.max(0.5, scale - 0.25);
                            setScale(newScale);
                            setZoomInput(Math.round(newScale * 100).toString());
                        }}
                        className="zoom-btn"
                        title="Zoom Out"
                    >
                        −
                    </button>
                    
                    {/* Zoom Input */}
                    <div className="zoom-input-group">
                        <input 
                            type="text" 
                            value={zoomInput}
                            onChange={handleZoomInput}
                            onKeyDown={handleZoomInputKeyDown}
                            className="zoom-input"
                            placeholder="Zoom %"
                            title="Enter zoom percentage (50-300) and press Enter"
                        />
                        <span className="zoom-percent">%</span>
                    </div>
                    
                    <button 
                        onClick={() => {
                            const newScale = scale + 0.25;
                            setScale(newScale);
                            setZoomInput(Math.round(newScale * 100).toString());
                        }}
                        className="zoom-btn"
                        title="Zoom In"
                    >
                        +
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Color Picker */}
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

            {/* PDF Container - Scrollable */}
            <div className="pdf-container" ref={pdfContainerRef}>
                <Document 
                    file={pdfUrl} 
                    onLoadSuccess={({ numPages }) => {
                        setTotalPages(numPages);
                        setPageInput('1');
                    }}
                    className="pdf-document"
                >
                    {/* Render all pages in continuous scroll */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <div 
                            key={pageNum}
                            ref={(el) => {
                                if (el) pageRefsMap.current.set(pageNum, el);
                            }}
                            className="pdf-page-container"
                        >
                            <div 
                                className="pdf-page-wrapper" 
                                onMouseUp={handleMouseUp}
                                onClick={() => setSelectedHighlightId(null)}
                            >
                                <Page 
                                    pageNumber={pageNum} 
                                    scale={scale} 
                                    renderTextLayer={true} 
                                    renderAnnotationLayer={false} 
                                />

                                <div className="custom-highlight-layer">
                                    {highlights
                                        .filter(h => h.pageNumber === pageNum)
                                        .map((h, i) => (
                                            <div 
                                                key={i} 
                                                className="highlight-group"
                                                title={`Highlighted by ${h.annotationData?.author?.name || 'Unknown'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedHighlightId(h.annotationData.id);
                                                }}
                                            >
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

                                                {selectedHighlightId === h.annotationData.id && 
                                                 h.annotationData.rects.length > 0 && 
                                                 h.annotationData.author?.id === user._id && (
                                                    <button
                                                        className="highlight-delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteHighlight(h.annotationData.id);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
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
                            
                            {/* Page separator */}
                            {pageNum < totalPages && <div className="page-separator-line" />}
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PdfViewer;