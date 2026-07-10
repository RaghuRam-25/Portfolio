import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../utils/api';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import Spinner from '../ui/Spinner';

const LiveChat = ({ adminUser }) => {
    const [socket, setSocket] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.emit('admin:connect', adminUser._id);

        newSocket.on('server:all_sessions', (allSessions) => {
            setSessions(allSessions);
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
            if (selectedSession?._id === updatedSession._id) {
                setSelectedSession(updatedSession);
            }
        });

        return () => newSocket.disconnect();
    }, [adminUser._id, selectedSession?._id]);

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
        if (inputText.trim() && socket && selectedSession) {
            socket.emit('admin:send_message', {
                adminId: adminUser._id,
                userId: selectedSession.user._id,
                message: inputText
            });
            setInputText('');
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-light-border dark:border-neutral-800">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><FiMessageSquare /> Live Chat</h3>
            <div className="grid grid-cols-12 gap-4 h-[600px]">
                {/* Session List */}
                <div className="col-span-4 border-r border-light-border dark:border-neutral-800 pr-4 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Spinner /></div>
                    ) : sessions.length === 0 ? (
                        <p className="text-sm text-neutral-500 text-center pt-10">No active chats.</p>
                    ) : (
                        sessions.map(session => (
                            <div key={session._id} onClick={() => handleSelectSession(session)} className={`p-3 rounded-lg cursor-pointer mb-2 flex items-center gap-3 ${selectedSession?._id === session._id ? 'bg-accent-blue/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}>
                                <img src={session.user.avatarUrl} alt={session.user.name} className="w-8 h-8 rounded-full" />
                                <div className="flex-1 truncate">
                                    <p className={`font-bold text-sm truncate ${session.adminHasUnread ? 'text-accent-blue' : ''}`}>{session.user.name}</p>
                                    <p className="text-xs text-neutral-500 truncate">{session.messages[session.messages.length - 1]?.message}</p>
                                </div>
                                {session.adminHasUnread && <div className="w-2.5 h-2.5 bg-accent-blue rounded-full flex-shrink-0"></div>}
                            </div>
                        ))
                    )}
                </div>

                {/* Chat Window */}
                <div className="col-span-8 flex flex-col">
                    {selectedSession ? (
                        <>
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg">
                                {selectedSession.messages.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-2.5 ${msg.sender.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender.role !== 'admin' && <img src={msg.sender.avatarUrl} alt={msg.sender.name} className="w-7 h-7 rounded-full" />}
                                        <div className={`max-w-[75%] p-2.5 rounded-xl text-sm ${msg.sender.role === 'admin' ? 'bg-accent-blue text-white rounded-br-none' : 'bg-white dark:bg-neutral-800 rounded-bl-none'}`}>{msg.message}</div>
                                        {msg.sender.role === 'admin' && <img src={adminUser.avatarUrl} alt={adminUser.name} className="w-7 h-7 rounded-full" />}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." className="flex-1 p-2.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                                <button type="submit" className="p-3 bg-accent-blue text-white rounded-md"><FiSend /></button>
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