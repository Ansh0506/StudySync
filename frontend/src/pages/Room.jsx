import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { io } from 'socket.io-client';

import ChatBox from '../components/ChatBox/ChatBox';
import PdfWorkspace from '../components/PdfWorkspace';

import './Room.css';

const RoomPage = () => {

    const { id } = useParams();

    const { user, loading: authLoading } = useAuth();

    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // RESIZABLE CHAT WIDTH
    const [chatWidth, setChatWidth] = useState(380);
    // Check if current user is the permanent master
    const isMaster = room && (room.master === user?._id || room.head === user?._id);

    // DELETE ROOM HANDLER
    const handleDeleteRoom = async () => {
        const confirmMessage = isMaster 
            ? '⚠️ WARNING: You are the Room Master. This will PERMANENTLY delete the room, all PDFs, and Chats for EVERYONE. Continue?' 
            : 'Are you sure you want to leave and delete this room from your dashboard?';

        if (!window.confirm(confirmMessage)) return;

        try {
            await API.delete(`/rooms/${id}`);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete room');
        }
    };
    // SOCKET + ROOM SETUP
    useEffect(() => {

        if (authLoading) return;

        let newSocket;

        const setupRoom = async () => {

            try {

                const { data } = await API.get(`/rooms/${id}`);

                setRoom(data);

                const token = localStorage.getItem('token');

                newSocket = io('http://localhost:5000', {
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

    // RESIZER
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

    // LOADING
    if (loading || authLoading) {

        return (
            <div className="room-loading">
                Loading Workspace...
            </div>
        );
    }

    // ERROR
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

            {/* HEADER */}
            <header className="room-header">

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
                        onClick={handleDeleteRoom}
                        className="room-delete-btn"
                        title={isMaster ? "Permanently Delete Room" : "Leave Room"}
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

            </header>

            {/* MAIN LAYOUT */}
            <main className="room-main">

                {/* PDF SECTION */}
                <section
                    className="room-pdf-section"
                    style={{
                        width: `calc(100% - ${chatWidth}px)`
                    }}
                >

                    <PdfWorkspace
                        room={room}
                        socket={socket}
                    />

                </section>

                {/* RESIZER */}
                <div
                    className="room-resizer"
                    onMouseDown={startResize}
                />

                {/* CHAT SECTION */}
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

            </main>

        </div>
    );
};

export default RoomPage;