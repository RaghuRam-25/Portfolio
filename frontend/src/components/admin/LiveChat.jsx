import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, PLACEHOLDER_AVATAR } from '../../utils/api';
import { FiSend, FiMessageSquare, FiUser, FiArrowLeft } from 'react-icons/fi';
import Spinner from '../ui/Spinner';

const LiveChat = ({ adminUser }) => {
    const [socket, setSocket] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const selectedSessionRef = useRef(null);

    useEffect(() => {
        selectedSessionRef.current = selectedSession;
    }, [selectedSession]);

    useEffect(() => {
        if (!adminUser?._id) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            auth: { token: localStorage.getItem('portfolio_token') },
        });
        setSocket(newSocket);

        newSocket.emit('admin:connect', adminUser._id);

        newSocket.on('server:all_sessions', (allSessions) => {
            setSessions(Array.isArray(allSessions) ? allSessions : []);
            setIsLoading(false);
        });

        newSocket.on('server:session_updated', (updatedSession) => {
            setSessions(prev => {
                const existing = prev.find(s => s._id === updatedSession._id);
                if (existing) {
                    return prev.map(s => s._id === updatedSession._id ? updatedSession : s).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
                } else {
                    return [updatedSession, ...prev].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
                }
            });
            if (selectedSessionRef.current?._id === updatedSession._id) {
                setSelectedSession(updatedSession);
            }
        });

        return () => newSocket.disconnect();
    }, [adminUser?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedSession?.messages]);

    const handleSelectSession = (session) => {
        setSelectedSession(session);
        if (session.adminHasUnread && socket) {
            socket.emit('admin:mark_read', session._id);
            setSessions(prev => prev.map(s => s._id === session._id ? { ...s, adminHasUnread: false } : s));
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        const message = inputText.trim();
        if (message && socket && selectedSession) {
            const optimisticSession = {
                ...selectedSession,
                lastMessageAt: new Date().toISOString(),
                messages: [
                    ...(selectedSession.messages || []),
                    {
                        _id: `local-${Date.now()}`,
                        message,
                        isOptimistic: true,
                        sender: {
                            _id: adminUser._id,
                            name: adminUser.name,
                            avatarUrl: adminUser.avatarUrl,
                            role: 'admin',
                        },
                        createdAt: new Date().toISOString(),
                    },
                ],
            };
            setSelectedSession(optimisticSession);
            setSessions(prev => prev.map(s => s._id === optimisticSession._id ? optimisticSession : s));
            socket.emit('admin:send_message', {
                adminId: adminUser._id,
                userId: selectedSession.user._id,
                message
            });
            setInputText('');
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-4 sm:p-6 rounded-2xl border border-light-border dark:border-neutral-800 min-w-0">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><FiMessageSquare /> Live Chat</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[min(72vh,640px)] min-h-[520px]">
                {/* Session List */}
                <div className={`md:col-span-4 md:border-r border-light-border dark:border-neutral-800 md:pr-4 overflow-y-auto custom-scrollbar ${selectedSession ? 'hidden md:block' : 'block'}`}>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Spinner /></div>
                    ) : sessions.length === 0 ? (
                        <p className="text-sm text-neutral-500 text-center pt-10">No active chats.</p>
                    ) : (
                        sessions.map(session => (
                            <div key={session._id} onClick={() => handleSelectSession(session)} className={`p-3 rounded-lg cursor-pointer mb-2 flex items-center gap-3 ${selectedSession?._id === session._id ? 'bg-accent-blue/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}>
                                <img src={session.user?.avatarUrl || PLACEHOLDER_AVATAR} alt={session.user?.name || 'User'} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-sm truncate ${session.adminHasUnread ? 'text-accent-blue' : ''}`}>{session.user.name}</p>
                                    <p className="text-xs text-neutral-500 truncate">{session.messages?.[session.messages.length - 1]?.message || 'No messages yet.'}</p>
                                </div>
                                {session.adminHasUnread && <div className="w-2.5 h-2.5 bg-accent-blue rounded-full flex-shrink-0"></div>}
                            </div>
                        ))
                    )}
                </div>

                {/* Chat Window */}
                <div className={`md:col-span-8 flex flex-col min-h-0 ${!selectedSession ? 'hidden md:flex' : 'flex'}`}>
                    {selectedSession ? (
                        <>
                            <div className="flex items-center gap-3 p-3 border border-light-border dark:border-neutral-800 rounded-lg mb-3">
                                <button onClick={() => setSelectedSession(null)} className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
                                    <FiArrowLeft />
                                </button>
                                <img src={selectedSession.user?.avatarUrl || PLACEHOLDER_AVATAR} alt={selectedSession.user?.name || 'User'} className="w-9 h-9 rounded-full object-cover" />
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate">{selectedSession.user?.name || 'User'}</p>
                                    <p className="text-xs text-neutral-500 truncate">{selectedSession.user?.email}</p>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto custom-scrollbar scroll-smooth space-y-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg">
                                {(selectedSession.messages || []).map((msg, index) => {
                                    const isAdmin = msg.sender?.role === 'admin' || msg.sender?._id === adminUser._id;
                                    return (
                                    <div key={msg._id || index} className={`flex items-end gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        {!isAdmin && <img src={msg.sender?.avatarUrl || selectedSession.user?.avatarUrl || PLACEHOLDER_AVATAR} alt={msg.sender?.name || 'User'} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                                        <div className={`max-w-[82%] sm:max-w-[75%] p-2.5 rounded-xl text-sm break-words whitespace-pre-wrap ${isAdmin ? 'bg-accent-blue text-white rounded-br-none' : 'bg-white dark:bg-neutral-800 rounded-bl-none border border-light-border dark:border-neutral-700/60'} ${msg.isOptimistic ? 'opacity-80' : ''}`}>{msg.message}</div>
                                        {isAdmin && (adminUser.avatarUrl ? <img src={adminUser.avatarUrl} alt={adminUser.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" /> : <div className="w-7 h-7 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center flex-shrink-0"><FiUser /></div>)}
                                    </div>
                                )})}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." className="min-w-0 flex-1 p-2.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700 outline-none focus:ring-1 focus:ring-accent-blue" />
                                <button type="submit" disabled={!inputText.trim()} className="p-3 bg-accent-blue text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"><FiSend /></button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">Select a conversation to start chatting.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveChat;
