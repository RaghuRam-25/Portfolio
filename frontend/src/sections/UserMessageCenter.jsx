import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI, SOCKET_URL } from '../utils/api';
import Spinner from '../components/ui/Spinner';
import { 
  FiMessageSquare, 
  FiCheckCircle, 
  FiSend, 
  FiTrash2, 
  FiArrowLeft, 
  FiAlertTriangle, 
  FiClock, 
  FiUser
} from 'react-icons/fi';
import { io } from 'socket.io-client';

const UserMessageCenter = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState({ loading: false, message: '', type: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const chatEndRef = useRef(null);

    // Fetch messages initially and set up Socket.io connection
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
        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
        
        // Emitting 'user:connect' allows the server to join the user to their private room
        socket.emit('user:connect', user._id);

        const handleMessageSeen = ({ messageId }) => {
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg._id === messageId ? { ...msg, isRead: true } : msg
                )
            );
            setSelectedMessage(prev => prev && prev._id === messageId ? { ...prev, isRead: true } : prev);
        };

        const handleNewReply = (updatedMsg) => {
            // Check if the reply is on a message belonging to the active user
            const msgUserId = updatedMsg.userId?._id || updatedMsg.userId;
            if (msgUserId && msgUserId.toString() === user._id.toString()) {
                setMessages(prev => {
                    const exists = prev.some(m => m._id === updatedMsg._id);
                    return exists ? prev.map(m => m._id === updatedMsg._id ? updatedMsg : m) : [updatedMsg, ...prev];
                });
                setSelectedMessage(prev => prev && prev._id === updatedMsg._id ? updatedMsg : prev);
            }
        };

        socket.on('messageSeen', handleMessageSeen);
        socket.on('newReply', handleNewReply);

        return () => {
            socket.off('messageSeen', handleMessageSeen);
            socket.off('newReply', handleNewReply);
            socket.disconnect();
        };
    }, [user._id]);

    // Scroll to the bottom of the conversation whenever the replies or active message changes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedMessage?.replies, selectedMessage?.message]);

    const handleSelectMessage = (message) => {
        setSelectedMessage(message);
        setReplyText('');
        setReplyStatus({ loading: false, message: '', type: '' });
    };

    const handleSendReply = async (id) => {
        if (!replyText.trim()) return;
        setReplyStatus({ loading: true, message: '', type: '' });
        const message = replyText.trim();
        const optimisticReply = {
            message,
            repliedBy: { _id: user._id, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
            date: new Date().toISOString(),
            isOptimistic: true,
        };
        setSelectedMessage(prev => prev && prev._id === id ? { ...prev, replies: [...(prev.replies || []), optimisticReply] } : prev);
        setMessages(prev => prev.map(m => m._id === id ? { ...m, replies: [...(m.replies || []), optimisticReply] } : m));
        setReplyText('');

        const res = await messagesAPI.userReply(id, message);
        if (res.success) {
            setReplyStatus({ loading: false, message: res.message, type: 'success' });
            setMessages(prev => prev.map(m => m._id === id ? res.data : m));
            setSelectedMessage(res.data);
        } else {
            setSelectedMessage(prev => prev && prev._id === id ? { ...prev, replies: (prev.replies || []).filter(r => !r.isOptimistic) } : prev);
            setMessages(prev => prev.map(m => m._id === id ? { ...m, replies: (m.replies || []).filter(r => !r.isOptimistic) } : m));
            setReplyStatus({ loading: false, message: res.message || 'Failed to send reply.', type: 'error' });
        }
    };

    const handleDeleteMessageClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeleteMessage = async () => {
        if (!selectedMessage) return;
        
        try {
            const res = await messagesAPI.delete(selectedMessage._id);
            if (res.success) {
                setMessages(prev => prev.filter(m => m._id !== selectedMessage._id));
                setSelectedMessage(null);
                setShowDeleteConfirm(false);
            } else {
                setReplyStatus({ loading: false, message: res.message || 'Failed to delete message.', type: 'error' });
                setShowDeleteConfirm(false);
            }
        } catch (err) {
            console.error('Delete message error:', err);
            setReplyStatus({ loading: false, message: 'Server error deleting message.', type: 'error' });
            setShowDeleteConfirm(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <section id="user-messages" className="py-8 sm:py-12 px-0 sm:px-2 md:px-6 max-w-7xl mx-auto scroll-mt-20 w-full min-w-0">
            <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-black text-light-textPrimary dark:text-white flex items-center gap-3">
                    <FiMessageSquare className="text-accent-purple" /> My Messages
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Interact directly and securely with support. Track and reply in real-time.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-96"><Spinner /></div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center max-w-lg mx-auto">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 bg-white dark:bg-neutral-900/40 rounded-2xl border border-light-border dark:border-neutral-800 overflow-hidden h-[min(72vh,650px)] min-h-[540px] shadow-sm">
                    {/* Left Column: Conversations Sidebar */}
                    <div className={`md:col-span-4 flex flex-col h-full border-r border-light-border dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-light-border dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900/60">
                            <span className="font-bold text-sm text-neutral-700 dark:text-neutral-300">Inbox ({messages.length})</span>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-light-border dark:divide-neutral-800/60 custom-scrollbar">
                            {messages.length === 0 ? (
                                <p className="text-neutral-500 text-center py-12 text-sm">No messages sent yet.</p>
                            ) : (
                                messages.map(msg => {
                                    const isSelected = selectedMessage?._id === msg._id;
                                            const latestMessageText = (msg.replies || []).length > 0 
                                                ? msg.replies[msg.replies.length - 1].message 
                                                : msg.message;
                                    const latestMessageTime = (msg.replies || []).length > 0
                                        ? msg.replies[msg.replies.length - 1].date
                                        : msg.createdAt;

                                    return (
                                        <div 
                                            key={msg._id} 
                                            onClick={() => handleSelectMessage(msg)} 
                                            className={`p-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-all ${
                                                isSelected ? 'bg-accent-purple/10 dark:bg-accent-purple/10 border-l-4 border-accent-purple' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1.5">
                                                <h4 className="font-bold text-sm text-light-textPrimary dark:text-neutral-200 truncate pr-2">
                                                    {msg.senderName || user.name}
                                                </h4>
                                                <span className="text-[10px] text-neutral-400 font-semibold whitespace-nowrap">
                                                    {formatDate(latestMessageTime)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-2 pr-6 break-words">
                                                {latestMessageText}
                                            </p>
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <div className={`flex items-center gap-1 ${msg.isRead ? 'text-emerald-500' : 'text-neutral-400'}`}>
                                                    {msg.isRead ? <FiCheckCircle /> : <FiClock />}
                                                    <span>{msg.isRead ? 'Seen' : 'Pending'}</span>
                                                </div>
                                                {msg.isPaymentConfirmation && (
                                                    <span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded text-[9px]">
                                                        Payment Ref
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Column: Chat Window */}
                    <div className={`md:col-span-8 flex flex-col h-full bg-white dark:bg-neutral-900/20 ${!selectedMessage ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                        {selectedMessage ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-light-border dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900/60">
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setSelectedMessage(null)} 
                                            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                                        >
                                            <FiArrowLeft size={20} />
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple font-bold">
                                            <FiUser className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-light-textPrimary dark:text-white">
                                                {selectedMessage.senderName || user.name}
                                            </h3>
                                                <p className="text-[10px] text-neutral-400 truncate max-w-[12rem] sm:max-w-none">
                                                ID: {selectedMessage._id}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleDeleteMessageClick}
                                        className="p-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-neutral-400 transition-colors"
                                        title="Delete message thread"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>

                                {/* Scrollable Chat Content */}
                                <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-4 bg-neutral-50/30 dark:bg-neutral-950/20 custom-scrollbar scroll-smooth">
                                    {/* Root User Message */}
                                    <div className="flex justify-end">
                                        <div className="max-w-[80%] md:max-w-[70%] bg-accent-purple text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm">
                                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{selectedMessage.message}</p>
                                            <div className="text-[9px] text-white/70 block mt-1.5 text-right font-medium">
                                                You • {formatTime(selectedMessage.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                                        selectedMessage.replies.map((reply, index) => {
                                            const isAdminReply = reply.repliedBy?.role === 'admin';
                                            const displayName = isAdminReply ? 'Admin' : (reply.repliedBy?.name || 'You');
                                            
                                            return (
                                                <div key={index} className={`flex ${isAdminReply ? 'justify-start' : 'justify-end'}`}>
                                                    <div className={`max-w-[80%] md:max-w-[70%] p-3.5 rounded-2xl shadow-sm border ${
                                                        isAdminReply 
                                                            ? 'bg-white dark:bg-neutral-800 text-light-textPrimary dark:text-neutral-100 border-light-border dark:border-neutral-700/60 rounded-tl-none' 
                                                            : 'bg-accent-purple text-white border-transparent rounded-tr-none'
                                                    }`}>
                                                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{reply.message}</p>
                                                        <div className={`text-[9px] block mt-1.5 font-medium ${
                                                            isAdminReply ? 'text-neutral-400' : 'text-white/70 text-right'
                                                        }`}>
                                                            {displayName} • {formatTime(reply.date)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Send Reply Input Form */}
                                <div className="p-4 border-t border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/40">
                                    <div className="flex gap-2">
                                        <textarea 
                                            value={replyText} 
                                            onChange={(e) => setReplyText(e.target.value)} 
                                            placeholder="Type your reply here..." 
                                            className="flex-grow p-3 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-light-border dark:border-neutral-800 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple h-12 max-h-32 resize-none custom-scrollbar text-light-textPrimary dark:text-white"
                                            disabled={replyStatus.loading}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendReply(selectedMessage._id);
                                                }
                                            }}
                                        />
                                        <button 
                                            onClick={() => handleSendReply(selectedMessage._id)} 
                                            disabled={!replyText.trim() || replyStatus.loading} 
                                            className="px-4 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-xl text-sm flex items-center justify-center gap-2 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all font-bold"
                                        >
                                            {replyStatus.loading ? <Spinner /> : <FiSend />}
                                        </button>
                                    </div>
                                    {replyStatus.message && (
                                        <p className={`mt-2 text-xs font-semibold ${replyStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {replyStatus.message}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8">
                                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800/40 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-4 border border-light-border dark:border-neutral-800">
                                    <FiMessageSquare className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-sm text-neutral-700 dark:text-neutral-300">Select a message thread</h4>
                                <p className="text-xs text-neutral-500 mt-1">Choose a conversation from the list to reply and view updates.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-light-border dark:border-neutral-800">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <FiAlertTriangle className="w-8 h-8" />
                            <h3 className="text-lg font-bold">Delete Message?</h3>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                            Are you sure you want to permanently delete this message thread? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteMessage}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default UserMessageCenter;
