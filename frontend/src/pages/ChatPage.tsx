import React, { useState, useEffect, useRef } from 'react'; // Chat Media Support & Emoji Implementation
import { useAuth } from '../contexts/AuthContext';
import { useCollege } from '../contexts/CollegeContext';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, MoreVertical, MessageCircle, Users, Sparkles, Phone, Video, Info, Paperclip, Smile, Image as ImageIcon, Check, FileIcon, Download, X, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

const ChatPage = () => {
    const { user } = useAuth();
    const { activeCollege } = useCollege();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConversation, setActiveConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [connections, setConnections] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadPreview, setUploadPreview] = useState<any>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [socketStatus, setSocketStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
    
    const socketRef = useRef<any>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial data fetch
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await api.get('/chat/conversations');
                setConversations(res.data);
                if (res.data.length > 0 && !activeConversation) setActiveConversation(res.data[0]);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchConnections = async () => {
            try {
                const res = await api.get('/social/connections');
                setConnections(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchConversations();
        fetchConnections();
    }, [user, activeCollege]);

    const startNewChat = React.useCallback((targetUser: any) => {
        const existing = conversations.find(c => c.users?.some((u: any) => u.id === targetUser.id));
        if (existing) {
            setActiveConversation(existing);
            return;
        }

        const tempConv = {
            id: null,
            users: [targetUser],
            messages: []
        };
        setActiveConversation(tempConv);
    }, [conversations]);

    // Handle auto-starting chat from URL query
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const targetUserId = searchParams.get('userId');
        if (targetUserId && connections.length > 0) {
            const target = connections.find(c => c.userId === targetUserId || c.id === targetUserId);
            if (target) {
                // Adapt target object to what startNewChat expects
                startNewChat({
                    id: target.userId || target.id,
                    name: target.name,
                    avatar: target.avatar
                });
            }
        }
    }, [searchParams, connections, startNewChat]);

    // Socket connection management
    useEffect(() => {
        if (!user) return;
        
        socketRef.current = io('/', {
            query: { userId: user.id, collegeId: activeCollege?.id },
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () => setSocketStatus('connected'));
        socketRef.current.on('disconnect', () => setSocketStatus('disconnected'));
        socketRef.current.on('connect_error', () => setSocketStatus('disconnected'));
        socketRef.current.on('reconnect_attempt', () => setSocketStatus('connecting'));

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, activeCollege]);

    // Socket listeners for active conversation
    useEffect(() => {
        if (!socketRef.current) return;

        const handleNewMessage = (data: any) => {
            if (data.conversationId === activeConversation?.id) {
                setMessages(prev => [...prev, data]);
            }
            // Update conversations list summary if needed
            setConversations(prev => prev.map(c => 
                c.id === data.conversationId ? { ...c, messages: [data, ...(c.messages || [])] } : c
            ));
        };

        const handleTyping = (data: any) => {
            if (data.from === activeConversation?.users?.[0]?.id) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        };

        socketRef.current.on('new_message', handleNewMessage);
        socketRef.current.on('user_typing', handleTyping);

        return () => {
            socketRef.current.off('new_message', handleNewMessage);
            socketRef.current.off('user_typing', handleTyping);
        };
    }, [activeConversation?.id, activeConversation?.users?.[0]?.id]);

    useEffect(() => {
        if (activeConversation?.id && activeConversation.id !== 'null') {
            const fetchMessages = async () => {
                try {
                    const res = await api.get(`/chat/messages/${activeConversation.id}`);
                    setMessages(res.data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchMessages();
        } else {
            setMessages([]); 
        }
    }, [activeConversation?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-expand textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [newMessage]);

    const handleDeleteMessage = async (msgId: string) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(`/chat/messages/${msgId}`);
            setMessages(prev => prev.filter(m => m.id !== msgId));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('chat', file);

        try {
            const res = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadPreview({
                url: res.data.url,
                name: file.name,
                type: file.type
            });
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        if ((!newMessage.trim() && !uploadPreview) || !activeConversation) return;

        try {
            const msgData = {
                conversationId: activeConversation.id,
                receiverId: activeConversation.users?.[0]?.id,
                content: newMessage || (uploadPreview?.type.startsWith('image/') ? 'Sent an image' : `Sent a file: ${uploadPreview?.name}`),
                mediaUrl: uploadPreview?.url
            };

            const res = await api.post('/chat/messages', msgData);
            
            if (!activeConversation.id) {
                const convRes = await api.get('/chat/conversations');
                setConversations(convRes.data);
                const newConv = convRes.data.find((c: any) => c.id === res.data.conversationId);
                if (newConv) setActiveConversation(newConv);
            }

            setMessages(prev => [...prev, res.data]);
            socketRef.current.emit('send_message', {
                receiverId: activeConversation.users?.[0]?.id,
                message: res.data
            });
            setNewMessage('');
            setUploadPreview(null);
            setShowEmojiPicker(false);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredConversations = conversations.filter(c => 
        c.users?.[0]?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const emojis = ['👍', '❤️', '🔥', '😂', '😮', '😢', '🙏', '✨', '✅', '🚀', '💯', '🤔'];

    return (
        <div className="fixed inset-x-0 bottom-[5rem] top-[4.5rem] flex overflow-hidden bg-white dark:bg-slate-950 transition-colors z-30">
            {/* Sidebar: Conversation List */}
            <div className={`w-full md:w-[320px] lg:w-[380px] shrink-0 border-r border-slate-100 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-xl ${activeConversation && 'hidden md:flex'}`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Messages</h1>
                        <button 
                            onClick={() => setShowNewChatModal(true)}
                            className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        >
                            <Sparkles size={20} />
                        </button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-blue-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map((conv) => (
                            <button
                                key={conv.id || 'temp'}
                                onClick={() => setActiveConversation(conv)}
                                className={`w-full p-4 flex items-center gap-4 rounded-[1.5rem] transition-all relative group ${activeConversation?.id === conv.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'hover:bg-white dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'}`}
                            >
                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md transition-transform group-hover:scale-105 ${activeConversation?.id === conv.id ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white'}`}>
                                        {conv.users?.[0]?.avatar ? (
                                            <img src={conv.users[0].avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                                        ) : conv.users?.[0]?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-50 dark:border-slate-900 shadow-sm" />
                                </div>
                                <div className="text-left overflow-hidden flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-sm font-bold truncate ${activeConversation?.id === conv.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{conv.users?.[0]?.name || 'Chat Participant'}</p>
                                        <span className={`text-[10px] ${activeConversation?.id === conv.id ? 'text-blue-100' : 'text-slate-400'}`}>12:45 PM</span>
                                    </div>
                                    <p className={`text-[11px] truncate opacity-80 ${activeConversation?.id === conv.id ? 'text-blue-50' : 'text-slate-500'}`}>
                                        {conv.messages?.[0]?.content || 'Say hello! 👋'}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 opacity-40">
                            <MessageCircle size={32} className="mb-2" />
                            <p className="text-xs">No conversations found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors ${!activeConversation && 'hidden md:flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 md:px-6 md:py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10 w-full">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/10">
                                        {activeConversation.users?.[0]?.avatar ? (
                                            <img src={activeConversation.users[0].avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                                        ) : activeConversation.users?.[0]?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                                        {activeConversation.users?.[0]?.name || 'Chat Participant'}
                                    </h3>
                                    <p className={`text-[11px] font-medium ${socketStatus === 'connected' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {socketStatus === 'connected' ? 'Active now' : 
                                         socketStatus === 'connecting' ? 'Reconnecting...' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <button className="p-2.5 rounded-full text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all active:scale-90">
                                    <Phone size={22} strokeWidth={1.5} />
                                </button>
                                <button className="p-2.5 rounded-full text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all active:scale-90">
                                    <Video size={24} strokeWidth={1.5} />
                                </button>
                                <button className="p-2.5 rounded-full text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all active:scale-90">
                                    <Info size={24} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/20 dark:bg-slate-950/20 custom-scrollbar relative">
                            <div className="flex justify-center mb-8">
                                <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Today</span>
                            </div>

                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;
                                const isNextMe = messages[idx + 1]?.senderId === msg.senderId;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-2`}>
                                        <div className={`max-w-[85%] flex items-end gap-2 ${isMe ? 'flex-row' : 'flex-row'}`}>
                                            <div className="flex flex-col">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    className={`px-5 py-3.5 rounded-[1.8rem] text-[15px] shadow-md transition-all ${isMe ? 'bg-gradient-to-bl from-blue-400 to-blue-600 text-white rounded-tr-none shadow-blue-500/20' : 'bg-[#e9ebef] dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border-none shadow-sm'}`}
                                                >
                                                    {msg.media_url && (
                                                        <div className="mb-2 rounded-2xl overflow-hidden shadow-inner">
                                                            {msg.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                                <img 
                                                                    src={msg.media_url} 
                                                                    alt="Shared" 
                                                                    className="max-h-60 w-full object-cover cursor-pointer"
                                                                    onClick={() => window.open(msg.media_url, '_blank')}
                                                                />
                                                            ) : (
                                                                <div className="p-3 flex items-center gap-3 bg-white/10">
                                                                    <FileIcon size={18} />
                                                                    <a href={msg.media_url} target="_blank" rel="noreferrer" className="text-xs font-bold underline">Download</a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="leading-snug whitespace-pre-wrap">{msg.content}</p>
                                                    <div className={`mt-1 flex items-center gap-1.5 opacity-70 justify-end`}>
                                                        <span className="text-[10px] font-medium">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isMe && <Check size={12} className="opacity-80" />}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {isTyping && (
                                <div className="flex justify-start items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                    <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 border border-slate-100 dark:border-white/5 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:75ms]" />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 relative">
                            {/* Emoji Picker Overlay */}
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="absolute bottom-full mb-4 left-6 p-4 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/5 z-20 w-72"
                                    >
                                        <div className="grid grid-cols-4 gap-2">
                                            {emojis.map(emoji => (
                                                <button 
                                                    key={emoji}
                                                    onClick={() => {
                                                        setNewMessage(prev => prev + emoji);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                    className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all active:scale-90"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Upload Preview */}
                            <AnimatePresence>
                                {uploadPreview && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full mb-4 left-6 p-3 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-blue-500/20 z-10 flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 overflow-hidden">
                                            {uploadPreview.type.startsWith('image/') ? (
                                                <img src={uploadPreview.url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <FileIcon size={20} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-[120px]">
                                            <p className="text-[11px] font-bold truncate max-w-[180px]">{uploadPreview.name}</p>
                                            <p className="text-[9px] text-emerald-500">Ready to send</p>
                                        </div>
                                        <button onClick={() => setUploadPreview(null)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors">
                                            <X size={16} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form className="relative flex items-center gap-3 max-w-5xl mx-auto px-2" onSubmit={handleSendMessage}>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 text-slate-500 hover:text-blue-500 transition-all active:scale-90"
                                    >
                                        <Paperclip size={22} strokeWidth={1.5} />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 text-slate-500 hover:text-blue-500 transition-all active:scale-90"
                                    >
                                        <ImageIcon size={23} strokeWidth={1.5} />
                                    </button>
                                </div>
                                <div className="flex-1 relative flex items-center bg-slate-50/80 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-full px-5">
                                    <textarea
                                        ref={textareaRef}
                                        value={newMessage}
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            socketRef.current.emit('typing', { receiverId: activeConversation.users?.[0]?.id });
                                        }}
                                        placeholder="Write something..."
                                        className="flex-1 bg-transparent py-4 text-[15px] text-slate-900 dark:text-white outline-none resize-none max-h-[150px] custom-scrollbar"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-2 transition-all ${showEmojiPicker ? 'text-amber-500 scale-110' : 'text-slate-400 hover:text-amber-500'}`}
                                    >
                                        <Smile size={22} strokeWidth={1.5} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !uploadPreview) || isUploading}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 shrink-0 ${(newMessage.trim() || uploadPreview) ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none'}`}
                                >
                                    <Send size={20} className="translate-x-0.5" strokeWidth={2.5} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-12 bg-slate-50/30 dark:bg-transparent transition-all">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative mb-8">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[3rem] sm:rounded-[3.5rem] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center relative z-10 transition-all">
                                    <MessageCircle size={48} className="text-blue-500 opacity-80 sm:hidden" strokeWidth={1.5} />
                                    <MessageCircle size={56} className="text-blue-500 opacity-80 hidden sm:block" strokeWidth={1.5} />
                                </div>
                                <div className="absolute -top-4 -right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                                    <Sparkles size={20} className="text-white sm:hidden" />
                                    <Sparkles size={24} className="text-white hidden sm:block" />
                                </div>
                                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-amber-400 rounded-full blur-2xl opacity-20" />
                            </div>
                            
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">Premium Messaging</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-[280px] sm:max-w-sm leading-relaxed mb-8">
                                Select a peer to start a private conversation. Your messages are encrypted and secure within {activeCollege?.name}.
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                                <button className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-[11px] sm:text-sm font-bold border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">Help</button>
                                <button 
                                    onClick={() => setShowNewChatModal(true)}
                                    className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl text-[11px] sm:text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                                >
                                    Find People
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
            <AnimatePresence>
                {showNewChatModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNewChatModal(false)}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New Chat</h2>
                                    <button onClick={() => setShowNewChatModal(false)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-slate-400 transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                                
                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search connections..." 
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {connections.length > 0 ? (
                                        connections.map((conn) => (
                                            <button
                                                key={conn.id}
                                                onClick={() => startNewChat(conn)}
                                                className="w-full p-4 flex items-center gap-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform">
                                                    {conn.avatar ? (
                                                        <img src={conn.avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                                                    ) : conn.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{conn.name}</p>
                                                    <p className="text-[11px] text-slate-500">Connected</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 opacity-40">
                                            <Users size={48} className="mx-auto mb-4" />
                                            <p className="text-sm">No connections available for chat.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
            `}} />
        </div>
    );
};

export default ChatPage;
