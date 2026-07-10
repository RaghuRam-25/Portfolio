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

    useEffect(() => {
        if (!user?.isLoggedIn || !user?._id) return;

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.emit('user:connect', user._id);

        newSocket.on('server:chat_history', (session) => {
            setMessages(session.messages || []);
        });

        newSocket.on('server:new_message', (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputText.trim() && socket) {
            socket.emit('user:send_message', { userId: user._id, message: inputText });
            setInputText('');
        }
    };

    if (!user?.isLoggedIn) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {isOpen && (
                <div className="w-80 h-[450px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col border border-light-border dark:border-neutral-800 animate-fadeIn">
                    <div className="p-4 border-b border-light-border dark:border-neutral-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm">Live Chat Support</h3>
                        <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-light-textPrimary dark:hover:text-dark-textPrimary"><FiX /></button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2.5 rounded-xl text-sm ${msg.sender._id === user._id ? 'bg-accent-blue text-white rounded-br-none' : 'bg-neutral-100 dark:bg-neutral-800 rounded-bl-none'}`}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-light-border dark:border-neutral-800 flex items-center gap-2">
                        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." className="flex-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                        <button type="submit" className="p-2.5 bg-accent-blue text-white rounded-md"><FiSend /></button>
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