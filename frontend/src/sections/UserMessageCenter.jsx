import React, { useState, useEffect } from 'react';
import { messagesAPI, SOCKET_URL } from '../utils/api';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import { FiMessageSquare, FiCheck, FiCheckCircle, FiSend } from 'react-icons/fi';
import { io } from 'socket.io-client';

const UserMessageCenter = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState({ loading: false, message: '', type: '' });

    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            const res = await messagesAPI.getSent();
            if (res.success) {
                setMessages(res.data);
            } else {
                setError(res.message || 'Failed to load messages.');
            }
            setIsLoading(false);
        };

        fetchMessages();

        // Setup socket for real-time updates
        const socket = io(SOCKET_URL);
        socket.emit('join', user._id);

        const handleMessageSeen = ({ messageId }) => {
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg._id === messageId ? { ...msg, isRead: true } : msg
                )
            );
        };

        socket.on('messageSeen', handleMessageSeen);

        return () => {
            socket.off('messageSeen', handleMessageSeen);
            socket.disconnect();
        };
    }, [user._id]);

    const handleSelectMessage = (message) => {
        setSelectedMessage(message);
        setReplyText('');
        setReplyStatus({ loading: false, message: '', type: '' });
    };

    const handleSendReply = async (id) => {
        if (!replyText.trim()) return;
        setReplyStatus({ loading: true, message: '', type: '' });
        const res = await messagesAPI.userReply(id, replyText);
        if (res.success) {
            setReplyStatus({ loading: false, message: res.message, type: 'success' });
            // Update the message in the state
            setMessages(prev => prev.map(m => m._id === id ? res.data : m));
            setSelectedMessage(res.data);
            setReplyText('');
        } else {
            setReplyStatus({ loading: false, message: res.message || 'Failed to send reply.', type: 'error' });
        }
    };

    const handleCloseModal = () => {
        setSelectedMessage(null);
    };

    return (
        <section id="user-messages" className="py-12">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-10">
                    <h2 className="text-3xl font-black">My Sent Messages</h2>
                    <p className="text-sm text-neutral-400">Track the status of your messages sent through the secure portal.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <p className="text-neutral-500 text-center py-10">You haven't sent any messages yet.</p>
                        ) : (
                            messages.map(msg => (
                                <div key={msg._id} onClick={() => handleSelectMessage(msg)} className="p-4 rounded-2xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/60 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3">{msg.message}</p>
                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${msg.isRead ? 'text-emerald-500' : 'text-neutral-500'}`}>
                                            {msg.isRead ? <FiCheckCircle /> : <FiCheck />}
                                            <span>{msg.isRead ? 'Seen' : 'Sent'}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-3 pt-3 border-t border-light-border dark:border-neutral-800">
                                        Sent on: {new Date(msg.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <Modal isOpen={!!selectedMessage} onClose={handleCloseModal} title="Message Thread">
                {selectedMessage && (
                    <div className="space-y-4 text-sm">
                        <div className="p-3 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg border border-light-border dark:border-neutral-700/50">
                            <div className="flex justify-between items-center text-xs text-neutral-500 mb-2">
                                <span className="font-bold">You</span>
                                <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
                        </div>

                        {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                            <div className="pt-4"><h4 className="text-sm font-bold mb-2">Replies</h4><div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {selectedMessage.replies.map((reply, index) => (
                                    <div key={index} className={`p-3 rounded-lg border ${reply.repliedBy.role === 'admin' ? 'bg-sky-500/10 border-sky-500/20' : 'bg-neutral-100 dark:bg-neutral-800/50 border-light-border dark:border-neutral-700/50'}`}>
                                        <div className="flex justify-between items-center text-xs text-neutral-500 mb-2">
                                            <span className="font-bold">{reply.repliedBy.role === 'admin' ? 'Admin' : 'You'}</span>
                                            <span>{new Date(reply.date).toLocaleString()}</span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm">{reply.message}</p>
                                    </div>
                                ))}
                            </div></div>
                        )}

                        <div className="mt-6 pt-6 border-t border-light-border dark:border-neutral-700/50">
                            <h4 className="text-sm font-bold mb-2">Send a Reply</h4>
                            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700 h-24" disabled={replyStatus.loading} />
                            <button onClick={() => handleSendReply(selectedMessage._id)} disabled={!replyText.trim() || replyStatus.loading} className="mt-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm flex items-center gap-2 disabled:bg-neutral-500">{replyStatus.loading ? <Spinner /> : <FiSend />} Send Reply</button>
                            {replyStatus.message && <p className={`mt-2 text-xs ${replyStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{replyStatus.message}</p>}
                        </div>
                    </div>
                )}
            </Modal>
        </section>
    );
};

export default UserMessageCenter;