import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { io } from 'socket.io-client';

import ChatBox from '../components/ChatBox';
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

                <div className="room-code">
                    Code: {room.roomCode}
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