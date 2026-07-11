import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/api';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';

const ChatWidget = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!user?.isLoggedIn || !user?._id) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            auth: { token: localStorage.getItem('portfolio_token') },
        });
        setSocket(newSocket);

        newSocket.emit('user:connect', user._id);

        newSocket.on('server:chat_history', (session) => {
            setMessages(Array.isArray(session.messages) ? session.messages : []);
        });

        newSocket.on('server:new_message', (newMessage) => {
            setMessages(prev => {
                const filtered = prev.filter(msg => !(msg.isOptimistic && msg.message === newMessage.message));
                if (filtered.some(msg => msg._id && msg._id === newMessage._id)) return filtered;
                return [...filtered, newMessage];
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user?.isLoggedIn, user?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const message = inputText.trim();
        if (message && socket) {
            setMessages(prev => [...prev, {
                _id: `local-${Date.now()}`,
                message,
                isOptimistic: true,
                sender: { _id: user._id, name: user.name, avatarUrl: user.avatarUrl, role: user.role },
                createdAt: new Date().toISOString(),
            }]);
            socket.emit('user:send_message', { userId: user._id, message });
            setInputText('');
        }
    };

    if (!user?.isLoggedIn) return null;

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50">
            {isOpen && (
                <div className="w-[calc(100vw-2rem)] max-w-sm h-[min(70vh,450px)] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col border border-light-border dark:border-neutral-800 animate-fadeIn overflow-hidden">
                    <div className="p-4 border-b border-light-border dark:border-neutral-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm">Live Chat Support</h3>
                        <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-light-textPrimary dark:hover:text-dark-textPrimary"><FiX /></button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 scroll-smooth">
                        {messages.map((msg, index) => (
                            <div key={msg._id || index} className={`flex ${(msg.sender?._id || msg.sender) === user._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[82%] p-2.5 rounded-xl text-sm break-words whitespace-pre-wrap ${(msg.sender?._id || msg.sender) === user._id ? 'bg-accent-blue text-white rounded-br-none' : 'bg-neutral-100 dark:bg-neutral-800 rounded-bl-none'} ${msg.isOptimistic ? 'opacity-80' : ''}`}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-light-border dark:border-neutral-800 flex items-center gap-2">
                        <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." className="min-w-0 flex-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700 outline-none focus:ring-1 focus:ring-accent-blue" />
                        <button type="submit" disabled={!inputText.trim()} className="p-2.5 bg-accent-blue text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"><FiSend /></button>
                    </form>
                </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-accent-blue text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
                {isOpen ? <FiX /> : <FiMessageCircle />}
            </button>
        </div>
    );
};

export default ChatWidget;
