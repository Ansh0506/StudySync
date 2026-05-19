import React, { useState, useEffect } from 'react';

import {
    PdfLoader,
    PdfHighlighter,
    Popup,
    AreaHighlight
} from 'react-pdf-highlighter';

import 'react-pdf-highlighter/dist/style.css';
import './PdfViewer.css';

import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = [
    '#FFD700',
    '#FF7F50',
    '#90EE90',
    '#87CEEB',
    '#DDA0DD'
];

const PdfViewer = ({ activePdf, room, socket }) => {

    const { user } = useAuth();

    const [highlights, setHighlights] = useState([]);

    // TOOLBAR STATE
    const [activeColor, setActiveColor] = useState(COLORS[0]);

    const [showColorDropdown, setShowColorDropdown] =
        useState(false);

    const [totalPages, setTotalPages] = useState(0);

    // PDF URL
    const normalizedPath =
        activePdf.filePath.replace(/\\/g, '/');

    const pdfUrl =
        `http://localhost:5000/${encodeURI(normalizedPath)}`;

    console.log('PdfViewer - activePdf:', activePdf);
    console.log('PdfViewer - filePath:', activePdf.filePath);
    console.log('PdfViewer - normalizedPath:', normalizedPath);
    console.log('PdfViewer - pdfUrl:', pdfUrl);

    // RESET PAGE COUNT WHEN PDF CHANGES
    useEffect(() => {
        setTotalPages(0);
    }, [activePdf]);

    // FETCH HIGHLIGHTS
    useEffect(() => {

        const fetchHighlights = async () => {

            try {

                const { data } =
                    await API.get(
                        `/annotations/pdf/${activePdf._id}`
                    );

                const formatted = data.map((ann) => ({
                    id: ann._id,
                    ...ann.annotationData
                }));

                setHighlights(formatted);

            } catch (error) {

                console.error(
                    'Failed to load highlights:',
                    error
                );
            }
        };

        fetchHighlights();

    }, [activePdf._id]);

    // REALTIME SOCKET ANNOTATIONS
    useEffect(() => {

        if (!socket) return;

        const handleReceive = (data) => {

            if (data.pdfId === activePdf._id) {

                setHighlights((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        ...data.annotationData
                    }
                ]);
            }
        };

        socket.on(
            'receive-annotation',
            handleReceive
        );

        return () =>
            socket.off(
                'receive-annotation',
                handleReceive
            );

    }, [socket, activePdf._id]);

    // ADD HIGHLIGHT
    const addHighlight = async (highlightData) => {

        const newHighlight = {
            id: Date.now().toString(),
            color: activeColor,
            ...highlightData
        };

        setHighlights((prev) => [
            ...prev,
            newHighlight
        ]);

        try {

            await API.post('/annotations/save', {

                roomId: room._id,

                pdfId: activePdf._id,

                pageNumber:
                    highlightData.position.pageNumber,

                type: 'highlight',

                annotationData: newHighlight
            });

            socket?.emit('draw-annotation', {

                roomId: room._id,

                pdfId: activePdf._id,

                annotationData: newHighlight
            });

        } catch (error) {

            console.error(
                'Failed to save highlight',
                error
            );
        }
    };

    return (

        <div className="pdf-loader-wrap">

            {/* TOOLBAR */}
            <div className="pdf-dark-toolbar">

                {/* PAGE INFO */}
                <div className="pdf-toolbar-section">

                    <div className="pdf-page-box">
                        1
                    </div>

                    <span className="pdf-toolbar-text">
                        / {totalPages || '...'}
                    </span>

                </div>

                <div className="pdf-toolbar-divider" />

                {/* HIGHLIGHT TOOL */}
                <div className="pdf-toolbar-section">

                    <div className="relative">

                        <button
                            className="pdf-tool-btn active"
                            onClick={() =>
                                setShowColorDropdown(
                                    !showColorDropdown
                                )
                            }
                            style={{
                                color: activeColor
                            }}
                        >

                            <svg
                                width="18"
                                height="18"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                            </svg>

                        </button>

                        {/* COLOR PICKER */}
                        {showColorDropdown && (

                            <div className="pdf-color-dropdown">

                                {COLORS.map((c) => (

                                    <button
                                        key={c}
                                        className="pdf-color-swatch"
                                        style={{
                                            backgroundColor: c,

                                            border:
                                                activeColor === c
                                                    ? '2px solid white'
                                                    : 'none'
                                        }}
                                        onClick={() => {

                                            setActiveColor(c);

                                            setShowColorDropdown(false);
                                        }}
                                    />

                                ))}

                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* PDF CONTENT */}
            <div className="pdf-scroll-container">

                <PdfLoader
                    url={pdfUrl}

                    beforeLoad={
                        <div className="pdf-loading">

                            <div className="pdf-loading-spinner" />

                            <span>
                                Loading document…
                            </span>

                        </div>
                    }
                >

                    {(pdfDocument) => {

                        console.log(
                            'PDF DOCUMENT LOADED',
                            pdfDocument
                        );

                        if (!totalPages) {

                            setTimeout(() => {

                                setTotalPages(
                                    pdfDocument.numPages
                                );

                            }, 0);
                        }

                        return (

                            <PdfHighlighter

                                pdfDocument={pdfDocument}

                                enableAreaSelection={(event) =>
                                    event.altKey
                                }

                                onScrollChange={() => {}}

                                onSelectionFinished={(

                                    position,
                                    content,
                                    hideTipAndSelection

                                ) => (

                                    <Popup

                                        popupContent={

                                            <button
                                                className="pdf-highlight-popup"

                                                style={{
                                                    backgroundColor:
                                                        activeColor,

                                                    color: '#000'
                                                }}

                                                onClick={() => {

                                                    addHighlight({

                                                        content,

                                                        position,

                                                        comment: ''
                                                    });

                                                    hideTipAndSelection();
                                                }}
                                            >
                                                Highlight
                                            </button>

                                        }

                                        onMouseOver={() => {}}

                                        onMouseOut={
                                            hideTipAndSelection
                                        }

                                        hideTipAndSelection={
                                            hideTipAndSelection
                                        }
                                    />

                                )}

                                highlightTransform={(

                                    highlight,
                                    index,
                                    setTip,
                                    hideTip,
                                    viewportToScaled,
                                    screenshot,
                                    isScrolledTo

                                ) => {

                                    const isText = !(

                                        highlight.content &&
                                        highlight.content.image
                                    );

                                    const component = isText ? (

                                        <div className="Highlight__parts">

                                            {highlight.position.rects.map(
                                                (rect, i) => (

                                                    <div
                                                        key={i}

                                                        style={{

                                                            ...rect,

                                                            backgroundColor:
                                                                highlight.color ||
                                                                '#FFD700',

                                                            opacity: 0.4,

                                                            position: 'absolute'
                                                        }}
                                                    />

                                                )
                                            )}

                                        </div>

                                    ) : (

                                        <AreaHighlight
                                            highlight={highlight}
                                            onChange={() => {}}
                                        />

                                    );

                                    return (
                                        <div key={index}>
                                            {component}
                                        </div>
                                    );
                                }}

                                highlights={highlights}
                            />

                        );
                    }}

                </PdfLoader>

            </div>

        </div>
    );
};

export default PdfViewer;