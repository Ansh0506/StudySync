import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API, { SERVER_BASE_URL } from '../services/api';
import { io } from 'socket.io-client';

import ChatBox from '../components/ChatBox/ChatBox';
import PdfWorkspace from '../components/PdfWorkspace/PdfWorkspace';
import ConfirmModal from '../components/Reusable/ConfirmModal';

import './Room.css';

const RoomPage = () => {

    const { id } = useParams();

    const { user, loading: authLoading } = useAuth();

    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // The chat panel can be resized horizontally in the room workspace.
    const [chatWidth, setChatWidth] = useState(380);

    // Fullscreen hides the room header/chat split so the PDF can take over the view.
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isChatOverlayOpen, setIsChatOverlayOpen] = useState(false);

    // Room owner IDs may arrive as raw strings or populated objects.
    const getId = (value) => value?._id || value;
    const isMaster = room && (
        getId(room.master)?.toString() === user?._id ||
        getId(room.head)?.toString() === user?._id
    );

    // Confirms the modal action, then lets the backend decide delete-vs-leave by ownership.
    const confirmDeleteRoom = async () => {
        try {
            await API.delete(`/rooms/${id}`);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete room');
        } finally {
            setShowDeleteModal(false);
        }
    };
    // Fetch room details, open the authenticated socket, and join the room channel.
    useEffect(() => {

        if (authLoading) return;

        let newSocket;

        const setupRoom = async () => {

            try {

                const { data } = await API.get(`/rooms/${id}`);

                setRoom(data);

                const token = localStorage.getItem('token');

                newSocket = io(SERVER_BASE_URL, {
                    auth: { token }
                });

                newSocket.on('connect', () => {

                    console.log('Connected to socket server');

                    newSocket.emit('join-room', {
                        roomId: id
                    });

                });

                newSocket.on('connect_error', (err) => {
                    console.error(
                        'Socket connection error:',
                        err.message
                    );
                });

                setSocket(newSocket);

                setLoading(false);

            } catch (err) {

                console.error('Failed to load room', err);

                setError(
                    'Could not load this room. It may have been deleted.'
                );

                setLoading(false);
            }
        };

        setupRoom();

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };

    }, [id, authLoading]);

    // Dragging the divider recalculates the chat panel width within readable bounds.
    const startResize = (e) => {

        e.preventDefault();

        const startX = e.clientX;
        const startWidth = chatWidth;

        const handleMouseMove = (moveEvent) => {

            const newWidth =
                startWidth - (moveEvent.clientX - startX);

            if (newWidth >= 280 && newWidth <= 800) {
                setChatWidth(newWidth);
            }
        };

        const handleMouseUp = () => {

            document.removeEventListener(
                'mousemove',
                handleMouseMove
            );

            document.removeEventListener(
                'mouseup',
                handleMouseUp
            );
        };

        document.addEventListener(
            'mousemove',
            handleMouseMove
        );

        document.addEventListener(
            'mouseup',
            handleMouseUp
        );
    };

    // Escape gives users a quick way out of PDF fullscreen mode.
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleEscapeKey);
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, [isFullscreen, setIsFullscreen]);

    if (loading || authLoading) {

        return (
            <div className="room-loading">
                Loading Workspace...
            </div>
        );
    }

    if (error) {

        return (
            <div className="room-error">

                <p className="room-error-text">
                    {error}
                </p>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="room-error-btn"
                >
                    Back to Dashboard
                </button>

            </div>
        );
    }

    return (

        <div className="room-page">

            {/* Room title, code, navigation, and delete/leave action. */}
            <header className="room-header" style={{ display: isFullscreen ? 'none' : 'flex' }}>

                <div className="room-header-left">

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="room-back-btn"
                    >
                        ← Dashboard
                    </button>

                    <h1 className="room-title">
                        {room.name}
                    </h1>

                </div>

                <div className="room-header-right">
                    <div className="room-code">
                        Code: {room.roomCode}
                    </div>

                    <button 
                        onClick={() => setShowDeleteModal(true)}
                        className="room-delete-btn"
                        title={isMaster ? "Permanently Delete Room" : "Leave Room"}
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

            </header>

            {/* Main split workspace: PDF area, draggable divider, and chat. */}
            <main className="room-main">

                {/* The PDF section expands to full width in fullscreen mode. */}
                <section
                    className="room-pdf-section"
                    style={{
                        width: isFullscreen ? '100%' : `calc(100% - ${chatWidth}px)`
                    }}
                >

                    <PdfWorkspace
                        room={room}
                        socket={socket}
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
                    />

                </section>

                {/* The resizer is hidden in fullscreen because the chat panel is hidden. */}
                {!isFullscreen && (
                    <div
                        className="room-resizer"
                        onMouseDown={startResize}
                    />
                )}

                {/* Standard room chat shown beside the PDF viewer. */}
                {!isFullscreen && (
                    <aside
                        className="room-chat-section"
                        style={{
                            width: `${chatWidth}px`
                        }}
                    >

                        {socket && (
                            <ChatBox
                                room={room}
                                socket={socket}
                            />
                        )}

                    </aside>
                )}

                {/* Fullscreen mode shows chat as an overlay instead of a side panel. */}
                {isFullscreen && isChatOverlayOpen && (
                    <div className="room-chat-overlay">
                        <button 
                            className="chat-overlay-close-btn"
                            onClick={() => setIsChatOverlayOpen(false)}
                            title="Close"
                        >
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="room-chat-overlay-content">
                            {socket && (
                                <ChatBox
                                    room={room}
                                    socket={socket}
                                    isOverlay={true}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Floating control used to reopen chat while reading fullscreen. */}
                {isFullscreen && !isChatOverlayOpen && (
                    <button 
                        className="chat-toggle-btn"
                        onClick={() => setIsChatOverlayOpen(true)}
                        title="Show Chat"
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>
                )}

            </main>

            <ConfirmModal
                isOpen={showDeleteModal}
                title={isMaster ? 'Delete this room?' : 'Leave this room?'}
                message={
                    isMaster
                        ? 'You are the room owner. This will permanently delete the room, PDFs, chat, and activity for everyone.'
                        : 'This will remove the room from your dashboard. Other members can keep using it.'
                }
                confirmText={isMaster ? 'Delete Room' : 'Leave Room'}
                onConfirm={confirmDeleteRoom}
                onCancel={() => setShowDeleteModal(false)}
            />

        </div>
    );
};

export default RoomPage;
